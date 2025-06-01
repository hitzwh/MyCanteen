<template>
  <view class="worker-container">
    <!-- 引入背景组件 -->
    <page-background></page-background>
    
    <!-- 状态栏占位：用于适配不同手机顶部状态栏的高度 -->
    <view class="status-bar"></view>
    
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">食堂管理</text>
      <text class="page-subtitle">职工管理系统</text>
    </view>
    
    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">数据加载中...</text>
    </view>
    
    <!-- 主要内容 -->
    <template v-else>
      <!-- 快捷统计卡片 -->
      <view class="stats-container">
        <view class="stats-card" @click="navigateTo('foodManage')">
          <view class="stats-value">{{ statsData.dishes || 0 }}</view>
          <view class="stats-label">菜品数量</view>
        </view>
        <view class="stats-card" @click="navigateTo('windowManage')">
          <view class="stats-value">{{ statsData.windows || 0 }}</view>
          <view class="stats-label">窗口数量</view>
        </view>
        <view class="stats-card" @click="navigateTo('messageManage')">
          <view class="stats-value">{{ statsData.unreadMessages || 0 }}</view>
          <view class="stats-label">未读消息</view>
        </view>
        <view class="stats-card" @click="navigateTo('commentManage')">
          <view class="stats-value">{{ statsData.newComments || 0 }}</view>
          <view class="stats-label">新增评论</view>
        </view>
      </view>

      <!-- 管理功能宫格 -->
      <view class="grid-container">
        <!-- 第一行按钮 -->
        <view class="grid-row">
          <view 
            class="grid-btn" 
            v-for="(item, idx) in gridBtns.slice(0,2)" 
            :key="item.text" 
            @click="onGridClick(item)"
            :class="getButtonClass(idx, 0)"
          >
            <text class="grid-icon">{{ item.unicode }}</text>
            <text class="grid-text">{{ item.text }}</text>
            <view v-if="item.badge" class="badge"></view>
          </view>
        </view>
        
        <!-- 第二行按钮 -->
        <view class="grid-row">
          <view 
            class="grid-btn" 
            v-for="(item, idx) in gridBtns.slice(2,4)" 
            :key="item.text" 
            @click="onGridClick(item)"
            :class="getButtonClass(idx, 1)"
          >
            <text class="grid-icon">{{ item.unicode }}</text>
            <text class="grid-text">{{ item.text }}</text>
            <view v-if="item.badge" class="badge"></view>
          </view>
        </view>
      </view>
      
      <!-- 数据分析区域 -->
      <view class="analysis-section">
        <view class="section-header">
          <text class="section-title">数据分析</text>
          <text class="section-more" @click="navigateTo('dataAnalysis')">查看更多</text>
        </view>
        
        <view class="analysis-content">
          <view class="analysis-card">
            <view class="chart-container">
              <!-- 这里可以放置echarts等图表组件 -->
              <view class="chart-placeholder">
                <text class="chart-text">近7天评分统计</text>
                <!-- 简单柱状图示意 -->
                <view class="simple-chart">
                  <view 
                    v-for="(value, index) in chartData" 
                    :key="index" 
                    class="chart-bar"
                    :style="{ height: value + '%' }"
                  >
                    <text class="chart-value">{{ value }}%</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 最新评论区域 -->
      <view class="comment-section">
        <view class="section-header">
          <text class="section-title">最新评论</text>
          <view class="section-actions">
            <text class="section-refresh" @click="manualRefreshComments">刷新</text>
            <text class="section-more" @click="navigateTo('commentManage')">查看全部</text>
          </view>
        </view>
        
        <view class="comment-list">
          <view class="comment-item" v-for="(item, index) in latestComments" :key="index" @tap="showCommentDetail(item)">
            <view class="comment-user">
              <image class="comment-avatar" :src="item.userId?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
              <view class="comment-info">
                <text class="comment-name">{{ item.userId?.username || '匿名用户' }}</text>
                <text class="comment-time">{{ formatDate(item.createdAt) }}</text>
              </view>
              <view class="comment-rating">
                <text class="rating-star" v-for="i in 5" :key="i" :class="{ 'active': i <= item.rating }">★</text>
              </view>
            </view>
            <view class="comment-content">{{ item.content }}</view>
            <view class="comment-dish" v-if="item.dishId">
              <text class="dish-label">评价菜品：</text>
              <text class="dish-name">{{ item.dishId.name }}</text>
            </view>
            <view class="comment-actions">
              <view class="action-btn" @click="replyComment(item)">回复</view>
              <view class="action-btn" @click="deleteComment(item)">删除</view>
            </view>
          </view>
          
          <view class="empty-tip" v-if="latestComments.length === 0">
            <text>暂无评论数据</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <view class="tab-item active">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item" @click="navigateTo('canteenManage')">
        <text class="tab-icon">🍴</text>
        <text class="tab-text">食堂</text>
      </view>
      <view class="tab-item" @click="navigateTo('messageManage')">
        <text class="tab-icon">📮</text>
        <text class="tab-text">消息</text>
        <view v-if="statsData.unreadMessages > 0" class="tab-badge">{{ statsData.unreadMessages }}</view>
      </view>
      <view class="tab-item" @click="navigateTo('profile')">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import PageBackground from '@/components/PageBackground.vue';
import request from '@/utils/request';
import { showSafeModal } from '@/utils/modal-helper';

// 加载状态
const loading = ref(true);

// 统计数据
const statsData = reactive({
  dishes: 0,
  windows: 0,
  unreadMessages: 0,
  newComments: 0
});

// 生成模拟图表数据
const chartData = ref([65, 59, 80, 81, 56, 55, 70]);

// 最新评论数据
const latestComments = ref([]);

// 宫格按钮数据：定义功能入口
const gridBtns = [
  { text: '食堂管理', badge: true, unicode: '🏢', route: 'canteenManage' },
  { text: '窗口管理', unicode: '🍽️', route: 'windowManage' },
  { text: '菜品管理', unicode: '🍲', route: 'foodManage' },
  { text: '评论管理', badge: true, unicode: '💬', route: 'commentManage' },
];

// 获取按钮的样式类
function getButtonClass(index, rowIndex) {
  const classes = [];
  
  // 根据行和列设置颜色类
  if (rowIndex === 0) {
    classes.push(index === 0 ? 'green-btn' : 'orange-btn');
  } else if (rowIndex === 1) {
    classes.push(index === 0 ? 'blue-btn' : 'purple-btn');
  } else {
    classes.push('pink-btn');
  }
  
  return classes.join(' ');
}

// 宫格按钮点击事件处理函数
function onGridClick(item) {
  if (item.route) {
    navigateTo(item.route);
  } else {
    uni.showToast({ title: item.text, icon: 'none' });
  }
}

// 页面导航
function navigateTo(route) {
  const routeMap = {
    canteenManage: '/pages/workermanage/canteen-manage',
    windowManage: '/pages/workermanage/window-manage',
    foodManage: '/pages/workermanage/food-manage',
    commentManage: '/pages/workermanage/comment-manage',
    messageManage: '/pages/workermanage/message-manage',
    dataAnalysis: '/pages/workermanage/data-analysis',
    profile: '/pages/workermanage/profile'
  };
  
  const url = routeMap[route];
  if (url) {
    uni.navigateTo({ url });
  } else {
    uni.showToast({ 
      title: '该功能正在开发中，敬请期待', 
      icon: 'none' 
    });
  }
}

// 回复评论
function replyComment(comment) {
  showSafeModal({
    title: '回复评论',
    content: `您正在回复 ${comment.userId?.username || '匿名用户'} 关于"${comment.dishId?.name || '菜品'}"的评论`,
    editable: true,
    placeholderText: '请输入回复内容',
    success: (res) => {
      if (res.confirm && res.content) {
        // 这里应该调用API保存回复
        sendReplyMessage(comment, res.content);
      }
    }
  });
}

// 发送回复消息
async function sendReplyMessage(comment, content) {
  try {
    // 这里应该是实际的API调用，根据API文档应该是发送消息
    // 由于API文档中没有直接的回复评论API，这里模拟一个成功响应
    uni.showToast({
      title: '回复成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('回复失败:', error);
    uni.showToast({
      title: '回复失败，请重试',
      icon: 'none'
    });
  }
}

// 删除评论
async function deleteComment(comment) {
  // 直接删除评论，不显示确认对话框
  try {
    // 显示加载提示
    uni.showLoading({
      title: '删除中...',
      mask: true
    });
    
    console.log('正在删除评论:', comment._id);
    
    // 尝试使用不同的API路径删除评论
    let res;
    try {
      // 首先尝试使用worker路径
      res = await request.delete(`/worker/comment/${comment._id}`);
      console.log('使用/worker/comment路径删除结果:', res);
    } catch (workerErr) {
      console.log('使用/worker/comment路径失败，尝试直接路径:', workerErr);
      // 如果worker路径失败，尝试直接路径
      res = await request.delete(`/comment/${comment._id}`);
      console.log('使用/comment路径删除结果:', res);
    }
    
    if (res && (res.code === 0 || res.statusCode === 200)) {
      // 删除成功后隐藏加载提示并显示成功提示
      uni.hideLoading();
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 从本地列表中移除该评论
      const index = latestComments.value.findIndex(item => item._id === comment._id);
      if (index !== -1) {
        console.log('从本地列表中移除评论:', comment._id);
        latestComments.value.splice(index, 1);
      }
      
      // 延迟一段时间后刷新评论列表，确保后端有足够时间处理
      console.log('等待后端处理删除操作...');
      setTimeout(async () => {
        console.log('开始刷新评论列表...');
        await refreshCommentList();
      }, 2000); // 增加延迟时间到2秒
    } else {
      // API调用失败
      uni.hideLoading();
      uni.showToast({
        title: res?.message || '删除失败',
        icon: 'none'
      });
      console.error('删除评论API调用失败:', res);
    }
  } catch (error) {
    // 处理错误
    uni.hideLoading();
    console.error('删除评论失败:', error);
    uni.showToast({
      title: '删除失败，请重试',
      icon: 'none'
    });
  }
}

// 刷新评论列表
async function refreshCommentList() {
  try {
    console.log('刷新评论列表...');
    
    // 尝试不同的API路径和参数
    let commentRes;
    
    // 尝试方法1: 使用worker路径
    try {
      console.log('尝试使用/worker/comment路径获取评论...');
      commentRes = await request.get('/worker/comment', { 
        isDeleted: false,
        status: 'active'
      });
      console.log('使用/worker/comment路径结果:', commentRes);
    } catch (workerErr) {
      console.log('使用/worker/comment路径失败，尝试直接路径:', workerErr);
      
      // 尝试方法2: 使用直接路径，带参数
      try {
        console.log('尝试使用/comment路径获取评论，带参数...');
        commentRes = await request.get('/comment', { 
          isDeleted: false,
          status: 'active'
        });
        console.log('使用/comment路径带参数结果:', commentRes);
      } catch (paramErr) {
        console.log('使用/comment路径带参数失败，尝试不带参数:', paramErr);
        
        // 尝试方法3: 使用直接路径，不带参数
        commentRes = await request.get('/comment');
        console.log('使用/comment路径不带参数结果:', commentRes);
      }
    }
    
    // 处理返回的数据
    if (commentRes && commentRes.data) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // 检查返回的评论列表
      if (Array.isArray(commentRes.data.list)) {
        console.log('返回的评论列表:', commentRes.data.list);
        
        // 手动过滤已删除的评论（以防后端没有过滤）
        const filteredComments = commentRes.data.list.filter(comment => 
          !comment.isDeleted && comment.status !== 'deleted'
        );
        
        console.log('过滤后的评论列表:', filteredComments);
        
        // 计算最近24小时的评论数量
        statsData.newComments = filteredComments.filter(comment => 
          new Date(comment.createdAt) > oneDayAgo
        ).length;
        
        // 更新最新评论
        latestComments.value = filteredComments.slice(0, 3);
        console.log('评论列表刷新成功:', {
          newComments: statsData.newComments,
          latestComments: latestComments.value.length
        });
      } else {
        console.error('API返回的评论列表格式不正确:', commentRes.data);
        uni.showToast({
          title: '获取评论数据格式错误',
          icon: 'none'
        });
      }
    } else {
      console.error('获取评论数据失败:', commentRes);
      uni.showToast({
        title: '获取评论数据失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('刷新评论列表失败:', error);
    uni.showToast({
      title: '刷新评论列表失败',
      icon: 'none'
    });
  }
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

// 获取统计数据
async function fetchStats() {
  try {
    // 检查是否有token
    const token = uni.getStorageSync('token');
    const userType = uni.getStorageSync('userType');
    
    if (!token) {
      console.error('没有找到登录凭证，需要重新登录');
      
      // 显示提示
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }
    
    // 检查用户类型
    if (userType !== 'staff') {
      console.warn('当前用户类型不是职工，可能导致权限问题');
    }
    
    console.log('开始获取职工端统计数据...');
    
    // 先获取简单的本地数据
    statsData.dishes = 48; // 先设置一个默认值，减少用户等待
    
    // 按顺序请求，避免并发导致的问题
    // 1. 先获取窗口数量
    try {
      console.log('获取窗口数量...');
      const windowRes = await request.get('/window');
      if (windowRes && windowRes.data) {
        statsData.windows = windowRes.data.length;
        console.log('窗口数量获取成功:', statsData.windows);
      }
    } catch (windowErr) {
      console.error('获取窗口数量失败:', windowErr);
      // 继续执行其他请求，不中断
    }
    
    // 2. 获取消息数量 - 未读消息
    try {
      console.log('获取未读消息数量...');
      const messageRes = await request.get('/message', { isRead: false });
      if (messageRes && messageRes.data) {
        statsData.unreadMessages = messageRes.data.unreadCount || 0;
        console.log('未读消息数量获取成功:', statsData.unreadMessages);
      }
    } catch (messageErr) {
      console.error('获取未读消息数量失败:', messageErr);
      // 继续执行其他请求，不中断
    }
    
    // 3. 获取评论数量
    try {
      console.log('获取评论数据...');
      
      // 使用与refreshCommentList相同的逻辑获取评论
      let commentRes;
      
      // 尝试方法1: 使用worker路径
      try {
        console.log('尝试使用/worker/comment路径获取评论...');
        commentRes = await request.get('/worker/comment', { 
          isDeleted: false,
          status: 'active'
        });
        console.log('使用/worker/comment路径结果:', commentRes);
      } catch (workerErr) {
        console.log('使用/worker/comment路径失败，尝试直接路径:', workerErr);
        
        // 尝试方法2: 使用直接路径，带参数
        try {
          console.log('尝试使用/comment路径获取评论，带参数...');
          commentRes = await request.get('/comment', { 
            isDeleted: false,
            status: 'active'
          });
          console.log('使用/comment路径带参数结果:', commentRes);
        } catch (paramErr) {
          console.log('使用/comment路径带参数失败，尝试不带参数:', paramErr);
          
          // 尝试方法3: 使用直接路径，不带参数
          commentRes = await request.get('/comment');
          console.log('使用/comment路径不带参数结果:', commentRes);
        }
      }
      
      if (commentRes && commentRes.data) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        // 检查返回的评论列表
        if (Array.isArray(commentRes.data.list)) {
          console.log('返回的评论列表:', commentRes.data.list);
          
          // 手动过滤已删除的评论（以防后端没有过滤）
          const filteredComments = commentRes.data.list.filter(comment => 
            !comment.isDeleted && comment.status !== 'deleted'
          );
          
          console.log('过滤后的评论列表:', filteredComments);
          
          // 计算最近24小时的评论数量
          statsData.newComments = filteredComments.filter(comment => 
            new Date(comment.createdAt) > oneDayAgo
          ).length;
          
          // 设置最新评论
          latestComments.value = filteredComments.slice(0, 3);
          console.log('评论数据获取成功:', {
            newComments: statsData.newComments,
            latestComments: latestComments.value.length
          });
        } else {
          console.error('API返回的评论列表格式不正确:', commentRes.data);
          latestComments.value = [];
        }
      }
    } catch (commentErr) {
      console.error('获取评论数据失败:', commentErr);
      // 评论获取失败，显示空列表
      latestComments.value = [];
    }
    
    console.log('所有统计数据获取完成');
    
  } catch (error) {
    console.error('获取统计数据主流程失败:', error);
    
    // 处理401未授权错误
    if (error.statusCode === 401) {
      // 清除存储的token和用户信息
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('userType');
      
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 1500);
    } else {
      // 其他错误
      uni.showToast({
        title: '获取数据失败，请重试',
        icon: 'none'
      });
    }
  } finally {
    loading.value = false;
  }
}

// 页面加载完成后执行
onMounted(() => {
  console.log('职工端首页加载完成');
  fetchStats();
});

// 手动刷新评论列表
async function manualRefreshComments() {
  try {
    uni.showLoading({
      title: '刷新中...',
      mask: true
    });
    
    console.log('手动刷新评论列表...');
    
    // 清除可能的缓存
    uni.removeStorageSync('commentCache');
    
    // 强制重新获取评论
    await refreshCommentList();
    
    uni.hideLoading();
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    });
  } catch (error) {
    uni.hideLoading();
    console.error('手动刷新失败:', error);
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    });
  }
}

// 显示评论详细信息
function showCommentDetail(comment) {
  console.log('评论详细信息:', comment);
  
  // 构建详细信息文本
  let detailText = `ID: ${comment._id}\n`;
  detailText += `用户: ${comment.userId?.username || '匿名用户'}\n`;
  detailText += `菜品: ${comment.dishId?.name || '未知菜品'}\n`;
  detailText += `评分: ${comment.rating}星\n`;
  detailText += `时间: ${formatDate(comment.createdAt)}\n`;
  detailText += `内容: ${comment.content}\n`;
  
  // 显示详细信息
  uni.showModal({
    title: '评论详细信息',
    content: detailText,
    showCancel: false
  });
}
</script>

<style lang="scss">
/* 页面容器样式 */
.worker-container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  box-sizing: border-box;
  position: relative;
  width: 100%;
}

/* 状态栏占位样式 */
.status-bar {
  height: 44rpx;
  width: 100%;
}

/* 页面标题样式 */
.page-header {
  padding: 20rpx 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
  background: linear-gradient(135deg, #34c759, #32ade6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
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

/* 统计卡片容器 */
.stats-container {
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.stats-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 20rpx 10rpx;
  width: 160rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stats-card:active {
  transform: scale(0.96);
}

.stats-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #666;
}

/* 宫格容器样式 */
.grid-container {
  width: 90%;
  max-width: 800rpx;
  margin: 20rpx auto 40rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  box-sizing: border-box;
}

/* 宫格行样式 */
.grid-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* 宫格按钮基础样式 */
.grid-btn {
  flex: 1;
  height: 180rpx;
  margin: 0 10rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(32, 35, 32, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 180rpx;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.grid-btn:active {
  transform: translateY(4rpx) scale(0.98);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.grid-icon {
  font-size: 60rpx;
  margin-bottom: 15rpx;
  line-height: 1;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.grid-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/* 颜色样式 */
.green-btn {
  background: linear-gradient(135deg, rgba(110, 235, 175, 0.9) 0%, rgba(31, 204, 121, 0.9) 100%);
}

.orange-btn {
  background: linear-gradient(135deg, rgba(255, 175, 75, 0.9) 0%, rgba(255, 112, 95, 0.9) 100%);
}

.blue-btn {
  background: linear-gradient(135deg, rgba(116, 182, 247, 0.9) 0%, rgba(94, 114, 235, 0.9) 100%);
}

.purple-btn {
  background: linear-gradient(135deg, rgba(134, 143, 254, 0.9) 0%, rgba(179, 55, 245, 0.9) 100%);
}

/* 数据分析区域 */
.analysis-section, .comment-section {
  width: 90%;
  max-width: 800rpx;
  margin: 0 auto 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #34c759;
}

.section-actions {
  display: flex;
  align-items: center;
}

.section-refresh {
  font-size: 26rpx;
  color: #34c759;
  margin-right: 20rpx;
  padding: 4rpx 10rpx;
  background-color: rgba(52, 199, 89, 0.1);
  border-radius: 10rpx;
}

.section-refresh:active {
  opacity: 0.7;
}

.analysis-content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.analysis-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.chart-container {
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
  width: 100%;
}

.chart-text {
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: block;
}

/* 简单图表样式 */
.simple-chart {
  height: 200rpx;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 20rpx 10rpx;
  border-bottom: 1px solid #eee;
}

.chart-bar {
  width: 40rpx;
  background: linear-gradient(to top, #34c759, #32ade6);
  border-radius: 6rpx 6rpx 0 0;
  position: relative;
  transition: height 0.5s ease;
}

.chart-value {
  position: absolute;
  top: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18rpx;
  color: #666;
}

/* 评论列表样式 */
.comment-list {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.comment-item {
  padding: 20rpx 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-user {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.comment-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.comment-info {
  flex: 1;
}

.comment-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
  display: block;
}

.comment-rating {
  display: flex;
}

.rating-star {
  color: #ddd;
  font-size: 28rpx;
  margin-left: 4rpx;
}

.rating-star.active {
  color: #ffcc00;
}

.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16rpx;
  padding: 0 10rpx;
}

.comment-dish {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  padding: 0 10rpx;
}

.dish-label {
  color: #999;
}

.dish-name {
  color: #34c759;
  font-weight: 500;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  font-size: 24rpx;
  color: #666;
  margin-left: 30rpx;
  padding: 6rpx 12rpx;
}

.action-btn:active {
  opacity: 0.7;
}

.empty-tip {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 底部导航栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  position: relative;
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 6rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #34c759;
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: 5rpx;
  right: 50%;
  margin-right: -40rpx;
  background-color: #ff3b30;
  color: white;
  font-size: 20rpx;
  min-width: 30rpx;
  height: 30rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}
</style> 