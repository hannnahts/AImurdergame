FROM python:3.12-slim AS builder
ARG EMBED_MODEL=BAAI/bge-small-zh-v1.5
WORKDIR /build
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" HF_HOME=/models
# CPU 版 torch:Linux 默认轮子带 CUDA,会让镜像大出几个 GB
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# 构建阶段就把嵌入模型下载进镜像:运行时完全离线,没有冷启动下载
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${EMBED_MODEL}')"

FROM python:3.12-slim
RUN useradd --create-home --uid 10001 app && mkdir /data && chown app /data
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /models /models
ENV PATH="/opt/venv/bin:$PATH" HF_HOME=/models HF_HUB_OFFLINE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY app ./app
COPY kb ./kb
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=2)" || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
