<template>
  <div class="tabcontainer">
    <div class="tab-buttons">
      <button 
        @click="activeTab = 'Tab1'"
        :class="['tab-btn', activeTab === 'Tab1' ? 'active' : '']"
      >
        冰箱
      </button>


      <button 
        @click="activeTab = 'Tab2'"
        :class="['tab-btn', activeTab === 'Tab2' ? 'active' : '']"
      >
        菜单
      </button>
    </div>

    <div class="tab-content-wrapper">
      <!-- 保留缓存，加 key 避免冲突 -->
      <keep-alive>
        <component :is="activeComponent" :key="activeTab" />
      </keep-alive>
    </div>
  </div>

</template>

<script setup>
import { ref, computed } from 'vue'
// 正确导入：按钮文字与组件功能对应
import Refrigerator from './Refrigerator.vue' // 冰箱组件
import Menu from './Menu.vue'                 // 菜单组件

const activeTab = ref('Tab1') // 默认显示冰箱

// 计算属性：正确映射按钮与组件
const activeComponent = computed(() => {
  return activeTab.value === 'Tab1' ? Refrigerator : Menu
})
</script>

<style scoped>
/* 样式不变，保留之前的优化 */
.tabcontainer {
  width: 100%;
  max-width: 7.5rem;
  margin: 0 auto;
  padding: 0 0.2rem;
}

.tab-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 2px solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  align-items: center; /* 保持垂直居中 */
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
  line-height: 1.5; /* 统一行高，确保文字垂直居中 */
  height: 44px; /* 固定高度，让两个按钮尺寸完全一致 */
}

.tab-btn.active {
  background: #007bff;
  color: #fff;
}


.tab-btn:hover:not(.active) {
  background: #eee;
}

.tab-content-wrapper {
  height: calc(100vh - 150px);
  overflow-y: auto;
  padding: 25px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.tab-content-wrapper::-webkit-scrollbar {
  width: 6px;
}
.tab-content-wrapper::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
</style>