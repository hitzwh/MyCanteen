<template>
  <!-- 整个页面的容器 -->
  <view class="message-container">
    <!-- 添加背景组件 -->
    <page-background></page-background>
    
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-content">
        <text class="title">消息</text>
        <view class="search-btn" @click="toggleSearchBar">
          <text class="iconfont icon-search-line"></text>                       
        </view>
      </view>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-bar" v-if="showSearchBar">
      <view class="search-input-wrapper">
        <text class="iconfont icon-search"></text>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索消息" 
          confirm-type="search"
          @confirm="searchMessages"
        />
        <text class="iconfont icon-close-circle-line clear-icon" v-if="searchKeyword" @click="clearSearch"></text>
      </view>
      <text class="cancel-btn" @click="toggleSearchBar">取消</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y @scrolltolower="loadMoreMessages" refresher-enabled @refresherrefresh="refreshMessages" :refresher-triggered="isRefreshing">
      <view v-if="filteredMessageList.length === 0 && searchKeyword" class="empty-result">
        <text class="iconfont icon-search-none"></text>
        <text class="empty-text">没有找到相关消息</text>
      </view>
      <view v-if="filteredMessageList.length === 0 && !searchKeyword && !loading" class="empty-result">
        <text class="iconfont icon-inbox-line"></text>
        <text class="empty-text">暂无消息</text>
      </view>
      <view 
        class="message-item card" 
        v-for="(item, index) in filteredMessageList" 
        :key="item._id" 
        @click="onMessageClick(item)" 
        hover-class="message-item-hover"
      >
        <!-- 左侧头像 -->
        <view class="avatar-wrapper">
          <image class="avatar" :src="getMessageAvatar(item)" mode="aspectFill" />
          <view class="unread-badge" v-if="!item.isRead">
            1
          </view>
        </view>
        
        <!-- 右侧内容 -->
        <view class="content-wrapper">
          <view class="content-header">
            <text class="shop-name">{{ item.title }}</text>
            <text class="message-time">{{ formatMessageTime(item.createdAt) }}</text>
          </view>
          <text class="message-preview" :class="{ 'unread': !item.isRead }">{{ item.content }}</text>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="load-more" v-if="hasMore && filteredMessageList.length > 0">
        <text>加载更多...</text>
      </view>
      <view class="load-more" v-if="!hasMore && filteredMessageList.length > 0">
        <text>没有更多消息了</text>
      </view>
    </scroll-view>

    <!-- 使用TabBar组件 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TabBar from '@/components/TabBar.vue';
import PageBackground from '@/components/PageBackground.vue';
import { messageApi } from '@/api';

// 搜索相关状态
const showSearchBar = ref(false);
const searchKeyword = ref('');

// 消息列表数据
const messageList = ref([]);
const loading = ref(false);
const isRefreshing = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const totalUnread = ref(0);

// 过滤后的消息列表
const filteredMessageList = computed(() => {
  if (!searchKeyword.value) {
    return messageList.value;
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  return messageList.value.filter(item => {
    return item.title.toLowerCase().includes(keyword) || 
           item.content.toLowerCase().includes(keyword);
  });
});

// 获取消息列表
async function fetchMessages(page = 1, append = false) {
  loading.value = true;
  try {
    const params = {
      page: page,
      pageSize: pageSize.value
    };
    const res = await messageApi.getMessages(params);
    if (res && res.data) {
      if (append) {
        messageList.value = [...messageList.value, ...res.data.list];
      } else {
        messageList.value = res.data.list;
      }
      totalUnread.value = res.data.unreadCount;
      hasMore.value = res.data.list.length === pageSize.value;
      currentPage.value = page;
    }
  } catch (error) {
    console.error('获取消息列表失败:', error);
    uni.showToast({
      title: '获取消息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 加载更多消息
function loadMoreMessages() {
  if (hasMore.value && !loading.value) {
    fetchMessages(currentPage.value + 1, true);
  }
}

// 刷新消息列表
function refreshMessages() {
  isRefreshing.value = true;
  fetchMessages(1, false);
}

// 切换搜索栏显示状态
const toggleSearchBar = () => {
  showSearchBar.value = !showSearchBar.value;
  if (!showSearchBar.value) {
    searchKeyword.value = '';
  }
};

// 清除搜索内容
const clearSearch = () => {
  searchKeyword.value = '';
};

// 处理搜索输入
const searchMessages = () => {
  console.log('搜索关键词:', searchKeyword.value);
};

// 获取消息头像
const getMessageAvatar = (message) => {
  // 根据消息类型返回不同的头像
  return message.avatar || '/static/images/default.jpg';
};

// 格式化消息时间
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // 计算时间差（毫秒）
  const diff = now.getTime() - messageDate.getTime();
  
  // 今天内
  if (diff < 24 * 60 * 60 * 1000 && 
      now.getDate() === messageDate.getDate()) {
    return messageDate.getHours().toString().padStart(2, '0') + ':' + 
           messageDate.getMinutes().toString().padStart(2, '0');
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.getDate() === messageDate.getDate() &&
      yesterday.getMonth() === messageDate.getMonth() &&
      yesterday.getFullYear() === messageDate.getFullYear()) {
    return '昨天';
  }
  
  // 今年内
  if (now.getFullYear() === messageDate.getFullYear()) {
    return (messageDate.getMonth() + 1) + '月' + messageDate.getDate() + '日';
  }
  
  // 更早
  return messageDate.getFullYear() + '/' + 
         (messageDate.getMonth() + 1) + '/' + 
         messageDate.getDate();
};

// 消息点击处理函数
const onMessageClick = async (message) => {
  try {
    // 获取消息详情
    const res = await messageApi.getMessageDetail(message._id);
    if (res && res.data) {
      // 标记消息为已读
      if (!message.isRead) {
        markMessageRead(message._id);
      }
      
      // 显示消息详情
      uni.showModal({
        title: res.data.title,
        content: res.data.content,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  } catch (error) {
    console.error('获取消息详情失败:', error);
    uni.showToast({
      title: '获取消息详情失败',
      icon: 'none'
    });
  }
};

// 标记消息为已读
async function markMessageRead(messageId) {
  try {
    await messageApi.markMessageRead({ messageId });
    // 更新本地消息状态
    const index = messageList.value.findIndex(item => item._id === messageId);
    if (index !== -1) {
      messageList.value[index].isRead = true;
    }
    // 减少未读消息数
    if (totalUnread.value > 0) {
      totalUnread.value--;
    }
  } catch (error) {
    console.error('标记消息已读失败:', error);
  }
}

// 标记所有消息为已读
async function markAllMessagesRead() {
  try {
    await messageApi.markMessageRead({});
    // 更新所有本地消息状态为已读
    messageList.value.forEach(item => {
      item.isRead = true;
    });
    totalUnread.value = 0;
    uni.showToast({
      title: '已全部标为已读',
      icon: 'success'
    });
  } catch (error) {
    console.error('标记所有消息已读失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
}

// 页面加载时执行
onMounted(() => {
  console.log('消息页面加载');
  fetchMessages();
});
</script>

<style lang="scss">
.message-container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  box-sizing: border-box;
  position: relative;
}

.status-bar {
  height: var(--status-bar-height, 44px);
}

.header {
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  height: 88rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #34c759, #32ade6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.search-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 246, 247, 0.8);
  border-radius: 36rpx;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.search-btn .iconfont {
  font-size: 36rpx;
  color: #666;
}

.search-btn:active {
  background: rgba(234, 234, 234, 0.9);
  transform: scale(0.95);
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input-wrapper {
  flex: 1;
  height: 72rpx;
  background: rgba(245, 246, 247, 0.8);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  position: relative;
  box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

.search-input-wrapper .iconfont {
  font-size: 32rpx;
  color: #999;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  font-size: 28rpx;
  color: #999;
  padding: 10rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #34c759;
  padding: 0 20rpx;
  font-weight: 500;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay text {
  font-size: 32rpx;
  color: #34c759;
  font-weight: bold;
}

/* 消息列表样式 */
.message-list {
  padding: 20rpx 30rpx;
  height: calc(100vh - 180rpx);
  box-sizing: border-box;
}

.message-item {
  display: flex;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.message-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3rpx;
  background: linear-gradient(90deg, rgba(52, 199, 89, 0.3), rgba(50, 173, 230, 0.3));
  opacity: 0.6;
}

.message-item-hover {
  transform: translateY(-2rpx);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.avatar-wrapper {
  width: 100rpx;
  height: 100rpx;
  position: relative;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.unread-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: #ff3b30;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  box-sizing: border-box;
  box-shadow: 0 2rpx 6rpx rgba(255, 59, 48, 0.4);
  border: 2rpx solid #fff;
  font-weight: 600;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.shop-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.message-preview {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-preview.unread {
  color: #333;
  font-weight: 500;
}

/* 空结果样式 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-result .iconfont {
  font-size: 80rpx;
  color: #ccc;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20rpx 0;
}

.load-more text {
  font-size: 24rpx;
  color: #999;
}

/* 适配不同屏幕 */
@media screen and (max-width: 375px) {
  .message-item {
    padding: 20rpx;
    margin-bottom: 20rpx;
  }
  
  .avatar-wrapper {
    width: 90rpx;
    height: 90rpx;
    margin-right: 20rpx;
  }
  
  .shop-name {
    font-size: 30rpx;
  }
  
  .message-preview {
    font-size: 26rpx;
  }
}
</style>