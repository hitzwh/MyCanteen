<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">{{ windowName }}的菜品</text>
    </view>

    <!-- 选择器区域 -->
    <view class="simple-selector-area">
      <view class="simple-selector-item">
        <picker :range="typeOptions" range-key="text" @change="onTypeChange">
          <view class="simple-picker-view">
            <text class="simple-picker-text">{{ selectedType ? selectedType.text : '荤/素' }}</text>
            <text class="simple-picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="simple-selector-divider"></view>
      <view class="simple-selector-item">
        <picker :range="supplyOptions" range-key="text" @change="onSupplyChange">
          <view class="simple-picker-view">
            <text class="simple-picker-text">{{ selectedSupply ? selectedSupply.text : '供应' }}</text>
            <text class="simple-picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 菜品列表 -->
    <scroll-view class="dish-list" scroll-y>
      <view class="dish-section" v-if="filteredDishes && filteredDishes.length > 0">
        <view 
          class="dish-card" 
          :class="{'sold-out': dish.status === 'soldout'}"
          v-for="(dish, index) in filteredDishes" 
          :key="index"
          @tap="viewDishDetail(dish)"
        >
          <view class="sold-out-badge" v-if="dish.status === 'soldout'">已售罄</view>
          <image class="dish-image" :src="dish.image || '/static/images/default.jpg'" mode="aspectFill"></image>
          <view class="dish-info">
            <view class="dish-header">
              <view class="dish-name">
                <text class="dish-dot">•</text>
                <text>{{dish.name}}</text>
              </view>
            </view>
            <view class="dish-desc">{{dish.description}}</view>
            <view class="dish-footer">
              <view class="dish-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{dish.price}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <image src="/static/images/default.jpg" mode="aspectFit"></image>
        <text>暂无菜品信息</text>
      </view>
    </scroll-view>
    
    <!-- 使用TabBar组件代替自定义底部导航栏 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
import { dishApi } from '@/api';
import { userApi } from '@/api';

export default {
  components: {
    TabBar
  },
  data() {
    return {
      windowId: '',
      windowName: '',
      loading: false,
      // 选择器选项
      typeOptions: [
        { value: 'all', text: '全部' },
        { value: 'meat', text: '荤菜' },
        { value: 'vegetable', text: '素菜' },
        { value: 'mixed', text: '荤素搭配' }
      ],
      supplyOptions: [
        { value: 'all', text: '全部' },
        { value: 'available', text: '供应中' },
        { value: 'soldout', text: '已售罄' }
      ],
      selectedType: null,
      selectedSupply: null,
      // 菜品数据
      dishes: []
    }
  },
  computed: {
    // 根据筛选条件过滤菜品
    filteredDishes() {
      let result = this.dishes;
      
      // 按类型筛选
      if (this.selectedType && this.selectedType.value !== 'all') {
        result = result.filter(dish => dish.type === this.selectedType.value);
      }
      
      // 按供应状态筛选
      if (this.selectedSupply && this.selectedSupply.value !== 'all') {
        result = result.filter(dish => dish.status === this.selectedSupply.value);
      }
      
      return result;
    }
  },
  onLoad(options) {
    // 获取传递的窗口ID和名称
    if (options.windowId) {
      this.windowId = options.windowId;
    }
    if (options.windowName) {
      this.windowName = decodeURIComponent(options.windowName);
    }
    
    // 设置默认选项
    this.selectedType = this.typeOptions[0]; // 默认选择"全部"
    this.selectedSupply = this.supplyOptions[0]; // 默认选择"全部"
    
    // 加载菜品数据
    this.loadDishes();
    
    // 添加全局点击事件监听器，用于关闭下拉选择器
    setTimeout(() => {
      try {
        if (typeof document !== 'undefined' && document.body) {
          document.body.addEventListener('click', this.handleGlobalClick);
        }
      } catch (error) {
        console.error('添加事件监听器失败:', error);
      }
    }, 300);
  },
  onUnmounted() {
    // 移除全局事件监听器
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeEventListener('click', this.handleGlobalClick);
      }
    } catch (error) {
      console.error('移除事件监听器失败:', error);
    }
  },
  methods: {
    // 全局点击事件处理
    handleGlobalClick(e) {
      // 仅H5环境
      // #ifdef H5
      // 如果点击了选择器相关元素，不做处理
      if (e && e.target && 
          (String(e.target.className).includes('picker') || 
           String(e.target.className).includes('selector') ||
           e.target.closest('.uni-picker-container') ||
           e.target.closest('.uni-select'))) {
        // 选择器相关元素被点击，不移除遮罩
        console.log('选择器元素被点击，保持遮罩');
        return;
      }
      
      // 检查是否有遮罩层，尝试移除
      try {
        this.removeMasks();
      } catch (error) {
        console.error('移除遮罩层时出错:', error);
      }
      // #endif
    },
    
    // 移除可能存在的遮罩层
    removeMasks() {
      // 仅在H5环境下执行DOM操作
      // #ifdef H5
      try {
        // 确保document存在
        if (typeof document === 'undefined' || !document.body) {
          console.warn('document或document.body不存在，无法移除遮罩层');
          return;
        }
        
        // 查找并处理遮罩层，但不处理正在使用的选择器遮罩
        const masks = document.querySelectorAll('.uni-mask:not(.uni-picker-mask), .uni-picker-mask:not(.active-picker-mask)');
        if (masks && masks.length > 0) {
          masks.forEach(mask => {
            try {
              // 检查是否是当前活动的选择器遮罩
              const isActivePicker = mask.closest && (
                mask.closest('.uni-picker-container.active') || 
                mask.closest('.uni-select.active')
              );
              
              if (!isActivePicker) {
                mask.style.backgroundColor = 'transparent';
                mask.style.display = 'none';
                console.log('已移除非活动选择器遮罩层');
              }
            } catch (error) {
              console.error('处理遮罩层时出错:', error);
            }
          });
        }
      } catch (error) {
        console.error('移除遮罩层失败:', error);
      }
      // #endif
      
      // 在非H5环境下，依赖样式覆盖
      // 触发视图更新，但避免频繁刷新
      if (!this.removeMasks._isRefreshing) {
        this.removeMasks._isRefreshing = true;
        try {
          this.loading = !this.loading;
          setTimeout(() => {
            this.loading = !this.loading;
            this.removeMasks._isRefreshing = false;
          }, 100);
        } catch (error) {
          console.error('触发视图更新失败:', error);
          this.removeMasks._isRefreshing = false;
        }
      }
    },
    
    goBack() {
      // 直接跳转到餐厅介绍页面，而不是使用navigateBack
      console.log('返回到餐厅介绍页面');
      
      // 使用reLaunch方法替代redirectTo，确保能正确返回
      uni.reLaunch({
        url: '/pages/index/canteen-intro',
        success: () => {
          console.log('成功返回到餐厅介绍页面');
        },
        fail: (err) => {
          console.error('返回失败:', err);
          
          // 如果reLaunch失败，尝试使用redirectTo
          uni.redirectTo({
            url: '/pages/index/canteen-intro',
            fail: (err2) => {
              console.error('redirectTo也失败了:', err2);
              
              // 最后尝试navigateTo
              uni.navigateTo({
                url: '/pages/index/canteen-intro'
              });
            }
          });
        }
      });
    },
    // 加载菜品数据
    async loadDishes() {
      if (!this.windowId) {
        uni.showToast({
          title: '窗口ID不存在',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      try {
        // 从API获取菜品数据
        const res = await dishApi.getDishesByWindow(this.windowId);
        if (res && res.data) {
          this.dishes = res.data.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description || '暂无描述',
            image: item.image || '/static/images/white.jpg',
            price: item.price.toFixed(2),
            type: this.getDishType(item.tags),
            status: item.status || 'available',
            rating: item.rating || 0,
            ratingCount: item.ratingCount || 0
          }));
          console.log('获取菜品数据成功:', this.dishes);
        }
      } catch (error) {
        console.error('获取菜品数据失败:', error);
        uni.showToast({
          title: '获取菜品数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 根据标签判断菜品类型
    getDishType(tags) {
      if (!tags || tags.length === 0) return 'mixed';
      
      const lowerTags = tags.map(tag => tag.toLowerCase());
      
      if (lowerTags.includes('荤菜') || lowerTags.includes('肉类')) {
        return 'meat';
      } else if (lowerTags.includes('素菜') || lowerTags.includes('蔬菜')) {
        return 'vegetable';
      } else {
        return 'mixed';
      }
    },
    
    // 查看菜品详情
    async viewDishDetail(dish) {
      console.log('查看菜品详情:', dish);
      
      try {
        // 记录浏览历史
        await userApi.recordHistory({ dishId: dish.id });
      } catch (error) {
        console.error('记录浏览历史失败:', error);
      }
      
      // 跳转到菜品详情页面，并传递窗口信息
      let url = `/pages/index/dish-detail?dishId=${dish.id}`;
      
      // 添加窗口ID和名称参数，以便返回时能回到正确的菜品列表
      if (this.windowId) {
        url += `&windowId=${this.windowId}`;
      }
      if (this.windowName) {
        url += `&windowName=${encodeURIComponent(this.windowName)}`;
      }
      
      uni.navigateTo({
        url: url,
        success: () => {
          console.log('跳转到菜品详情页面成功');
        },
        fail: (err) => {
          console.error('跳转到菜品详情页面失败:', err);
          uni.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    // 关闭所有弹窗方法
    closePopups() {
      // 关闭所有可能的弹窗
      this.showFilterPopup = false;
      this.showDishDetailPopup = false;
      
      // 隐藏加载指示器
      try {
        uni.hideLoading();
      } catch (error) {
        console.error('隐藏加载指示器时出错:', error);
      }
    },
    // 类型变化事件
    onTypeChange(e) {
      // 先关闭所有弹窗
      this.closePopups();
      
      const index = e.detail.value;
      this.selectedType = this.typeOptions[index];
      
      // 显示加载指示器，但不使用mask以避免遮挡选择器
      uni.showLoading({
        title: '加载中',
        mask: false
      });
      
      // 延迟执行筛选，确保选择器已关闭
      setTimeout(() => {
        this.filterDishes();
        uni.hideLoading();
      }, 300);
      
      // 安全地尝试移除遮罩层
      try {
        setTimeout(() => {
          this.removeMasks();
        }, 100);
      } catch (error) {
        console.error('移除遮罩层时出错:', error);
      }
    },
    // 供应变化事件
    onSupplyChange(e) {
      // 先关闭所有弹窗
      this.closePopups();
      
      const index = e.detail.value;
      this.selectedSupply = this.supplyOptions[index];
      
      // 显示加载指示器，但不使用mask以避免遮挡选择器
      uni.showLoading({
        title: '加载中',
        mask: false
      });
      
      // 延迟执行筛选，确保选择器已关闭
      setTimeout(() => {
        this.filterDishes();
        uni.hideLoading();
      }, 300);
      
      // 安全地尝试移除遮罩层
      try {
        setTimeout(() => {
          this.removeMasks();
        }, 100);
      } catch (error) {
        console.error('移除遮罩层时出错:', error);
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.status-bar {
  width: 100%;
  height: var(--status-bar-height);
  background-color: #ffffff;
}

.nav-header {
  position: relative;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  z-index: 10;
}

.back-icon {
  position: absolute;
  left: 20rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.03);
  font-size: 40rpx;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon:active {
  background-color: rgba(0, 0, 0, 0.08);
}

.back-icon text {
  font-weight: bold;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 简化选择器区域样式 */
.simple-selector-area {
  margin: 0 0 20rpx 0;
  display: flex;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 999;
}

.simple-selector-divider {
  width: 1rpx;
  height: 40rpx;
  background-color: #eee;
  margin: 0 20rpx;
  align-self: center;
}

.simple-selector-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.simple-picker-view {
  display: flex;
  align-items: center;
}

.simple-picker-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.simple-picker-arrow {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.dish-list {
  padding: 0 20rpx 30rpx;
  height: calc(100vh - 90rpx - var(--status-bar-height) - 100rpx);
  background-color: #f8f8f8;
  -webkit-overflow-scrolling: touch;
}

.dish-list .dish-section {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding: 30rpx 0;
}

/* 菜品卡片样式 */
.dish-card {
  width: 100%;
  display: flex;
  background-color: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  padding: 10rpx;
}

.dish-image {
  width: 160rpx;
  height: 160rpx;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 15rpx;
  border-radius: 8rpx;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10rpx 15rpx;
  overflow: hidden;
  min-width: 0;
  margin-right: 10rpx;
}

.dish-header {
  width: 100%;
  margin-bottom: 15rpx;
}

.dish-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  padding-right: 15rpx;
}

.dish-dot {
  color: #ff9500;
  font-size: 36rpx;
  margin-right: 8rpx;
  line-height: 1;
  flex-shrink: 0;
}

.dish-name text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  flex: 1;
  padding-right: 10rpx;
}

.dish-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin-top: 5rpx;
}

.dish-price {
  color: #ff6200;
  font-weight: bold;
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
  padding-right: 15rpx;
}

.price-symbol {
  font-size: 24rpx;
  margin-right: 4rpx;
}

.price-value {
  font-size: 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 30rpx;
  height: 400rpx;
}

.empty-state image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  opacity: 0.8;
}

.empty-state text {
  font-size: 28rpx;
  color: #999;
  line-height: 1.4;
  text-align: center;
}

.sold-out-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: rgba(255, 0, 0, 0.7);
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  z-index: 5;
}

/* 添加售罄菜品的样式 */
.dish-card.sold-out {
  opacity: 0.7;
  filter: grayscale(0.5);
}

.dish-card.sold-out .dish-image {
  position: relative;
}

.dish-card.sold-out .dish-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* 全局修复遮罩层问题 */
/* 修复uni-app原生组件样式 */
page {
  /* 防止picker遮罩层导致整个页面变灰 */
  --picker-mask-background: transparent !important;
  --picker-view-z-index: 999999;
  --picker-indicator-height: 80rpx;
}

/* 修复uni-select选择器的mask问题 */
:deep(.uni-mask),
:deep(.uni-picker-mask) {
  background-color: transparent !important;
  pointer-events: auto !important;
  z-index: 999998 !important;
}

/* 修复uni-picker弹出层的样式 */
:deep(.uni-picker),
:deep(.uni-picker-container),
:deep(.uni-picker-view),
:deep(.uni-select),
:deep(.uni-select-picker) {
  z-index: 999999 !important;
  pointer-events: auto !important;
  touch-action: auto !important;
}

:deep(.uni-picker-view-indicator),
:deep(.uni-picker-view-content),
:deep(.uni-picker-view-wrapper) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

:deep(.uni-picker-view-column) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

:deep(.uni-picker-item) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
}

:deep(.uni-picker-toggle),
:deep(.uni-picker-action) {
  z-index: 999999 !important;
  pointer-events: auto !important;
}

/* 确保选择器弹出框可点击 */
.uni-picker-view-column,
.uni-picker-item,
:deep(.uni-picker-view-column),
:deep(.uni-picker-item) {
  pointer-events: auto !important;
  touch-action: pan-y !important;
}

/* 解决picker选择器弹出时背景变灰的问题 */
:deep(.uni-picker .uni-picker-view-mask) {
  background-color: transparent !important;
}

/* 解决移动端picker选择问题 */
@media screen and (max-width: 768px) {
  .uni-picker-container {
    top: auto !important;
    bottom: 0;
    z-index: 999999 !important;
    pointer-events: auto !important;
  }
  
  /* 确保选择器内容可滑动 */
  .uni-picker-view-column {
    overflow: visible !important;
    pointer-events: auto !important;
    touch-action: pan-y !important;
  }
}
</style> 