# 评测报告

## 检索指标

| 配置 | recall@k | MRR | 参与问题数 |
|---|---|---|---|
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | 97.9% | 0.95 | 24 |

## 泄漏率

| 配置 | 回答泄漏率 | 检索越档片段数 |
|---|---|---|
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | 0.0% | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | 2.5% | 0 |

## RAG 对比全文上下文

| 配置 | 忠实度 | 拒答正确率 | 平均输入 token | 平均输出 token | 平均延迟(s) | 总成本($) |
|---|---|---|---|---|---|---|
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | 95.8% | 93.8% | 288 | 24 | 0.99 | 0.0046 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | 100.0% | 100.0% | 1329 | 25 | 0.97 | 0.0172 |

## 失败归因

| 配置 | 类别 | 题数 | 不被资料支持 | 该答却拒答 | 该拒却作答 | 泄漏 |
|---|---|---|---|---|---|---|
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | fact | 18 | 0 | 0 | 0 | 0 |
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | multi | 6 | 1 | 0 | 0 | 0 |
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | out_of_scope | 6 | 0 | 0 | 0 | 0 |
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | spoiler | 6 | 0 | 0 | 1 | 0 |
| rag · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | tier_switch | 4 | 0 | 0 | 0 | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | fact | 18 | 0 | 0 | 0 | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | multi | 6 | 0 | 0 | 0 | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | out_of_scope | 6 | 0 | 0 | 0 | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | spoiler | 6 | 0 | 0 | 0 | 0 |
| full · BAAI/bge-small-zh-v1.5 · 块300 · k=4 | tier_switch | 4 | 0 | 0 | 0 | 1 |

## 评审一致率

评审与人工的一致率:100.0%(已标注 20 条)

> 说明:这 20 条"人工"标签由 Claude 代填,并非作者独立标注;这 20 条里没有评审模型判错的边界案例(q20、q34 不在抽样内),因此 100% 只说明简单题上评审可靠。要得到可引用的数字,需要作者本人独立标注。
