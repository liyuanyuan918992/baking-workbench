/* ============================================
   烘焙工作台 v3 - 粉色烘焙风完整版
   配方CRUD + 图片上传 + 星级 + 倍率换算
   + 采购清单合并 + 库存 + 计时器
   + 自定义分类 + 心得 + 制作计划
   + 数据导入导出 + 字体缩放 + 夜间模式
============================================ */

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
      if (state.recipes.length === 0) loadSamples();
    } catch (e) {
      loadSamples();
    }
  } else {
    loadSamples();
  }
}

function loadSamples() {
  state.recipes = JSON.parse(JSON.stringify(SAMPLE_RECIPES));
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

  // 原料反查条
  const recheckBar = `
    <div class="recheck-bar">
      <span class="recheck-label">原料反查：</span>
      <input type="text" id="recheckInput" placeholder="输入原料名，如 低筋面粉 / 黄油">
      <button class="mini-btn" onclick="recheckByIng()">🔍 查询</button>
      <button class="mini-btn" onclick="document.getElementById('recheckInput').value=''">清除</button>
    </div>`;

  const cards = recipes.map(r => {
    const cat = CATEGORIES[r.cat] || { icon: '📌', name: '未分类' };
    const thumbBg = r.photo ? `background-image:url('${r.photo}');background-size:cover;background-position:center` : '';
    const starsHtml = renderStars(r.rating || 0);
    return `
      <div class="recipe-card" onclick="selectRecipe('${r.id}')">
        <div class="recipe-thumb ${r.photo ? 'has-photo' : ''}" style="${thumbBg}">
          <span class="cat-badge">${cat.icon} ${cat.name}</span>
          ${r.photo ? '' : `<span>${r.emoji || '🍽️'}</span>`}
          ${r.photo ? '' : '<span class="photo-placeholder">📷 待上传</span>'}
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

  const photoSection = recipe.photo
    ? `<div class="detail-photo-section"><img class="detail-photo" src="${recipe.photo}" alt="成品图"></div>`
    : `<div class="detail-photo-section"><div class="detail-photo-empty"><div class="icon">📷</div><div>暂无成品图，点击「编辑」上传</div></div></div>`;

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

  const stepItems = (recipe.steps || []).map((s, idx) => `
    <li class="step-item">
      <span class="step-num">${idx + 1}</span>
      <span class="step-text">${escapeHtml(s)}</span>
    </li>`).join('');

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
        <div class="section-title"><span class="sec-icon">⚠️</span>难点 & 心得</div>
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
}

// ============ 智能识别：粘贴文字自动拆分配料/步骤 ============
let smartPasteTarget = 'ingredients'; // 'ingredients' | 'steps'
let smartPasteResult = []; // 解析结果暂存

function openSmartPasteModal(target) {
  smartPasteTarget = target;
  smartPasteResult = [];
  const titleEl = document.getElementById('smartPasteTitle');
  const hintEl = document.getElementById('smartPasteHint');
  const textEl = document.getElementById('smartPasteText');
  const previewEl = document.getElementById('smartPastePreview');

  if (target === 'ingredients') {
    titleEl.textContent = '📋 智能识别配料';
    hintEl.innerHTML = '粘贴配料表文字，自动按「名称 + 数字 + 单位」拆分。<br>支持格式：<code>高筋面粉 250g</code> / <code>牛奶120克</code> / <code>黄油 25 g</code>';
    textEl.placeholder = '在这里粘贴配料表...\n\n示例：\n高筋面粉 250g\n牛奶 120g\n黄油 25g\n酵母 3g\n盐 3g';
  } else {
    titleEl.textContent = '📋 智能识别步骤';
    hintEl.innerHTML = '粘贴步骤文字，自动按行号/序号拆分。<br>支持「1.」「步骤一」「第一步」等格式';
    textEl.placeholder = '在这里粘贴步骤文字...\n\n示例：\n1. 所有材料入揉面桶搅拌成团\n2. 加入黄油揉至扩展阶段\n3. 发酵60分钟至2倍大';
  }
  textEl.value = '';
  previewEl.innerHTML = '';
  textEl.oninput = () => parseSmartPaste(textEl.value);
  document.getElementById('smartPasteModal').classList.add('show');
}

function parseSmartPaste(text) {
  const previewEl = document.getElementById('smartPastePreview');
  if (!text.trim()) { smartPasteResult = []; previewEl.innerHTML = ''; return; }

  if (smartPasteTarget === 'ingredients') {
    smartPasteResult = parseIngredients(text);
    previewEl.innerHTML = smartPasteResult.map((item, idx) => `
      <div class="sp-item">
        <span class="sp-name">${escapeHtml(item.name)}</span>
        <span class="sp-amt">${item.amount}${item.unit}</span>
        <span class="sp-del" onclick="removeSmartItem(${idx})">×</span>
      </div>
    `).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:8px">未识别到配料，请检查格式</div>';
  } else {
    smartPasteResult = parseSteps(text);
    previewEl.innerHTML = smartPasteResult.map((step, idx) => `
      <div class="sp-item">
        <span class="sp-name" style="font-weight:400;font-size:12.5px">${idx + 1}. ${escapeHtml(step)}</span>
        <span class="sp-del" onclick="removeSmartItem(${idx})">×</span>
      </div>
    `).join('') || '<div style="font-size:12px;color:var(--text-muted);padding:8px">未识别到步骤</div>';
  }
}

function removeSmartItem(idx) {
  smartPasteResult.splice(idx, 1);
  // 重新渲染预览
  const previewEl = document.getElementById('smartPastePreview');
  if (smartPasteTarget === 'ingredients') {
    previewEl.innerHTML = smartPasteResult.map((item, i) => `
      <div class="sp-item">
        <span class="sp-name">${escapeHtml(item.name)}</span>
        <span class="sp-amt">${item.amount}${item.unit}</span>
        <span class="sp-del" onclick="removeSmartItem(${i})">×</span>
      </div>
    `).join('');
  } else {
    previewEl.innerHTML = smartPasteResult.map((step, i) => `
      <div class="sp-item">
        <span class="sp-name" style="font-weight:400;font-size:12.5px">${i + 1}. ${escapeHtml(step)}</span>
        <span class="sp-del" onclick="removeSmartItem(${i})">×</span>
      </div>
    `).join('');
  }
}

// 解析配料文字 → [{name, amount, unit}]
function parseIngredients(text) {
  const lines = text.split(/[\n\r;；]+/).map(l => l.trim()).filter(Boolean);
  const result = [];
  // 用单个正则按行解析，捕获组：name | amount | unit
  // 支持：高筋面粉 250g / 牛奶 120克 / 250g 高筋面粉 / 黄油25g / 盐 适量
  const re = /^(.+?)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(g|克|ml|毫升|L|升|个|只|滴|片|勺|汤匙|茶匙|包|袋|颗|根|适量|少许)?\s*$/;

  for (let line of lines) {
    // 去掉前导符号 "•"、"- "、"1." 等
    line = line.replace(/^[\s•·\-\*]+/, '').replace(/^\d+[.、)]\s*/, '');

    // 模式 A：名称在前 "高筋面粉 250g" / "牛奶120克" / "黄油 25 g"
    let m = line.match(re);
    if (m) {
      result.push({
        name: m[1].trim(),
        amount: parseFloat(m[2]) || 0,
        unit: m[3] || 'g'
      });
      continue;
    }

    // 模式 B：数字在前 "250g 高筋面粉"
    const reNumFirst = /^(\d+(?:\.\d+)?)\s*(g|克|ml|毫升|L|升|个|只|滴|片|勺|汤匙|茶匙|包|袋|颗|根|适量|少许)?\s*(.+)$/;
    m = line.match(reNumFirst);
    if (m && m[3] && m[3].trim()) {
      result.push({
        name: m[3].trim(),
        amount: parseFloat(m[1]) || 0,
        unit: m[2] || 'g'
      });
      continue;
    }

    // 模式 C：只有名称无数字（如"盐 适量" / "葱 少许"）
    const m2 = line.match(/^(.+?)\s*(适量|少许|少量)$/);
    if (m2) {
      result.push({ name: m2[1].trim(), amount: 0, unit: m2[2] });
      continue;
    }

    // 模式 D：名称 + 数字 紧贴（无空格）"面粉250g"
    const m3 = line.match(/^(.+?)(\d+(?:\.\d+)?)\s*(g|克|ml|毫升|L|升|个|只|滴|片|勺|汤匙|茶匙|包|袋|颗|根|适量|少许)?$/);
    if (m3 && m3[1].trim()) {
      result.push({
        name: m3[1].trim(),
        amount: parseFloat(m3[2]) || 0,
        unit: m3[3] || 'g'
      });
      continue;
    }

    // 兜底：整行作为名称
    if (line.length > 0 && line.length < 30) {
      result.push({ name: line, amount: 0, unit: 'g' });
    }
  }
  return result;
}

// 解析步骤文字 → [string]
function parseSteps(text) {
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    // 去掉前导序号 "1." "1、" "第一步" "步骤一"
    return line
      .replace(/^(?:第[一二三四五六七八九十\d]+[步阶段]?)\s*[:：]?\s*/, '')
      .replace(/^(?:步骤\s*\d+)\s*[:：]?\s*/, '')
      .replace(/^\d+\s*[.、)]\s*/, '')
      .replace(/^[\s•·\-\*]+\s*/, '')
      .trim();
  }).filter(Boolean);
}

function applySmartPaste() {
  if (smartPasteResult.length === 0) {
    // 尝试从文本框再解析一次
    parseSmartPaste(document.getElementById('smartPasteText').value);
  }
  if (smartPasteResult.length === 0) {
    showToast('未识别到内容');
    return;
  }

  if (smartPasteTarget === 'ingredients') {
    // 合并到 tempIngredients
    smartPasteResult.forEach(item => {
      state.tempIngredients.push({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        cost: 0
      });
    });
    renderIngRows();
    showToast(`已识别 ${smartPasteResult.length} 项配料 ✓`);
  } else {
    // 追加到步骤文本框
    const ta = document.getElementById('f-steps');
    const existing = ta.value.trim();
    const newSteps = smartPasteResult.join('\n');
    ta.value = existing ? (existing + '\n' + newSteps) : newSteps;
    showToast(`已识别 ${smartPasteResult.length} 条步骤 ✓`);
  }
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
    emoji: '',
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
      data.emoji = state.recipes[idx].emoji || '🍽️';
      state.recipes[idx] = data;
    }
    showToast('配方已更新 ✓');
  } else {
    data.id = 'r' + Date.now();
    data.emoji = '🍽️';
    state.recipes.push(data);
    showToast('配方已保存 ✓');
  }

  const wasNew = !state.editingId;
  state.editingId = null;
  state.tempPhoto = '';
  state.tempRating = 0;
  state.tempIngredients = [];
  saveState();
  closeModal('recipeModal');
  render();
  if (wasNew) {
    // 新建后跳到详情
    const last = state.recipes[state.recipes.length - 1];
    selectRecipe(last.id);
  }
}

function duplicateRecipe(id) {
  const r = state.recipes.find(x => x.id === id);
  if (!r) return;
  const copy = JSON.parse(JSON.stringify(r));
  copy.id = 'r' + Date.now();
  copy.name = r.name + '（副本）';
  state.recipes.push(copy);
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
        <div style="font-weight:600">${r.emoji || '🍽️'} ${r.name} ${renderStars(r.rating || 0)}</div>
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
              <div class="recipe-name">${r.emoji || '🍽️'} ${r.name}</div>
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

// ============ AI 生成配方（通义千问 VL） ============
const AI_KEY_STORAGE = 'baking_ai_apikey';
let aiTempPhoto = ''; // base64 图片

function loadAIKey() {
  return localStorage.getItem(AI_KEY_STORAGE) || '';
}

function saveAIKey() {
  const key = document.getElementById('aiApiKey').value.trim();
  if (!key) { showToast('请输入 Key'); return; }
  localStorage.setItem(AI_KEY_STORAGE, key);
  showToast('API Key 已保存（仅本地）✓');
}

function openAIGenModal() {
  document.getElementById('aiApiKey').value = loadAIKey();
  document.getElementById('aiText').value = '';
  document.getElementById('aiStatus').textContent = '';
  document.getElementById('aiStatus').className = '';
  aiTempPhoto = '';
  const preview = document.getElementById('aiPhotoPreview');
  preview.style.backgroundImage = '';
  preview.classList.remove('has-image');
  preview.innerHTML = '<span class="upload-hint">点击上传图片<br>（视频关键画面截图）</span>';
  document.getElementById('aiGenModal').classList.add('show');
}

function handleAIPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { showToast('图片过大，请压缩到 4MB 以内'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    aiTempPhoto = e.target.result;
    const preview = document.getElementById('aiPhotoPreview');
    preview.style.backgroundImage = `url('${aiTempPhoto}')`;
    preview.classList.add('has-image');
    preview.innerHTML = '<span class="remove-photo" onclick="event.stopPropagation();clearAIPhoto()">×</span>';
  };
  reader.readAsDataURL(file);
}

function clearAIPhoto() {
  aiTempPhoto = '';
  const preview = document.getElementById('aiPhotoPreview');
  preview.style.backgroundImage = '';
  preview.classList.remove('has-image');
  preview.innerHTML = '<span class="upload-hint">点击上传图片<br>（视频关键画面截图）</span>';
  document.getElementById('ai-photo').value = '';
}

async function generateRecipeByAI() {
  const apiKey = loadAIKey() || document.getElementById('aiApiKey').value.trim();
  if (!apiKey) {
    showToast('请先填入通义千问 API Key');
    return;
  }

  const text = document.getElementById('aiText').value.trim();
  if (!aiTempPhoto && !text) {
    showToast('请上传图片或粘贴文字');
    return;
  }

  const statusEl = document.getElementById('aiStatus');
  const btn = document.getElementById('aiGenBtn');
  statusEl.className = 'loading';
  statusEl.textContent = '🤖 AI 思考中，请稍等 10-30 秒...';
  btn.disabled = true;
  btn.textContent = '生成中...';

  try {
    // 构造 prompt
    const prompt = `你是一个专业烘焙配方整理助手。请根据${aiTempPhoto ? '上传的图片' : '提供的文字'}，整理出一个完整的烘焙配方。

要求：
1. 仔细识别图片中的配料表、用量、制作步骤
2. 如果是视频截图，识别画面中的文字信息
3. 按以下 JSON 格式输出（只输出 JSON，不要其他文字）：
{
  "name": "配方名称",
  "cat": "分类(bread/cake/cookie/pastry/cn/filled 之一)",
  "temp": "温度如 上火180/下火160",
  "duration": "时间如 25分钟",
  "outputQty": 1,
  "outputUnit": "个",
  "ingredients": [{"name":"配料名","amount":250,"unit":"g","cost":0}],
  "steps": ["步骤1","步骤2"],
  "ovenTip": "森歌D5ZK平炉适配提示（原配方上下火取中位温度，平炉无法独立调上下火）",
  "difficulty": ["难点1","难点2"],
  "tags": ["标签1","标签2"]
}

${text ? '\n用户补充说明：' + text : ''}
注意：cost 字段如果不清楚就填 0。amount 必须是数字。`;

    // 构造消息内容
    const content = [];
    if (aiTempPhoto) {
      // 提取 base64 纯数据（去掉 data:image/xxx;base64, 前缀）
      const base64Data = aiTempPhoto.split(',')[1];
      const mimeType = aiTempPhoto.match(/data:(image\/\w+);/)[1] || 'image/jpeg';
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64Data}` }
      });
    }
    content.push({ type: 'text', text: prompt });

    // 调用通义千问 VL API（兼容 OpenAI 格式）
    const resp = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-vl-max',
        messages: [{ role: 'user', content: content }],
        temperature: 0.3
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`API ${resp.status}: ${errText.substring(0, 200)}`);
    }

    const data = await resp.json();
    const aiText = data.choices[0].message.content;

    // 提取 JSON
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 返回格式异常');
    const recipe = JSON.parse(jsonMatch[0]);

    // 填入表单
    fillRecipeFormFromAI(recipe);

    statusEl.className = 'success';
    statusEl.textContent = '✓ 配方已生成，请检查后保存';
    showToast('AI 生成完成 ✓');
    setTimeout(() => closeModal('aiGenModal'), 1500);

  } catch (err) {
    statusEl.className = 'error';
    let msg = err.message;
    if (msg.includes('401')) msg = 'API Key 无效，请检查';
    else if (msg.includes('429')) msg = '调用频率超限，请稍后再试';
    else if (msg.includes('insufficient')) msg = '余额不足，请充值或领取免费额度';
    statusEl.textContent = '❌ ' + msg;
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 生成配方';
  }
}

function fillRecipeFormFromAI(recipe) {
  // 确保模态框已打开
  if (!document.getElementById('recipeModal').classList.contains('show')) {
    openRecipeModal();
  }

  document.getElementById('f-name').value = recipe.name || 'AI 生成配方';
  const catSelect = document.getElementById('f-cat');
  if (recipe.cat && catSelect) {
    for (let opt of catSelect.options) {
      if (opt.value === recipe.cat) { catSelect.value = recipe.cat; break; }
    }
  }
  document.getElementById('f-temp').value = recipe.temp || '';
  document.getElementById('f-duration').value = recipe.duration || '';
  document.getElementById('f-outputQty').value = recipe.outputQty || 1;
  document.getElementById('f-outputUnit').value = recipe.outputUnit || '';
  document.getElementById('f-steps').value = (recipe.steps || []).join('\n');
  document.getElementById('f-oven').value = recipe.ovenTip || '';
  document.getElementById('f-difficulty').value = (recipe.difficulty || []).join('\n');
  document.getElementById('f-tags').value = (recipe.tags || []).join(', ');

  // 填入配料
  state.tempIngredients = (recipe.ingredients || []).map(i => ({
    name: i.name || '',
    amount: parseFloat(i.amount) || 0,
    unit: i.unit || 'g',
    cost: parseFloat(i.cost) || 0
  }));
  if (state.tempIngredients.length === 0) addIngRow();
  else renderIngRows();
}

// ============ 启动 ============
init();