<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">关于掌上食堂</text>
    </view>

    <!-- 关于内容 -->
    <view class="about-content">
      <view class="app-logo">
        <image src="/static/logo.png" mode="aspectFit"></image>
      </view>
      
      <view class="app-name">掌上食堂</view>
      <view class="app-version">版本 1.0.0</view>
      
      <view class="info-section">
        <view class="info-title">应用介绍</view>
        <view class="info-text">
          掌上食堂是一款为校园师生提供餐厅信息查询、菜品浏览、在线预订等服务的应用。我们致力于为用户提供便捷、高效的校园餐饮体验，让您的校园生活更加美好。
        </view>
      </view>
      
      <view class="info-section">
        <view class="info-title">开发团队</view>
        <view class="info-text">
          本应用由校园创新工作室开发，团队成员包括UI设计师、前端开发工程师、后端开发工程师和产品经理，共同努力为您带来优质的校园服务体验。
        </view>
      </view>
      
      <view class="info-section">
        <view class="info-title">联系我们</view>
        <view class="contact-list">
          <view class="contact-item">
            <text class="iconfont icon-mail"></text>
            <text class="contact-text">support@campus-food.com</text>
          </view>
          <view class="contact-item">
            <text class="iconfont icon-phone"></text>
            <text class="contact-text">400-123-4567</text>
          </view>
          <view class="contact-item">
            <text class="iconfont icon-global"></text>
            <text class="contact-text">www.campus-food.com</text>
          </view>
        </view>
      </view>
      
      <view class="copyright">
        <text>© 2025 掌上食堂 版权所有</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appInfo: {
        name: '校园食堂',
        version: '1.0.0',
        description: '提供校园食堂菜品展示、评价和推荐的应用',
        developer: '校园开发团队'
      },
      contactInfo: [
        { icon: 'icon-mail-line', text: 'support@example.com' },
        { icon: 'icon-phone-line', text: '400-123-4567' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
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

.about-content {
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  
  image {
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  }
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.app-version {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.info-section {
  width: 100%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.info-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  position: relative;
  padding-left: 20rpx;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 28rpx;
    background-color: #34c759;
    border-radius: 4rpx;
  }
}

.info-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.contact-list {
  margin-top: 20rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .iconfont {
    font-size: 36rpx;
    color: #34c759;
    margin-right: 20rpx;
  }
  
  .contact-text {
    font-size: 28rpx;
    color: #666;
  }
}

.copyright {
  margin-top: 60rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}
</style> 