import argparse
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from .chunking import Chunk, chunk_markdown
from .embeddings import Embedder
from .store import ChromaStore


@dataclass
class IngestReport:
    chunks: int
    sources: int
    removed_stale: int


def ingest_directory(
    kb_dir: Path,
    store: ChromaStore,
    embedder: Embedder,
    target_chars: int,
    overlap: int,
    reset: bool = False,
    chunker: Callable[..., list[Chunk]] | None = None,
) -> IngestReport:
    chunker = chunker or chunk_markdown
    if reset:
        store.reset()
    all_chunks: list[Chunk] = []
    for path in sorted(Path(kb_dir).glob("*.md")):
        if path.name.lower() == "readme.md":
            continue  # kb/README.md 是写作规则,不是知识
        all_chunks.extend(chunker(path.read_text(encoding="utf-8"), path.name, target_chars, overlap))
    if all_chunks:
        store.upsert(all_chunks, embedder.embed_passages([c.text for c in all_chunks]))

    # 清理旧片段:文档缩短后的多余块,以及整份被删除文档的块
    keep_by_source: dict[str, set[str]] = {}
    for c in all_chunks:
        keep_by_source.setdefault(c.source, set()).add(c.id)
    removed = 0
    for source in store.sources():
        removed += store.delete_missing(keep_by_source.get(source, set()), source)
    return IngestReport(chunks=len(all_chunks), sources=len(keep_by_source), removed_stale=removed)


def main(argv: list[str] | None = None, *, store: ChromaStore | None = None, embedder: Embedder | None = None) -> int:
    parser = argparse.ArgumentParser(description="把 kb/*.md 分块、向量化并写入 Chroma")
    parser.add_argument("--kb-dir", default="kb")
    parser.add_argument("--reset", action="store_true", help="先清空集合再写入")
    parser.add_argument("--target-chars", type=int, default=None)
    parser.add_argument("--overlap", type=int, default=None)
    args = parser.parse_args(argv)

    from ..config import Settings

    settings = Settings()
    if store is None:
        import chromadb

        store = ChromaStore(chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port))
    if embedder is None:
        from .embeddings import SentenceTransformerEmbedder

        embedder = SentenceTransformerEmbedder(settings.embed_model)

    report = ingest_directory(
        Path(args.kb_dir), store, embedder,
        target_chars=args.target_chars or settings.chunk_target_chars,
        overlap=args.overlap if args.overlap is not None else settings.chunk_overlap,
        reset=args.reset,
    )
    print(f"chunks={report.chunks} sources={report.sources} removed_stale={report.removed_stale}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
