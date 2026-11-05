# 部署指南

目标:把后端(api + chroma + caddy)跑在一台 Linux 云服务器上,前端仍在 GitHub Pages。

> 服务器区域、价格、是否需要备案请以服务商官网为准。香港/新加坡区域的服务器通常不需要 ICP 备案,但请自行确认。
> 内存:`api` 常驻内存见 `backend/README.md`,再给 chroma 与 caddy 留余量(建议 ≥ 2 GB)。

## 1. 准备

1. 开一台 Ubuntu 22.04+ 服务器,记下公网 IP。
2. 准备一个域名(或子域名),例如 `api.example.com`。
3. 准备好 DeepSeek 的 API key。**key 只放在服务器的 `backend/.env` 里,不要放进前端、仓库或 GitHub 变量。**

## 2. 服务器初始化

```bash
# 安装 Docker(官方脚本,也可按官网文档手动安装)
curl -fsSL https://get.docker.com | sh

# 防火墙只开 22/80/443
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

## 3. 拉代码与配置

```bash
git clone <仓库地址> app && cd app
git checkout <要部署的分支>

cp backend/.env.example backend/.env
# 编辑 backend/.env,至少填:DEEPSEEK_API_KEY
# 另外在仓库根目录建一个 .env,供 compose 读取域名:
echo "API_DOMAIN=api.example.com" > .env
```

`ALLOWED_ORIGINS` 在生产叠加层里已固定为 `https://hannnahts.github.io`。

## 4. DNS

给 `API_DOMAIN` 加一条 A 记录指向服务器公网 IP。先让它生效,再启动 caddy,否则证书签发会失败。

## 5. 启动

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile tools run --rm ingest
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f caddy   # 看证书签发
```

知识库改动后重新执行第二条命令即可(会清空并重建索引)。

## 6. 验证

```bash
curl -s https://$API_DOMAIN/health
# {"status":"ok","chroma":"ok"}

# 其它来源不应得到 CORS 放行头(下面应没有 access-control-allow-origin 行)
curl -si -H "Origin: https://evil.example" https://$API_DOMAIN/health | grep -i access-control

# 允许的来源应该有
curl -si -H "Origin: https://hannnahts.github.io" https://$API_DOMAIN/health | grep -i access-control
```

- 同一个 anon_id 连续发超过 40 条,应返回 429 `rate_limited`,前端自动回退到关键词应答。
- 预算熔断:临时把 `backend/.env` 里 `DAILY_BUDGET_USD` 设为 `0.0001`,`docker compose ... up -d` 重启 api,应返回 `budget_exhausted`;验证后改回。
- 重启持久化:`docker compose ... restart` 之后,限额计数与知识库仍在。

## 7. 前端接入

在 GitHub 仓库 Settings → Secrets and variables → Actions → **Variables** 添加 `CHAT_API_URL`,值为 `https://<API_DOMAIN>`(这是公开地址,放变量即可,不是密钥)。然后推送 `main` 或手动触发 Pages 工作流,前端构建时会带上它。

## 8. 日常运维

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail 100 api
```

日志只记录 tier、状态、命中数、token 数、耗时,不记录用户消息内容。
