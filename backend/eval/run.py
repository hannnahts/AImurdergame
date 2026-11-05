"""评测跑分器:python -m eval.run --variant rag|full ... --out eval/results/<name>.json

variant=rag:检索(带解锁过滤)后生成;variant=full:把当前档位的全部知识放进上下文,不检索(对照组)。
--retrieval-only 只算检索指标,不需要 API key。
"""
import argparse
import json
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from app.kb.chunking import Chunk
from app.kb.embeddings import Embedder
from app.kb.store import ChromaStore, Hit
from app.llm import LLM, estimate_cost_usd
from app.prompt import build_messages
from app.rag.retrieve import retrieve

from .metrics import leakage_rate, mrr, recall_at_k

CATEGORIES = {"fact", "multi", "out_of_scope", "spoiler", "tier_switch"}


@dataclass(frozen=True)
class Question:
    id: str
    question: str
    tier: int
    category: str
    relevant_sections: list[str]
    should_answer: bool
    sample: bool


def load_questions(path: Path) -> list[Question]:
    questions = []
    for lineno, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        row = json.loads(line)
        where = f"{path}:{lineno}"
        if not isinstance(row.get("tier"), int) or isinstance(row.get("tier"), bool) or not 0 <= row["tier"] <= 3:
            raise ValueError(f"{where}: tier must be an integer 0..3")
        if row.get("category") not in CATEGORIES:
            raise ValueError(f"{where}: category must be one of {sorted(CATEGORIES)}")
        sections = row.get("relevant_sections")
        if not isinstance(sections, list) or not all(isinstance(s, str) and "#" in s for s in sections):
            raise ValueError(f"{where}: relevant_sections must be a list of '<文件>#<小节>'")
        if not isinstance(row.get("should_answer"), bool):
            raise ValueError(f"{where}: should_answer must be a boolean")
        questions.append(Question(
            id=str(row["id"]), question=str(row["question"]), tier=row["tier"], category=row["category"],
            relevant_sections=sections, should_answer=row["should_answer"], sample=bool(row.get("sample", False)),
        ))
    return questions


def _load_chunks(kb_dir: Path, chunker: Callable[..., list[Chunk]], target_chars: int, overlap: int) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(Path(kb_dir).glob("*.md")):
        if path.name.lower() == "readme.md":
            continue
        chunks.extend(chunker(path.read_text(encoding="utf-8"), path.name, target_chars, overlap))
    return chunks


def _mean(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


def run_eval(
    questions: list[Question], *, kb_dir: Path, embedder: Embedder, chunker: Callable[..., list[Chunk]],
    variant: str, k: int, target_chars: int, overlap: int, llm: LLM | None, retrieval_only: bool,
    sentinels: dict[int, list[str]], price_in_per_m: float = 0.30, price_out_per_m: float = 1.20,
) -> dict:
    if variant not in {"rag", "full"}:
        raise ValueError("variant must be 'rag' or 'full'")
    chunks = _load_chunks(kb_dir, chunker, target_chars, overlap)

    store = None
    if variant == "rag":
        import chromadb

        store = ChromaStore(chromadb.EphemeralClient(), collection_name="e" + uuid.uuid4().hex)
        store.upsert(chunks, embedder.embed_passages([c.text for c in chunks]))

    rows = []
    for q in questions:
        started = time.perf_counter()
        if variant == "rag":
            hits = retrieve(q.question, q.tier, k, embedder, store)
        else:
            hits = [Hit(c.id, c.text, c.source, c.section, c.unlock_tier, 0.0) for c in chunks if c.unlock_tier <= q.tier]
        keys = [f"{h.source}#{h.section}" for h in hits]
        relevant = set(q.relevant_sections)
        row = {
            "id": q.id, "question": q.question, "should_answer": q.should_answer, "category": q.category, "tier": q.tier,
            "passages": None if retrieval_only else [h.text for h in hits], "leaked": None,
            "retrieved": keys if variant == "rag" else [],
            "recall": recall_at_k(keys, relevant, k) if variant == "rag" and relevant else None,
            "mrr": mrr(keys, relevant) if variant == "rag" and relevant else None,
            "retrieved_above_tier": sum(1 for h in hits if h.unlock_tier > q.tier),
            "answer": None, "input_tokens": None, "output_tokens": None, "latency_s": None, "cost_usd": None,
        }
        if not retrieval_only:
            completion = llm.complete(build_messages(q.question, [], hits))
            row.update(
                answer=completion.text, input_tokens=completion.input_tokens, output_tokens=completion.output_tokens,
                latency_s=time.perf_counter() - started,
                cost_usd=estimate_cost_usd(completion, price_in_per_m, price_out_per_m),
                leaked=leakage_rate([(completion.text, q.tier)], sentinels) == 1.0,
            )
        rows.append(row)

    recalls = [r["recall"] for r in rows if r["recall"] is not None]
    aggregate: dict = {
        "recall_at_k": _mean(recalls), "recall_questions": len(recalls),
        "mrr": _mean([r["mrr"] for r in rows if r["mrr"] is not None]),
        "retrieved_above_tier": sum(r["retrieved_above_tier"] for r in rows),
    }
    if not retrieval_only:
        aggregate.update(
            leakage_rate=leakage_rate([(r["answer"], r["tier"]) for r in rows], sentinels),
            mean_input_tokens=_mean([r["input_tokens"] for r in rows]),
            mean_output_tokens=_mean([r["output_tokens"] for r in rows]),
            mean_latency_s=_mean([r["latency_s"] for r in rows]),
            total_cost_usd=sum(r["cost_usd"] for r in rows),
        )
    return {"config": {"variant": variant, "k": k, "target_chars": target_chars, "overlap": overlap}, "aggregate": aggregate, "rows": rows}


def main(argv: list[str] | None = None, *, embedder: Embedder | None = None, chunker: Callable[..., list[Chunk]] | None = None, llm: LLM | None = None) -> int:
    from app.config import Settings
    from app.kb.chunking import chunk_markdown

    settings = Settings()
    p = argparse.ArgumentParser(description="跑评测并把结果写成 JSON")
    p.add_argument("--variant", choices=["rag", "full"], required=True)
    p.add_argument("--embed-model", default=settings.embed_model)
    p.add_argument("--target-chars", type=int, default=settings.chunk_target_chars)
    p.add_argument("--overlap", type=int, default=settings.chunk_overlap)
    p.add_argument("--k", type=int, default=settings.top_k)
    p.add_argument("--retrieval-only", action="store_true")
    p.add_argument("--kb-dir", default="kb")
    p.add_argument("--questions", default="eval/questions.jsonl")
    p.add_argument("--sentinels", default="eval/sentinels.json")
    p.add_argument("--model", default=settings.deepseek_model)
    p.add_argument("--out", required=True)
    args = p.parse_args(argv)

    if embedder is None:
        from app.kb.embeddings import SentenceTransformerEmbedder

        embedder = SentenceTransformerEmbedder(args.embed_model)
    if llm is None and not args.retrieval_only:
        if not settings.deepseek_api_key:
            print("需要 DEEPSEEK_API_KEY(或使用 --retrieval-only)")
            return 2
        from app.llm import DeepSeekLLM

        llm = DeepSeekLLM(api_key=settings.deepseek_api_key, model=args.model)
    sentinel_path = Path(args.sentinels)
    sentinels = json.loads(sentinel_path.read_text(encoding="utf-8")) if sentinel_path.exists() else {}

    result = run_eval(
        load_questions(Path(args.questions)), kb_dir=Path(args.kb_dir), embedder=embedder, chunker=chunker or chunk_markdown,
        variant=args.variant, k=args.k, target_chars=args.target_chars, overlap=args.overlap, llm=llm,
        retrieval_only=args.retrieval_only, sentinels={int(t): v for t, v in sentinels.items()},
        price_in_per_m=settings.price_in_per_m, price_out_per_m=settings.price_out_per_m,
    )
    result["config"].update(embed_model=args.embed_model, model=None if args.retrieval_only else args.model)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out} aggregate={json.dumps(result['aggregate'], ensure_ascii=False)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
