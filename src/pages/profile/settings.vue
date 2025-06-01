<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">设置</text>
    </view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <!-- 账号安全 -->
      <view class="settings-group">
        <view class="settings-title">账号安全</view>
        <view class="settings-item" @click="goToChangePwd">
          <view class="item-left">
            <text class="iconfont icon-lock"></text>
            <text class="item-text">修改密码</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 通用设置 -->
      <view class="settings-group">
        <view class="settings-title">通用设置</view>
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-notification"></text>
            <text class="item-text">消息通知</text>
          </view>
          <view class="item-right">
            <switch :checked="notificationEnabled" @change="toggleNotification" color="#34c759" style="transform:scale(0.8)" />
          </view>
        </view>
        <view class="settings-item" @click="clearCache">
          <view class="item-left">
            <text class="iconfont icon-clean"></text>
            <text class="item-text">清除缓存</text>
          </view>
          <view class="item-right">
            <text class="cache-size">{{cacheSize}}</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 关于与帮助 -->
      <view class="settings-group">
        <view class="settings-title">关于与帮助</view>
        <view class="settings-item" @click="goToAbout">
          <view class="item-left">
            <text class="iconfont icon-info-circle"></text>
            <text class="item-text">关于掌上食堂</text>
          </view>
          <view class="item-right">
            <text class="version-text">v1.0.0</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="goToFeedback">
          <view class="item-left">
            <text class="iconfont icon-message"></text>
            <text class="item-text">意见反馈</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="goToPrivacyPolicy">
          <view class="item-left">
            <text class="iconfont icon-shield"></text>
            <text class="item-text">隐私政策</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
        <view class="settings-item" @click="goToUserAgreement">
          <view class="item-left">
            <text class="iconfont icon-file-text"></text>
            <text class="item-text">用户协议</text>
          </view>
          <view class="item-right">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 退出登录 -->
      <view class="logout-button" @click="showLogoutConfirm">
        <text>退出登录</text>
      </view>
    </view>
    
    <!-- 退出登录确认弹窗 -->
    <view class="popup-mask" v-if="showLogoutPopup" @click="cancelLogout"></view>
    <view class="logout-popup" v-if="showLogoutPopup">
      <view class="popup-title">确认退出登录？</view>
      <view class="popup-content">退出后需要重新登录才能使用掌上食堂</view>
      <view class="popup-buttons">
        <view class="cancel-button" @click="cancelLogout">取消</view>
        <view class="confirm-button" @click="confirmLogout">确认退出</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notificationEnabled: true,
      cacheSize: '12.6MB',
      showLogoutPopup: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/profile/index'
          });
        }
      });
    },
    goToChangePwd() {
      uni.navigateTo({
        url: '/pages/profile/change-password'
      });
    },
    goToAbout() {
      uni.navigateTo({
        url: '/pages/profile/about'
      });
    },
    goToFeedback() {
      uni.navigateTo({
        url: '/pages/profile/feedback'
      });
    },
    goToPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/profile/privacy-policy'
      });
    },
    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/profile/user-agreement'
      });
    },
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value;
      uni.showToast({
        title: this.notificationEnabled ? '已开启消息通知' : '已关闭消息通知',
        icon: 'none'
      });
    },
    clearCache() {
      uni.showLoading({
        title: '清除中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        this.cacheSize = '0KB';
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        });
      }, 1000);
    },
    showLogoutConfirm() {
      this.showLogoutPopup = true;
    },
    cancelLogout() {
      this.showLogoutPopup = false;
    },
    confirmLogout() {
      uni.showLoading({
        title: '退出中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        // 清除登录状态
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        // 清除头像URL
        uni.removeStorageSync('userAvatar');
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 1000);
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
  z-index: 100;

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
    transition: all 0.2s;
    
    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
    
    .iconfont {
      font-size: 36rpx;
    }
  }

  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -8rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background-color: #34c759;
      border-radius: 3rpx;
      opacity: 0.8;
    }
  }
}

.settings-list {
  padding: 20rpx 0;
  width: 100%;
  box-sizing: border-box;
}

.settings-group {
  margin: 0 30rpx 20rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.settings-title {
  font-size: 26rpx;
  color: #999;
  padding: 20rpx 30rpx 10rpx;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  .item-left {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
    
    .iconfont {
      font-size: 40rpx;
      color: #34c759;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .item-text {
      font-size: 30rpx;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .item-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    
    .iconfont {
      font-size: 32rpx;
      color: #999;
    }
    
    .version-text, .cache-size {
      font-size: 26rpx;
      color: #999;
      margin-right: 10rpx;
    }
  }
}

.logout-button {
  margin: 60rpx 30rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #ff3b30;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: calc(100% - 60rpx);
  box-sizing: border-box;
  
  &:active {
    background-color: rgba(255, 59, 48, 0.05);
  }
}

/* 退出登录确认弹窗 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.logout-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: #fff;
  border-radius: 16rpx;
  z-index: 999;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  
  .popup-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    padding: 40rpx 30rpx 20rpx;
  }
  
  .popup-content {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    padding: 0 30rpx 40rpx;
  }
  
  .popup-buttons {
    display: flex;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    
    .cancel-button, .confirm-button {
      flex: 1;
      height: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      font-weight: 500;
    }
    
    .cancel-button {
      color: #666;
      border-right: 1px solid rgba(0, 0, 0, 0.05);
      
      &:active {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }
    
    .confirm-button {
      color: #ff3b30;
      
      &:active {
        background-color: rgba(255, 59, 48, 0.05);
      }
    }
  }
}
</style> 