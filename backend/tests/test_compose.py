"""容器配置的静态检查(无需 Docker):守住 spec 的硬约束。"""
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
COMPOSE = yaml.safe_load((ROOT / "docker-compose.yml").read_text())
DOCKERFILE = (ROOT / "backend" / "Dockerfile").read_text()


def _pinned_chromadb_version() -> str:
    reqs = (ROOT / "backend" / "requirements.txt").read_text()
    return re.search(r"^chromadb==([\w.]+)$", reqs, re.M).group(1)


def test_chroma_is_not_published_to_the_host():
    assert "ports" not in COMPOSE["services"]["chroma"]


def test_api_is_bound_to_loopback_only():
    ports = COMPOSE["services"]["api"]["ports"]
    assert ports and all(p.startswith("127.0.0.1:") for p in ports)


def test_chroma_image_version_matches_pinned_client():
    assert COMPOSE["services"]["chroma"]["image"] == f"chromadb/chroma:{_pinned_chromadb_version()}"


def test_named_volumes_are_declared_and_mounted():
    assert set(COMPOSE["volumes"]) >= {"chroma-data", "api-data"}
    assert any(v.startswith("chroma-data:") for v in COMPOSE["services"]["chroma"]["volumes"])
    assert any(v.startswith("api-data:") for v in COMPOSE["services"]["api"]["volumes"])


def test_api_depends_on_chroma():
    assert "chroma" in COMPOSE["services"]["api"]["depends_on"]


def test_dockerfile_is_non_root_with_healthcheck():
    users = re.findall(r"^USER\s+(\S+)", DOCKERFILE, re.M)
    assert users and users[-1] not in {"root", "0"}
    assert "HEALTHCHECK" in DOCKERFILE


def test_secrets_are_not_baked_into_compose():
    text = (ROOT / "docker-compose.yml").read_text()
    assert "DEEPSEEK_API_KEY" not in text.replace("env_file", "")


def test_ingest_is_an_opt_in_tools_job():
    ingest = COMPOSE["services"]["ingest"]
    assert ingest["profiles"] == ["tools"]
    assert ingest["command"][:3] == ["python", "-m", "app.kb.ingest"]
    assert "--reset" in ingest["command"]
    assert "ports" not in ingest


def test_api_and_ingest_are_built_from_the_same_definition():
    assert COMPOSE["services"]["ingest"]["build"] == COMPOSE["services"]["api"]["build"]
    assert COMPOSE["services"]["ingest"]["environment"]["CHROMA_HOST"] == "chroma"


def test_embedding_model_is_baked_at_build_time_and_runtime_is_offline():
    builder_stage, final_stage = DOCKERFILE.split("\nFROM ")
    assert "SentenceTransformer(" in builder_stage  # 构建阶段下载模型
    assert "SentenceTransformer(" not in final_stage  # 最终镜像里不再联网下载
    assert "HF_HUB_OFFLINE=1" in DOCKERFILE
    assert "COPY --from=builder /models /models" in DOCKERFILE


def test_dockerfile_uses_cpu_only_torch():
    assert "download.pytorch.org/whl/cpu" in DOCKERFILE


def test_knowledge_base_is_copied_into_the_image():
    assert "COPY kb ./kb" in DOCKERFILE


def test_baked_model_matches_the_runtime_default():
    from app.config import Settings

    compose_text = (ROOT / "docker-compose.yml").read_text()
    compose_default = re.search(r"EMBED_MODEL:\s*\$\{EMBED_MODEL:-([^}]+)\}", compose_text).group(1)
    dockerfile_default = re.search(r"^ARG EMBED_MODEL=(\S+)", DOCKERFILE, re.M).group(1)
    assert compose_default == dockerfile_default == Settings().embed_model
