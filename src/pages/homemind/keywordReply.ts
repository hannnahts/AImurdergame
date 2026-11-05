// 小A 的关键词应答(旧版逻辑,原样保留)。后端不可用时用它兜底。
export function keywordReply(text: string): string {
  const t = text.trim();
  if (!t) return '小A听不懂主人的话,可以再说一遍吗?';
  if (t.includes('忘记密码')) return '如果主人忘记了密码,可以通过手机发送验证信息修改密码哦~ 若手机不在身边,可以看看与 app 绑定的论坛内容,或许能勾起回忆 ><';
  if (['浴室', '卫生间', '浴缸'].some((k) => t.includes(k))) return '目前浴室系统连接异常,可以检查接地情况、致电客服,或在论坛发技术帖子求助哦~';
  if (t.includes('小雅')) return '小雅的最后一次登录是 2 天前。';
  if (['删除', '记录'].some((k) => t.includes(k))) return '修改记录需要管理员二次确认,且不可恢复哦。';
  return '小A听不懂主人的话,可以再说一遍吗?';
}
