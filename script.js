const DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'baby-manual-timeline-checks-v1';
const PROFILE_KEY = 'baby-manual-profile-v1';
const BACKUP_APP = 'baby-manual';
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 1024 * 1024;
const SEX_PROFILE = {
  female: { label: '女宝宝', defaultNickname: '小棉袄', babyIcon: '🎀', heroIcon: '🌸', footerIcon: '🌷' },
  male: { label: '男宝宝', defaultNickname: '小盔甲', babyIcon: '🧸', heroIcon: '🌿', footerIcon: '🌱' }
};
const GROWTH_KEY = 'baby-manual-growth-v1';
const GROWTH_METRICS = {
  weight: { label: '体重', unit: 'kg', color: '#2f7d3e' },
  length: { label: '身长', unit: 'cm', color: '#cd8748' },
  head: { label: '头围', unit: 'cm', color: '#7d63ac' }
};
let babyProfile = loadProfile();
let BIRTH_DATE = parseLocalDate(babyProfile.birthDate);

const milestones = [
  {
    id: 'birth', age: '出生当天', icon: '🌷', title: '第一次见面',
    checkup: false,
    phase: '新生儿期 · 0—1个月',
    daily: [
      '观察吃奶、精神、呼吸、体温及大小便；有异常及时告知医护人员。',
      '每次入睡都仰卧在平整、坚实的婴儿床上，床内不放枕头、厚被、玩偶和防撞床围。',
      '按需哺乳并观察含乳、吞咽；配方奶严格按说明冲调，不随意加浓或稀释。',
      '脐带残端保持清洁干燥，尿布不要包住脐部；不自行涂粉或偏方。'
    ],
    tasks: [
      '完成新生儿即时评估；按医院安排接种乙肝疫苗第1剂和卡介苗。',
      '尽早肌肤接触并尝试第一次哺乳，妈妈与宝宝都不勉强。',
      '确认出生医学证明、新生儿疾病筛查和听力筛查的办理流程。',
      '保存出院小结、接种记录及医院复诊电话。'
    ]
  },
  {
    id: 'day-4', age: '出生第4天', icon: '🏥', title: '筛查与黄疸复查',
    checkup: false,
    tasks: [
      '确认新生儿遗传代谢病筛查是否已采血，以及结果查询方式。',
      '按出院医嘱复测黄疸、体重；不要靠晒太阳代替医学评估。',
      '核对首次社区儿保或新生儿访视的时间与联系方式。'
    ]
  },
  {
    id: 'day-8', age: '出生第8天', icon: '🏡', title: '回家后的第一次复盘',
    checkup: false,
    tasks: [
      '核对体重变化、吃奶及大小便情况；按医嘱决定是否提前复诊。',
      '检查睡眠环境：同房不同床，移走松软物品，避免过热和烟雾。',
      '全家学会正确抱姿与拍嗝；明确“绝不摇晃宝宝”的照护底线。'
    ]
  },
  {
    id: 'day-15', age: '出生第15天', icon: '🌤️', title: '两周龄照护调整',
    checkup: false,
    tasks: [
      '中国营养学会建议出生后数日起每日补充维生素D 10μg（400 IU）；无需常规补钙，具体方案由儿保医生结合宝宝情况确认。',
      '若黄疸仍明显、加深，或伴吃奶差、嗜睡、大便颜色变浅，应及时就医。',
      '检查尿布尺码与衣物厚度，以颈背部温热、不出汗为参考。'
    ]
  },
  {
    id: 'month-1', age: '1月龄', icon: '🌱', title: '满月儿保与疫苗',
    checkup: {
      name: '满月健康管理（出生后28—30天）',
      items: [
        '测量体重、身长、头围，评估满月增长并绘制生长曲线。',
        '检查黄疸、脐部愈合、皮肤与髋关节，观察视听反应。',
        '反馈喂养与大小便情况；核对维生素D每日补充方案。',
        '带好出院小结、新生儿筛查结果和疫苗本。'
      ],
      note: '依据《国家基本公共卫生服务规范（第三版）》，满月健康管理是正式儿保节点；具体时间以当地社区卫生服务中心安排为准。'
    },
    phase: '婴儿早期 · 1—6个月',
    daily: [
      '按需喂养，观察饥饿和吃饱信号；不喂水、蜂蜜或辅食，配方奶按比例冲调。',
      '清醒且有人全程看护时少量多次趴玩；睡眠仍保持仰卧和安全睡眠环境。',
      '多回应宝宝的声音与表情，说话、唱歌、看简单图卡；不做强迫训练。',
      '逐步建立固定的睡前顺序；白天保持正常光线与活动，夜间低光、低刺激，不强迫小月龄宝宝睡整夜。',
      '维生素D通常每日400 IU（10μg），避免多种制剂重复补充；钙、铁、DHA等不因“大家都补”而自行添加。',
    ],
    tasks: [
      '进行满月儿保：测量体重、身长、头围，评估喂养、视听反应与发育情况。',
      '核对乙肝疫苗第2剂的接种或预约记录，并确认下一次接种时间。',
      '确认听力及新生儿筛查结果；异常结果按医嘱复诊，不等待自愈。',
      '整理宝宝健康档案：出院资料、体检数据、疫苗本和就诊记录。'
    ]
  },
  {
    id: 'day-43', age: '出生第43天', icon: '🤱', title: '产后42天左右复查',
    checkup: false,
    tasks: [
      '妈妈完成产后复查，关注伤口、盆底、情绪、睡眠及避孕等问题。',
      '宝宝是否需同步复查按当地儿保安排，重点反馈吃奶、排便和体重增长。',
      '重新安排夜间照护轮班；持续情绪低落、焦虑或失眠时主动寻求专业帮助。'
    ]
  },
  {
    id: 'month-2', age: '2月龄', icon: '✨', title: '疫苗、抬头与社交微笑',
    tasks: [
      '依据2026版国家免疫程序，2月龄安排脊灰疫苗第1剂和百白破疫苗第1剂；以当地门诊预约为准。',
      '若考虑五联、13价肺炎或轮状疫苗，本月尽早与广州门诊制定衔接方案；轮状部分产品首剂限6—12周龄，五联不能与免费剂次机械叠加。',
      '按当地安排完成儿保，和医生交流追视、对声音的反应、抬头及吃奶情况。',
      '准备应对傍晚哭闹高峰：轮班照护；难以承受时将宝宝仰卧放入安全婴儿床，短暂离开透气，绝不摇晃。',
      {
        female: '私处护理：女宝宝轻柔清洁外阴，由前向后擦拭，不深入清洗，也不用妇科洗液；红肿、持续异味或异常分泌物需就医。',
        male: '私处护理：男宝宝轻柔清洁外阴和阴囊皮肤，不强行翻包皮或拉扯；红肿、排尿异常或异常分泌物需就医。'
      },
      '若对声音无明显反应、完全不注视人脸，或任何已有能力出现倒退，及时咨询儿保医生。'
    ]
  },
  {
    id: 'month-3', age: '3月龄', icon: '🧸', title: '脊灰第2剂与翻身准备',
    checkup: {
      name: '3月龄婴幼儿健康管理',
      items: [
        '测量体重、身长、头围，与满月数据对比评估生长趋势。',
        '观察抬头、追视、逗笑、双手张开与抓握等发育表现。',
        '询问喂养方式、奶量、睡眠与维生素D补充情况。',
        '按当地安排进行发育筛查；同一门诊日常可衔接脊灰第2剂接种。'
      ],
      note: '国家规范建议3、6、8、12、18、24、30、36月龄各进行一次健康管理；是否另设2、4月龄体检由当地门诊安排。'
    },
    tasks: [
      '依据2026版国家免疫程序，3月龄安排脊灰疫苗第2剂；百白破第2剂在4月龄，不再沿用旧版3、4、5月龄程序。',
      '观察抬头稳定性、双手是否逐渐放开及社交回应，在体检时主动反馈疑虑。',
      '开始按“可能会突然翻身”预防坠落：换尿布时一手始终护住宝宝，不单独留在高处。',
      '检查玩具：无小零件、长绳和破损，摇铃等需符合年龄与安全标准。'
    ]
  },
  {
    id: 'month-4', age: '4月龄', icon: '🍑', title: '翻身期与居家防坠',
    tasks: [
      '依据2026版国家免疫程序，4月龄安排脊灰疫苗第3剂和百白破疫苗第2剂。',
      '完成4月龄相关儿保或发育观察，记录主动抓握、翻身尝试与互动发声。',
      '排查坠落、夹伤和误吞风险；不使用学步车，不让宝宝独处沙发或成人床。',
      '若计划调整喂养或提前添加辅食，先与儿保医生讨论，不因“长得快”自行提前。'
    ]
  },
  {
    id: 'month-5', age: '5月龄', icon: '🥣', title: '为第一口辅食做准备',
    checkup: false,
    tasks: [
      '现行国家程序不在5月龄常规安排百白破；请核对2、4月龄记录。若选五联等自费方案，按产品说明书与门诊衔接，勿重复或漏种。',
      '评估辅食准备信号：能较稳控制头颈、有支撑地坐、对食物感兴趣；不以月龄单一项决定。',
      '准备带安全带的高脚餐椅、小勺和围兜，学习坐着进食及呛噎急救知识。',
      '列出首轮食物：强化铁婴儿米粉、肉泥等富铁食物；规划一次一种、少量尝试的添加顺序。'
    ]
  },
  {
    id: 'month-6', age: '6月龄', icon: '🥄', title: '辅食正式启动',
    checkup: {
      name: '6月龄健康管理与贫血筛查',
      items: [
        '测量体重、身长、头围，评估近期生长速度与曲线走向。',
        '回顾辅食启动：富铁食物、质地、进食量与呛噎风险。',
        '国家规范在6—8月龄安排一次血常规（或血红蛋白）检测，是否当场查以门诊为准。',
        '评估翻身、坐的趋势、伸手抓物、咿呀发声；确认首次口腔检查安排。'
      ],
      note: '带上近期辅食记录（种类、量、过敏反应）和接种证，便于医生综合判断。'
    },
    phase: '婴儿中期 · 6—12个月',
    daily: [
      '继续母乳或配方奶；具备准备信号后逐步添加辅食，先保证富铁食物，奶仍是重要营养来源。',
      '进食时坐直并全程成人看护；食物软硬和形状匹配能力，不边走边吃。',
      '出牙后用含氟牙膏米粒大小早晚刷牙，牙膏用量和氟浓度听从儿童口腔医生建议。',
      '安排地板自由活动、亲子阅读和户外时间；睡眠与乘车安全规则保持不变。'
    ],
    tasks: [
      '开始辅食时从少量泥糊状开始，逐步增加稠度与种类；新食物留意皮疹、呕吐、喘憋等反应。',
      '1岁前不喂蜂蜜，不以鲜牛奶替代母乳或配方奶，不额外加盐、糖和果汁。',
      '依据2026版国家免疫程序，6月龄安排乙肝疫苗第3剂、百白破疫苗第3剂和A群流脑多糖疫苗第1剂；具体以门诊安排为准。',
      '预约6月龄儿保，评估生长、发育、喂养及贫血风险；是否查血常规由医生决定。',
      '预约首次儿童口腔检查；第一颗牙萌出后或1岁前建立口腔健康档案。'
    ]
  },
  {
    id: 'month-8', age: '8月龄', icon: '🐢', title: '爬行期安全与疫苗',
    checkup: {
      name: '8月龄健康管理',
      items: [
        '测量体重、身长、头围，观察生长曲线是否平稳。',
        '评估独坐、爬行、扶站、拇食指捏取与互动游戏表现。',
        '讨论辅食进展、咀嚼练习、户外活动与睡眠。',
        '按当地安排完成发育筛查；本月常同时进行麻腮风、乙脑疫苗接种。'
      ],
      note: '对听力、视力或互动有疑虑时当场提出，不必等下一次体检。'
    },
    tasks: [
      '参考免疫程序，通常安排麻腮风疫苗第1剂、乙脑疫苗第1剂；种类和时间依地区方案。',
      '按“会爬、会拉物”重新布置家居：固定柜子和电视，安装插座保护、楼梯门与窗户限位。',
      '收好纽扣电池、磁珠、药品、小零件及热水；洗澡和近水时保持一臂范围内看护。',
      '根据咀嚼与抓握能力逐渐引入软烂手指食物，避免整粒坚果、整颗葡萄、爆米花等高危食物。'
    ]
  },
  {
    id: 'month-9', age: '9月龄', icon: '👏', title: '发育评估与自主进食',
    tasks: [
      '按当地安排完成9月龄儿保，交流坐爬、捏取、回应名字、发音及分离焦虑。',
      '依据2026版国家免疫程序，9月龄安排A群流脑多糖疫苗第2剂；如使用符合条件的流脑结合疫苗替代，需由门诊核对接种记录。',
      '提供安全的手指食物和练习杯，允许宝宝参与进食；不强迫吃完，也不追喂。',
      '玩躲猫猫、拍手和找玩具等互动游戏，观察共同注意与动作模仿。'
    ]
  },
  {
    id: 'month-12', age: '1周岁', icon: '🎂', title: '周岁体检与饮食过渡',
    checkup: {
      name: '1周岁健康管理',
      items: [
        '测量体重、身长、头围，评估一年生长速度与曲线位置。',
        '大运动、精细动作、语言和社交互动的综合发育评估。',
        '讨论饮食过渡、奶量、牙齿萌出与口腔护理；按医嘱决定是否查血常规。',
        '核对疫苗记录，讨论水痘等非免疫规划疫苗的适用与安排。'
      ],
      note: '国家规范在6、12、24、36月龄用行为测听法进行听力筛查，具体执行以当地门诊为准。'
    },
    phase: '学步期 · 1—2岁',
    daily: [
      '逐步建立三餐和加餐节律，继续母乳或选择合适奶类；食物多样、少盐少糖，不用食物奖励。',
      '早晚刷牙，使用合适大小的牙刷与含氟牙膏；具体用量遵循儿童口腔医生指导。',
      '保证地板运动、户外活动和亲子共读，多描述生活，不要求识字或抢跑学习。',
      '提供可安全探索的空间，照护者回应情绪并设定少量、一致的安全规则。'
    ],
    tasks: [
      '完成周岁儿保：生长曲线、大运动、精细动作、语言和社交互动综合评估。',
      '逐步从泥糊过渡到软碎、手指食物和家庭清淡饮食，避免只喝奶而进食种类单一。',
      '核对疫苗本并与医生讨论水痘等非免疫规划疫苗的适用与安排。',
      '乘车继续使用符合身高体重上限的后向式安全座椅，不在车内长时间抱睡。',
      '走路早晚差异很大；若能力倒退或无法扶站等，及时让儿保医生评估。'
    ]
  },
  {
    id: 'month-15', age: '15月龄', icon: '🚶', title: '走稳与语言积累',
    checkup: false,
    tasks: [
      '按当地安排进行儿保，记录独走、蹲下站起、有意识叫人和简单指令理解。',
      '随着攀爬能力增强，再次检查家具固定、楼梯门、窗台和厨房危险物品。',
      '逐渐减少奶瓶依赖，改用杯子；不含着奶瓶入睡，避免长时间频繁夜奶。',
      '通过指认物品、读图和回应发音扩展语言，不用电子屏幕替代真人交流。'
    ]
  },
  {
    id: 'month-18', age: '18月龄', icon: '💬', title: '语言与发育筛查',
    checkup: {
      name: '18月龄健康管理与发育筛查',
      items: [
        '测量体重、身长、头围并评估生长曲线。',
        '评估独走、跑动、蹲起、握笔涂鸦与简单指令理解。',
        '国家规范在18月龄安排一次血常规（或血红蛋白）检测。',
        '与医生讨论语言与互动表现，按当地安排进行孤独症风险筛查。'
      ],
      note: '就诊时可带上日常记录的发音、指物与互动片段，比现场短时间观察更有参考价值。'
    },
    tasks: [
      '参考免疫程序，通常安排百白破第4剂、麻腮风第2剂及甲肝等疫苗，以当地方案为准。',
      '完成18月龄儿保及发育筛查，与医生讨论孤独症风险筛查；担忧不必等到“再大看看”。',
      '关注词汇、指物分享兴趣、模仿和互动；语言能力倒退、不应名或少对视应尽早评估。',
      '2岁前尽量不安排娱乐性屏幕时间，视频通话除外；不要用屏幕长期安抚。'
    ]
  },
  {
    id: 'month-24', age: '2周岁', icon: '🎨', title: '自主意识与如厕准备',
    checkup: {
      name: '2周岁健康管理',
      items: [
        '测量体重、身长、头围并评估生长曲线。',
        '综合评估语言（双词短语）、运动、社交与自理能力。',
        '国家规范在24月龄安排行为测听法听力筛查；视力与口腔检查按当地安排。',
        '讨论如厕准备、屏幕时间与行为情绪，核对疫苗接种记录。'
      ]
    },
    phase: '幼儿期 · 2—3岁',
    daily: [
      '鼓励自己吃饭、收拾玩具、穿脱简单衣物，给有限选择并允许慢一点。',
      '固定吃饭、睡眠、阅读和户外节奏；情绪爆发时先保证安全，再简短共情和设限。',
      '每天亲子共读和自由游戏，屏幕内容需适龄、限时并由成人陪同讨论。',
      '早晚刷牙并定期口腔检查；继续使用后向式座椅至产品身高或体重上限，再按说明转换。'
    ],
    tasks: [
      '完成2周岁儿保，综合评估语言、运动、社交和自理能力，并再次核对疫苗接种记录。',
      '观察如厕准备信号，如能保持尿布较干、会表达需求、能走到便盆；不强迫、不惩罚尿裤子。',
      '通过角色扮演和轮流游戏学习分享；两岁宝宝仍需要成人帮助，不把冲突贴成“没教养”。',
      '核对乙脑第2剂及其他漏种疫苗是否需补种，按当地接种门诊安排。'
    ]
  },
  {
    id: 'month-30', age: '2岁半', icon: '🧩', title: '社交、自理与规则',
    checkup: {
      name: '2岁半健康管理',
      items: [
        '测量体重、身长、头围并评估生长曲线。',
        '观察简单句子、两步指令、双脚跳、同伴互动等表现。',
        '国家规范在30月龄安排一次血常规（或血红蛋白）检测。',
        '回顾近半年进食、睡眠、屏幕时间与户外活动，获取调整建议。'
      ]
    },
    tasks: [
      '按当地安排儿保，关注简单句子、假装游戏、与同伴互动和基本自理能力。',
      '如使用甲肝灭活疫苗，核对第2剂是否完成；其他疫苗继续按接种证查漏。',
      '练习在陪同下遵守两步骤指令、收拾物品及表达需求，为集体生活做准备。',
      '若持续听不清、说话难以理解或社交互动明显困难，安排听力、语言或发育评估。'
    ]
  },
  {
    id: 'month-36', age: '3周岁', icon: '🎒', title: '入园准备与全面体检',
    checkup: {
      name: '3周岁健康管理与入园体检',
      items: [
        '测量身高（站高）、体重，按当地规范评估生长情况。',
        '大运动、精细动作、语言、认知与社交情绪的综合发育评估。',
        '国家规范在36月龄安排听力筛查；视力、口腔检查按当地与入园要求进行。',
        '核对疫苗记录并补种漏种；如需入园体检证明，提前问清当地要求。'
      ]
    },
    tasks: [
      '完成3周岁儿保，按建议评估视力、听力、口腔、语言、运动及社交情绪。',
      '依据2026版国家免疫程序，3周岁安排A群C群流脑多糖疫苗第1剂；同时核对接种证和入园材料，需要补种时与门诊制定计划。',
      '提前演练分离、表达如厕和求助、简单穿脱及收拾物品，不要求入园前必须完全独立。',
      '逐步调整作息接近幼儿园节奏，用绘本介绍集体生活，允许宝宝紧张并反复确认安全感。'
    ]
  }
];
let completedTasks = loadCompletedTasks();
let growthRecords = loadGrowthRecords();
let currentGrowthMetric = 'weight';
let currentFilter = 'all';
let currentMilestone;
let nextMilestone;
let nextCheckupMilestone;

function loadProfile() {
  const fallback = { birthDate: '2026-01-01', sex: 'female', nickname: '宝宝' };
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (!saved || !/^\d{4}-\d{2}-\d{2}$/.test(saved.birthDate)) return fallback;

    const sex = saved.sex === 'male' ? 'male' : 'female';
    const savedNickname = String(saved.nickname || '').trim().slice(0, 12);
    const isLegacyDefault = !savedNickname || savedNickname === '小公主';
    return {
      birthDate: saved.birthDate,
      sex,
      nickname: isLegacyDefault ? SEX_PROFILE[sex].defaultNickname : savedNickname
    };
  } catch (error) {
    return fallback;
  }
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(babyProfile));
    return true;
  } catch (error) {
    // 禁止本地存储时，自定义信息仅在本次打开期间有效。
    return false;
  }
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function todayAtNoon() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMilestoneDate(item) {
  const monthMatch = /^month-(\d+)$/.exec(item.id);
  if (monthMatch) return addMonthsClamped(BIRTH_DATE, Number(monthMatch[1]));

  const earlyDayOffsets = { birth: 0, 'day-4': 3, 'day-8': 7, 'day-15': 14, 'day-43': 42 };
  const offset = earlyDayOffsets[item.id];
  if (offset === undefined) throw new Error(`未知时间节点：${item.id}`);
  return new Date(BIRTH_DATE.getTime() + offset * DAY);
}

function formatDate(value) {
  const date = parseLocalDate(value);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 · 周${weekdays[date.getDay()]}`;
}

function daysBetween(start, end) {
  return Math.round((end - start) / DAY);
}

function addMonthsClamped(date, months) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

function calculateAge(today) {
  let totalMonths = (today.getFullYear() - BIRTH_DATE.getFullYear()) * 12
    + today.getMonth() - BIRTH_DATE.getMonth();

  if (addMonthsClamped(BIRTH_DATE, totalMonths) > today) totalMonths -= 1;
  totalMonths = Math.max(0, totalMonths);

  const anniversary = addMonthsClamped(BIRTH_DATE, totalMonths);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = daysBetween(anniversary, today);
  const parts = [];

  if (years > 0) parts.push(`${years}岁`);
  if (months > 0 || years === 0) parts.push(`${months}个月`);
  if (days > 0) parts.push(`${days}天`);

  return parts.join('');
}

function locateTimeline(today) {
  const dated = milestones.map(item => {
    const dateObject = getMilestoneDate(item);
    return { ...item, dateObject, date: formatISODate(dateObject) };
  });
  currentMilestone = [...dated].reverse().find(item => item.dateObject <= today) || dated[0];
  nextMilestone = dated.find(item => item.dateObject > today) || null;
  nextCheckupMilestone = dated.find(item => item.checkup && item.dateObject >= today) || null;
  return dated;
}

function getTaskText(task) {
  if (typeof task === 'string') return task;
  return task[babyProfile.sex] || task.female;
}

function taskMarkup(milestone, type, tasks) {
  return tasks.map((task, index) => {
    const id = `${milestone.id}-${type}-${index}`;
    const checked = completedTasks.has(id) ? 'checked' : '';
    return `
      <li>
        <label class="task-item" for="${id}">
          <input id="${id}" type="checkbox" data-task-id="${id}" ${checked}>
          <span class="custom-checkbox" aria-hidden="true"></span>
          <span>${getTaskText(task)}</span>
        </label>
      </li>`;
  }).join('');
}

function getAgeRange(item) {
  if (item.dateObject < addMonthsClamped(BIRTH_DATE, 6)) return 'early';
  if (item.dateObject < addMonthsClamped(BIRTH_DATE, 12)) return 'infant';
  if (item.dateObject < addMonthsClamped(BIRTH_DATE, 24)) return 'toddler';
  return 'preschool';
}

function renderTimeline(today) {
  const dated = locateTimeline(today);
  const timeline = document.getElementById('timeline');

  timeline.innerHTML = dated.map(item => {
    const dayNumber = daysBetween(BIRTH_DATE, item.dateObject) + 1;

    return `
      <div class="milestone-wrapper" data-range="${getAgeRange(item)}" data-checkup="${item.checkup ? 'true' : 'false'}">
        ${item.phase ? `<div class="phase-banner"><span>${item.phase}</span><small>本阶段每日事项见下方起点卡片</small></div>` : ''}
        <article id="${item.id}" class="milestone">
          <div class="timeline-meta">
            <strong>${item.age}</strong>
            <time datetime="${item.date}">${formatDate(item.date)}</time>
            <span>出生第${dayNumber}天</span>
          </div>
          <div class="timeline-dot" aria-hidden="true"><span>${item.icon}</span></div>
          <details class="milestone-card">
            <summary>
              <div><h3>${item.title}</h3>${item.checkup ? '<span class="checkup-tag">🩺 儿保日</span>' : ''}</div>
              <span class="expand-icon" aria-hidden="true">＋</span>
            </summary>
            <div class="card-content">
              ${item.checkup ? `
                <section class="checkup-reminder">
                  <div class="checkup-title"><span aria-hidden="true">🩺</span><h4>儿保提醒 · ${item.checkup.name}</h4></div>
                  <ul class="checkup-list">${item.checkup.items.map(text => `<li>${text}</li>`).join('')}</ul>
                  ${item.checkup.note ? `<p class="checkup-note">${item.checkup.note}</p>` : ''}
                </section>` : ''}
              ${item.daily ? `
                <section class="daily-routine">
                  <div class="daily-title"><span aria-hidden="true">🔁</span><h4>本阶段每日事项</h4></div>
                  <p>从这里开始执行，后续时间节点不再重复。</p>
                  <ul class="task-list">${taskMarkup(item, 'daily', item.daily)}</ul>
                </section>` : ''}
              <section class="time-tasks">
                <h4>这个时间点的重要事项</h4>
                <ul class="task-list">${taskMarkup(item, 'time', item.tasks)}</ul>
              </section>
            </div>
          </details>
        </article>
      </div>`;
  }).join('');

  document.getElementById('expandAll').textContent = '展开全部';
  updateSummary(today);
  updateProgress();
}

function updateSummary(today) {
  const dayNumber = daysBetween(BIRTH_DATE, today) + 1;
  const presentation = SEX_PROFILE[babyProfile.sex] || SEX_PROFILE.female;
  document.getElementById('babyDisplay').textContent = babyProfile.nickname;
  document.getElementById('sexDisplay').textContent = presentation.label;
  document.getElementById('babyIcon').textContent = presentation.babyIcon;
  document.getElementById('heroFlower').textContent = presentation.heroIcon;
  document.getElementById('birthDateDisplay').textContent = formatDate(formatISODate(BIRTH_DATE)).split(' · ')[0];
  document.getElementById('heroGreeting').textContent = `我们的${babyProfile.nickname} · 成长大事记`;
  document.getElementById('footerNote').textContent = `为我们的${babyProfile.nickname}，认真爱，慢慢陪。${presentation.footerIcon}`;
  document.getElementById('currentAge').textContent = calculateAge(today);
  document.getElementById('daysAlive').textContent = `第${dayNumber}天`;

  if (currentMilestone) {
    document.getElementById('nowTitle').textContent = `${currentMilestone.age} · ${currentMilestone.title}`;
    document.getElementById('nowDescription').textContent =
      `对应日期为${formatDate(currentMilestone.date)}。每日事项只在该阶段起点列出，本卡片聚焦这个时间点的新任务。`;
  }

  if (nextMilestone) {
    const remaining = daysBetween(today, nextMilestone.dateObject);
    document.getElementById('nextTitle').textContent = `${nextMilestone.age} · ${nextMilestone.title}`;
    document.getElementById('nextDate').textContent = `${formatDate(nextMilestone.date)}，还有${remaining}天`;
  } else {
    document.getElementById('nextTitle').textContent = '时间轴已走到最后';
    document.getElementById('nextDate').textContent = '可以继续记录宝宝3岁后的成长。';
  }

  const checkupTitle = document.getElementById('nextCheckupTitle');
  const checkupDate = document.getElementById('nextCheckupDate');
  if (checkupTitle && checkupDate) {
    if (nextCheckupMilestone) {
      const remaining = daysBetween(today, nextCheckupMilestone.dateObject);
      checkupTitle.textContent = `${nextCheckupMilestone.age} · ${nextCheckupMilestone.checkup.name}`;
      checkupDate.textContent = remaining === 0
        ? '就是今天，记得带上健康档案与疫苗本。'
        : `${formatDate(nextCheckupMilestone.date)}，还有${remaining}天，可提前向社区儿保门诊预约。`;
    } else {
      checkupTitle.textContent = '3岁内常规儿保节点已完成';
      checkupDate.textContent = '之后按当地安排继续定期体检与发育评估。';
    }
  }

  const ageInDays = dayNumber - 1;
  const weeks = Math.floor(ageInDays / 7);
  const weekDays = ageInDays % 7;
  const rotaAlert = document.getElementById('rotaAlert');
  if (ageInDays <= 90) {
    rotaAlert.innerHTML = `<strong>⏰ 当前轮状疫苗时间窗提醒：</strong>宝宝今天约${weeks}周${weekDays}天。部分轮状产品首剂限6—12周龄，若考虑接种，请尽快联系广州接种门诊确认产品、首剂期限和库存，不要等到3月龄再安排。`;
  } else if (ageInDays <= 224) {
    rotaAlert.innerHTML = '<strong>轮状疫苗提醒：</strong>宝宝可能已接近或超过部分产品的首剂期限，请带接种证由门诊判断可选方案，不自行补种。';
  } else {
    rotaAlert.hidden = true;
  }
}

function getChecklistKey() {
  return `${STORAGE_KEY}-${babyProfile.birthDate}`;
}

function loadCompletedTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(getChecklistKey()) || '[]');
    return new Set(Array.isArray(saved) ? saved : []);
  } catch (error) {
    return new Set();
  }
}

function saveCompletedTasks() {
  try {
    localStorage.setItem(getChecklistKey(), JSON.stringify([...completedTasks]));
    return true;
  } catch (error) {
    // 浏览器禁止本地存储时仍可在当前页面勾选，不影响阅读。
    return false;
  }
}

function getValidTaskIds() {
  const validIds = new Set();
  milestones.forEach(item => {
    item.tasks.forEach((task, index) => validIds.add(`${item.id}-time-${index}`));
    (item.daily || []).forEach((task, index) => validIds.add(`${item.id}-daily-${index}`));
  });
  return validIds;
}

function createBackup() {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      birthDate: babyProfile.birthDate,
      sex: babyProfile.sex,
      nickname: babyProfile.nickname
    },
    completedTasks: [...completedTasks].sort(),
    growthRecords: [...growthRecords]
  };
}

function parseBackup(text, today = todayAtNoon()) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error('备份文件格式不正确，请选择由本页面导出的 JSON 文件。');
  }

  if (!data || data.app !== BACKUP_APP || data.version !== BACKUP_VERSION) {
    throw new Error('这不是受支持的宝宝使用说明书备份文件。');
  }

  const profile = data.profile;
  if (!profile || typeof profile.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)) {
    throw new Error('备份中的出生日期无效。');
  }
  const birthDate = parseLocalDate(profile.birthDate);
  if (formatISODate(birthDate) !== profile.birthDate || birthDate > today) {
    throw new Error('备份中的出生日期无效或晚于今天。');
  }
  if (!['female', 'male'].includes(profile.sex)) {
    throw new Error('备份中的宝宝性别无效。');
  }
  if (typeof profile.nickname !== 'string') {
    throw new Error('备份中的宝宝称呼无效。');
  }
  const nickname = profile.nickname.trim();
  if (!nickname || nickname.length > 12) {
    throw new Error('备份中的宝宝称呼为空或超过12个字符。');
  }
  if (!Array.isArray(data.completedTasks) || data.completedTasks.some(id => typeof id !== 'string')) {
    throw new Error('备份中的勾选记录格式无效。');
  }

  const validIds = getValidTaskIds();
  const suppliedTasks = [...new Set(data.completedTasks)];
  const validTasks = suppliedTasks.filter(id => validIds.has(id));
  const growthRecords = Array.isArray(data.growthRecords)
    ? data.growthRecords.filter(isValidGrowthRecord).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  return {
    profile: { birthDate: profile.birthDate, sex: profile.sex, nickname },
    completedTasks: validTasks,
    growthRecords,
    skippedTasks: suppliedTasks.length - validTasks.length
  };
}

function applyBackup(backup) {
  babyProfile = backup.profile;
  BIRTH_DATE = parseLocalDate(babyProfile.birthDate);
  completedTasks = new Set(backup.completedTasks);
  growthRecords = backup.growthRecords || [];
  const profileSaved = saveProfile();
  const tasksSaved = saveCompletedTasks();
  const growthSaved = saveGrowthRecords();

  document.getElementById('sexInput').value = babyProfile.sex;
  document.getElementById('birthDateInput').value = babyProfile.birthDate;
  document.getElementById('nicknameInput').value = babyProfile.nickname;
  document.getElementById('nicknameInput').placeholder = `例如：${SEX_PROFILE[babyProfile.sex].defaultNickname}`;
  renderTimeline(todayAtNoon());
  applyFilter(currentFilter);
  refreshGrowthBounds();
  renderGrowth();
  return profileSaved && tasksSaved && growthSaved;
}

function setBackupStatus(message, isError = false) {
  const status = document.getElementById('backupStatus');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function downloadBackup() {
  const safeNickname = babyProfile.nickname.replace(/[\\/:*?"<>|]/g, '_');
  const filename = `宝宝使用说明书-${safeNickname}-${babyProfile.birthDate}.json`;
  const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return filename;
}

function updateProgress() {
  const total = milestones.reduce((sum, item) => sum + item.tasks.length + (item.daily?.length || 0), 0);
  const done = completedTasks.size;
  const percent = total ? Math.round(done / total * 100) : 0;
  document.getElementById('progressText').textContent = `已完成 ${done} / ${total} 项`;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressBar').parentElement.setAttribute('aria-label', `事项完成${percent}%`);
}

// ===== 生长记录 =====
function getGrowthKey() {
  return `${GROWTH_KEY}-${babyProfile.birthDate}`;
}

function isValidGrowthRecord(item) {
  if (!item || typeof item !== 'object') return false;
  if (typeof item.id !== 'string' || !item.id) return false;
  if (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return false;
  return ['weight', 'length', 'head'].some(key => typeof item[key] === 'number' && item[key] > 0);
}

function loadGrowthRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(getGrowthKey()) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(isValidGrowthRecord).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    return [];
  }
}

function saveGrowthRecords() {
  try {
    localStorage.setItem(getGrowthKey(), JSON.stringify(growthRecords));
    return true;
  } catch (error) {
    return false;
  }
}

function recordAge(dateStr) {
  const days = daysBetween(BIRTH_DATE, parseLocalDate(dateStr));
  const months = Math.floor(days / 30.4375);
  const restDays = Math.max(0, Math.round(days - months * 30.4375));
  return { months: days / 30.4375, label: `${months}个月${restDays > 0 ? restDays + '天' : ''}` };
}

function niceStep(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = n >= 5 ? 5 : n >= 2 ? 2 : 1;
  return step * pow;
}

function formatTick(v) {
  return String(Math.round(v * 100) / 100);
}

function getMetricPoints(metric) {
  return growthRecords
    .filter(record => typeof record[metric] === 'number')
    .map(record => ({ ...record, months: recordAge(record.date).months }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildGrowthChart(metric) {
  const meta = GROWTH_METRICS[metric];
  const points = getMetricPoints(metric);
  const W = 640, H = 280;
  const margin = { top: 26, right: 24, bottom: 36, left: 48 };
  const iw = W - margin.left - margin.right;
  const ih = H - margin.top - margin.bottom;
  const title = `<text x="${margin.left}" y="${margin.top - 8}" class="axis-label axis-title">${meta.label}（${meta.unit}）× 月龄</text>`;

  if (!points.length) {
    return `${title}<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="chart-empty">暂无${meta.label}记录，先添加一次测量</text>`;
  }

  const xVals = points.map(p => p.months);
  const yVals = points.map(p => p[metric]);
  let xMin = Math.min(...xVals), xMax = Math.max(...xVals);
  if (xMax - xMin < 1) { xMin -= 0.5; xMax += 0.5; }
  let yMin = Math.min(...yVals), yMax = Math.max(...yVals);
  const yPad = Math.max((yMax - yMin) * 0.2, yMax * 0.03);
  yMin = Math.max(0, yMin - yPad); yMax += yPad;

  const x = v => margin.left + (v - xMin) / (xMax - xMin) * iw;
  const y = v => margin.top + ih - (v - yMin) / (yMax - yMin) * ih;

  const yTicks = [];
  const yStep = niceStep((yMax - yMin) / 4);
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);
  const xTicks = [];
  const xStep = xMax - xMin > 18 ? 6 : xMax - xMin > 8 ? 3 : 1;
  for (let v = Math.ceil(xMin); v <= Math.floor(xMax); v += xStep) xTicks.push(v);

  const gridLines = yTicks.map(v =>
    `<line x1="${margin.left}" y1="${y(v)}" x2="${W - margin.right}" y2="${y(v)}" class="grid"/>
     <text x="${margin.left - 8}" y="${y(v) + 3}" text-anchor="end" class="axis-label">${formatTick(v)}</text>`).join('');
  const xLabels = xTicks.map(v =>
    `<text x="${x(v)}" y="${H - 12}" text-anchor="middle" class="axis-label">${v}月</text>`).join('');

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.months).toFixed(1)},${y(p[metric]).toFixed(1)}`).join(' ');
  const circles = points.map((p, i) =>
    `<circle cx="${x(p.months).toFixed(1)}" cy="${y(p[metric]).toFixed(1)}" r="4.5" class="chart-dot" style="fill:${meta.color}"/>
     <circle cx="${x(p.months).toFixed(1)}" cy="${y(p[metric]).toFixed(1)}" r="12" class="chart-hit" data-i="${i}" tabindex="0" aria-label="${formatDate(p.date)}，${meta.label}${p[metric]}${meta.unit}"/>`).join('');

  const last = points[points.length - 1];
  const lastLabel = points.length > 1
    ? `<text x="${Math.min(x(last.months) - 4, W - margin.right).toFixed(1)}" y="${(y(last[metric]) - 10).toFixed(1)}" text-anchor="end" class="chart-end-label">${formatTick(last[metric])}${meta.unit}</text>`
    : '';

  return `${title}${gridLines}${xLabels}
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${H - margin.bottom}" class="axis"/>
    <line x1="${margin.left}" y1="${H - margin.bottom}" x2="${W - margin.right}" y2="${H - margin.bottom}" class="axis"/>
    ${points.length > 1 ? `<path d="${path}" fill="none" style="stroke:${meta.color}" class="chart-line"/>` : ''}
    ${circles}
    <line id="growthGuide" x1="0" y1="${margin.top}" x2="0" y2="${H - margin.bottom}" class="chart-guide" hidden/>
    ${lastLabel}`;
}

function bindGrowthHover() {
  const svg = document.getElementById('growthChart');
  const tooltip = document.getElementById('growthTooltip');
  if (!svg || !tooltip || !svg.closest) return;
  const wrap = svg.closest('.growth-chart-wrap');
  const meta = GROWTH_METRICS[svg.dataset.metric || currentGrowthMetric];
  const points = getMetricPoints(svg.dataset.metric || currentGrowthMetric);
  const guide = svg.querySelector ? svg.querySelector('#growthGuide') : null;

  function showTip(circle) {
    const p = points[Number(circle.dataset.i)];
    if (!p || !wrap || !wrap.getBoundingClientRect) return;
    if (guide) {
      guide.setAttribute('x1', circle.getAttribute('cx'));
      guide.setAttribute('x2', circle.getAttribute('cx'));
      guide.hidden = false;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const px = svgRect.left - wrapRect.left + Number(circle.getAttribute('cx')) * (svgRect.width / 640);
    const py = svgRect.top - wrapRect.top + Number(circle.getAttribute('cy')) * (svgRect.height / 280);
    tooltip.innerHTML = `<strong>${formatDate(p.date)}</strong>（${recordAge(p.date).label}）<br>${meta.label} ${p[svg.dataset.metric]} ${meta.unit}`;
    tooltip.style.left = `${px}px`;
    tooltip.style.top = `${py - 8}px`;
    tooltip.hidden = false;
  }
  function hideTip() {
    tooltip.hidden = true;
    if (guide) guide.hidden = true;
  }

  if (!svg.querySelectorAll) return;
  svg.querySelectorAll('.chart-hit').forEach(hit => {
    hit.addEventListener('mouseenter', () => showTip(hit));
    hit.addEventListener('focus', () => showTip(hit));
    hit.addEventListener('mouseleave', hideTip);
    hit.addEventListener('blur', hideTip);
  });
}

function renderGrowth() {
  const svg = document.getElementById('growthChart');
  const tbody = document.getElementById('growthRecords');
  const empty = document.getElementById('growthEmpty');
  if (!svg || !tbody) return;

  svg.innerHTML = buildGrowthChart(currentGrowthMetric);
  svg.dataset.metric = currentGrowthMetric;

  tbody.innerHTML = growthRecords.map(record => {
    const cell = key => typeof record[key] === 'number' ? String(record[key]) : '—';
    return `<tr>
      <td>${formatDate(record.date)}</td>
      <td>${recordAge(record.date).label}</td>
      <td>${cell('weight')}</td>
      <td>${cell('length')}</td>
      <td>${cell('head')}</td>
      <td><button class="growth-delete" data-id="${record.id}" type="button">删除</button></td>
    </tr>`;
  }).join('');
  if (empty) empty.hidden = growthRecords.length > 0;

  bindGrowthHover();
}

function parseMetric(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function refreshGrowthBounds() {
  const dateInput = document.getElementById('growthDate');
  if (!dateInput) return;
  dateInput.min = formatISODate(BIRTH_DATE);
  dateInput.max = formatISODate(todayAtNoon());
}

function initGrowth() {
  const form = document.getElementById('growthForm');
  if (!form) return;
  const dateInput = document.getElementById('growthDate');
  const error = document.getElementById('growthFormError');
  refreshGrowthBounds();
  dateInput.value = formatISODate(todayAtNoon());

  document.querySelectorAll('.growth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentGrowthMetric = tab.dataset.metric;
      document.querySelectorAll('.growth-tab').forEach(t => t.classList.toggle('active', t === tab));
      renderGrowth();
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const date = dateInput.value;
    const weight = parseMetric(document.getElementById('growthWeight').value);
    const length = parseMetric(document.getElementById('growthLength').value);
    const head = parseMetric(document.getElementById('growthHead').value);

    const fail = msg => {
      if (error) { error.textContent = msg; error.hidden = false; }
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('请选择测量日期。');
    const recordDate = parseLocalDate(date);
    if (recordDate < BIRTH_DATE) return fail('测量日期早于出生日期，请核对。');
    if (recordDate > todayAtNoon()) return fail('测量日期不能晚于今天。');
    if (weight === null && length === null && head === null) return fail('请至少填写体重、身长或头围中的一项。');

    growthRecords.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      ...(weight !== null ? { weight } : {}),
      ...(length !== null ? { length } : {}),
      ...(head !== null ? { head } : {})
    });
    growthRecords.sort((a, b) => a.date.localeCompare(b.date));
    saveGrowthRecords();
    if (error) error.hidden = true;
    form.reset();
    dateInput.value = formatISODate(todayAtNoon());
    renderGrowth();
  });

  document.getElementById('growthRecords').addEventListener('click', event => {
    const btn = event.target.closest ? event.target.closest('.growth-delete') : null;
    if (!btn) return;
    growthRecords = growthRecords.filter(record => record.id !== btn.dataset.id);
    saveGrowthRecords();
    renderGrowth();
  });

  renderGrowth();
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-button').forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });

  let visibleCount = 0;
  document.querySelectorAll('.milestone-wrapper').forEach(wrapper => {
    let visible = false;
    if (filter === 'all') {
      visible = true;
    } else if (filter === 'checkup') {
      visible = wrapper.dataset.checkup === 'true';
    } else {
      visible = wrapper.dataset.range === filter;
    }
    wrapper.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  document.getElementById('emptyState').hidden = visibleCount > 0;
}

function initInteractions() {
  document.getElementById('timeline').addEventListener('change', event => {
    const checkbox = event.target.closest('input[data-task-id]');
    if (!checkbox) return;

    if (checkbox.checked) completedTasks.add(checkbox.dataset.taskId);
    else completedTasks.delete(checkbox.dataset.taskId);
    saveCompletedTasks();
    updateProgress();
  });

  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  });

  document.getElementById('jumpCurrent').addEventListener('click', () => {
    if (!currentMilestone) return;
    applyFilter('all');
    const card = document.querySelector(`#${currentMilestone.id} details`);
    if (card) card.open = true;
    document.getElementById(currentMilestone.id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('expandAll').addEventListener('click', event => {
    const visibleCards = [...document.querySelectorAll('.milestone-wrapper:not([hidden]) details')];
    const shouldOpen = visibleCards.some(card => !card.open);
    visibleCards.forEach(card => { card.open = shouldOpen; });
    event.currentTarget.textContent = shouldOpen ? '收起全部' : '展开全部';
  });
}

function initProfile() {
  const form = document.getElementById('profileForm');
  const sexInput = document.getElementById('sexInput');
  const birthInput = document.getElementById('birthDateInput');
  const nicknameInput = document.getElementById('nicknameInput');
  sexInput.value = babyProfile.sex;
  birthInput.value = babyProfile.birthDate;
  birthInput.max = formatISODate(todayAtNoon());
  nicknameInput.value = babyProfile.nickname;
  nicknameInput.placeholder = `例如：${SEX_PROFILE[babyProfile.sex].defaultNickname}`;

  sexInput.addEventListener('change', () => {
    const currentNickname = nicknameInput.value.trim();
    const defaultNicknames = [
      ...Object.values(SEX_PROFILE).map(profile => profile.defaultNickname),
      '宝宝', '小公主'
    ];
    if (!currentNickname || defaultNicknames.includes(currentNickname)) {
      nicknameInput.value = SEX_PROFILE[sexInput.value].defaultNickname;
    }
    nicknameInput.placeholder = `例如：${SEX_PROFILE[sexInput.value].defaultNickname}`;
    nicknameInput.setCustomValidity('');
  });
  birthInput.addEventListener('input', () => birthInput.setCustomValidity(''));
  nicknameInput.addEventListener('input', () => nicknameInput.setCustomValidity(''));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const today = todayAtNoon();
    const sex = sexInput.value === 'male' ? 'male' : 'female';
    const nextBirthDate = parseLocalDate(birthInput.value);
    const nickname = nicknameInput.value.trim();

    if (formatISODate(nextBirthDate) !== birthInput.value || nextBirthDate > today) {
      birthInput.setCustomValidity('请选择不晚于今天的有效出生日期。');
      birthInput.reportValidity();
      return;
    }
    if (!nickname) {
      nicknameInput.setCustomValidity('请填写宝宝称呼。');
      nicknameInput.reportValidity();
      return;
    }
    nicknameInput.setCustomValidity('');

    babyProfile = { birthDate: birthInput.value, sex, nickname: nickname.slice(0, 12) };
    BIRTH_DATE = nextBirthDate;
    completedTasks = loadCompletedTasks();
    growthRecords = loadGrowthRecords();
    saveProfile();
    renderTimeline(today);
    applyFilter(currentFilter);
    refreshGrowthBounds();
    renderGrowth();
    document.querySelector('.profile-settings').open = false;
  });
}

function initBackup() {
  const fileInput = document.getElementById('importFile');

  document.getElementById('exportData').addEventListener('click', () => {
    try {
      const filename = downloadBackup();
      setBackupStatus(`已生成备份“${filename}”，请在浏览器下载记录中查看。`);
    } catch (error) {
      setBackupStatus('导出失败，请检查浏览器是否允许下载后重试。', true);
    }
  });

  document.getElementById('importData').addEventListener('click', () => {
    setBackupStatus('');
    fileInput.click();
  });

  fileInput.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > MAX_BACKUP_BYTES) {
        throw new Error('备份文件超过1 MB，请选择由本页面导出的 JSON 文件。');
      }
      const backup = parseBackup(await file.text());
      const profile = backup.profile;
      const sexLabel = SEX_PROFILE[profile.sex].label;
      const confirmed = window.confirm(
        `确认导入“${profile.nickname}”（${sexLabel}，${profile.birthDate}）的备份？\n\n`
        + `备份含${backup.completedTasks.length}项事项记录和${backup.growthRecords.length}条生长记录。导入后将切换到这个宝宝，`
        + '并覆盖本机同生日的记录；其他生日记录不受影响。'
      );
      if (!confirmed) {
        setBackupStatus('已取消导入，现有记录未改变。');
        return;
      }

      const persisted = applyBackup(backup);
      let message = `已导入“${profile.nickname}”的${backup.completedTasks.length}项事项记录和${backup.growthRecords.length}条生长记录。`;
      if (backup.skippedTasks > 0) message += `已忽略${backup.skippedTasks}个无法识别的旧事项。`;
      if (!persisted) message += '浏览器未允许本地保存，刷新后可能丢失，请立即重新导出备份。';
      setBackupStatus(message, !persisted);
    } catch (error) {
      setBackupStatus(error.message || '导入失败，请检查备份文件后重试。', true);
    } finally {
      event.target.value = '';
    }
  });
}

function initBudget() {
  const combo = document.getElementById('budgetCombo');
  const pcv = document.getElementById('budgetPcv');
  const rota = document.getElementById('budgetRota');
  const other = document.getElementById('budgetOther');
  const controls = [combo, pcv, rota, other];

  function updateBudget() {
    const comboCost = Number(combo.value);
    const pcvCost = Number(pcv.value);
    const rotaCost = Number(rota.value);
    const otherCost = Math.max(0, Number(other.value) || 0);
    const total = comboCost + pcvCost + rotaCost + otherCost;
    const details = [comboCost > 0 ? '进口五联' : '免费基础方案'];

    if (pcvCost > 0) details.push(pcv.selectedOptions[0].textContent.split('｜')[0] + '13价肺炎');
    if (rotaCost > 0) details.push(rota.selectedOptions[0].textContent.split('｜')[0] + '轮状');
    if (otherCost > 0) details.push(`其他预留¥${otherCost.toLocaleString('zh-CN')}`);

    document.getElementById('budgetTotal').textContent = `¥${total.toLocaleString('zh-CN')}`;
    document.getElementById('budgetBreakdown').textContent = details.length > 1 || otherCost > 0
      ? `包含：${details.join('、')}。实际以广州门诊报价为准。`
      : '当前仅选择免费基础方案，未选其他自费项目。';
  }

  controls.forEach(control => control.addEventListener('input', updateBudget));
  updateBudget();
}

document.addEventListener('DOMContentLoaded', () => {
  const today = todayAtNoon();
  initProfile();
  initBackup();
  renderTimeline(today);
  initInteractions();
  initBudget();
  initGrowth();
  initMilestoneTabs();
});

// 儿保指南 - 发育里程碑Tab切换
function initMilestoneTabs() {
  const tabs = document.querySelectorAll('.milestone-tabs .tab');
  const panels = document.querySelectorAll('.milestone-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}
