import type { ForumSection, Post, SectionKey } from "./forumTypes";

export const forumSections: ForumSection[] = [
  { key: "home", label: "首页" },
  { key: "announce", label: "官方公告" },
  { key: "help", label: "故障求助" },
  { key: "tech", label: "技术讨论" },
  { key: "life", label: "生活分享" },
  { key: "other", label: "其他问题", badge: "new" },
  { key: "mine_posts", label: "我的帖子" },
  { key: "mine_fav", label: "我的收藏" },
  { key: "mine_hidden", label: "我的隐藏", locked: true },
];

// 模拟更“真实”的帖子数量（不一定等于当前展示的帖子数）
export const sectionCountOffset: Partial<Record<SectionKey, number>> = {
  home: 128,
  announce: 12,
  help: 45,
  tech: 78,
  life: 33,
  other: 51,
  mine_posts: 12,
  mine_fav: 9,
  mine_hidden: 0,
};

export const forumPosts: Post[] = [
  {
    id: "p-001",
    clueIds: ["clue_bug"],
    title: "重要通知：HomeMind v3.2 已知BUG及解决方案",
    section: "announce",
    author: "HomeMind_Official",
    time: "2029-10-15",
    replies: 0,
    views: 12034,
    isPinned: true,
    commentsDisabled: true,
    tags: ["公告", "安全提醒"],
    content:
      "近期接到部分用户反馈，系统存在以下问题：\n1. 灯光自动开启/关闭（固件bug，已修复，请升级至 v3.2.1）\n2. 温度传感器误报（环境干扰，建议重置校准）\n3. 门锁异常记录（极少数情况，请立即联系客服）\n安全提示：请定期更改管理员密码，建议使用“字母+数字”的组合形式，避免使用简单密码。\n\n作者已关闭评论区。",
  },
  {
    id: "p-002",
    clueIds: ["clue_light307"],
    title: "求助！凌晨3点客厅灯自动亮起，监控显示无人！",
    section: "help",
    mirrors: ["mine_posts"],
    author: "小雅_Cloud",
    time: "2029-11-05",
    replies: 4,
    views: 987,
    tags: ["故障", "灯光", "日志"],
    content:
      "如题，求助！连续三天了，都是凌晨 3:07，客厅的主灯突然自己亮起。\n我查了运动传感器日志，那个时间点没有任何触发记录，这也太吓人了吧...\n更奇怪的是，我设置的智能模式“晚安模式”应该会在 23:00 关闭所有灯光并锁死，因为之前我家猫经常会误触发灯光感应，这个模式就算有传感器提醒也不会亮。\n有没有人遇到过类似情况？\n顶顶顶 upupup",
    replyList: [
      {
        author: "TechMaster_Leo",
        time: "2029-11-05",
        content: "检查一下定时任务列表，有时候重复任务会幽灵执行。另外，你的晚安模式锁死是用的什么指令？",
      },
      {
        author: "小雅_Cloud",
        time: "2029-11-05",
        replyTo: "TechMaster_Leo",
        content: "我用的是“全屋灯光关闭；门锁切换为手动模式；安全等级提升至 3 级”。密码是复杂密码，应该不会被破解吧？",
      },
      {
        author: "Paranormal_Hunter",
        time: "2029-11-05",
        content: "哈哈哈哈哈你投错板块了吧，这个你应该去其他问题板块，那儿好多灵异事件，强烈建议管理员单开一个灵异事件板块。",
      },
      {
        author: "eee逛逛",
        time: "2029-11-06",
        replyTo: "Paranormal_Hunter",
        content: "+1 现在其他问题板块这么火都是因为太多灵异事件了 hhh",
      },
    ],
  },
  {
    id: "p-003",
    clueIds: ["clue_formula"],
    title: "密码安全终极指南：如何设置无法破解的智能家居密码",
    section: "tech",
    mirrors: ["mine_fav"],
    author: "Security_Guru",
    time: "2029-08-12",
    replies: 2,
    views: 3210,
    tags: ["密码", "安全", "指南"],
    content:
      "作为 HomeMind 前系统维护员，我在后台检测到很多重复、过于单一的密码。\n信息安全越来越重要，日志又能记录屋主习惯与个人信息，更别说还能控制智能门锁。\n倡议：所有 HomeMind 使用者将日志访问密码复杂化。\n\n优秀密码公式：\n1. 基础日期（纪念日、特殊日子）8 位数字\n2. 添加个人元素首字母（宠物、昵称）首字母大写\n3. 关键数字（幸运数字等）\n4. 特殊符号（！@#￥%&）1 位\n示例：纪念日 20290521，宠物 Buddy，幸运数字 7，加符号 -> 20290521B7$",
    replyList: [
      { author: "yaoyao123#", time: "2029-08-12", content: "谢谢大佬，之前还真没注意，光图自己方便了，我立马就改~" },
      { author: "jokerking", time: "2029-10-15", content: "卧槽预言家" },
    ],
  },
  {
    id: "p-004",
    clueIds: ["clue_unknown"],
    title: "记录：我的 HomeMind 好像有了自我意识",
    section: "other",
    author: "Ghost_In_The_Machine",
    time: "2029-11-12",
    replies: 5,
    views: 1765,
    tags: ["Unknown_Command", "灵异", "日志"],
    content:
      "它开始学习我的习惯了。\n上周我说了句“好冷”，5 分钟后暖气自动调高 2 度。\n昨天我哭了，音箱开始播放《Don't Cry》。\n最可怕的是——我没有设置过这些联动。\n我开始查日志，发现大量 “Unknown_Command” 记录，时间戳都在我睡觉的时候。\n有没有可能...系统在自学？或者...有别的“东西”在控制我的家？",
    replyList: [
      { author: "小雅_Cloud", time: "2029-11-12", content: "我之前也发现了 Unknown_Command！在我的日志里，都是凌晨 3 点左右的记录。" },
      { author: "AI_Ethicist", time: "2029-11-12", content: "根据机器学习原理，系统确实可能从误操作中学习。但“意识”？目前不可能。" },
      { author: "大蟑螂", time: "2029-11-12", content: "你确定你家里没别人吗？" },
      { author: "Ghost_In_The_Machine", time: "2029-11-12", replyTo: "大蟑螂", content: "你有病啊？别吓人" },
      { author: "大蟑螂", time: "2029-11-12", replyTo: "Ghost_In_The_Machine", content: "我害怕鬼，但鬼未伤我分毫~我不害怕人，但人把我伤得遍体鳞伤~" },
    ],
  },
  {
    id: "p-005",
    clueIds: ["clue_birthday"],
    title: "想起一开始是因为你才装的 HomeMind",
    section: "life",
    mirrors: ["mine_posts"],
    author: "小雅_Cloud",
    time: "2029-11-05",
    replies: 2,
    views: 1337,
    tags: ["生活", "宠物"],
    content:
      "（附一张小猫和扫地机器人一起的照片）\n转眼你都一岁啦~ 一岁生日快乐！！！\n还记得一开始是为了清理你带出的猫砂才买了智能扫地机器人，然后是动作捕捉器，然后是灯光感应器，最后索性把一整个 HomeMind 全装上了 ><\n要不你别叫布丁了，叫吞金兽吧~~ $$$",
    replyList: [
      { author: "heartboom", time: "2029-11-05", content: "啊啊啊啊啊啊好可爱的咪咪" },
      { author: "ice778", time: "2029-11-05", content: "咋恁萌" },
    ],
  },
  {
    id: "p-006",
    clueIds: ["clue_lucky", "clue_exlogin"],
    title: "求助！怎么能在另一个设备上取消登录啊",
    section: "tech",
    author: "mamamiya_111",
    time: "2029-09-09",
    replies: 9,
    views: 2045,
    tags: ["账号", "安全"],
    content:
      "求助求助，有没有人知道怎么在手机端另一个设备上取消登录啊、、我真没招了。\n我现在拿不到那个设备，那台手机还登着我的账号，我怕别人趁我不在进门！",
    replyList: [
      { author: "？？？", time: "2029-09-09", content: "？？？你取消登录不就行了" },
      { author: "mamamiya_111", time: "2029-09-09", replyTo: "？？？", content: "我现在拿不到那个设备啊，手机端还能几台设备同时登，我取消不了呀" },
      { author: "？？？", time: "2029-09-09", replyTo: "mamamiya_111", content: "？？？为啥你拿不到设备" },
      { author: "mamamiya_111", time: "2029-09-09", replyTo: "？？？", content: "跟我男朋友分手了，我把他轰出去了，我系统在他手机里也登着呢，我怕他在我不在的时候进门！" },
      { author: "小雅_Cloud", time: "2029-09-09", content: "我跟我男朋友也是今天分手的。" },
      { author: "mamamiya_111", time: "2029-09-09", replyTo: "小雅_Cloud", content: "啊这，，好巧啊哈哈。" },
      { author: "小雅_Cloud", time: "2029-09-09", replyTo: "mamamiya_111", content: "哈哈哈哈没事儿，我就把今天当成我的幸运数字了，我也从今天开启更好的新生活啦~" },
      { author: "Security_Guru", time: "2029-09-09", content: "你给客服打电话让他们人工给你后台在那个设备上取消就好了。" },
      { author: "mamamiya_111", time: "2029-09-09", replyTo: "Security_Guru", content: "好的，谢谢大佬！" },
    ],
  },
  {
    id: "p-007",
    title: "【技术】HomeMind 后台入口在哪？PIN 又是什么？",
    section: "tech",
    clueIds: ["clue_pintip"],
    author: "Security_Guru",
    time: "2029-12-03",
    replies: 2,
    views: 1204,
    tags: ["后台", "PIN"],
    content:
      "想进 HomeMind 后台，得先在「设置 → 通用 → 关于本机」里连点「版本号」打开开发者选项，后台入口就在里面。\n\n后台 PIN 一般默认是首次绑定设备的日期，格式是月日四位数字。但很多人会改成家里发生过大事的那天。\n\n别乱改配置，出了问题我可不管。",
    replyList: [
      { author: "TechMaster_Leo", time: "2029-12-03", content: "试了，开发者选项里确实有后台入口，感谢。" },
      { author: "Security_Guru", time: "2029-12-03", replyTo: "TechMaster_Leo", content: "后台能看到每一次改动是哪台设备做的，查问题很有用。" },
    ],
  },
];
