import re
from pathlib import Path

from app.kb.chunking import Chunk, KbFormatError
from app.kb.ingest import ingest_directory, main


def simple_chunker(text: str, source: str, target_chars: int = 300, overlap: int = 40) -> list[Chunk]:
    """测试内自带的简单分块器(每个 `##` 小节一块),不依赖 Hannah 的实现。"""
    m = re.match(r"---\nunlock_tier: (\d+)\n---\n", text)
    if not m:
        raise KbFormatError("missing front matter")
    tier = int(m.group(1))
    body = text[m.end():]
    parts = [p for p in re.split(r"^## ", body, flags=re.M) if p.strip()]
    chunks = []
    for i, p in enumerate(parts):
        title, _, rest = p.partition("\n")
        chunks.append(Chunk(id=f"{source}#{i}", text=f"{title}\n{rest}".strip(), source=source, section=title.strip(), unlock_tier=tier))
    return chunks


def _doc(tier: int, *sections: tuple[str, str]) -> str:
    return f"---\nunlock_tier: {tier}\n---\n" + "".join(f"## {t}\n{b}\n" for t, b in sections)


def _run(kb: Path, store, embedder, **kw):
    return ingest_directory(kb, store, embedder, target_chars=300, overlap=40, chunker=simple_chunker, **kw)


def test_ingest_directory_reads_all_markdown(tmp_path, store, embedder):
    (tmp_path / "a.md").write_text(_doc(0, ("灯光", "亮度"), ("窗帘", "开合")))
    (tmp_path / "b.md").write_text(_doc(1, ("设备", "列表")))
    (tmp_path / "ignore.txt").write_text("not markdown")
    report = _run(tmp_path, store, embedder)
    assert (report.chunks, report.sources) == (3, 2)
    assert store.count() == 3


def test_ingest_is_idempotent(tmp_path, store, embedder):
    (tmp_path / "a.md").write_text(_doc(0, ("灯光", "亮度")))
    _run(tmp_path, store, embedder)
    _run(tmp_path, store, embedder)
    assert store.count() == 1


def test_reingest_removes_stale_chunks_when_document_shrinks(tmp_path, store, embedder):
    path = tmp_path / "a.md"
    path.write_text(_doc(0, ("灯光", "亮度"), ("窗帘", "开合"), ("温度", "设定")))
    _run(tmp_path, store, embedder)
    path.write_text(_doc(0, ("灯光", "亮度")))
    report = _run(tmp_path, store, embedder)
    assert report.removed_stale == 2
    assert store.count() == 1


def test_reingest_removes_chunks_of_deleted_documents(tmp_path, store, embedder):
    (tmp_path / "a.md").write_text(_doc(0, ("灯光", "亮度")))
    (tmp_path / "b.md").write_text(_doc(0, ("窗帘", "开合")))
    _run(tmp_path, store, embedder)
    (tmp_path / "b.md").unlink()
    report = _run(tmp_path, store, embedder)
    assert report.removed_stale == 1
    assert store.sources() == {"a.md"}


def test_reset_replaces_collection(tmp_path, store, embedder):
    (tmp_path / "a.md").write_text(_doc(0, ("灯光", "亮度")))
    _run(tmp_path, store, embedder)
    (tmp_path / "a.md").unlink()
    (tmp_path / "b.md").write_text(_doc(1, ("设备", "列表")))
    _run(tmp_path, store, embedder, reset=True)
    assert store.sources() == {"b.md"}
    assert store.count() == 1


def test_main_prints_report_and_returns_zero(tmp_path, store, embedder, capsys, monkeypatch):
    (tmp_path / "a.md").write_text(_doc(0, ("灯光", "亮度")))
    monkeypatch.setattr("app.kb.ingest.chunk_markdown", simple_chunker)
    code = main(["--kb-dir", str(tmp_path), "--reset"], store=store, embedder=embedder)
    assert code == 0
    assert "chunks=1" in capsys.readouterr().out
