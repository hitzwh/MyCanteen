<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">编辑资料</text>
      <view class="save-btn" @click="saveProfile" :class="{ 'disabled': !isModified }">
        保存
      </view>
    </view>

    <!-- 编辑内容区域 -->
    <view class="edit-content">
      <!-- 头像编辑 -->
      <view class="edit-item avatar-item">
        <text class="item-label">头像</text>
        <view class="avatar-wrapper" @click="editAvatar">
          <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
          <view class="edit-hint">
            <text class="iconfont icon-camera-line"></text>
          </view>
        </view>
      </view>

      <!-- 昵称编辑 -->
      <view class="edit-item">
        <text class="item-label">昵称</text>
        <input 
          class="input-field"
          type="text"
          v-model="userInfo.username"
          placeholder="请输入昵称"
          maxlength="20"
          @input="checkModified"
        />
      </view>

      <!-- 个人简介编辑 -->
      <view class="edit-item description-item">
        <text class="item-label">个人简介</text>
        <textarea 
          class="textarea-field"
          v-model="userInfo.description"
          placeholder="介绍一下自己吧..."
          maxlength="200"
          @input="checkModified"
        ></textarea>
        <text class="word-count">{{ userInfo.description.length }}/200</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { updateUserInfo } from '@/api/user';
import { uploadImage } from '@/api/worker';

// 用户信息
const userInfo = ref({
  username: '',
  avatar: '/static/default.jpg',
  description: ''
});

// 原始用户信息，用于检测是否修改
const originalUserInfo = ref({});

// 是否已修改
const isModified = ref(false);

// 上传状态
const isUploading = ref(false);

// 检查是否有修改
function checkModified() {
  isModified.value = 
    userInfo.value.username !== originalUserInfo.value.username ||
    userInfo.value.avatar !== originalUserInfo.value.avatar ||
    userInfo.value.description !== originalUserInfo.value.description;
}

// 返回上一页
function goBack() {
  if (!isModified.value) {
    // 直接返回个人中心页面
    uni.navigateTo({
      url: '/pages/profile/index'
    });
    return;
  }
  
  uni.showModal({
    title: "提示",
    content: "资料已修改，是否保存？",
    confirmText: "保存",
    cancelText: "不保存",
    success: (res) => {
      if (res.confirm) {
        saveProfile();
      } else {
        // 不保存，直接返回个人中心页面
        uni.navigateTo({
          url: '/pages/profile/index'
        });
      }
    },
    fail: (err) => {
      console.error('弹窗显示失败', err);
      // 即使弹窗失败也要返回个人中心页面
      uni.navigateTo({
        url: '/pages/profile/index'
      });
    }
  });
}

// 编辑头像
function editAvatar() {
  // 如果正在上传，不允许重复操作
  if (isUploading.value) {
    uni.showToast({
      title: '正在上传中，请稍候',
      icon: 'none'
    });
    return;
  }
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      console.log('选择的图片:', tempFilePath);
      
      if (tempFilePath) {
        // 显示上传中提示
        uni.showLoading({
          title: '上传中...',
          mask: true
        });
        
        isUploading.value = true;
        
        // 直接上传图片到服务器
        uploadAvatar(tempFilePath);
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      });
    }
  });
}

// 上传头像
async function uploadAvatar(filePath) {
  try {
    // 调用上传API
    const result = await uploadImage(filePath, 'avatar');
    
    console.log('上传结果:', result);
    
    // 获取图片URL
    let imageUrl = null;
    
    if (result && result.code === 0) {
      // 标准格式: {code: 0, data: {url: '...'}}
      if (result.data && result.data.url) {
        imageUrl = result.data.url;
      } 
      // 替代格式: {code: 0, url: '...'}
      else if (result.url) {
        imageUrl = result.url;
      }
    } 
    // 另一种格式: {success: true, url: '...'}
    else if (result && result.success && result.url) {
      imageUrl = result.url;
    }
    
    if (imageUrl) {
      // 更新头像
      userInfo.value.avatar = imageUrl;
      checkModified();
      
      uni.hideLoading();
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      });
    } else {
      throw new Error('上传失败: 返回结果不包含有效的URL');
    }
  } catch (error) {
    console.error('上传头像失败:', error);
    
    uni.hideLoading();
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    });
  } finally {
    isUploading.value = false;
  }
}

// 保存资料
async function saveProfile() {
  if (!isModified.value) return;
  
  try {
    uni.showLoading({
      title: '保存中...',
      mask: true
    });
    
    // 如果头像是本地路径而不是http链接，需要先上传
    let avatarUrl = userInfo.value.avatar;
    
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      try {
        // 上传图片到服务器
        const result = await uploadImage(avatarUrl, 'avatar');
        
        if (result && result.code === 0 && result.data && result.data.url) {
          avatarUrl = result.data.url;
        } else if (result && result.code === 0 && result.url) {
          avatarUrl = result.url;
        } else if (result && result.success && result.url) {
          avatarUrl = result.url;
        } else {
          throw new Error('上传头像失败');
        }
      } catch (uploadError) {
        console.error('上传头像失败:', uploadError);
        uni.hideLoading();
        uni.showToast({
          title: '上传头像失败，请重试',
          icon: 'none'
        });
        return;
      }
    }
    
    // 调用API更新用户信息
    await updateUserInfo({
      username: userInfo.value.username,
      avatar: avatarUrl,
      description: userInfo.value.description
    });
    
    // 更新原始数据
    originalUserInfo.value = { ...userInfo.value };
    isModified.value = false;
    
    uni.hideLoading();
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    // 将更新后的数据保存到缓存
    const updatedUserInfo = {
      username: userInfo.value.username,
      avatar: avatarUrl,
      description: userInfo.value.description
    };
    
    // 保存到缓存，以便其他页面可以读取
    uni.setStorageSync('userInfo', updatedUserInfo);
    
    // 触发全局事件，通知页面刷新用户信息
    uni.$emit('userInfoUpdated', updatedUserInfo);
    
    // 延迟跳转到个人中心页面
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/profile/index',
        success: () => {
          console.log('跳转到个人中心页面成功');
        },
        fail: (err) => {
          console.error('跳转到个人中心页面失败:', err);
          // 如果跳转失败，尝试使用redirectTo
          uni.redirectTo({
            url: '/pages/profile/index'
          });
        }
      });
    }, 1500);
  } catch (error) {
    console.error('保存用户信息失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.options) {
    const { username, avatar, description } = currentPage.options;
    
    userInfo.value = {
      username: username || '',
      avatar: avatar || '/static/default.jpg',
      description: description || ''
    };
    
    // 保存原始数据
    originalUserInfo.value = { ...userInfo.value };
  }
});
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  position: relative;
}

.status-bar {
  height: var(--status-bar-height, 44px);
  background-color: #fff;
}

.nav-header {
  position: relative;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0 30rpx;
  
  .back-icon {
    position: absolute;
    left: 30rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 40rpx;
      color: #333;
    }
  }
  
  .header-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .save-btn {
    position: absolute;
    right: 30rpx;
    font-size: 30rpx;
    color: #34c759;
    padding: 20rpx;
    
    &.disabled {
      color: #999;
    }
  }
}

.edit-content {
  padding: 30rpx;
}

.edit-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .item-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: block;
  }
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .avatar-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .edit-hint {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50rpx;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 28rpx;
        color: #fff;
      }
    }
  }
}

.input-field {
  width: 100%;
  height: 80rpx;
  font-size: 30rpx;
  color: #333;
  padding: 0 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.description-item {
  position: relative;
  
  .textarea-field {
    width: 100%;
    height: 240rpx;
    font-size: 30rpx;
    color: #333;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    box-sizing: border-box;
  }
  
  .word-count {
    position: absolute;
    right: 30rpx;
    bottom: 30rpx;
    font-size: 24rpx;
    color: #999;
  }
}

/* 确保uni-modal可以正常显示和交互 */
::v-deep uni-modal,
::v-deep .uni-modal {
  z-index: 9999 !important;
}

::v-deep .uni-modal-mask {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

/* 特别处理取消和确认按钮 */
::v-deep .uni-modal-btn {
  position: relative !important;
  z-index: 10000 !important;
  pointer-events: auto !important;
  min-height: 44px; /* 确保按钮有足够的点击区域 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 清除按钮上可能存在的其他样式干扰 */
::v-deep .uni-modal-btn:before,
::v-deep .uni-modal-btn:after {
  display: none !important;
}

/* 改善弹窗交互体验 */
::v-deep .uni-modal-dialog {
  overflow: visible !important;
}
</style> 