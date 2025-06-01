<template>
  <!-- 整个页面的容器 -->
  <view class="evaluate-container">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <!-- 全部筛选 -->
      <view class="filter-item" :class="{ active: currentFilter === 'all' }">
        <picker @change="onSortChange" :value="sortIndex" :range="sortOptions">
          <view class="picker-content">
            <text>{{ currentSort }}</text>
            <text class="iconfont icon-arrow-down-s-fill"></text>
          </view>
        </picker>
      </view>
      <view class="divider"></view>
      <!-- 窗口筛选 -->
      <view class="filter-item" :class="{ active: currentFilter === 'window' }">
        <picker @change="onWindowChange" :value="windowIndex" :range="windowOptions" range-key="name">
          <view class="picker-content">
            <text>{{ currentWindow }}</text>
            <text class="iconfont icon-arrow-down-s-fill"></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view class="evaluate-list" scroll-y @scrolltolower="loadMoreComments" refresher-enabled @refresherrefresh="refreshComments" :refresher-triggered="isRefreshing">
      <view v-if="loading && evaluateList.length === 0" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="evaluateList.length === 0" class="empty-container">
        <text class="iconfont icon-message-3-line"></text>
        <text class="empty-text">暂无评价</text>
      </view>
      
      <view v-else class="evaluate-items">
        <view class="evaluate-item" v-for="(item, index) in evaluateList" :key="index">
          <image class="food-image" :src="item.image || '/static/images/white.jpg'" mode="aspectFill" />
          <view class="evaluate-content">
            <view class="food-info">
              <text class="food-name">{{ item.name }}</text>
              <text class="window-name">{{ item.window }}</text>
            </view>
            <view class="rating">
              <text class="rating-score">{{ item.rating.toFixed(1) }}</text>
              <view class="rating-stars">
                <text class="star" v-for="i in 5" :key="i" :class="{ active: i <= item.rating }">★</text>
              </view>
            </view>
            <view class="comment">{{ item.comment }}</view>
            <view class="comment-images" v-if="item.images && item.images.length > 0">
              <image 
                v-for="(img, imgIndex) in item.images" 
                :key="imgIndex" 
                :src="img" 
                mode="aspectFill"
                @tap="previewImage(item.images, imgIndex)"
              ></image>
            </view>
            <view class="comment-footer">
              <text class="comment-date">{{ formatDate(item.createdAt) }}</text>
              <view class="comment-user">
                <image class="user-avatar" :src="item.userAvatar || '/static/images/default.jpg'" mode="aspectFill"></image>
                <text class="user-name">{{ item.userName }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="loading && evaluateList.length > 0" class="loading-more">
          <view class="loading-spinner"></view>
          <text>加载更多...</text>
        </view>
        
        <view v-if="!hasMore && evaluateList.length > 0" class="no-more">
          <text>没有更多评价了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 使用TabBar组件 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TabBar from '@/components/TabBar.vue';
import { commentApi } from '@/api';
import { windowApi } from '@/api';

// 当前筛选状态
const currentFilter = ref('all');

// 排序选项
const sortOptions = ['最新', '评分⬇', '评分⬆'];
const sortIndex = ref(0);
const currentSort = computed(() => sortOptions[sortIndex.value]);

// 窗口选项
const windowOptions = ref([
  { id: '', name: '全部窗口' }
]);
const windowIndex = ref(0);
const currentWindow = computed(() => windowOptions.value[windowIndex.value].name);

// 评价列表数据
const evaluateList = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const isRefreshing = ref(false);

// 查询参数
const queryParams = ref({
  page: 1,
  pageSize: 10,
  windowId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// 获取窗口列表
const fetchWindowList = async () => {
  try {
    const res = await windowApi.getAllWindows();
    if (res && res.data) {
      // 添加所有窗口到选项中
      windowOptions.value = [
        { id: '', name: '全部窗口' },
        ...res.data.map(window => ({
          id: window._id,
          name: window.name
        }))
      ];
    }
  } catch (error) {
    console.error('获取窗口列表失败:', error);
    uni.showToast({
      title: '获取窗口列表失败',
      icon: 'none'
    });
  }
};

// 获取评价列表
const fetchEvaluateList = async (refresh = false) => {
  if (loading.value && !refresh) return;
  
  loading.value = true;
  
  try {
    // 如果是刷新，重置页码
    if (refresh) {
      queryParams.value.page = 1;
      hasMore.value = true;
    }
    
    const res = await commentApi.getAllComments(queryParams.value);
    
    if (res && res.data) {
      const comments = res.data.list.map(item => ({
        id: item._id,
        name: item.dishId.name,
        image: item.dishId.image,
        window: item.dishId.windowId ? item.dishId.windowId.name : '未知窗口',
        rating: item.rating,
        comment: item.content,
        images: item.images || [],
        createdAt: item.createdAt,
        userName: item.userId.username,
        userAvatar: item.userId.avatar
      }));
      
      // 如果是刷新，替换数据；否则，追加数据
      if (refresh) {
        evaluateList.value = comments;
      } else {
        evaluateList.value = [...evaluateList.value, ...comments];
      }
      
      // 更新分页信息
      queryParams.value.page++;
      hasMore.value = comments.length === pageSize.value;
    } else {
      // 如果没有数据，显示空状态
      if (refresh) {
        evaluateList.value = [];
      }
      hasMore.value = false;
    }
  } catch (error) {
    console.error('获取评价列表失败:', error);
    uni.showToast({
      title: '获取评价列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    if (isRefreshing.value) {
      isRefreshing.value = false;
    }
  }
};

// 刷新评价列表
const refreshComments = () => {
  isRefreshing.value = true;
  fetchEvaluateList(true);
};

// 加载更多评价
const loadMoreComments = () => {
  if (!loading.value && hasMore.value) {
    fetchEvaluateList();
  }
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

// 预览图片
const previewImage = (images, current) => {
  uni.previewImage({
    urls: images,
    current: images[current]
  });
};

// 排序方式改变处理函数
const onSortChange = (e) => {
  sortIndex.value = parseInt(e.detail.value);
  currentFilter.value = 'all';
  
  // 根据排序选项更新查询参数
  switch (sortIndex.value) {
    case 0: // 最新
      queryParams.value.sortBy = 'createdAt';
      queryParams.value.sortOrder = 'desc';
      break;
    case 1: // 评分从高到低
      queryParams.value.sortBy = 'rating';
      queryParams.value.sortOrder = 'desc';
      break;
    case 2: // 评分从低到高
      queryParams.value.sortBy = 'rating';
      queryParams.value.sortOrder = 'asc';
      break;
  }
  
  // 重新获取数据
  fetchEvaluateList(true);
};

// 窗口选择改变处理函数
const onWindowChange = (e) => {
  windowIndex.value = parseInt(e.detail.value);
  currentFilter.value = 'window';
  
  // 更新查询参数中的窗口ID
  queryParams.value.windowId = windowOptions.value[windowIndex.value].id;
  
  // 重新获取数据
  fetchEvaluateList(true);
};

// 页面加载时获取数据
onMounted(() => {
  fetchWindowList();
  fetchEvaluateList();
});
</script>

<style lang="scss">
.evaluate-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 120rpx;
  box-sizing: border-box;
  position: relative;
}

.status-bar {
  height: 44rpx;
  width: 100%;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-item {
  flex: 1;
  text-align: center;
  position: relative;
  transition: all 0.3s;

  &.active {
    color: #34c759;
    font-weight: 500;
  }
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;

  .icon-arrow-down {
    font-size: 24rpx;
    margin-left: 8rpx;
  }
}

.divider {
  width: 2rpx;
  height: 24rpx;
  background: #eee;
  margin: 0 40rpx;
}

.evaluate-list {
  height: calc(100vh - 220rpx);
  padding: 0 30rpx;
}

.evaluate-item {
  display: flex;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.food-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
}

.evaluate-content {
  flex: 1;
}

.food-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.food-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.window-name {
  font-size: 24rpx;
  color: #999;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.rating-score {
  font-size: 36rpx;
  color: #34c759;
  font-weight: 600;
  margin-right: 16rpx;
}

.rating-stars {
  display: flex;
  align-items: center;
}

.star {
  font-size: 32rpx;
  color: #ddd;
  margin-right: 4rpx;

  &.active {
    color: #ffcd3c;
  }
}

.comment {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
  
  image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    object-fit: cover;
  }
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.comment-date {
  font-size: 24rpx;
  color: #999;
}

.comment-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.user-name {
  font-size: 24rpx;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(52, 199, 89, 0.2);
  border-top-color: #34c759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-container .iconfont {
  font-size: 80rpx;
  color: #ddd;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

.loading-more .loading-spinner {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
  margin-bottom: 0;
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 