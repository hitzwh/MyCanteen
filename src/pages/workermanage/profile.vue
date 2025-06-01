<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title">个人中心</text>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">数据加载中...</text>
    </view>

    <!-- 主要内容 -->
    <template v-else>
      <!-- 个人信息卡片 -->
      <view class="profile-card">
        <view class="profile-header">
          <image class="avatar" :src="userInfo.avatar || '/static/images/worker-avatar.jpg'" mode="aspectFill"></image>
          <view class="profile-info">
            <text class="username">{{ userInfo.username || '未设置昵称' }}</text>
            <text class="user-role">职工账号</text>
          </view>
          <view class="edit-btn" @click="editProfile">
            <text class="edit-icon">✏️</text>
          </view>
        </view>
        
        <view class="profile-details">
          <view class="detail-item">
            <text class="detail-label">工号</text>
            <text class="detail-value">{{ userInfo.staffId || '未设置' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">手机号</text>
            <text class="detail-value">{{ formatPhone(userInfo.phone) || '未绑定' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">所属食堂</text>
            <text class="detail-value">{{ userInfo.canteenName || '未关联' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">职位</text>
            <text class="detail-value">{{ userInfo.position || '未设置' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 工作状态卡片 -->
      <view class="status-card">
        <view class="card-title">工作状态</view>
        <view class="status-content">
          <view class="status-item">
            <view class="status-value">{{ workStatus.daysWorked || 0 }}</view>
            <view class="status-label">工作天数</view>
          </view>
          <view class="status-item">
            <view class="status-value">{{ workStatus.repliedComments || 0 }}</view>
            <view class="status-label">已回复评论</view>
          </view>
          <view class="status-item">
            <view class="status-value">{{ workStatus.dishesManaged || 0 }}</view>
            <view class="status-label">管理菜品</view>
          </view>
        </view>
      </view>
      
      <!-- 设置选项 -->
      <view class="settings-section">
        <view class="settings-group">
          <view class="settings-title">账号设置</view>
          
          <view class="setting-item" @click="navigateTo('changePassword')">
            <text class="setting-icon password-icon">🔒</text>
            <text class="setting-label">修改密码</text>
            <text class="setting-arrow">›</text>
          </view>
          
          <view class="setting-item" @click="navigateTo('bindPhone')">
            <text class="setting-icon phone-icon">📱</text>
            <text class="setting-label">绑定手机</text>
            <text class="setting-arrow">›</text>
          </view>
          
          <view class="setting-item" @click="navigateTo('notifications')">
            <text class="setting-icon notification-icon">🔔</text>
            <text class="setting-label">消息通知</text>
            <view class="setting-right">
              <switch :checked="notificationsEnabled" @change="toggleNotifications" color="#34c759" style="transform:scale(0.8)" />
            </view>
          </view>
        </view>
        
        <view class="settings-group">
          <view class="settings-title">其他设置</view>
          
          <view class="setting-item" @click="navigateTo('about')">
            <text class="setting-icon about-icon">ℹ️</text>
            <text class="setting-label">关于我们</text>
            <text class="setting-arrow">›</text>
          </view>
          
          <view class="setting-item" @click="navigateTo('feedback')">
            <text class="setting-icon feedback-icon">📝</text>
            <text class="setting-label">意见反馈</text>
            <text class="setting-arrow">›</text>
          </view>
          
          <view class="setting-item" @click="clearCache">
            <text class="setting-icon cache-icon">🧹</text>
            <text class="setting-label">清除缓存</text>
            <text class="setting-value">{{ cacheSize }}</text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-btn" @click="confirmLogout">退出登录</view>
    </template>

    <!-- 编辑个人资料弹窗 -->
    <view class="modal" v-if="showEditModal">
      <view class="modal-mask" @click="closeEditModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑个人资料</text>
          <text class="modal-close" @click="closeEditModal">×</text>
        </view>
        <view class="modal-body">
          <view class="avatar-section">
            <AvatarUploader v-model="editForm.avatar" />
          </view>
          
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input type="text" v-model="editForm.username" placeholder="请输入昵称" class="form-input" />
          </view>
          
          <view class="form-item">
            <text class="form-label">工号</text>
            <input type="text" v-model="editForm.staffId" placeholder="请输入工号" class="form-input" />
          </view>
          
          <view class="form-item">
            <text class="form-label">职位</text>
            <input type="text" v-model="editForm.position" placeholder="请输入职位" class="form-input" />
          </view>
          
          <view class="form-item">
            <text class="form-label">手机号</text>
            <view class="phone-section">
              <text class="phone-value">{{ formatPhone(userInfo.phone) || '未绑定' }}</text>
              <text class="phone-change" @click="navigateTo('bindPhone')">{{ userInfo.phone ? '更换' : '绑定' }}</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeEditModal">取消</button>
          <button class="confirm-btn" @click="saveProfile">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 自定义退出登录确认弹窗 -->
    <view class="custom-modal" v-if="showLogoutConfirm">
      <view class="custom-modal-mask" @click="cancelLogout"></view>
      <view class="custom-modal-content" @click.stop>
        <view class="custom-modal-title">退出登录</view>
        <view class="custom-modal-message">确定要退出当前账号吗？</view>
        <view class="custom-modal-buttons">
          <view class="custom-modal-btn custom-modal-cancel" @click.stop="cancelLogout">取消</view>
          <view class="custom-modal-btn custom-modal-confirm" @click.stop="confirmLogoutAction">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import request from '@/utils/request';
import { getWorkerInfo, updateWorkerInfo } from '../../api/worker';
import AvatarUploader from '@/components/AvatarUploader.vue';

// 状态变量
const loading = ref(true);
const userInfo = reactive({
  username: '',
  avatar: '',
  staffId: '',
  phone: '',
  canteenName: '',
  position: ''
});

const workStatus = reactive({
  daysWorked: 0,
  repliedComments: 0,
  dishesManaged: 0
});

const notificationsEnabled = ref(true);
const cacheSize = ref('0MB');

// 编辑模式状态
const showEditModal = ref(false);
const editForm = reactive({
  username: '',
  avatar: '',
  staffId: '',
  phone: '',
  position: ''
});

// 退出登录确认弹窗状态
const showLogoutConfirm = ref(false);

// 初始化方法
onMounted(() => {
  fetchUserInfo();
  calculateCacheSize();
});

// 获取用户信息
async function fetchUserInfo() {
  try {
    loading.value = true;
    
    // 获取用户信息，使用职工API
    const userRes = await getWorkerInfo();
    if (userRes && userRes.data) {
      const data = userRes.data;
      userInfo.username = data.username || '';
      userInfo.avatar = data.avatar || '';
      userInfo.staffId = data.staffId || '';
      userInfo.phone = data.phone || '';
      userInfo.position = data.position || '';
      
      // 获取食堂信息
      if (data.canteenId) {
        const canteenRes = await request.get(`/canteen/${data.canteenId}`);
        if (canteenRes && canteenRes.data) {
          userInfo.canteenName = canteenRes.data.name;
        }
      }
      
      // 获取工作状态
      await fetchWorkStatus();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取工作状态
async function fetchWorkStatus() {
  try {
    // 这里模拟数据，实际项目中应该调用相关API
    workStatus.daysWorked = 45;
    workStatus.repliedComments = 23;
    workStatus.dishesManaged = 38;
  } catch (error) {
    console.error('获取工作状态失败:', error);
  }
}

// 计算缓存大小
function calculateCacheSize() {
  // 模拟缓存大小计算
  setTimeout(() => {
    cacheSize.value = '3.2MB';
  }, 500);
}

// 格式化手机号
function formatPhone(phone) {
  if (!phone) return '';
  
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7);
  }
  
  return phone;
}

// 编辑个人资料
function editProfile() {
  // 初始化编辑表单
  editForm.username = userInfo.username;
  editForm.avatar = userInfo.avatar;
  editForm.staffId = userInfo.staffId;
  editForm.phone = userInfo.phone;
  editForm.position = userInfo.position;
  
  // 显示编辑弹窗
  showEditModal.value = true;
}

// 关闭编辑弹窗
function closeEditModal() {
  showEditModal.value = false;
}

// 保存个人资料
async function saveProfile() {
  if (!editForm.username) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: '保存中...'
    });
    
    const formData = {
      username: editForm.username,
      staffId: editForm.staffId,
      position: editForm.position
    };
    
    if (editForm.avatar) {
      formData.avatar = editForm.avatar;
    }
    
    // 调用更新接口
    const res = await updateWorkerInfo(formData);
    
    if (res && res.code === 0) {
      // 更新成功，刷新用户信息
      Object.assign(userInfo, formData);
      
      uni.hideLoading();
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 关闭弹窗
      closeEditModal();
    } else {
      throw new Error(res.message || '保存失败');
    }
  } catch (error) {
    console.error('保存个人资料失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '保存失败，请重试',
      icon: 'none'
    });
  }
}

// 切换通知开关
function toggleNotifications(e) {
  notificationsEnabled.value = e.detail.value;
}

// 清除缓存
function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除应用缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '清除中...'
        });
        
        // 模拟清除缓存
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
          cacheSize.value = '0MB';
        }, 1000);
      }
    }
  });
}

// 确认退出登录
function confirmLogout() {
  // 显示自定义退出登录确认弹窗
  showLogoutConfirm.value = true;
}

// 取消退出登录
function cancelLogout() {
  showLogoutConfirm.value = false;
}

// 确认退出登录操作
function confirmLogoutAction() {
  showLogoutConfirm.value = false;
  handleLogout();
}

// 处理退出登录逻辑
async function handleLogout() {
  try {
    uni.showLoading({
      title: '退出中...'
    });
    
    // 调用退出登录接口
    const res = await request.post('/worker/logout');
    
    if (res && res.code === 0) {
      // 清除本地存储的用户信息和token
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      
      uni.hideLoading();
      uni.showToast({
        title: '退出成功',
        icon: 'success',
        success: () => {
          // 跳转到登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1000);
        }
      });
    } else {
      throw new Error(res.message || '退出失败');
    }
  } catch (error) {
    console.error('退出登录失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '退出失败，请重试',
      icon: 'none'
    });
  }
}

// 页面导航
function navigateTo(route) {
  const routeMap = {
    changePassword: '/pages/workermanage/settings/change-password',
    bindPhone: '/pages/workermanage/settings/bind-phone',
    notifications: '/pages/workermanage/settings/notifications',
    about: '/pages/workermanage/settings/about',
    feedback: '/pages/workermanage/settings/feedback'
  };
  
  const url = routeMap[route];
  if (url) {
    uni.navigateTo({ url });
  } else {
    uni.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    });
  }
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
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.iconfont {
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-left: 20rpx;
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

/* 个人信息卡片 */
.profile-card {
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  position: relative;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 20rpx;
  border: 4rpx solid #f5f5f5;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.user-role {
  font-size: 26rpx;
  color: #34c759;
  background-color: rgba(52, 199, 89, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  display: inline-block;
}

.edit-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
}

.edit-icon {
  font-size: 32rpx;
}

.profile-details {
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 20rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
  font-size: 28rpx;
}

.detail-value {
  color: #333;
  font-size: 28rpx;
  font-weight: 500;
}

/* 工作状态卡片 */
.status-card {
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.status-content {
  display: flex;
  justify-content: space-around;
}

.status-item {
  text-align: center;
  flex: 1;
}

.status-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.status-label {
  font-size: 24rpx;
  color: #999;
}

/* 设置选项 */
.settings-section {
  margin-bottom: 30rpx;
}

.settings-group {
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
}

.settings-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.password-icon, .security-icon {
  color: #34c759;
}

.phone-icon, .notification-icon {
  color: #007aff;
}

.about-icon, .feedback-icon, .cache-icon {
  color: #5856d6;
}

.setting-label {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.setting-arrow {
  color: #ccc;
  font-size: 40rpx;
}

.setting-value {
  font-size: 28rpx;
  color: #999;
}

.setting-right {
  display: flex;
  align-items: center;
}

/* 退出登录按钮 */
.logout-btn {
  width: 90%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background-color: #ff3b30;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  margin: 60rpx auto;
  box-shadow: 0 6rpx 16rpx rgba(255, 59, 48, 0.2);
}

.logout-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

/* 编辑个人资料弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-content {
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 30rpx;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #f5f5f5;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.phone-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
}

.phone-value {
  font-size: 28rpx;
  color: #333;
}

.phone-change {
  font-size: 28rpx;
  color: #1989fa;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
}

.cancel-btn, .confirm-btn {
  font-size: 28rpx;
  padding: 8rpx 24rpx;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.cancel-btn {
  background-color: #f0f9ff;
  color: #1989fa;
}

.confirm-btn {
  background-color: #34c759;
  color: #ffffff;
}

/* 自定义退出登录确认弹窗样式 */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  pointer-events: auto;
}

.custom-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1000000;
}

.custom-modal-content {
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
  position: relative;
  z-index: 1000001;
  pointer-events: auto;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.custom-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

.custom-modal-message {
  font-size: 30rpx;
  color: #666;
  margin-bottom: 30rpx;
  text-align: center;
  padding: 0 20rpx;
}

.custom-modal-buttons {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding-top: 20rpx;
}

.custom-modal-btn {
  font-size: 32rpx;
  padding: 20rpx 0;
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1000002;
  pointer-events: auto !important;
}

.custom-modal-btn:active {
  opacity: 0.7;
}

.custom-modal-cancel {
  color: #666;
  border-right: 1px solid #eee;
}

.custom-modal-confirm {
  color: #ff3b30;
  font-weight: bold;
}
</style> 