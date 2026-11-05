# 小A 管家后端(RAG + Chroma + Docker)

HomeMind 里的 AI 管家"小A":玩家提问 → 本地嵌入 → 在 Chroma 里检索**玩家已解锁档位**内的世界观片段 → 拼提示词 → DeepSeek 生成回答。前端在 GitHub Pages,只多一个 `/chat` 调用;任何失败都回退到前端自带的关键词应答。

## 架构

| 组件 | 位置 | 职责 |
|---|---|---|
| 聊天界面 | 浏览器(前端) | 展示对话,提交问题与解锁档位 |
| `api`(FastAPI) | 容器 | 校验与限额 → 嵌入问题 → 检索(带解锁过滤)→ 调 DeepSeek → 返回回答与引用片段 id |
| `chroma` | 容器(数据卷持久化) | 向量库,不暴露到宿主机 |
| `ingest` | 一次性容器任务 | 把 `kb/*.md` 分块、向量化、写入 Chroma |

防剧透靠**元数据过滤**而不是提示词:每个片段带 `unlock_tier`(0 到 3),检索时只返回 `≤` 玩家当前档位的片段,未解锁的内容根本不进入模型上下文。

## 本地运行

```bash
cp backend/.env.example backend/.env      # 填 DEEPSEEK_API_KEY
docker compose up -d --build              # api + chroma
docker compose --profile tools run --rm ingest
curl -s localhost:8000/health             # {"status":"ok","chroma":"ok"}
curl -s localhost:8000/chat -H 'content-type: application/json' \
  -d '{"anon_id":"test-anon-1","tier":0,"message":"HomeMind 能做什么?","history":[]}'
```

不用 Docker 的开发方式:`cd backend && python3.11 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt && .venv/bin/pytest`。

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | (空) | 只放在环境变量里,不入库、不进前端 |
| `DEEPSEEK_MODEL` | `deepseek-flash` | 评测对照用 `deepseek-v4-pro` |
| `EMBED_MODEL` | `BAAI/bge-small-zh-v1.5` | 构建镜像时烘焙进去;换模型要重新构建 |
| `ALLOWED_ORIGINS` | Pages 域名 + localhost | CORS 白名单 |
| `PER_ID_DAILY` / `PER_IP_DAILY` | 40 / 120 | 每匿名 id、每 IP 的每日条数 |
| `DAILY_BUDGET_USD` | 3.0 | 全局每日预算熔断 |

## 测试

`pytest`(默认不含 `slow` 与 `handoff` 标记)。`pytest -m slow` 需要下载真实嵌入模型;`pytest -m handoff` 是留给 Hannah 实现分块后的验收测试。

## 评测

`python -m eval.run` → `python -m eval.judge` → `python -m eval.report`,详见 `eval/` 下各脚本顶部说明。结果摘要将在跑完实验后填在这里(**尚未运行**)。

## 隐私

- 玩家的问题和检索到的片段会发送到 DeepSeek 的服务生成回答,不含任何个人信息。
- 匿名 id 只是浏览器本地生成的随机串,用于限额。
- 服务端日志只记录档位、命中的片段 id、token 数和耗时,**不记录消息正文**。
