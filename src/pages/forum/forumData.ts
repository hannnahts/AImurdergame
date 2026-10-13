// src/pages/forum/forumData.ts
import type { ForumSection, Post } from "./forumTypes";

export const forumSections: ForumSection[] = [
  { key: "home", label: "首页" },

  { key: "help", label: "故障求助", count: 1243 },
  { key: "life", label: "生活分享", count: 5672 },
  { key: "tech", label: "技术讨论", count: 3891 },
  { key: "announce", label: "官方公告", count: 47 },
  { key: "other", label: "其他问题", count: 889, badge: "new" },

  { key: "mine_posts", label: "我的帖子", count: 42 },
  { key: "mine_fav", label: "我的收藏", count: 156 },
  { key: "mine_hidden", label: "我的隐藏", count: 23, locked: true },
];

export const forumPosts: Post[] = [
  {
    id: "p-001",
    title: "【求助】HomeMind 备份恢复后，时间线对不上了？",
    section: "help",
    author: "小雅_Cloud",
    time: "03-12 23:48",
    replies: 19,
    lastBy: "小雅_Cloud",
    lastTime: "03-13 09:02",
    comments: [
      { user: "老王_运维", time: "03-13 00:12", text: "「记录已优化」是管理员手动触发的操作，系统不会自己做。你们家谁有管理员权限？", likes: 6 },
      { user: "小雅_Cloud", time: "03-13 00:20", text: "管理员是他……我这边只能看，改不了。" },
      { user: "阿Ken", time: "03-13 08:41", text: "先别恢复了，把原始备份导出来留一份，以防万一。", likes: 3 },
      { user: "小雅_Cloud", time: "03-13 09:02", text: "我试过，导出按钮是灰的。" },
    ],
    views: 612,
    isPinned: true,
    tags: ["备份", "异常", "HomeMind"],
    excerpt: "恢复出来的日志里，有一段日期像被挪动过……我是不是看错了？",
    content:
      "我把旧手机的备份恢复到新设备后，HomeMind 的日志看起来“很完整”，但时间线有几处不连续。\n\n比如：某条记录明明应该在周二晚上出现，却出现在周三早上。更奇怪的是，系统提示里出现过一次“记录已优化”。\n\n有人遇到过类似情况吗？是我设置错了吗？",
    clueId: "clue_timegap",
  },
  {
    id: "p-002",
    title: "【吐槽】男朋友给全屋装了监控，说这是爱我",
    section: "life",
    author: "小雅_Cloud",
    time: "02-27 22:15",
    replies: 34,
    lastBy: "匿名用户",
    lastTime: "02-28 12:05",
    comments: [
      { user: "路人甲", time: "02-27 22:40", text: "这不叫爱，这叫控制。认真的，跑。", likes: 21 },
      { user: "小雅_Cloud", time: "02-27 22:52", text: "他平时对我真的很好，就是怕我出事……可能是我想多了。" },
      { user: "阿Ken", time: "02-28 07:10", text: "至少把位置共享关了吧？", likes: 8 },
      { user: "小雅_Cloud", time: "02-28 07:31", text: "关不掉，那个选项只有管理员能改。" },
      { user: "匿名用户", time: "02-28 12:05", text: "楼主，你还好吗？需要的话可以私信我。", likes: 5 },
    ],
    views: 1208,
    tags: ["情感", "监控"],
    excerpt: "他说只是为了安全，可我连在阳台打电话都会被问是谁……",
    content:
      "他给家里每个房间都装了摄像头，门锁、灯光、温控全都连在一个 App 上。\n\n他说这是爱我，怕我出事。可我出门他会问我去哪，晚了十分钟他会连续打七个电话。\n\n我想搬出去住一段时间，但不敢开口。他一生气，会把门锁调成只能他开。\n\n（楼主已关闭评论）",
    clueId: "clue_control",
  },
  {
    id: "p-003",
    title: "【技术】HomeMind 后台怎么进？PIN 又是什么？",
    section: "tech",
    author: "老王_运维",
    time: "03-01 10:42",
    replies: 8,
    lastBy: "老王_运维",
    lastTime: "03-01 11:35",
    comments: [
      { user: "阿Ken", time: "03-01 11:20", text: "试了，开发者选项那里确实有后台入口，感谢。", likes: 2 },
      { user: "老王_运维", time: "03-01 11:35", text: "别乱改配置，出了问题我可不管。" },
    ],
    views: 330,
    tags: ["后台", "PIN"],
    clueId: "clue_pintip",
    excerpt: "HomeMind 的后台 PIN 是怎么设置的？",
    content:
      "想进 HomeMind 后台，得先在「设置 → 通用 → 关于本机」里连点「版本号」打开开发者选项，后台入口就在里面。\n\nPIN 一般默认是首次绑定主控设备的日期，格式是月日四位数字。\n\n但很多人会改成家里发生过大事的那天，比如纪念日、搬家日。\n\n想不起来的话，翻翻日志里最重要的那个日期。",
  },
  {
    id: "p-004",
    title: "【公告】HomeMind 将于本周更新「自动优化」功能",
    section: "announce",
    author: "官方客服",
    time: "03-10 09:00",
    replies: 2,
    lastBy: "官方客服",
    lastTime: "03-10 10:02",
    comments: [
      { user: "路人乙", time: "03-10 09:30", text: "自动优化会不会把有用的录像也清掉？" },
      { user: "官方客服", time: "03-10 10:02", text: "优化需管理员二次确认，且不可恢复，请谨慎操作。", likes: 12 },
    ],
    views: 5120,
    isPinned: true,
    tags: ["公告"],
    excerpt: "自动优化将清理冗余的录像和日志。",
    content:
      "本次更新为用户提供「日志优化」功能，管理员可手动选择需要清理的时间段。\n\n注意：执行优化需要管理员二次确认，且操作不可恢复。",
  },
];
