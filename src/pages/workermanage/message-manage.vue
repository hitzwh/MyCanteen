<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title">消息管理</text>
    </view>

    <!-- 消息筛选 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }" 
        @click="switchTab('all')"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'unread' }" 
        @click="switchTab('unread')"
      >
        未读
        <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">数据加载中...</text>
    </view>

    <!-- 消息列表 -->
    <scroll-view v-else scroll-y class="message-list">
      <view class="empty-tip" v-if="filteredMessages.length === 0">
        <text>{{ activeTab === 'unread' ? '暂无未读消息' : '暂无消息' }}</text>
      </view>
      
      <view 
        v-for="(item, index) in filteredMessages" 
        :key="item._id" 
        class="message-item"
        :class="{ unread: !item.isRead }"
        @click="showMessage(item)"
      >
        <view class="message-dot" v-if="!item.isRead"></view>
        <view class="message-header">
          <text class="message-title">{{ item.title }}</text>
          <text class="message-time">{{ formatDate(item.createdAt) }}</text>
        </view>
        <text class="message-content">{{ item.content }}</text>
      </view>
    </scroll-view>

    <!-- 消息详情弹窗 -->
    <view class="modal" v-if="showModal">
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">消息详情</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="detail-header">
            <text class="detail-title">{{ currentMessage.title }}</text>
            <text class="detail-time">{{ formatDate(currentMessage.createdAt) }}</text>
          </view>
          <view class="detail-content">{{ currentMessage.content }}</view>
        </view>
        <view class="modal-footer">
          <button class="primary-btn" @click="markAsRead" v-if="!currentMessage.isRead">标记为已读</button>
          <button class="primary-btn" @click="closeModal">关闭</button>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="action-btn" @click="markAllAsRead" v-if="unreadCount > 0">
        标记全部为已读
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request';

// 状态变量
const loading = ref(true);
const messages = ref([]);
const activeTab = ref('all');
const unreadCount = ref(0);
const showModal = ref(false);
const currentMessage = ref({});

// 计算属性
const filteredMessages = computed(() => {
  if (activeTab.value === 'unread') {
    return messages.value.filter(msg => !msg.isRead);
  }
  return messages.value;
});

// 初始化方法
onMounted(() => {
  fetchMessages();
});

// 获取消息列表
async function fetchMessages() {
  try {
    loading.value = true;
    
    const res = await request.get('/message');
    
    if (res && res.data) {
      messages.value = res.data.list || [];
      unreadCount.value = res.data.unreadCount || 0;
    }
  } catch (error) {
    console.error('获取消息列表失败:', error);
    uni.showToast({
      title: '获取消息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 切换标签
function switchTab(tab) {
  activeTab.value = tab;
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  
  // 小于1天，显示几小时前
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  }
  
  // 小于7天，显示几天前
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 否则显示完整日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 显示消息详情
async function showMessage(message) {
  currentMessage.value = message;
  showModal.value = true;
  
  // 如果是未读消息，自动标记为已读
  if (!message.isRead) {
    await markMessageAsRead(message._id);
  }
}

// 标记消息为已读
async function markAsRead() {
  if (!currentMessage.value._id || currentMessage.value.isRead) return;
  
  await markMessageAsRead(currentMessage.value._id);
  closeModal();
}

// 标记指定消息为已读
async function markMessageAsRead(messageId) {
  try {
    const res = await request.post('/message/read', { messageId });
    
    if (res && res.code === 0) {
      // 更新本地消息状态
      const message = messages.value.find(msg => msg._id === messageId);
      if (message) {
        message.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    }
  } catch (error) {
    console.error('标记消息已读失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
}

// 标记所有消息为已读
async function markAllAsRead() {
  try {
    uni.showLoading({
      title: '处理中...'
    });
    
    const res = await request.post('/message/read');
    
    if (res && res.code === 0) {
      // 更新所有消息状态
      messages.value.forEach(msg => {
        msg.isRead = true;
      });
      unreadCount.value = 0;
      
      uni.hideLoading();
      uni.showToast({
        title: '已全部标记为已读',
        icon: 'success'
      });
    } else {
      throw new Error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('标记全部已读失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
  currentMessage.value = {};
}

// 返回上一页
function goBack() {
  uni.navigateTo({
    url: '/pages/workerindex/index'
  });
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* 页面标题样式 */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.iconfont{
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-left: 30rpx;
}

/* 标签栏样式 */
.tab-bar {
  display: flex;
  background-color: #ffffff;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #34c759;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #34c759;
  border-radius: 3rpx;
}

.badge {
  position: absolute;
  top: 10rpx;
  right: 80rpx;
  min-width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  padding: 0 10rpx;
  background-color: #ff3b30;
  color: #ffffff;
  font-size: 22rpx;
  border-radius: 18rpx;
  text-align: center;
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  flex: 1;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #34c759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 30rpx;
  color: #666;
}

/* 消息列表样式 */
.message-list {
  flex: 1;
  margin-bottom: 120rpx;
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.message-item {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

.message-item.unread {
  background-color: #f0f9ff;
}

.message-dot {
  position: absolute;
  top: 20rpx;
  left: -10rpx;
  width: 20rpx;
  height: 20rpx;
  background-color: #1989fa;
  border-radius: 50%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.message-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}

.message-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 30rpx;
}

.detail-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.detail-time {
  font-size: 24rpx;
  color: #999;
}

.detail-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  border-top: 1px solid #f0f0f0;
}

.primary-btn {
  padding: 16rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #34c759;
  color: #ffffff;
  margin-left: 20rpx;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 30rpx;
  display: flex;
  justify-content: center;
  padding: 0 30rpx;
}

.action-btn {
  width: 80%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background-color: #34c759;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 45rpx;
  box-shadow: 0 10rpx 20rpx rgba(52, 199, 89, 0.2);
}
</style> 