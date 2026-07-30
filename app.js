/* ============================================
   烘焙工作台 v3 - 粉色烘焙风完整版
   配方CRUD + 图片上传 + 星级 + 倍率换算
   + 采购清单合并 + 库存 + 计时器
   + 自定义分类 + 心得 + 制作计划
   + 数据导入导出 + 字体缩放 + 夜间模式
============================================ */

// ============ 封面简图库 ============
const RECIPE_EMOJIS = [
  // 蛋糕类
  '🎂', '🍰', '🍮', '🧁', '🥧', '🍩', '🥐', '🥮',
  // 面包类
  '🍞', '🥖', '🥯', '🫓', '🥪',
  // 饼干甜点
  '🍪', '🍫', '🍬', '🍭', '🍯',
  // 水果相关
  '🍓', '🍒', '🍑', '🍎', '🍋', '🍌', '🍇', '🍉',
  // 饮品/茶
  '🍵', '☕', '🥛', '🧋',
  // 烘焙工具
  '🥄', '🧈', '🧂', '🥚', '🌾'
];

function renderEmojiGrid(selected) {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;
  grid.innerHTML = RECIPE_EMOJIS.map(function(em) {
    var sel = em === selected ? ' selected' : '';
    return '<button type="button" class="emoji-btn' + sel + '" data-emoji="' + em + '" onclick="selectEmoji(\'' + em + '\')">' + em + '</button>';
  }).join('');
}

function selectEmoji(em) {
  state.tempEmoji = em;
  // 重新渲染高亮
  document.querySelectorAll('.emoji-btn').forEach(function(b) {
    if (b.dataset.emoji === em) b.classList.add('selected');
    else b.classList.remove('selected');
  });
  // 如果有照片，不冲突；emoji 作为兜底缩略显示
}

// ============ 烘焙原料市价库（参考盒马/京东2024-2025零售均价，元/g 或 元/ml 或 元/个） ============
// 单位统一为：元/g（元/克），蛋类/液体按 元/个、元/ml
const INGREDIENT_PRICES = {
  // 粉类
  '高筋面粉': 0.018, '低筋面粉': 0.022, '中筋面粉': 0.015, '全麦面粉': 0.025,
  '玉米淀粉': 0.020, '糯米粉': 0.018, '杏仁粉': 0.45, '可可粉': 0.35,
  '抹茶粉': 1.2, '奶粉': 0.30, '芝士粉': 0.80, '面包粉': 0.020,
  // 糖类
  '白砂糖': 0.012, '细砂糖': 0.012, '糖粉': 0.018, '红糖': 0.020,
  '糖浆': 0.025, '蜂蜜': 0.080, '麦芽糖': 0.030, '木糖醇': 0.080,
  '代糖': 0.30,
  // 油脂
  '黄油': 0.10, '无盐黄油': 0.10, '盐黄油': 0.11, '玉米油': 0.030,
  '橄榄油': 0.080, '色拉油': 0.020, '酥油': 0.030, '起酥油': 0.025,
  '椰子油': 0.10, '淡奶油': 0.065, '奶油奶酪': 0.080, '马苏里拉芝士': 0.10,
  '芝士': 0.10, '干酪': 0.15,
  // 乳制品
  '牛奶': 0.022, '全脂牛奶': 0.022, '脱脂牛奶': 0.020, '酸奶': 0.040,
  '炼乳': 0.040, '乳酪': 0.080,
  // 蛋类
  '鸡蛋': 1.0, '蛋白': 0.50, '蛋黄': 0.60, '鸭蛋': 2.0, '鹌鹑蛋': 0.20,
  // 酵母/膨松剂
  '酵母': 0.20, '耐高糖酵母': 0.30, '泡打粉': 0.060, '苏打粉': 0.040,
  '塔塔粉': 0.20, '吉利丁': 0.50, '吉利丁片': 0.50,
  // 调味料
  '盐': 0.005, '海盐': 0.040, '柠檬汁': 0.080, '白醋': 0.010,
  '香草精': 0.50, '柠檬皮屑': 0.50,
  // 巧克力/坚果
  '巧克力': 0.12, '黑巧克力': 0.18, '白巧克力': 0.15, '可可脂': 0.30,
  '核桃': 0.10, '杏仁': 0.12, '腰果': 0.18, '榛子': 0.20, '花生': 0.040,
  '开心果': 0.50, '松子': 0.80, '瓜子仁': 0.10,
  // 果干/水果
  '蔓越莓干': 0.10, '葡萄干': 0.060, '红枣': 0.060, '桂圆': 0.10,
  '草莓': 0.10, '蓝莓': 0.20, '香蕉': 0.020, '苹果': 0.020,
  // 液体
  '水': 0.0001, '温水': 0.0001, '凉水': 0.0001,
  // 其它
  '椰蓉': 0.10, '椰丝': 0.10, '奶粉/糖粉': 0.30,
  '白芝麻': 0.080, '黑芝麻': 0.080, '肉松': 0.10, '香葱': 0.030,
  '火腿': 0.080, '培根': 0.10, '豆沙': 0.040
};

// 单位换算比例（to 克 或 to 毫升）
const UNIT_CONVERSION = {
  'g': 1, '克': 1,
  'ml': 1, '毫升': 1,
  'kg': 1000, '千克': 1000,
  'L': 1000, '升': 1000,
  '个': null,    // 蛋类按个算
  '只': null,
  '颗': null,
  '滴': 0.05,    // 1滴≈0.05ml
  '片': null,    // 吉利丁片等按重量
  '勺': 15,      // 1勺≈15g（汤匙）
  '汤匙': 15,
  '茶匙': 5,
  '包': null,
  '袋': null,
  '盒': null,
  '杯': 240,
  '份': null,
  '条': null,
  '块': null,
  '根': null,
  '适量': 1, '少许': 1
};

function estimateCost(name, amount, unit) {
  // 直接查表
  var directPrice = INGREDIENT_PRICES[name];
  if (!directPrice) {
    // 模糊匹配：去掉 "无盐""低脂" 等修饰词
    var stripped = name.replace(/(无盐|有盐|低脂|高脂|常温|新鲜|有机)/g, '');
    for (var key in INGREDIENT_PRICES) {
      if (name.indexOf(key) >= 0 || stripped === key || stripped.indexOf(key) >= 0) {
        directPrice = INGREDIENT_PRICES[key];
        break;
      }
    }
  }
  if (!directPrice) return 0;

  // 单位换算
  if (unit === '个' || unit === '只' || unit === '颗' || unit === '滴') {
    return directPrice * amount;  // 蛋类/液体按个数
  }
  var gramPerUnit = UNIT_CONVERSION[unit];
  if (!gramPerUnit) return directPrice * amount;  // 兜底
  return directPrice * amount * gramPerUnit;
}

// 批量估算配料成本
function autoFillCosts() {
  var filled = 0;
  var total = 0;
  state.tempIngredients.forEach(function(ing, idx) {
    if (ing.name && ing.amount) {
      var cost = estimateCost(ing.name, parseFloat(ing.amount), ing.unit || 'g');
      if (cost > 0) {
        ing.cost = Math.round(cost * 100) / 100;  // 保留2位
        filled++;
        total += ing.cost;
      }
    }
  });
  renderIngRows();
  return { filled: filled, total: Math.round(total * 100) / 100 };
}

// ============ 默认分类 ============
const DEFAULT_CATEGORIES = {
  all:    { name: '全部配方', icon: '📋', custom: false },
  bread:  { name: '面包类',   icon: '🍞', custom: false },
  cake:   { name: '蛋糕类',   icon: '🎂', custom: false },
  cookie: { name: '饼干类',   icon: '🍪', custom: false },
  pastry: { name: '酥点类',   icon: '🥐', custom: false },
  cn:     { name: '中式烘焙类', icon: '🥮', custom: false },
  filled: { name: '夹心酱类', icon: '🥫', custom: false }
};

let CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));

const CAT_COLOR_MAP = {
  bread: '#ff7a8f', cake: '#a85a4a', cookie: '#d68555',
  pastry: '#b07ec5', cn: '#8aa050', filled: '#5a8aa8'
};

const CUSTOM_COLORS = ['#ff7a8f', '#a85a4a', '#d68555', '#8aa050', '#b07ec5', '#5a8aa8'];

// ============ 示例配方 ============
const SAMPLE_RECIPES = [
  {
    id: 'r1', cat: 'bread', name: '北海道牛奶吐司', emoji: '🍞', photo: '',
    rating: 3, temp: '上火180/下火200', duration: '25 分钟', scale: 1,
    outputQty: 1, outputUnit: '条',
    ingredients: [
      { name: '高筋面粉', amount: 250, unit: 'g', cost: 4.5 },
      { name: '牛奶', amount: 120, unit: 'g', cost: 1.2 },
      { name: '淡奶油', amount: 35, unit: 'g', cost: 1.4 },
      { name: '黄油', amount: 25, unit: 'g', cost: 1.2 },
      { name: '细砂糖', amount: 35, unit: 'g', cost: 0.4 },
      { name: '盐', amount: 3, unit: 'g', cost: 0.05 },
      { name: '耐高糖酵母', amount: 3, unit: 'g', cost: 0.3 }
    ],
    steps: [
      '除黄油外所有材料入揉面桶，搅拌至成团',
      '加入软化黄油，继续揉至完全扩展阶段（能拉出透光薄膜）',
      '28℃湿度75%发酵约60分钟至2倍大',
      '排气分割整形，入450g吐司模',
      '35℃湿度80%二次发酵至8分满',
      '入炉前刷全蛋液，烤后立即脱模防缩腰'
    ],
    ovenTip: '原配方上火180/下火200，森歌D5ZK平炉取170℃，烤盘放中层偏下；表面上色后（约18分钟）盖锡纸防焦，底层垫空烤盘隔热防糊底。',
    difficulty: [
      '面团需揉至完全扩展阶段',
      '一发温度28℃湿度75%',
      '二发温度35℃湿度80%'
    ],
    tags: ['早餐', '咸口', '拉丝']
  },
  {
    id: 'r2', cat: 'cake', name: '古早味戚风蛋糕', emoji: '🍰', photo: '',
    rating: 4, temp: '上火150/下火160', duration: '60 分钟', scale: 1,
    outputQty: 1, outputUnit: '个（8寸）',
    ingredients: [
      { name: '鸡蛋', amount: 5, unit: '个', cost: 3 },
      { name: '低筋面粉', amount: 85, unit: 'g', cost: 1.2 },
      { name: '玉米油', amount: 50, unit: 'g', cost: 1 },
      { name: '牛奶', amount: 50, unit: 'g', cost: 0.5 },
      { name: '细砂糖（蛋白）', amount: 60, unit: 'g', cost: 0.6 },
      { name: '柠檬汁', amount: 3, unit: '滴', cost: 0.05 }
    ],
    steps: [
      '蛋黄与蛋白分离，蛋黄中加入玉米油和牛奶拌匀',
      '筛入低筋面粉翻拌至无干粉',
      '蛋白加柠檬汁，分三次加糖打发至湿性偏干',
      '分三次将蛋白霜与蛋黄糊翻拌均匀',
      '倒入模具，烤盘注热水水浴法烘烤',
      '出炉立即倒扣，彻底晾凉再脱模'
    ],
    ovenTip: '森歌D5ZK平炉设150℃，烤盘注水做水浴，模具外包锡纸防进水；下层烤，最后10分钟观察上色，必要时盖锡纸。底火偏弱可延长5分钟。',
    difficulty: [
      '蛋白打发至湿性偏干（小弯钩），切勿打过头',
      '翻拌手法要轻，避免消泡',
      '水浴法底层注热水，模具外包锡纸',
      '出炉立即倒扣，彻底晾凉再脱模'
    ],
    tags: ['生日', '绵软', '水浴']
  },
  {
    id: 'r3', cat: 'pastry', name: '鲜肉蛋黄酥', emoji: '🥮', photo: '',
    rating: 5, temp: '上火180/下火190', duration: '35 分钟', scale: 1,
    outputQty: 16, outputUnit: '个',
    ingredients: [
      { name: '中筋面粉', amount: 240, unit: 'g', cost: 3 },
      { name: '猪油', amount: 90, unit: 'g', cost: 3 },
      { name: '温水', amount: 90, unit: 'g', cost: 0 },
      { name: '低筋面粉（油酥）', amount: 180, unit: 'g', cost: 2.2 },
      { name: '猪油（油酥）', amount: 90, unit: 'g', cost: 3 },
      { name: '咸蛋黄', amount: 16, unit: '个', cost: 12 },
      { name: '肉松', amount: 100, unit: 'g', cost: 4 },
      { name: '豆沙', amount: 320, unit: 'g', cost: 6 },
      { name: '蛋黄液', amount: 1, unit: '个', cost: 0.6 }
    ],
    steps: [
      '水油皮材料揉成光滑面团，松弛30分钟',
      '油酥材料拌匀备用',
      '水油皮包油酥，擀卷两次',
      '卷好的皮子擀开包入豆沙肉松蛋黄馅',
      '表面刷蛋黄液撒黑芝麻',
      '烤箱预热，中层烘烤35分钟'
    ],
    ovenTip: '森歌D5ZK平炉取175℃中层；先烤20分钟定型，取出刷第二次蛋液撒芝麻，再烤15分钟。平炉底火不足，烤盘放中下层延长5分钟。',
    difficulty: [
      '水油皮需揉至扩展出膜，松弛30分钟',
      '油酥软硬度需与水油皮一致',
      '开酥全程注意保湿防干裂',
      '咸蛋黄喷酒烤5分钟去腥后再包'
    ],
    tags: ['送礼', '中秋', '开酥']
  },
  {
    id: 'r4', cat: 'cake', name: '巴斯克焦香芝士', emoji: '🧀', photo: '',
    rating: 2, temp: '上下火220', duration: '25 分钟', scale: 1,
    outputQty: 1, outputUnit: '个（6寸）',
    ingredients: [
      { name: '奶油奶酪', amount: 250, unit: 'g', cost: 25 },
      { name: '细砂糖', amount: 60, unit: 'g', cost: 0.6 },
      { name: '淡奶油', amount: 150, unit: 'g', cost: 6 },
      { name: '鸡蛋', amount: 2, unit: '个', cost: 1.2 },
      { name: '低筋面粉', amount: 10, unit: 'g', cost: 0.15 }
    ],
    steps: [
      '奶油奶酪室温软化至顺滑',
      '加入细砂糖搅拌均匀',
      '分次加入蛋液拌匀',
      '加入淡奶油拌匀',
      '筛入低筋面粉过筛',
      '倒入模具，220℃烤25分钟'
    ],
    ovenTip: '原配方上下火220，平炉取200℃（降20℃防过焦），中层烤；表面深焦糖色即可出炉，冷藏4小时后食用口感最佳。',
    difficulty: [
      '奶油奶酪需提前室温软化至顺滑',
      '鸡蛋分次加入避免油水分离',
      '过筛面糊使口感更细腻'
    ],
    tags: ['免烤', '入门', '芝士控']
  },
  {
    id: 'r5', cat: 'cn', name: '黑芝麻馒头', emoji: '⚪', photo: '',
    rating: 1, temp: '0', duration: '蒸 15 分钟', scale: 1,
    outputQty: 8, outputUnit: '个',
    ingredients: [
      { name: '中筋面粉', amount: 300, unit: 'g', cost: 3 },
      { name: '水', amount: 150, unit: 'g', cost: 0 },
      { name: '细砂糖', amount: 20, unit: 'g', cost: 0.2 },
      { name: '酵母', amount: 3, unit: 'g', cost: 0.3 },
      { name: '熟黑芝麻粉', amount: 40, unit: 'g', cost: 3 },
      { name: '猪油', amount: 5, unit: 'g', cost: 0.15 }
    ],
    steps: [
      '所有材料揉成光滑面团',
      '发酵至2倍大（约50分钟）',
      '充分排气揉至切面无大气孔',
      '整形后二次醒发15分钟',
      '冷水上锅蒸15分钟，焖3分钟出锅'
    ],
    ovenTip: '使用森歌D5ZK蒸箱模式，100℃蒸15分钟；蒸前冷水上锅，水开后计时，关火后焖3分钟再开盖防回缩。',
    difficulty: [
      '一次发酵至2倍大',
      '排气要充分',
      '关火后焖3分钟防塌陷'
    ],
    tags: ['早餐', '蒸制', '一次发酵']
  },
  {
    id: 'r6', cat: 'cookie', name: '法式马卡龙', emoji: '🍪', photo: '',
    rating: 5, temp: '上下火150', duration: '15 分钟', scale: 1,
    outputQty: 20, outputUnit: '对',
    ingredients: [
      { name: '杏仁粉', amount: 100, unit: 'g', cost: 12 },
      { name: '糖粉', amount: 100, unit: 'g', cost: 2 },
      { name: '蛋清', amount: 75, unit: 'g', cost: 1.5 },
      { name: '细砂糖', amount: 75, unit: 'g', cost: 0.7 },
      { name: '水', amount: 25, unit: 'g', cost: 0 },
      { name: '食用色素', amount: 1, unit: '滴', cost: 0.1 }
    ],
    steps: [
      '杏仁粉糖粉混合过筛两次',
      '蛋清打至粗泡，分次加糖打至硬性发泡',
      '糖+水烧至118℃，缓慢倒入蛋清打发',
      '蛋白霜与杏仁粉翻拌至缎带状',
      '装裱花袋挤圆形，静置至结皮',
      '中层150℃烤15分钟'
    ],
    ovenTip: '森歌D5ZK平炉设150℃中层；底火偏弱建议烤盘下垫硅胶垫隔热，避免底部上色过深。出炉待凉再取。',
    difficulty: [
      '杏仁粉糖粉需过筛两次',
      '意式蛋白霜糖浆烧至118℃',
      '翻拌至缎带状流淌（Lava阶段）',
      '挤好后静置结皮'
    ],
    tags: ['法式', '高难度', '送礼']
  },
  {
    id: 'r7', cat: 'cookie', name: '经典提拉米苏', emoji: '☕', photo: '',
    rating: 3, temp: '0', duration: '冷藏 4 小时', scale: 1,
    outputQty: 1, outputUnit: '个（6寸）',
    ingredients: [
      { name: '马斯卡彭奶酪', amount: 250, unit: 'g', cost: 35 },
      { name: '淡奶油', amount: 200, unit: 'g', cost: 8 },
      { name: '细砂糖', amount: 50, unit: 'g', cost: 0.5 },
      { name: '蛋黄', amount: 3, unit: '个', cost: 1.8 },
      { name: '手指饼干', amount: 200, unit: 'g', cost: 8 },
      { name: '浓缩咖啡', amount: 150, unit: 'g', cost: 2 },
      { name: '咖啡酒', amount: 30, unit: 'g', cost: 8 },
      { name: '可可粉', amount: 10, unit: 'g', cost: 1 }
    ],
    steps: [
      '蛋黄隔水加热加糖打发至浓稠发白',
      '马斯卡彭搅拌至顺滑',
      '淡奶油打至6分发',
      '三者混合拌匀',
      '手指饼干快速蘸咖啡液',
      '分层组装，冷藏4小时以上'
    ],
    ovenTip: '免烤甜品，无需使用烤箱。手指饼干快速蘸咖啡液（1秒），浸泡过久会塌软。冷藏定型至少4小时，过夜更佳。',
    difficulty: [
      '蛋黄隔水加热打发至浓稠发白',
      '马斯卡彭冷藏状态使用',
      '淡奶油打至6分发',
      '分层组装后冷藏定型'
    ],
    tags: ['免烤', '咖啡', '冷藏']
  },
  {
    id: 'r8', cat: 'pastry', name: '蔓越莓贝果', emoji: '🥯', photo: '',
    rating: 3, temp: '上火210/下火190', duration: '20 分钟', scale: 1,
    outputQty: 6, outputUnit: '个',
    ingredients: [
      { name: '高筋面粉', amount: 250, unit: 'g', cost: 4.5 },
      { name: '水', amount: 135, unit: 'g', cost: 0 },
      { name: '细砂糖', amount: 10, unit: 'g', cost: 0.1 },
      { name: '盐', amount: 4, unit: 'g', cost: 0.05 },
      { name: '黄油', amount: 8, unit: 'g', cost: 0.4 },
      { name: '耐高糖酵母', amount: 3, unit: 'g', cost: 0.3 },
      { name: '蔓越莓干', amount: 50, unit: 'g', cost: 3 }
    ],
    steps: [
      '所有材料揉至扩展阶段',
      '一发后冷藏松弛30分钟',
      '分割整形为贝果形状',
      '煮糖水每面30秒',
      '沥干后入烤箱中层',
      '200℃烤20分钟'
    ],
    ovenTip: '森歌D5ZK平炉取200℃。贝果先煮糖水再入炉，烤盘垫硅胶垫防粘；中层烤，15分钟后盖锡纸防上色过深。',
    difficulty: [
      '面团含水量低揉至扩展即可',
      '一发后冷藏松弛便于整形',
      '煮糖水每面30秒',
      '入炉前可撒白芝麻'
    ],
    tags: ['低脂', '早餐', '耐储存']
  }
];

// ============ 应用状态 ============
let state = {
  recipes: [],
  memos: [],
  plans: [],
  favorites: [],          // 收藏 id 列表
  stock: {},              // 库存 {name: amount}
  customCats: [],
  currentCat: 'all',
  currentRecipeId: null,
  searchKeyword: '',
  editingId: null,
  mobileTab: 'recipe',
  tempPhoto: '',
  tempRating: 0,
  tempEmoji: '',            // 表单中选中的 emoji 封面
  tempIngredients: [],    // 表单中的配料
  currentScale: 1,        // 当前详情页的倍率
  ingChecks: {},          // {recipeId: {ingName: bool}}
  fontSize: 14,
  darkMode: false
};

const STORAGE_KEY = 'baking_workbench_v3';

// ============ 初始化 ============
function init() {
  loadState();
  rebuildCategories();
  bindEvents();
  applyFontSize();
  applyDarkMode();
  render();
  registerSW();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.recipes = data.recipes || [];
      state.memos = data.memos || [];
      state.plans = data.plans || [];
      state.favorites = data.favorites || [];
      state.stock = data.stock || {};
      state.customCats = data.customCats || [];
      state.fontSize = data.fontSize || 14;
      state.darkMode = data.darkMode || false;
      // 不再自动加载示例配方：用户数据优先
    } catch (e) {
      // JSON 解析失败：保留空状态，不覆盖
      console.warn('loadState parse error, keep empty state');
    }
  } else {
    // 检查旧版本 key（v2 兼容）
    const LEGACY_KEYS = ['baking_workbench', 'baking_workbench_v2', 'baking-workbench-v1', 'baking_workbench_v1'];
    for (var i = 0; i < LEGACY_KEYS.length; i++) {
      var legacy = localStorage.getItem(LEGACY_KEYS[i]);
      if (legacy) {
        try {
          var data = JSON.parse(legacy);
          if (data.recipes && data.recipes.length > 0) {
            // 迁移到新 key
            state.recipes = data.recipes;
            state.memos = data.memos || [];
            state.plans = data.plans || [];
            state.favorites = data.favorites || [];
            state.stock = data.stock || {};
            state.customCats = data.customCats || [];
            saveState();  // 持久化到新 key
            showToast('已迁移 ' + data.recipes.length + ' 个配方 ✓');
            return;
          }
        } catch (e) {}
      }
    }
    // 全新用户：空状态，不加载示例
  }
}

function loadSamples() {
  // 已废弃：不再自动加载示例配方
  // 保留函数为了 resetData 兼容（如果用户主动重置）
  state.recipes = [];
  state.memos = [];
  state.plans = [];
  state.favorites = [];
  state.stock = {};
}

function rebuildCategories() {
  CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  state.customCats.forEach(c => {
    CATEGORIES[c.id] = { name: c.name, icon: c.icon || '📌', custom: true };
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    recipes: state.recipes,
    memos: state.memos,
    plans: state.plans,
    favorites: state.favorites,
    stock: state.stock,
    customCats: state.customCats,
    fontSize: state.fontSize,
    darkMode: state.darkMode
  }));
}

// ============ Service Worker ============
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW ok:', reg.scope))
        .catch(err => console.log('SW fail:', err));
    });
  }
}

// ============ 字体缩放 ============
function applyFontSize() {
  document.documentElement.style.fontSize = state.fontSize + 'px';
}

function changeFontSize(delta) {
  state.fontSize = Math.max(11, Math.min(20, state.fontSize + delta));
  applyFontSize();
  saveState();
  showToast('字号：' + state.fontSize + 'px');
}

// ============ 夜间模式 ============
function applyDarkMode() {
  document.body.classList.toggle('dark-mode', state.darkMode);
  const moon = document.querySelector('[onclick="toggleDarkMode()"]');
  if (moon) moon.textContent = state.darkMode ? '☀️' : '🌙';
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  applyDarkMode();
  saveState();
}

// ============ 事件绑定 ============
function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchKeyword = e.target.value.trim().toLowerCase();
    renderContent();
  });
  window.addEventListener('resize', handleResize);

  // 星级点击
  document.querySelectorAll('#f-stars .star').forEach(s => {
    s.addEventListener('click', () => {
      state.tempRating = parseInt(s.dataset.v);
      updateStars();
    });
  });
}

function handleResize() {
  const main = document.querySelector('.main');
  if (window.innerWidth <= 900) {
    main.classList.remove('show-recipe', 'show-sidebar', 'show-plan', 'show-memo');
    main.classList.add('show-' + state.mobileTab);
  } else {
    main.classList.remove('show-recipe', 'show-sidebar', 'show-plan', 'show-memo');
  }
}

function switchMobileTab(tab) {
  state.mobileTab = tab;
  const main = document.querySelector('.main');
  main.classList.remove('show-recipe', 'show-sidebar', 'show-plan', 'show-memo');
  main.classList.add('show-' + tab);
  document.querySelectorAll('.m-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  // 关键：切回配方 Tab 时重新渲染配方列表
  if (tab === 'recipe') {
    state.currentRecipeId = null;  // 退出详情页
    renderContent();
  }
  if (tab === 'plan') renderPlansTab();
  if (tab === 'memo') renderMemoTab();
}

function updateStars() {
  document.querySelectorAll('#f-stars .star').forEach(s => {
    const v = parseInt(s.dataset.v);
    s.classList.toggle('filled', v <= state.tempRating);
  });
}

// ============ 主渲染 ============
function render() {
  renderCategoryList();
  renderTagCloud();
  renderContent();
  renderFooter();
  refreshSelects();
}

function renderCategoryList() {
  const list = document.getElementById('categoryList');
  list.innerHTML = Object.entries(CATEGORIES).map(([id, cat]) => {
    const count = id === 'all' ? state.recipes.length : state.recipes.filter(r => r.cat === id).length;
    const color = cat.custom ? '' : CAT_COLOR_MAP[id] || '';
    const style = color ? `background:linear-gradient(135deg, ${color}, ${color}cc)` : '';
    return `
      <li class="category-item ${state.currentCat === id ? 'active' : ''}" data-cat="${id}" onclick="selectCategory('${id}')">
        <span class="cat-icon" style="${style ? '-webkit-background-clip:text;background-clip:text;color:transparent' : ''}">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${count}</span>
      </li>`;
  }).join('');
}

function renderFooter() {
  document.getElementById('footerCount').textContent = state.recipes.length;
  document.getElementById('footerCustom').textContent = state.customCats.length;
}

function selectCategory(catId) {
  state.currentCat = catId;
  state.currentRecipeId = null;
  renderCategoryList();
  renderContent();
}

function renderTagCloud() {
  const cloud = document.getElementById('tagCloud');
  const tagMap = {};
  state.recipes.forEach(r => {
    (r.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
  });
  const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 16);
  cloud.innerHTML = sorted.map(([name]) =>
    `<span class="tag" onclick="searchByTag('${name}')">${name}</span>`
  ).join('');
}

function searchByTag(name) {
  document.getElementById('searchInput').value = name;
  state.searchKeyword = name.toLowerCase();
  renderContent();
}

// ============ 中栏渲染 ============
function renderContent() {
  if (state.currentRecipeId) {
    const recipe = state.recipes.find(r => r.id === state.currentRecipeId);
    if (recipe) { renderDetail(recipe); return; }
  }
  renderList();
}

function renderList() {
  const content = document.getElementById('content');
  let recipes = state.recipes;
  if (state.currentCat !== 'all') recipes = recipes.filter(r => r.cat === state.currentCat);
  if (state.searchKeyword) {
    const kw = state.searchKeyword;
    recipes = recipes.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      (r.ingredients || []).some(i => i.name.toLowerCase().includes(kw)) ||
      (r.tags || []).some(t => t.toLowerCase().includes(kw))
    );
  }

  const catName = CATEGORIES[state.currentCat] ? CATEGORIES[state.currentCat].name : '全部配方';

  if (recipes.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="icon">🥣</div>
        <div class="title">${state.searchKeyword ? '未找到匹配配方' : '暂无配方'}</div>
        <div class="desc">${state.searchKeyword ? '试试其他关键词' : '点击右上角「+ 新建」开始记录'}</div>
      </div>`;
    return;
  }

  // 标签筛选行（取前 6 个常用标签）
  const allTags = [...new Set(recipes.flatMap(r => r.tags || []))].slice(0, 6);
  const filterRow = allTags.length ? `
    <div class="filter-row">
      <span class="filter-label">标签筛选：</span>
      ${allTags.map(t => `<span class="filter-chip" onclick="searchByTag('${t}')">${t}</span>`).join('')}
      ${state.searchKeyword ? `<span class="filter-clear" onclick="clearSearch()">清空筛选</span>` : ''}
    </div>` : '';

  // 工具条：原料反查 + 网络搜索（紧凑布局）
  const recheckBar = `
    <div class="recheck-bar">
      <button class="mini-btn" onclick="toggleRecheck()">🔍 原料反查</button>
      <button class="mini-btn web" onclick="openWebSearch()">🌐 网络搜索</button>
      <div id="recheckPanel" style="display:none;margin-top:8px">
        <input type="text" id="recheckInput" placeholder="输入原料名，如 低筋面粉 / 黄油">
        <button class="mini-btn" onclick="recheckByIng()">查询</button>
        <button class="mini-btn" onclick="document.getElementById('recheckInput').value='';document.getElementById('recheckPanel').style.display='none'">关闭</button>
      </div>
    </div>`;

  const cards = recipes.map(r => {
    const cat = CATEGORIES[r.cat] || { icon: '📌', name: '未分类' };
    const thumbBg = r.photo ? `background-image:url('${r.photo}');background-size:cover;background-position:center` : '';
    const starsHtml = renderStars(r.rating || 0);
    return `
      <div class="recipe-card" onclick="selectRecipe('${r.id}')">
        <div class="recipe-thumb ${r.photo ? 'has-photo' : ''}" style="${thumbBg}">
          <span class="cat-badge">${cat.icon} ${cat.name}</span>
          ${r.photo ? '' : `<span class="recipe-emoji-big">${r.emoji || '🍰'}</span>`}
        </div>
        <div class="recipe-body">
          <div class="recipe-name">${r.name}</div>
          <div class="recipe-stars">${starsHtml}</div>
          <div class="recipe-meta">
            <span>🔥 ${r.temp || '-'}</span>
            <span>⏱️ ${r.duration || '-'}</span>
            <span>📦 ${r.outputQty || 1}${r.outputUnit || ''}</span>
          </div>
          <div class="recipe-tags">
            ${(r.tags || []).map(t => `<span class="mini-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }).join('');

  content.innerHTML = `
    <div class="content-header">
      <h2>${catName} <span class="result-count">· 共 ${recipes.length} 个配方${state.searchKeyword ? ' · 已选 ' + recipes.length + ' 个' : ''}</span></h2>
    </div>
    ${recheckBar}
    ${filterRow}
    <div class="recipe-grid">${cards}</div>
  `;
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  state.searchKeyword = '';
  renderContent();
}

function recheckByIng() {
  const v = document.getElementById('recheckInput').value.trim();
  if (!v) return;
  state.searchKeyword = v.toLowerCase();
  document.getElementById('searchInput').value = v;
  renderContent();
}

function toggleRecheck() {
  var p = document.getElementById('recheckPanel');
  p.style.display = p.style.display === 'none' ? 'flex' : 'none';
}

function openWebSearch() {
  // 弹出简易搜索框
  var q = prompt('输入要搜索的烘焙配方，如：\n• 巴斯克芝士蛋糕\n• 蔓越莓饼干\n• 全麦吐司');
  if (!q) return;
  // 跳转下厨房站内搜索
  var url = 'https://so.xiachufang.com/?keyword=' + encodeURIComponent(q);
  window.open(url, '_blank', 'noopener');
  showToast('已在新窗口打开下厨房搜索 ✓');
}

// ============ 详情页：换封面（独立弹窗） ============
let coverEditRecipeId = null;
let coverTempEmoji = '';
let coverTempPhoto = '';

function openCoverChanger(recipeId) {
  var r = state.recipes.find(function(x) { return x.id === recipeId; });
  if (!r) return;
  coverEditRecipeId = recipeId;
  coverTempEmoji = r.emoji || '🍰';
  coverTempPhoto = r.photo || '';
  
  // 渲染 emoji 网格
  var grid = document.getElementById('coverEmojiGrid');
  grid.innerHTML = RECIPE_EMOJIS.map(function(em) {
    var sel = em === coverTempEmoji ? ' selected' : '';
    return '<button type="button" class="emoji-btn' + sel + '" data-emoji="' + em + '" onclick="selectCoverEmoji(\'' + em + '\')">' + em + '</button>';
  }).join('');
  
  // 渲染照片预览
  var preview = document.getElementById('coverPhotoPreview');
  if (coverTempPhoto) {
    preview.style.backgroundImage = 'url(\'' + coverTempPhoto + '\')';
    preview.classList.add('has-image');
    preview.innerHTML = '<span class="remove-photo" onclick="event.stopPropagation();clearCoverPhoto()">×</span>';
  } else {
    preview.style.backgroundImage = '';
    preview.classList.remove('has-image');
    preview.innerHTML = '<span class="upload-hint">点击上传照片</span>';
  }
  
  document.getElementById('coverModal').classList.add('show');
}

function selectCoverEmoji(em) {
  coverTempEmoji = em;
  coverTempPhoto = '';  // 选了 emoji 就清空照片
  document.querySelectorAll('#coverEmojiGrid .emoji-btn').forEach(function(b) {
    if (b.dataset.emoji === em) b.classList.add('selected');
    else b.classList.remove('selected');
  });
  // 清空照片预览
  var preview = document.getElementById('coverPhotoPreview');
  preview.style.backgroundImage = '';
  preview.classList.remove('has-image');
  preview.innerHTML = '<span class="upload-hint">点击上传照片</span>';
}

function handleCoverPhotoUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('图片过大，请压缩到 4MB 以内'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    coverTempPhoto = e.target.result;
    coverTempEmoji = '';  // 上传照片就不需要 emoji
    var preview = document.getElementById('coverPhotoPreview');
    preview.style.backgroundImage = 'url(\'' + coverTempPhoto + '\')';
    preview.classList.add('has-image');
    preview.innerHTML = '<span class="remove-photo" onclick="event.stopPropagation();clearCoverPhoto()">×</span>';
  };
  reader.readAsDataURL(file);
}

function clearCoverPhoto() {
  coverTempPhoto = '';
  var preview = document.getElementById('coverPhotoPreview');
  preview.style.backgroundImage = '';
  preview.classList.remove('has-image');
  preview.innerHTML = '<span class="upload-hint">点击上传照片</span>';
  document.getElementById('cover-photo').value = '';
  // 恢复 emoji 选中
  if (!coverTempEmoji) coverTempEmoji = '🍰';
  document.querySelectorAll('#coverEmojiGrid .emoji-btn').forEach(function(b) {
    if (b.dataset.emoji === coverTempEmoji) b.classList.add('selected');
    else b.classList.remove('selected');
  });
}

function saveCover() {
  var r = state.recipes.find(function(x) { return x.id === coverEditRecipeId; });
  if (!r) return;
  r.emoji = coverTempEmoji || '🍰';
  r.photo = coverTempPhoto || '';
  saveState();
  closeModal('coverModal');
  // 重新渲染详情页
  if (state.currentRecipeId === r.id) renderDetail(r);
  // 重新渲染列表
  renderContent();
  showToast('封面已更新 ✓');
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= rating ? 'filled' : 'empty'}">★</span>`;
  }
  return html;
}

// ============ 详情页 ============
function renderDetail(recipe) {
  const content = document.getElementById('content');
  const cat = CATEGORIES[recipe.cat] || { icon: '📌', name: '未分类' };
  const scale = state.currentScale || 1;
  const ingChecks = state.ingChecks[recipe.id] || {};

  const photoSection = `
    <div class="detail-photo-section">
      ${recipe.photo
        ? `<img class="detail-photo" src="${recipe.photo}" alt="成品图">`
        : `<div class="detail-photo-empty emoji-fallback"><div class="recipe-emoji-big">${recipe.emoji || '🍰'}</div><div class="emoji-hint">点击 ✏️ 更换封面图</div></div>`}
      <div class="cover-actions">
        <button class="cover-btn" onclick="event.stopPropagation();openCoverChanger('${recipe.id}')" title="更换封面">✏️ 换封面</button>
      </div>
    </div>`;

  const ingItems = (recipe.ingredients || []).map((i, idx) => {
    const checked = ingChecks[i.name] || false;
    const amt = scale === 1 ? i.amount : formatAmount(i.amount * scale);
    return `
      <div class="ing-item ${checked ? 'checked' : ''}" onclick="toggleIngCheck('${recipe.id}', '${escapeHtml(i.name)}')">
        <span class="ing-check">${checked ? '✓' : ''}</span>
        <span class="ing-name">${escapeHtml(i.name)}</span>
        <span class="ing-amt">${amt}${i.unit || ''}</span>
        <span class="ing-actions" onclick="event.stopPropagation()">
          <button onclick="editIngInDetail('${recipe.id}', ${idx})" title="编辑">✏️</button>
          <button class="del" onclick="delIngInDetail('${recipe.id}', ${idx})" title="删除">🗑️</button>
        </span>
      </div>`;
  }).join('');

  const stepItems = (recipe.steps || []).map((s, idx) => {
    // 小标题格式：【蛋黄糊制作】
    if (/^【.+】$/.test(s)) {
      return `<li class="step-item step-subtitle">${escapeHtml(s)}</li>`;
    }
    return `
    <li class="step-item">
      <span class="step-bar"></span>
      <span class="step-text">${escapeHtml(s)}</span>
    </li>`;
  }).join('');

  const diffList = (recipe.difficulty || []).map(d =>
    `<div class="difficulty-item"><span class="diff-bullet">◆</span><span>${escapeHtml(d)}</span></div>`
  ).join('');

  const fav = state.favorites.includes(recipe.id);
  const totalCost = (recipe.ingredients || []).reduce((s, i) => s + (i.cost || 0), 0);
  const unitCost = recipe.outputQty ? (totalCost / recipe.outputQty).toFixed(2) : '-';

  content.innerHTML = `
    <div class="content-header">
      <h2><button class="tb-btn" onclick="backToList()" style="padding:6px 12px">← 返回列表</button></h2>
    </div>
    <div class="recipe-detail">
      <div class="detail-head">
        <div class="recipe-check ${fav ? 'checked' : ''}" onclick="toggleFavorite('${recipe.id}')">${fav ? '✓' : ''}</div>
        <div class="detail-title">${recipe.name} <span class="detail-stars">${renderStars(recipe.rating || 0)}</span></div>
        <div class="detail-actions">
          <button class="icon-btn" onclick="duplicateRecipe('${recipe.id}')" title="复制">📋</button>
          <button class="icon-btn" onclick="openRecipeModal('${recipe.id}')" title="编辑">✏️</button>
          <button class="icon-btn" onclick="openPurchaseModal(['${recipe.id}'])" title="加入采购">🛒</button>
          <button class="icon-btn" onclick="openPlanModal('${recipe.id}')" title="添加计划">📅</button>
          <button class="icon-btn danger" onclick="deleteRecipe('${recipe.id}')" title="删除">🗑️</button>
        </div>
      </div>

      <div class="param-row">
        <div class="param-badge temp"><span class="icon">🔥</span>${recipe.temp || '-'}℃</div>
        <div class="param-badge time"><span class="icon">⏱️</span>${recipe.duration || '-'}</div>
        <div class="param-badge output"><span class="icon">📦</span>${recipe.outputQty || 1}${recipe.outputUnit || ''}</div>
        <div class="param-badge output" style="background:linear-gradient(135deg,#fff0e0,#ffe0c0);color:#c87830"><span class="icon">💰</span>成本 ¥${totalCost.toFixed(2)} · 单价 ¥${unitCost}</div>
      </div>

      <div class="param-row" style="background:linear-gradient(135deg,#fff8e0,#fff0c8);border-left:3px solid #f0b840">
        <div style="font-size:13px;color:#b88820"><span style="font-weight:600">💡</span> ${recipe.ovenTip || '暂无适配提示'}</div>
      </div>

      <div class="scale-row">
        <span class="scale-label">倍率换算：</span>
        <button class="scale-btn ${scale === 0.5 ? 'active' : ''}" onclick="setScale(0.5)">½</button>
        <button class="scale-btn ${scale === 1 ? 'active' : ''}" onclick="setScale(1)">×1</button>
        <button class="scale-btn ${scale === 2 ? 'active' : ''}" onclick="setScale(2)">×2</button>
        <button class="scale-btn ${scale === 3 ? 'active' : ''}" onclick="setScale(3)">×3</button>
        <button class="scale-btn ${scale === 5 ? 'active' : ''}" onclick="setScale(5)">×5</button>
        <input type="number" class="scale-input" id="scaleCustom" placeholder="倍数" step="0.5" min="0.1" value="${scale}" onchange="setScale(parseFloat(this.value)||1)">
        <button class="scale-reset" onclick="setScale(1)">↺ 复位</button>
      </div>

      <div class="ingredients-section">
        <div class="section-title">
          <span class="sec-icon">🧾</span>配料
          <span class="recheck-hint">点亮 ✓ 可单独勾该项 · 悬停显示编辑/删除</span>
          <button class="copy-btn" onclick="copyIngredients('${recipe.id}')">📋 复制</button>
        </div>
        <div class="ing-grid">${ingItems}</div>
        <button class="ing-add-btn" onclick="addIngInDetail('${recipe.id}')">+ 添加配料</button>
      </div>

      <div class="steps-section">
        <div class="section-title"><span class="sec-icon">📝</span>步骤</div>
        <ol class="steps-list">${stepItems}</ol>
      </div>

      <div class="note-section">
        <div class="section-title"><span class="sec-icon">⚠️</span>注意事项</div>
        <div class="note-block">${diffList || '暂无'}</div>
      </div>

      ${photoSection}
    </div>
  `;
}

function formatAmount(n) {
  return Math.round(n * 100) / 100;
}

function setScale(s) {
  state.currentScale = s;
  if (state.currentRecipeId) renderDetail(state.recipes.find(r => r.id === state.currentRecipeId));
}

function toggleIngCheck(recipeId, ingName) {
  if (!state.ingChecks[recipeId]) state.ingChecks[recipeId] = {};
  state.ingChecks[recipeId][ingName] = !state.ingChecks[recipeId][ingName];
  renderDetail(state.recipes.find(r => r.id === recipeId));
}

function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(x => x !== id);
    showToast('已取消收藏');
  } else {
    state.favorites.push(id);
    showToast('已收藏 ⭐');
  }
  saveState();
  renderDetail(state.recipes.find(r => r.id === id));
}

// ============ 详情页配料行：编辑/删除/添加 ============
let ingEditContext = { recipeId: null, idx: -1, isNew: false };

function editIngInDetail(recipeId, idx) {
  const r = state.recipes.find(x => x.id === recipeId);
  if (!r || !r.ingredients[idx]) return;
  const ing = r.ingredients[idx];
  ingEditContext = { recipeId, idx, isNew: false };
  document.getElementById('ingEditTitle').textContent = '编辑配料';
  document.getElementById('ie-name').value = ing.name || '';
  document.getElementById('ie-amount').value = (ing.amount || '') + (ing.unit || '');
  document.getElementById('ie-cost').value = ing.cost || '';
  document.getElementById('ingEditModal').classList.add('show');
}

function addIngInDetail(recipeId) {
  ingEditContext = { recipeId, idx: -1, isNew: true };
  document.getElementById('ingEditTitle').textContent = '添加配料';
  document.getElementById('ie-name').value = '';
  document.getElementById('ie-amount').value = '';
  document.getElementById('ie-cost').value = '';
  document.getElementById('ingEditModal').classList.add('show');
}

function saveIngEdit() {
  const name = document.getElementById('ie-name').value.trim();
  if (!name) { showToast('请填写名称'); return; }
  const amountRaw = document.getElementById('ie-amount').value.trim();
  const m = amountRaw.match(/^(\d+(?:\.\d+)?)\s*(g|克|ml|个|滴|片|勺|包|克)?/);
  const amount = m ? parseFloat(m[1]) : 0;
  const unit = m && m[2] ? m[2] : 'g';
  const cost = parseFloat(document.getElementById('ie-cost').value) || 0;

  const r = state.recipes.find(x => x.id === ingEditContext.recipeId);
  if (!r) return;
  if (!r.ingredients) r.ingredients = [];

  if (ingEditContext.isNew) {
    r.ingredients.push({ name, amount, unit, cost });
    showToast('已添加配料 ✓');
  } else {
    r.ingredients[ingEditContext.idx] = { name, amount, unit, cost };
    showToast('已更新配料 ✓');
  }
  saveState();
  closeModal('ingEditModal');
  if (state.currentRecipeId === r.id) renderDetail(r);
}

function delIngInDetail(recipeId, idx) {
  const r = state.recipes.find(x => x.id === recipeId);
  if (!r || !r.ingredients[idx]) return;
  if (!confirm('删除该项配料？')) return;
  r.ingredients.splice(idx, 1);
  saveState();
  showToast('已删除');
  if (state.currentRecipeId === r.id) renderDetail(r);
}

function selectRecipe(id) {
  state.currentRecipeId = id;
  state.currentScale = 1;
  renderContent();
}

function backToList() {
  state.currentRecipeId = null;
  state.currentScale = 1;
  renderContent();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ 标签筛选行 ============
function searchByTag(name) {
  document.getElementById('searchInput').value = name;
  state.searchKeyword = name.toLowerCase();
  renderContent();
}

// ============ 图片上传 ============
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('图片过大，请压缩到 2MB 以内'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.tempPhoto = e.target.result;
    const preview = document.getElementById('photoPreview');
    preview.style.backgroundImage = `url('${state.tempPhoto}')`;
    preview.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  state.tempPhoto = '';
  const preview = document.getElementById('photoPreview');
  preview.style.backgroundImage = '';
  preview.classList.remove('has-image');
  document.getElementById('f-photo').value = '';
}

// ============ 配料行管理 ============
function renderIngRows() {
  const container = document.getElementById('ingRows');
  if (state.tempIngredients.length === 0) addIngRow();
  container.innerHTML = state.tempIngredients.map((ing, idx) => `
    <div class="ing-row">
      <input type="text" placeholder="名称" value="${escapeHtml(ing.name || '')}" onchange="updateIng(${idx}, 'name', this.value)">
      <input type="text" placeholder="用量 如200g" value="${escapeHtml((ing.amount || '') + (ing.unit || ''))}" onchange="updateIng(${idx}, 'amount', this.value)">
      <input type="number" placeholder="成本" step="0.01" value="${ing.cost || ''}" onchange="updateIng(${idx}, 'cost', this.value)">
      <button class="del-row" onclick="delIngRow(${idx})">×</button>
    </div>
  `).join('');
  updateCostSummary();
}

function addIngRow() {
  state.tempIngredients.push({ name: '', amount: '', unit: '', cost: '' });
  renderIngRows();
}

function updateIng(idx, field, value) {
  const ing = state.tempIngredients[idx];
  if (field === 'amount') {
    const m = String(value).match(/^(\d+(?:\.\d+)?)\s*(g|克|ml|个|滴|片|勺)?/);
    if (m) {
      ing.amount = parseFloat(m[1]);
      ing.unit = m[2] || 'g';
    } else {
      ing.amount = 0;
      ing.unit = 'g';
    }
  } else if (field === 'cost') {
    ing.cost = parseFloat(value) || 0;
  } else {
    ing[field] = value;
  }
}

function delIngRow(idx) {
  state.tempIngredients.splice(idx, 1);
  if (state.tempIngredients.length === 0) addIngRow();
  renderIngRows();
  updateCostSummary();
}

function onAutoFillCost() {
  var result = autoFillCosts();
  updateCostSummary();
  if (result.filled === 0) {
    showToast('未识别到原料，请检查名称');
  } else {
    showToast('已估算 ' + result.filled + ' 项 · 总成本约 ¥' + result.total + ' ✓');
  }
}

function updateCostSummary() {
  var el = document.getElementById('costSummary');
  if (!el) return;
  var total = 0;
  var qtyInput = document.getElementById('f-outputQty');
  var unitInput = document.getElementById('f-outputUnit');
  var qty = parseInt(qtyInput ? qtyInput.value : 0) || 0;
  state.tempIngredients.forEach(function(ing) {
    total += parseFloat(ing.cost) || 0;
  });
  if (total === 0) {
    el.innerHTML = '';
    return;
  }
  var html = '<div class="cost-sum-row">💰 总成本 ¥' + total.toFixed(2);
  if (qty > 0) {
    var unit = unitInput ? unitInput.value : '';
    html += ' · 单价 ¥' + (total / qty).toFixed(2) + '/' + (unit || '份');
  }
  html += '</div>';
  el.innerHTML = html;
}

// ============ 智能识别：粘贴文字自动拆分配料+步骤+注意事项+温度/时间/份量 ============
let smartPasteResult = { ingredients: [], steps: [], notes: [], temp: '', duration: '', outputQty: '', outputUnit: '' };

function openSmartPasteModal() {
  smartPasteResult = { ingredients: [], steps: [], notes: [], temp: '', duration: '', outputQty: '', outputUnit: '' };
  document.getElementById('smartPasteText').value = '';
  document.getElementById('smartPastePreview').innerHTML = '';
  document.getElementById('smartPasteText').oninput = function() {
    parseSmartPaste(this.value);
  };
  document.getElementById('smartPasteModal').classList.add('show');
}

// 主解析：分段 → 分类解析
function parseSmartPaste(text) {
  const previewEl = document.getElementById('smartPastePreview');
  if (!text.trim()) {
    smartPasteResult = { ingredients: [], steps: [], notes: [], temp: '', duration: '', outputQty: '', outputUnit: '' };
    previewEl.innerHTML = '';
    return;
  }

  const segments = segmentText(text);
  // 从全文提取温度/时间/份量
  var meta = parseMeta(text);

  smartPasteResult = {
    ingredients: parseIngredients(segments.ingredients.join('\n')),
    steps: parseSteps(segments.steps.join('\n')),
    notes: parseNotes(segments.notes.join('\n')),
    temp: meta.temp,
    duration: meta.duration,
    outputQty: meta.outputQty,
    outputUnit: meta.outputUnit
  };

  renderSmartPreview();
}

function renderSmartPreview() {
  const previewEl = document.getElementById('smartPastePreview');
  let html = '';

  // 温度/时间/份量 卡片
  var metaParts = [];
  if (smartPasteResult.temp) metaParts.push('温度 ' + escapeHtml(smartPasteResult.temp));
  if (smartPasteResult.duration) metaParts.push('时间 ' + escapeHtml(smartPasteResult.duration));
  if (smartPasteResult.outputQty || smartPasteResult.outputUnit) {
    metaParts.push('份量 ' + (smartPasteResult.outputQty || '') + (smartPasteResult.outputUnit || ''));
  }
  if (metaParts.length > 0) {
    html += '<div class="sp-section"><div class="sp-section-title">🔥 烘焙参数</div>';
    html += '<div class="sp-item sp-meta-item"><span class="sp-name" style="font-weight:400">' + metaParts.join(' · ') + '</span></div>';
    html += '</div>';
  }

  if (smartPasteResult.ingredients.length > 0) {
    html += '<div class="sp-section"><div class="sp-section-title">🧾 配料（' + smartPasteResult.ingredients.length + '）</div>';
    html += smartPasteResult.ingredients.map(function(item, idx) {
      var amt = (item.amount && item.amount > 0) ? item.amount : '';
      return '<div class="sp-item">' +
        '<span class="sp-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="sp-amt">' + amt + (item.unit || '') + '</span>' +
        '<span class="sp-del" onclick="removeSmartItem(\'ingredients\', ' + idx + ')">×</span>' +
        '</div>';
    }).join('');
    html += '</div>';
  }

  if (smartPasteResult.steps.length > 0) {
    html += '<div class="sp-section"><div class="sp-section-title">📝 步骤（' + smartPasteResult.steps.length + '）</div>';
    html += smartPasteResult.steps.map(function(step, idx) {
      return '<div class="sp-item">' +
        '<span class="sp-name" style="font-weight:400;font-size:12.5px;line-height:1.5">' + (idx + 1) + '. ' + escapeHtml(step) + '</span>' +
        '<span class="sp-del" onclick="removeSmartItem(\'steps\', ' + idx + ')">×</span>' +
        '</div>';
    }).join('');
    html += '</div>';
  }

  if (smartPasteResult.notes.length > 0) {
    html += '<div class="sp-section"><div class="sp-section-title">⚠️ 注意事项（' + smartPasteResult.notes.length + '）</div>';
    html += smartPasteResult.notes.map(function(note, idx) {
      return '<div class="sp-item">' +
        '<span class="sp-name" style="font-weight:400;font-size:12.5px;line-height:1.5">' + escapeHtml(note) + '</span>' +
        '<span class="sp-del" onclick="removeSmartItem(\'notes\', ' + idx + ')">×</span>' +
        '</div>';
    }).join('');
    html += '</div>';
  }

  if (!html) {
    html = '<div style="font-size:12px;color:var(--text-muted);padding:8px">未识别到内容，请检查格式</div>';
  }
  previewEl.innerHTML = html;
}

function removeSmartItem(type, idx) {
  smartPasteResult[type].splice(idx, 1);
  renderSmartPreview();
}

// ============ 文本分段：识别"配方/步骤/注意事项"区域 ============
function segmentText(text) {
  var lines = text.split(/[\n\r]+/);
  var section = 'unknown';
  var segments = { ingredients: [], steps: [], notes: [], unknown: [] };

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    // 识别段标题
    if (/^[一二三四五六七八九十]+\s*[、.．]\s*(精准)?配方|配方表|材料表|材料|配料|食材/i.test(line)) {
      section = 'ingredients';
      continue;
    }
    if (/^[一二三四五六七八九十]+\s*[、.．]\s*(制作)?步骤|制作步骤|做法|操作步骤|制作过程|烘焙步骤|步骤/i.test(line)) {
      section = 'steps';
      continue;
    }
    if (/(关键)?注意|小贴士|tips|温馨提示|注意事项/i.test(line)) {
      section = 'notes';
      continue;
    }

    // 跳过表头行 "材料 用量"
    if (/^材料\s*用量$/.test(line)) continue;
    // 跳过纯标题行（"X寸XXX制作教程"）
    if (/^.+制作教程$/.test(line) && section === 'unknown') continue;

    segments[section].push(line);
  }
  return segments;
}

// ============ 解析配料 ============
// 支持：低筋面粉 45g / 鸡蛋 3个（单颗50g以上）/ 玉米油 30g / 柠檬汁 数滴 / 盐 适量
function parseIngredients(text) {
  if (!text.trim()) return [];
  var lines = text.split(/[\n\r;；]+/).map(function(l) { return l.trim(); }).filter(Boolean);
  var result = [];

  // 单位列表
  var U = '(?:g|克|ml|毫升|L|升|个|只|滴|片|勺|汤匙|茶匙|包|袋|颗|根|盒|杯|份|条|块)';
  // 量词列表
  var QUANT = '(?:适量|少许|少量|数滴|数片|数个|一撮|一点点)';

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
      .replace(/^[•◦·\-\*\s]+/, '')
      .replace(/^\d+\s*[.、)]\s*/, '')
      .trim();
    if (!line) continue;

    var m;

    // 模式 1：名称 + 数字 + 单位（可带括号备注）"低筋面粉 45g"
    m = line.match(new RegExp('^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*(' + U + ')\\s*(?:[（(].*[）)])?\\s*$', 'i'));
    if (m) { result.push({ name: m[1].trim(), amount: parseFloat(m[2]), unit: m[3] }); continue; }

    // 模式 2：名称 + 数字 + 个/只等（"鸡蛋 3个（单颗50g以上）"）
    m = line.match(new RegExp('^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*(个|只|颗|根|条|片|包|袋|盒|杯|份|块)\\s*(?:[（(].*[）)])?\\s*$', ''));
    if (m) { result.push({ name: m[1].trim(), amount: parseFloat(m[2]), unit: m[3] }); continue; }

    // 模式 3：名称+数字+单位 无空格 "低筋面粉45g"
    m = line.match(new RegExp('^(.+?)(\\d+(?:\\.\\d+)?)\\s*(' + U + ')\\s*(?:[（(].*[）)])?\\s*$', 'i'));
    if (m) { result.push({ name: m[1].trim(), amount: parseFloat(m[2]), unit: m[3] }); continue; }

    // 模式 4：名称 + 量词 "柠檬汁 数滴" / "盐 适量"
    m = line.match(new RegExp('^(.+?)\\s+(' + QUANT + ')\\s*(?:[（(].*[）)])?\\s*$', ''));
    if (m) { result.push({ name: m[1].trim(), amount: 0, unit: m[2] }); continue; }

    // 模式 5：名称 + "几X" "几滴"/"几片"
    m = line.match(/^(.+?)\s+(几(?:滴|片|个|勺|克))\s*(?:[（(].*[）)])?\s*$/);
    if (m) { result.push({ name: m[1].trim(), amount: 0, unit: m[2] }); continue; }

    // 模式 6：数字在前 "45g 低筋面粉"
    m = line.match(new RegExp('^(\\d+(?:\\.\\d+)?)\\s*(' + U + ')\\s+(.+)$', 'i'));
    if (m) { result.push({ name: m[3].trim(), amount: parseFloat(m[1]), unit: m[2] }); continue; }

    // 兜底：短行且非句子 → 整行作为名称
    if (line.length < 25 && !/[。；！？]/.test(line)) {
      result.push({ name: line, amount: 0, unit: 'g' });
    }
  }
  return result;
}

// ============ 解析步骤 ============
// 去掉序号和符号，保留小标题 + 详细步骤
function parseSteps(text) {
  if (!text.trim()) return [];
  var lines = text.split(/[\n\r]+/).map(function(l) { return l.trim(); }).filter(Boolean);
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var cleaned = lines[i]
      .replace(/^[◦•·\-\*\s]+/, '')
      .replace(/^\d+\s*[.、)]\s*/, '')
      .replace(/^(?:第[一二三四五六七八九十\d]+[步阶段]?)\s*[:：]?\s*/, '')
      .replace(/^(?:步骤\s*\d+)\s*[:：]?\s*/, '')
      .trim();

    if (!cleaned) continue;

    // 判断是否小标题（如"蛋黄糊制作""蛋白打发"）
    var isSubtitle = cleaned.length <= 12 && !/[。，,.]/.test(cleaned) &&
      /(制作|打发|混合|烘烤|出炉|脱模|发酵|揉面|整形|准备)/.test(cleaned);

    if (isSubtitle) {
      result.push('【' + cleaned + '】');
    } else {
      result.push(cleaned);
    }
  }
  return result;
}

// ============ 解析注意事项 ============
function parseNotes(text) {
  if (!text.trim()) return [];
  var lines = text.split(/[\n\r]+/).map(function(l) { return l.trim(); }).filter(Boolean);
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var cleaned = lines[i]
      .replace(/^[•◦·\-\*\s]+/, '')
      .replace(/^\d+\s*[.、)]\s*/, '')
      .trim();
    if (cleaned) result.push(cleaned);
  }
  return result;
}

// ============ 从全文提取温度/时间/份量/模具 ============
function parseMeta(text) {
  var meta = { temp: '', duration: '', outputQty: '', outputUnit: '' };

  // 1. 温度提取
  // 匹配：上下火165℃ / 上火180/下火160 / 165℃ / 180度
  var tempM = text.match(/上下火\s*(\d{2,3})\s*[℃度]/);
  if (!tempM) tempM = text.match(/上火\s*(\d{2,3})\s*[\/／]?\s*下火\s*(\d{2,3})\s*[℃度]?/);
  if (!tempM) tempM = text.match(/(\d{2,3})\s*℃/);
  if (!tempM) tempM = text.match(/(\d{2,3})\s*度/);
  if (tempM) {
    if (tempM[2]) {
      meta.temp = '上火' + tempM[1] + '/下火' + tempM[2];
    } else {
      meta.temp = tempM[0].replace(/\s+/g, '');
    }
  }

  // 2. 时间提取（烘烤时间，不取冷冻/发酵时间）
  // 优先级 1：全程烘烤XX分钟 / 烘烤XX分钟 / 烘焙XX分钟
  var durM = text.match(/(?:全程|全程烘烤|烘烤时间|烘烤|烘焙时间|烘焙)\s*(\d{1,3})\s*[-~至]\s*(\d{1,3})\s*分钟/);
  if (!durM) durM = text.match(/(?:全程|全程烘烤|烘烤时间|烘烤|烘焙时间|烘焙)\s*(\d{1,3})\s*分钟/);
  // 优先级 2：烤XX分钟（不包含冷冻/冷藏/发酵前缀）
  if (!durM) {
    var candidates = text.match(/(?:烤|烘烤|烘焙)\s*(\d{1,3})\s*分钟/g) || [];
    // 单独找一次"烤XX分钟"
    var m = text.match(/(?:烤|烘烤|烘焙)\s*(\d{1,3})\s*分钟/);
    if (m) {
      durM = m;
    }
  }
  // 优先级 3：在"步骤"段中找 "烘烤45分钟"
  if (!durM) {
    // 直接匹配"XX分钟"但排除前面有"冷冻/冷藏/发酵/静置/松弛/醒发"的
    var allMs = text.match(/(\d{1,3})\s*[-~至]\s*(\d{1,3})\s*分钟|\d{1,3}\s*分钟/g) || [];
    // 过滤：前后不能是冷冻/发酵
    for (var i = 0; i < allMs.length; i++) {
      var idx = text.indexOf(allMs[i]);
      var before = text.substring(Math.max(0, idx - 6), idx);
      if (!/(冷冻|冷藏|发酵|静置|松弛|醒发|腌制|浸泡)/.test(before)) {
        var dm = allMs[i].match(/(\d{1,3})\s*[-~至]\s*(\d{1,3})\s*分钟/);
        if (!dm) dm = allMs[i].match(/(\d{1,3})\s*分钟/);
        if (dm) { durM = dm; break; }
      }
    }
  }
  if (durM) {
    if (durM[2]) {
      meta.duration = durM[1] + '-' + durM[2] + '分钟';
    } else {
      meta.duration = durM[1] + '分钟';
    }
  }

  // 3. 模具/份量提取
  // 匹配：6寸 / 8寸 / 6寸模具 / 450g吐司模 / 2个 / 1条
  var sizeM = text.match(/(\d+)\s*寸(?:模具)?/);
  if (sizeM) {
    meta.outputQty = sizeM[1];
    meta.outputUnit = '寸';
  } else {
    // 尝试匹配 450g 吐司模 / X个 / X条 等
    var qtyM = text.match(/(\d+)\s*(个|条|份|盒|块|盘)/);
    if (qtyM) {
      meta.outputQty = qtyM[1];
      meta.outputUnit = qtyM[2];
    }
  }

  return meta;
}

// ============ 应用识别结果到表单 ============
function applySmartPaste() {
  // 如果预览为空，再解析一次
  if (smartPasteResult.ingredients.length === 0 && smartPasteResult.steps.length === 0 && smartPasteResult.notes.length === 0 && !smartPasteResult.temp) {
    parseSmartPaste(document.getElementById('smartPasteText').value);
  }

  var msgParts = [];

  // 温度
  if (smartPasteResult.temp) {
    var tempInput = document.getElementById('f-temp');
    if (!tempInput.value.trim()) tempInput.value = smartPasteResult.temp;
    msgParts.push('温度');
  }

  // 时间
  if (smartPasteResult.duration) {
    var durInput = document.getElementById('f-duration');
    if (!durInput.value.trim()) durInput.value = smartPasteResult.duration;
    msgParts.push('时间');
  }

  // 份量
  if (smartPasteResult.outputQty || smartPasteResult.outputUnit) {
    var qtyInput = document.getElementById('f-outputQty');
    var unitInput = document.getElementById('f-outputUnit');
    if (!qtyInput.value.trim()) qtyInput.value = smartPasteResult.outputQty || '';
    if (!unitInput.value.trim()) unitInput.value = smartPasteResult.outputUnit || '';
    msgParts.push('份量');
  }

  // 配料
  if (smartPasteResult.ingredients.length > 0) {
    smartPasteResult.ingredients.forEach(function(item) {
      state.tempIngredients.push({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        cost: 0
      });
    });
    renderIngRows();
    msgParts.push(smartPasteResult.ingredients.length + ' 项配料');
  }

  // 步骤
  if (smartPasteResult.steps.length > 0) {
    var ta = document.getElementById('f-steps');
    var existing = ta.value.trim();
    var newSteps = smartPasteResult.steps.join('\n');
    ta.value = existing ? (existing + '\n' + newSteps) : newSteps;
    msgParts.push(smartPasteResult.steps.length + ' 条步骤');
  }

  // 注意事项
  if (smartPasteResult.notes.length > 0) {
    var ta2 = document.getElementById('f-difficulty');
    var existing2 = ta2.value.trim();
    var newNotes = smartPasteResult.notes.join('\n');
    ta2.value = existing2 ? (existing2 + '\n' + newNotes) : newNotes;
    msgParts.push(smartPasteResult.notes.length + ' 条注意事项');
  }

  if (msgParts.length === 0) {
    showToast('未识别到内容');
    return;
  }
  showToast('已识别 ' + msgParts.join(' · ') + ' ✓');
  closeModal('smartPasteModal');
}

// ============ 模态框：新增/编辑配方 ============
function openRecipeModal(recipeId) {
  refreshCatSelect();

  if (recipeId) {
    const r = state.recipes.find(x => x.id === recipeId);
    if (!r) return;
    state.editingId = recipeId;
    state.tempPhoto = r.photo || '';
    state.tempRating = r.rating || 0;
    state.tempEmoji = r.emoji || '';
    state.tempIngredients = JSON.parse(JSON.stringify(r.ingredients || []));
    document.getElementById('recipeModalTitle').textContent = '编辑配方';
    document.getElementById('recipeSaveBtn').textContent = '保存';
    document.getElementById('f-name').value = r.name;
    document.getElementById('f-cat').value = r.cat;
    document.getElementById('f-temp').value = r.temp || '';
    document.getElementById('f-duration').value = r.duration || '';
    document.getElementById('f-outputQty').value = r.outputQty || '';
    document.getElementById('f-outputUnit').value = r.outputUnit || '';
    document.getElementById('f-steps').value = (r.steps || []).join('\n');
    document.getElementById('f-oven').value = r.ovenTip || '';
    document.getElementById('f-difficulty').value = (r.difficulty || []).join('\n');
    document.getElementById('f-tags').value = (r.tags || []).join(', ');
    const preview = document.getElementById('photoPreview');
    if (r.photo) {
      preview.style.backgroundImage = `url('${r.photo}')`;
      preview.classList.add('has-image');
    } else {
      preview.style.backgroundImage = '';
      preview.classList.remove('has-image');
    }
  } else {
    state.editingId = null;
    state.tempPhoto = '';
    state.tempRating = 0;
    state.tempEmoji = '🍰';
    state.tempIngredients = [];
    document.getElementById('recipeModalTitle').textContent = '新建配方';
    document.getElementById('recipeSaveBtn').textContent = '保存';
    ['f-name','f-temp','f-duration','f-outputQty','f-outputUnit','f-steps','f-oven','f-difficulty','f-tags'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-cat').value = state.currentCat !== 'all' ? state.currentCat : 'bread';
    clearPhoto();
    addIngRow();
  }
  updateStars();
  renderIngRows();
  renderEmojiGrid(state.tempEmoji);
  document.getElementById('recipeModal').classList.add('show');
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function saveRecipe() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('请填写名称'); return; }

  const ingredients = state.tempIngredients
    .filter(i => i.name && i.name.trim())
    .map(i => ({
      name: i.name.trim(),
      amount: i.amount || 0,
      unit: i.unit || 'g',
      cost: parseFloat(i.cost) || 0
    }));

  const data = {
    name: name,
    cat: document.getElementById('f-cat').value,
    emoji: state.tempEmoji || '🍰',
    photo: state.tempPhoto || '',
    rating: state.tempRating,
    temp: document.getElementById('f-temp').value.trim(),
    duration: document.getElementById('f-duration').value.trim(),
    outputQty: parseInt(document.getElementById('f-outputQty').value) || 1,
    outputUnit: document.getElementById('f-outputUnit').value.trim(),
    ingredients: ingredients,
    steps: document.getElementById('f-steps').value.split('\n').filter(l => l.trim()),
    ovenTip: document.getElementById('f-oven').value.trim(),
    difficulty: document.getElementById('f-difficulty').value.split('\n').filter(l => l.trim()),
    tags: document.getElementById('f-tags').value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  };

  if (state.editingId) {
    const idx = state.recipes.findIndex(r => r.id === state.editingId);
    if (idx >= 0) {
      data.id = state.editingId;
      data.emoji = state.recipes[idx].emoji || '🍰';
      state.recipes[idx] = data;
    }
    showToast('配方已更新 ✓');
  } else {
    data.id = 'r' + Date.now();
    data.emoji = '🍰';
    state.recipes.unshift(data);  // 新配方排在最上面
    showToast('配方已保存 ✓');
  }

  const wasNew = !state.editingId;
  state.editingId = null;
  state.tempPhoto = '';
  state.tempRating = 0;
  state.tempEmoji = '';
  state.tempIngredients = [];
  saveState();
  closeModal('recipeModal');
  render();
  if (wasNew) {
    // 新建后跳到详情（unshift后第 0 个就是新配方）
    selectRecipe(state.recipes[0].id);
  }
}

function duplicateRecipe(id) {
  const r = state.recipes.find(x => x.id === id);
  if (!r) return;
  const copy = JSON.parse(JSON.stringify(r));
  copy.id = 'r' + Date.now();
  copy.name = r.name + '（副本）';
  state.recipes.unshift(copy);  // 副本也排到最上面
  saveState();
  render();
  showToast('已复制配方 ✓');
}

function deleteRecipe(id) {
  if (!confirm('确认删除该配方？')) return;
  state.recipes = state.recipes.filter(r => r.id !== id);
  state.favorites = state.favorites.filter(x => x !== id);
  state.plans = state.plans.filter(p => p.recipeId !== id);
  state.memos.forEach(m => { if (m.recipeId === id) m.recipeId = ''; });
  state.currentRecipeId = null;
  saveState();
  render();
  showToast('已删除');
}

// ============ 自定义分类 ============
function addCustomCategory() {
  const input = document.getElementById('newCatName');
  const name = input.value.trim();
  if (!name) { showToast('请输入分类名'); return; }
  if (name.length > 8) { showToast('最多8个字'); return; }
  const id = 'c' + Date.now();
  state.customCats.push({ id, name, icon: '📌' });
  rebuildCategories();
  saveState();
  input.value = '';
  render();
  showToast('分类已添加 ✓');
}

// ============ 采购清单（合并多个配方） ============
function openPurchaseModal(preselectIds) {
  const sel = document.getElementById('p-recipes');
  sel.innerHTML = state.recipes.map(r =>
    `<option value="${r.id}" ${preselectIds && preselectIds.includes(r.id) ? 'selected' : ''}>${r.name}</option>`
  ).join('');
  document.getElementById('purchaseList').innerHTML =
    '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:30px 0">按 Ctrl/Cmd 多选后生成清单</div>';
  document.getElementById('purchaseModal').classList.add('show');
  if (preselectIds && preselectIds.length) generatePurchaseList();
}

function generatePurchaseList() {
  const sel = document.getElementById('p-recipes');
  const selectedIds = Array.from(sel.selectedOptions).map(o => o.value);
  if (selectedIds.length === 0) {
    document.getElementById('purchaseList').innerHTML =
      '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:30px 0">请先选择配方</div>';
    return;
  }

  const merged = {};
  selectedIds.forEach(id => {
    const r = state.recipes.find(x => x.id === id);
    if (!r) return;
    (r.ingredients || []).forEach(i => {
      const key = i.name;
      if (!merged[key]) {
        merged[key] = { name: i.name, total: 0, unit: i.unit, stock: state.stock[i.name] || 0 };
      }
      merged[key].total += i.amount || 0;
    });
  });

  // 应用倍率
  const scale = state.currentScale || 1;
  const list = Object.values(merged).map(m => {
    const need = m.total * scale - m.stock;
    return { ...m, need: Math.max(0, need) };
  });

  const html = list.map(m => {
    const stockText = m.stock > 0 ? `（库存 ${formatAmount(m.stock)}${m.unit}，需采购 ${formatAmount(m.need)}${m.unit}）` : '';
    return `<div class="purchase-item"><span class="pi-name">${escapeHtml(m.name)}</span><span class="pi-amt">${formatAmount(m.total * scale)}${m.unit}</span><div style="font-size:11px;color:var(--text-muted);margin-top:3px">${stockText}</div></div>`;
  }).join('');

  document.getElementById('purchaseList').innerHTML = html || '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:30px 0">无配料</div>';

  // 绑定 select 变化
  sel.onchange = generatePurchaseList;
}

function copyPurchaseList() {
  const items = document.querySelectorAll('#purchaseList .purchase-item');
  if (items.length === 0) return;
  const text = Array.from(items).map(it => {
    const name = it.querySelector('.pi-name').textContent;
    const amt = it.querySelector('.pi-amt').textContent;
    return `${name} ${amt}`;
  }).join('\n');
  copyToClipboard(text);
  showToast('清单已复制 ✓');
}

function copyIngredients(recipeId) {
  const r = state.recipes.find(x => x.id === recipeId);
  if (!r) return;
  const scale = state.currentScale || 1;
  const text = (r.ingredients || []).map(i =>
    `${i.name} ${formatAmount(i.amount * scale)}${i.unit || ''}`
  ).join('\n');
  copyToClipboard(text);
  showToast('配料已复制 ✓');
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

// ============ 库存 ============
function openStockModal() {
  renderStockList();
  document.getElementById('stockModal').classList.add('show');
}

function renderStockList() {
  const list = document.getElementById('stockList');
  const entries = Object.entries(state.stock);
  if (entries.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12.5px;padding:20px 0">暂无库存</div>';
    return;
  }
  list.innerHTML = entries.map(([name, amt]) => `
    <div class="ing-row" style="grid-template-columns:2fr 1fr 32px">
      <input type="text" value="${escapeHtml(name)}" onchange="updateStock(this.previousElementSibling ? '' : '', this.value)" readonly>
      <input type="text" value="${amt}" onchange="updateStock('${escapeHtml(name)}', this.value)">
      <button class="del-row" onclick="removeStock('${escapeHtml(name)}')">×</button>
    </div>
  `).join('');
}

function addStockRow() {
  const name = prompt('原料名称');
  if (!name) return;
  const amt = prompt('余量（数字+单位，如 500g）', '0');
  state.stock[name] = parseFloat(amt) || 0;
  saveState();
  renderStockList();
}

function updateStock(oldName, newVal) {
  // 简化版：通过 DOM 处理
  const inputs = document.querySelectorAll('#stockList .ing-row');
  inputs.forEach(row => {
    const nInp = row.querySelector('input:first-child');
    const aInp = row.querySelector('input:nth-child(2)');
    if (aInp === document.activeElement && oldName) {
      state.stock[oldName] = parseFloat(newVal) || 0;
    }
  });
  saveState();
}

function removeStock(name) {
  delete state.stock[name];
  saveState();
  renderStockList();
}

function saveStock() {
  saveState();
  closeModal('stockModal');
  showToast('库存已保存 ✓');
}

// ============ 收藏 ============
function openFavoriteModal() {
  const list = document.getElementById('favoriteList');
  const favRecipes = state.recipes.filter(r => state.favorites.includes(r.id));
  if (favRecipes.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:30px 0">暂无收藏，点配方前的 ☐ 收藏</div>';
  } else {
    list.innerHTML = favRecipes.map(r => `
      <div class="quick-memo" style="cursor:pointer" onclick="closeModal('favoriteModal');selectRecipe('${r.id}')">
        <div style="font-weight:600">${r.emoji || '🍰'} ${r.name} ${renderStars(r.rating || 0)}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${r.temp || '-'} · ${r.duration || '-'} · ${(r.tags || []).join(', ')}</div>
      </div>
    `).join('');
  }
  document.getElementById('favoriteModal').classList.add('show');
}

// ============ 制作计划 ============
function openPlanModal(recipeId) {
  document.getElementById('pl-date').value = new Date().toISOString().slice(0, 10);
  refreshPlanRecipeSelect();
  document.getElementById('pl-recipe').value = recipeId || '';
  document.getElementById('pl-note').value = '';
  document.getElementById('planModal').classList.add('show');
}

function savePlan() {
  const date = document.getElementById('pl-date').value;
  const recipeId = document.getElementById('pl-recipe').value;
  const note = document.getElementById('pl-note').value.trim();
  if (!date || !recipeId) { showToast('请选择日期和配方'); return; }
  state.plans.push({ id: 'p' + Date.now(), date, recipeId, note });
  saveState();
  closeModal('planModal');
  showToast('计划已添加 ✓');
}

function renderPlansTab() {
  const content = document.getElementById('content');
  const sorted = state.plans.slice().sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="icon">📅</div>
        <div class="title">暂无制作计划</div>
        <div class="desc">进入配方详情，点击「📅」按钮添加计划</div>
      </div>`;
    return;
  }
  content.innerHTML = `
    <div class="content-header">
      <h2>📅 制作计划 <span class="result-count">· 共 ${sorted.length} 个</span></h2>
    </div>
    <div class="recipe-grid" style="grid-template-columns:1fr">
      ${sorted.map(p => {
        const r = state.recipes.find(x => x.id === p.recipeId);
        if (!r) return '';
        return `
          <div class="recipe-card" onclick="selectRecipe('${r.id}')">
            <div class="recipe-body">
              <div class="recipe-name">${r.emoji || '🍰'} ${r.name}</div>
              <div class="recipe-stars" style="color:var(--pink-deep);font-weight:600">📅 ${p.date}</div>
              ${p.note ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${escapeHtml(p.note)}</div>` : ''}
              <button class="tb-btn" style="margin-top:8px;font-size:11px;padding:4px 10px" onclick="event.stopPropagation();removePlan('${p.id}')">✕ 删除计划</button>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;
}

function removePlan(id) {
  state.plans = state.plans.filter(p => p.id !== id);
  saveState();
  renderPlansTab();
}

// ============ 心得 ============
function openMemoModal() {
  document.getElementById('m-text').value = '';
  document.getElementById('m-type').value = '温度';
  document.getElementById('m-recipe').value = state.currentRecipeId || '';
  document.getElementById('memoModal').classList.add('show');
}

function saveMemo() {
  const text = document.getElementById('m-text').value.trim();
  if (!text) { showToast('请填写心得'); return; }
  state.memos.push({
    id: 'm' + Date.now(),
    recipeId: document.getElementById('m-recipe').value,
    text, type: document.getElementById('m-type').value,
    date: new Date().toISOString().slice(0, 10)
  });
  saveState();
  closeModal('memoModal');
  showToast('心得已保存 ✓');
}

function renderMemoTab() {
  const content = document.getElementById('content');
  const list = state.memos.slice().reverse();
  if (list.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="icon">💡</div>
        <div class="title">暂无心得</div>
        <div class="desc">点击顶部「💡 记心得」按钮记录</div>
      </div>`;
    return;
  }
  content.innerHTML = `
    <div class="content-header">
      <h2>💡 调试心得 <span class="result-count">· 共 ${list.length} 条</span></h2>
    </div>
    <div>${list.map(m => {
      const r = state.recipes.find(x => x.id === m.recipeId);
      return `
        <div class="quick-memo">
          <div class="memo-date">${m.date} · ${r ? r.name : '通用'} · ${m.type}</div>
          <div class="memo-text">${escapeHtml(m.text)}</div>
        </div>`;
    }).join('')}</div>
  `;
}

// ============ 计时器 ============
let timerInterval = null;
let timerRemaining = 0;

function openTimerModal() {
  document.getElementById('timerModal').classList.add('show');
  updateTimerDisplay();
}

function startTimer() {
  const mins = parseInt(document.getElementById('timerMinutes').value) || 0;
  if (timerInterval) clearInterval(timerInterval);
  timerRemaining = mins * 60;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      showToast('⏰ 烘焙时间到！');
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const h = String(Math.floor(timerRemaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((timerRemaining % 3600) / 60)).padStart(2, '0');
  const s = String(timerRemaining % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${h}:${m}:${s}`;
}

// ============ 数据管理 ============
function exportData() {
  const data = {
    version: 3,
    exportDate: new Date().toISOString(),
    recipes: state.recipes,
    memos: state.memos,
    plans: state.plans,
    favorites: state.favorites,
    stock: state.stock,
    customCats: state.customCats
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `烘焙工作台备份_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('备份已导出 ✓');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.recipes) { showToast('文件格式不正确'); return; }
      if (!confirm(`将导入 ${data.recipes.length} 个配方，会覆盖当前数据。确认？`)) return;
      state.recipes = data.recipes;
      state.memos = data.memos || [];
      state.plans = data.plans || [];
      state.favorites = data.favorites || [];
      state.stock = data.stock || {};
      state.customCats = data.customCats || [];
      rebuildCategories();
      state.currentRecipeId = null;
      saveState();
      render();
      showToast('数据已导入 ✓');
    } catch (err) {
      showToast('导入失败');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetData() {
  if (!confirm('确认重置全部数据？')) return;
  if (!confirm('再次确认：这个操作不可撤销！')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.customCats = [];
  state.favorites = [];
  state.plans = [];
  state.memos = [];
  state.stock = {};
  rebuildCategories();
  state.recipes = [];
  saveState();
  render();
  showToast('已重置全部数据');
}

// 清空示例配方（id 以 r 开头 + 数字 的配方）
function clearSampleRecipes() {
  var samples = state.recipes.filter(function(r) {
    return /^r\d+$/.test(r.id);
  });
  if (samples.length === 0) {
    showToast('没有示例配方可清空');
    return;
  }
  if (!confirm('确认删除 ' + samples.length + ' 个示例配方？\n（你自己添加的配方不会被删除）')) return;
  state.recipes = state.recipes.filter(function(r) {
    return !/^r\d+$/.test(r.id);
  });
  saveState();
  render();
  showToast('已清空 ' + samples.length + ' 个示例配方 ✓');
}
  loadSamples();
  state.currentRecipeId = null;
  state.currentCat = 'all';
  saveState();
  render();
  showToast('已重置');
}

// ============ 下拉框刷新 ============
function refreshCatSelect() {
  const sel = document.getElementById('f-cat');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = Object.entries(CATEGORIES)
    .filter(([id]) => id !== 'all')
    .map(([id, cat]) => `<option value="${id}">${cat.icon} ${cat.name}</option>`).join('');
  if (current) sel.value = current;
}

function refreshPlanRecipeSelect() {
  const sel = document.getElementById('pl-recipe');
  if (!sel) return;
  sel.innerHTML = state.recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

function refreshMemoRecipeSelect() {
  const sel = document.getElementById('m-recipe');
  if (!sel) return;
  sel.innerHTML = '<option value="">— 通用心得 —</option>' +
    state.recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

function refreshSelects() {
  refreshCatSelect();
  refreshPlanRecipeSelect();
  refreshMemoRecipeSelect();
}

// ============ Toast ============
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}


// ============ 启动 ============
init();