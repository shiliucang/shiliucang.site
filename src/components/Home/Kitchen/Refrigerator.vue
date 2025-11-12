<template>
  <div class="app-container">
    <header class="re-header">
      <span>智能冰箱管理</span>
    </header>

    <!-- 主要内容区（物品列表） -->
    <main class="re-content">
      <!-- 物品列表 -->
      <div class="items-list">
        <!-- 空状态 -->
        <div v-if="items.length === 0" class="empty-state">
          <p class="empty-text">这里空空如也哦～</p>
        </div>

        <!-- 物品卡片（修复按钮点击） -->
        <div v-else class="card-list">
          <div class="swipe-container"  v-for="(item, index) in items"  :key="item.id"
            @touchstart="handleSwipeStart(index, $event)"
            @touchmove="handleSwipeMove(index, $event)"
            @touchend="handleSwipeEnd(index)"
            @mousedown="handleSwipeStart(index, $event)"
            @mousemove="handleSwipeMove(index, $event)"
            @mouseup="handleSwipeEnd(index)"
            @mouseleave="handleSwipeEnd(index)"
            @click="handleCardClick(index)"
          >

            <!-- 卡片内容（名称+天数）- 层级降低，不遮挡按钮 -->
            <div class="item-card">
              <div class="item-text">
                <span>{{ item.name }}</span>
              </div>
              <!-- 天数（左滑时隐藏） -->
              <div  class="item-day" 
                :style="{ opacity: swipeDistance[index] > 0 ? 0 : 1, transform: `translateX(${swipeDistance[index] * 0.5}px)` }"
              >
                <span>{{ calculateDays(item.purchaseDate) }} 天</span>
              </div>
            </div>
            
            <!-- 操作按钮（提高层级，确保可点击） -->
            <div class="swipe-buttons" :style="{ width: `${swipeDistance[index]}px` }">
              <button   class="operation-btn refresh-btn"  aria-label="刷新购买时间"  @click="handleRefresh(index, $event)">
                <img src="/src/assets/img/refresh.png" alt="刷新">
              </button>
              <button   class="operation-btn delete-btn"  aria-label="删除物品"  @click="handleDelete(index, $event)">
                <img src="/src/assets/img/delete.png" alt="删除">
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加物品区域（固定在最下方） -->
    <div class="add-item-container">
      
      <!-- 添加按钮 -->
      <button class="add-btn"  @click="showAddInput = true"  v-show="!showAddInput">
        <img src="/src/assets/img/add.png" alt="添加">
      </button>

      <!-- 输入框区域 -->
      <div class="add-input-area" v-show="showAddInput">
        <input   type="text"   placeholder="输入物品名称"    class="add-input"    v-model="newItemName" 
          @keyup.enter="confirmAddItem"    @keyup.esc="cancelAddItem"  ref="addInputRef">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';

// 响应式数据
const newItemName = ref('');
const items = ref([]);
const showAddInput = ref(false);
const spinningIndex = ref(-1); // 刷新按钮旋转状态
const addInputRef = ref(null);
const STORAGE_KEY = 'refrigerator_items';

// 左滑相关数据
const swipeDistance = ref([]); // 每个卡片的滑动距离（控制按钮宽度）
const startX = ref(-1); // 触摸/鼠标起始X坐标
const isSwiping = ref(false); // 是否正在滑动
const activeSwipeIndex = ref(-1); // 当前处于左滑状态的卡片索引
const MAX_SWIPE_DISTANCE = 120; // 最大滑动距离（按钮总宽度）
const MIN_SWIPE_DISTANCE = 40; // 显示按钮的最小滑动距离

// 初始化滑动距离数组
const initSwipeDistance = () => {
  swipeDistance.value = items.value.map(() => 0);
};

// 从本地存储加载数据
const loadFromLocalStorage = () => {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (storedItems) {
      items.value = JSON.parse(storedItems);
      initSwipeDistance();
    }
  } catch (error) {
    console.error('加载本地存储数据失败:', error);
    items.value = [];
    initSwipeDistance();
  }
};

// 保存数据到本地存储
const saveToLocalStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
  } catch (error) {
    console.error('保存数据到本地存储失败:', error);
  }
};

// 生成唯一ID
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `${timestamp}-${randomNum}`;
};

// 确认添加物品
const confirmAddItem = () => {
  if (!newItemName.value.trim()) {
    alert('请输入物品名称');
    return;
  }

  const newItem = {
    id: generateUniqueId(),
    name: newItemName.value.trim(),
    purchaseDate: new Date().toISOString()
  };

  items.value.push(newItem);
  swipeDistance.value.push(0); // 新增卡片初始化滑动距离
  saveToLocalStorage();

  // 重置状态
  newItemName.value = '';
  showAddInput.value = false;

  // 滚动到最新添加的物品
  setTimeout(() => {
    const lastItem = document.querySelector('.swipe-container:last-child');
    if (lastItem) {
      lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
};

// 取消添加物品
const cancelAddItem = () => {
  newItemName.value = '';
  showAddInput.value = false;
};

// 处理刷新操作（修复事件冒泡）
const handleRefresh = (index, e) => {
  e.stopPropagation(); // 阻止事件冒泡到卡片
  e.preventDefault(); // 阻止默认行为
  
  spinningIndex.value = index;
  // 重置购买时间为当前时间
  items.value[index] = {
    ...items.value[index],
    purchaseDate: new Date().toISOString()
  };
  saveToLocalStorage();
  // 旋转动画结束后撤销左滑状态
  setTimeout(() => {
    spinningIndex.value = -1;
    resetSwipe(index);
  }, 500);
};

/**
 * 处理删除操作（修复事件冒泡）
 */
const handleDelete = (index, e) => {
  e.stopPropagation(); // 阻止事件冒泡到卡片
  e.preventDefault(); // 阻止默认行为
  
  if (window.confirm('确定要删除这个物品吗？')) {
    items.value.splice(index, 1);
    swipeDistance.value.splice(index, 1);
    saveToLocalStorage();
    // 删除后重置激活状态
    if (activeSwipeIndex.value === index) {
      activeSwipeIndex.value = -1;
    }
  }
};

/**
 * 计算存放天数
 */
const calculateDays = (purchaseDate) => {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const timeDiff = now - purchase;
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

// 重置单个卡片的滑动状态（完全关闭按钮）
const resetSwipe = (index) => {
  swipeDistance.value[index] = 0; // 宽度设为0，按钮完全隐藏
  if (activeSwipeIndex.value === index) {
    activeSwipeIndex.value = -1;
  }
};

// 重置所有卡片的滑动状态
const resetAllSwipe = () => {
  if (activeSwipeIndex.value === -1) return;
  swipeDistance.value[activeSwipeIndex.value] = 0; // 完全关闭按钮
  activeSwipeIndex.value = -1;
};

// 左滑开始
const handleSwipeStart = (index, e) => {
  isSwiping.value = true;
  // 记录起始X坐标
  if (e.type === 'touchstart') {
    startX.value = e.touches[0].clientX;
  } else if (e.type === 'mousedown') {
    startX.value = e.clientX;
  }
  // 重置其他卡片的滑动状态
  if (activeSwipeIndex.value !== -1 && activeSwipeIndex.value !== index) {
    resetSwipe(activeSwipeIndex.value);
  }
};

// 左滑/右滑过程中
const handleSwipeMove = (index, e) => {
  if (!isSwiping.value || startX.value === -1) return;
  
  let currentX = 0;
  // 获取当前X坐标
  if (e.type === 'touchmove') {
    currentX = e.touches[0].clientX;
  } else if (e.type === 'mousemove') {
    currentX = e.clientX;
  }
  
  // 计算滑动偏移量（左滑为正，右滑为负）
  const offset = currentX - startX.value;
  // 计算目标宽度：当前宽度 - 偏移量（右滑时offset为正，宽度减小）
  let targetDistance = swipeDistance.value[index] - offset;
  
  // 限制宽度范围（0~MAX_SWIPE_DISTANCE）
  if (targetDistance < 0) {
    targetDistance = 0; // 右滑超过初始位置，按钮完全隐藏
  } else if (targetDistance > MAX_SWIPE_DISTANCE) {
    targetDistance = MAX_SWIPE_DISTANCE; // 左滑超过最大距离，固定宽度
  }
  
  swipeDistance.value[index] = targetDistance;
  // 更新激活状态（宽度>0即为激活）
  activeSwipeIndex.value = targetDistance > 0 ? index : -1;
};

// 滑动结束
const handleSwipeEnd = (index) => {
  if (!isSwiping.value) return;
  
  // 滑动距离不足，完全关闭按钮；足够则保持最大宽度
  if (swipeDistance.value[index] < MIN_SWIPE_DISTANCE) {
    resetSwipe(index); // 完全关闭按钮
  } else {
    swipeDistance.value[index] = MAX_SWIPE_DISTANCE;
    activeSwipeIndex.value = index;
  }
  
  // 重置滑动状态
  isSwiping.value = false;
  startX.value = -1;
};

// 点击卡片空白处（撤销左滑）
const handleCardClick = (index) => {
  // 只有当前卡片处于左滑状态时，点击才撤销
  if (activeSwipeIndex.value === index) {
    resetSwipe(index);
  }
};

/**
 * 点击页面空白处：同时处理「撤销左滑」和「取消输入框」
 */
const handleDocumentClick = (e) => {
  // 排除添加区域、输入框、操作按钮的点击
  const ignoreTargets = [
    '.add-item-container',
    '.add-input',
    '.operation-btn',
    '.add-btn'
  ];
  
  const isIgnore = ignoreTargets.some(selector => {
    const element = document.querySelector(selector);
    return element && element.contains(e.target);
  });
  
  // 1. 点击空白处取消输入框（核心新增逻辑）
  if (!isIgnore && showAddInput.value) {
    cancelAddItem();
  }
  
  // 2. 点击空白处撤销左滑（原有逻辑）
  if (!isIgnore && activeSwipeIndex.value !== -1) {
    resetAllSwipe();
  }
};

/**
 * 页面挂载时初始化
 */
onMounted(() => {
  loadFromLocalStorage();
  
  // 监听输入框显示状态，确保聚焦
  watch(showAddInput, (isShow) => {
    if (isShow) {
      nextTick(() => {
        addInputRef.value?.focus();
      });
    }
  });

  // 点击空白处关闭输入框或撤销左滑
  document.addEventListener('click', handleDocumentClick);

  // 防止添加区域事件冒泡
  document.querySelector('.add-item-container')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

/**
 * 页面卸载前移除事件监听
 */
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
/* 全局容器 - 适配7.5rem固定宽度（移动端） */
.app-container {
  width: 7.5rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafc;
  overflow-x: hidden;
}

/* 页面头部 */
.re-header {
  background-color: white;
  padding: 0.2rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.re-header span {
  font-size: 0.4rem;
  font-weight: bold;
  color: #165DFF;
}

/* 主要内容区 */
.re-content {
  flex: 1;
  width: 7.0rem;
  margin: 0 auto;
  padding: 0.3rem 0;
  overflow-y: auto;
}

/* 物品列表容器 */
.items-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 1.2rem 0.3rem;
  background-color: white;
  border-radius: 0.2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.empty-text {
  color: #6b7280;
  font-size: 0.35rem;
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* 滑动容器 - 关键：相对定位 */
.swipe-container {
  position: relative;
  width: 100%;
  height: 1.0rem;
  background-color: white;
  border-radius: 0.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  cursor: pointer;
}

/* 卡片内容（名称+天数）- 降低层级，不遮挡按钮 */
.item-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.3rem;
  z-index: 1; /* 层级低于按钮 */
  box-sizing: border-box;
}

/* 物品名称 */
.item-text {
  color: #333;
  font-size: 0.35rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 4.5rem;
}

/* 天数（左滑时隐藏） */
.item-day {
  color: red;
  font-size: 0.35rem;
  font-weight: 600;
  margin-left: 0.2rem;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform-origin: right center;
}

/* 操作按钮容器 - 提高层级，确保可点击 */
.swipe-buttons {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  z-index: 2; /* 层级高于卡片内容 */
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 操作按钮通用样式 - 扩大点击区域 */
.operation-btn {
  width: 0.6rem;
  height: 100%;
  border: none;
  padding: 0.1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  /* 扩大点击区域（解决图标过小问题） */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
}

.operation-btn img {
  width: 0.4rem;
  height: 0.4rem;
  object-fit: contain;
}

/* 刷新按钮样式 */
.refresh-btn {
  background-color: #e8f4f8;
}

.refresh-btn:hover, .refresh-btn:active {
  background-color: #d1e7ed;
}

/* 删除按钮样式 */
.delete-btn {
  background-color: #fee2e2;
}

.delete-btn:hover, .delete-btn:active {
  background-color: #fecaca;
}

/* 刷新按钮旋转动画 */
.operation-btn.refresh-btn img {
  animation: spin 0.5s linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 添加物品容器 */
.add-item-container {
  width: 7.0rem;
  margin: 0 auto;
  padding: 0.2rem 0 0.3rem;
  background-color: #f9fafc;
  z-index: 5;
}

/* 添加按钮 */
.add-btn {
  width: 100%;
  height: 0.8rem;
  background-color: white;
  border: 2px dashed #36CFC9;
  border-radius: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn img {
  width: 0.4rem;
  height: 0.4rem;
  object-fit: contain;
}

.add-btn:hover {
  background-color: rgba(54, 207, 201, 0.05);
  border-color: #165DFF;
  transform: translateY(-2px);
}

/* 输入框区域 */
.add-input-area {
  width: 100%;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0.2rem;
  border-radius: 0.2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.add-input {
  flex: 1;
  padding: 0.2rem 0.3rem;
  border: 1px solid #165DFF;
  border-radius: 0.15rem;
  font-size: 0.35rem;
  outline: none;
}

.add-input:focus {
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

/* 确保按钮可点击 */
button {
  pointer-events: auto !important;
}

input {
  pointer-events: auto !important;
}

/* 禁止文本选择 */
.swipe-container {
  user-select: none;
  -webkit-user-select: none;
}
</style>