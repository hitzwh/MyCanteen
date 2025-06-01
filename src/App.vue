<template>
  <view>
    <router-view></router-view>
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch');
    // 在应用启动时设置字体和样式
    this.initAppStyles();
    // 设置响应式布局
    this.setupResponsiveLayout();
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    // 初始化应用样式
    initAppStyles() {
      // 检测平台
      const platform = uni.getSystemInfoSync().platform;
      
      // 设置平台特定样式
      if (platform === 'android') {
        // Android平台优化
        console.log('在Android平台上运行，应用特定样式优化');
        
        // 可以在此处设置平台特定的全局变量
        this.adjustIconSizes();
      }
    },
    
    // 调整图标大小以适应Android
    adjustIconSizes() {
      // 这里可以动态设置一些全局样式变量
      // 例如可以通过uni.addStyle添加特定于平台的样式
      // 或者设置全局变量供组件使用
    },
    
    // 设置响应式布局
    setupResponsiveLayout() {
      try {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync();
        console.log('设备信息:', systemInfo);
        
        // 设置全局变量，供组件使用
        getApp().globalData = getApp().globalData || {};
        getApp().globalData.systemInfo = systemInfo;
        
        // 计算响应式单位
        const screenWidth = systemInfo.screenWidth;
        const screenHeight = systemInfo.screenHeight;
        
        // 设置设计稿的尺寸（这里假设设计稿是750px宽度）
        const designWidth = 750;
        
        // 计算缩放比例
        const scale = screenWidth / designWidth;
        
        // 存储响应式相关的数据
        getApp().globalData.scale = scale;
        getApp().globalData.screenWidth = screenWidth;
        getApp().globalData.screenHeight = screenHeight;
        
        console.log('响应式布局初始化完成，缩放比例:', scale);
      } catch (e) {
        console.error('设置响应式布局失败:', e);
      }
    }
  }
}
</script>

<style>
/* 全局样式，确保内容在安全区域内 */
page {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden; /* 防止水平滚动 */
}

/* 处理iphone X及以上机型的底部安全区 */
.safe-area-inset-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 处理顶部状态栏 */
.safe-area-inset-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 图标显示修复 */
.iconfont {
  font-family: "iconfont" !important;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Android平台特定样式 */
/* 设置更好的字体渲染 */
view, text, button, input {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 确保盒子间距一致 */
.container-wrapper {
  width: 100%;
  box-sizing: border-box;
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 修复不同设备上的间距问题 */
.selector-area .selector-item,
.food-list .food-item {
  margin-bottom: 20rpx !important;
}

/* 修复Android上的图标显示问题 */
@supports (-webkit-touch-callout: none) {
  /* iOS设备 */
  .iconfont::before {
    /* 为iOS设备添加特定样式 */
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
  }
}

@supports not (-webkit-touch-callout: none) {
  /* 非iOS设备（Android等） */
  .iconfont::before {
    display: inline-block !important;
    height: 1em;
    width: 1em;
    line-height: 1;
  }
}

/* 为徽标添加脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

<style>
@import url('./static/iconfont/iconfont.css');
</style>

<style>
/* 全局样式优化 */
page {
  background-color: #f8f9fc;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif;
}

/* 确保地图选择器和位置选择相关组件显示在最上层 */
.uni-map,
.uni-map-container,
.uni-map-view,
.uni-choose-location,
.uni-choose-location-container,
.uni-location-picker,
.uni-map-box,
.uni-map-mask {
  z-index: 999999999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: auto !important;
}

/* 确保地图选择器的控件可交互 */
.uni-map-control,
.uni-map-button,
.uni-map-callout,
.uni-map-marker,
.uni-map-cover-view,
.uni-map-cover-image {
  z-index: 999999999 !important;
  pointer-events: auto !important;
}

/* 优化全局背景 */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(248, 249, 252, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
  background-attachment: fixed;
  z-index: -1;
}

/* 背景装饰元素 */
.bg-decoration {
  position: fixed;
  z-index: -1;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(30px);
}

.bg-decoration-1 {
  top: -5%;
  right: -10%;
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(45deg, rgba(52, 199, 89, 0.2), rgba(64, 156, 255, 0.2));
}

.bg-decoration-2 {
  bottom: 10%;
  left: -10%;
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 59, 48, 0.15));
}

/* 卡片样式优化 */
.card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05), 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.card:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08), 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 按钮样式优化 */
.btn {
  background: linear-gradient(135deg, #34c759, #32ade6);
  color: white;
  border-radius: 50rpx;
  padding: 24rpx 40rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 20rpx rgba(52, 199, 89, 0.3);
  border: none;
  transition: all 0.3s ease;
}

.btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(52, 199, 89, 0.2);
}

/* 输入框样式优化 */
.input {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  transition: all 0.3s ease;
}

.input:focus {
  border-color: rgba(52, 199, 89, 0.5);
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.1);
}

/* 标题样式优化 */
.section-title {
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 24rpx;
  margin-bottom: 30rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(to bottom, #34c759, #32ade6);
  border-radius: 4rpx;
}

/* 列表项样式优化 */
.list-item {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.list-item:active {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2rpx);
}

/* 标签样式优化 */
.tag {
  background-color: rgba(52, 199, 89, 0.1);
  color: #34c759;
  border-radius: 30rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  margin-right: 16rpx;
  border: 1px solid rgba(52, 199, 89, 0.2);
}

/* 确保uni-app原生组件显示在最上层 */
.uni-modal,
.uni-modal-mask,
.uni-modal-dialog,
uni-modal, 
uni-modal .uni-modal,
uni-modal .uni-modal-dialog,
.uni-popup,
.uni-popup-dialog,
.uni-popup-mask,
.uni-modal-wrapper,
.uni-mask {
  z-index: 99999 !important;
}

/* 图片预览弹窗必须显示在最顶层 */
uni-image-viewer,
.uni-image-viewer,
.uni-image-viewer-mask,
.uni-image-viewer-view,
uni-image-viewer .uni-image-viewer,
uni-image-viewer .uni-image-viewer-mask,
uni-image-viewer .uni-image-viewer-view,
.uni-preview-image,
.uni-preview-image-view,
.uni-image-swiper,
uni-previewImage,
.uni-previewImage,
.uni-mask.viewer-mask,
.uni-slider-wrapper {
  z-index: 2000000 !important; /* 比其他弹窗高两个数量级 */
  position: fixed !important;
  visibility: visible !important;
  display: block !important;
}

/* 确保图片预览的操作按钮可点击 */
.uni-image-viewer .uni-image-viewer-btn,
.uni-image-viewer-view .uni-image-viewer-btn,
.uni-preview-image .uni-preview-image-btn,
.uni-btn,
.uni-slider-handle,
.uni-slider-thumb {
  z-index: 2000001 !important;
  position: relative !important;
  pointer-events: auto !important;
  visibility: visible !important;
}

/* 修复模态框按钮点击没反应的问题 */
.uni-modal .uni-modal-btn,
.uni-modal-btn,
uni-modal .uni-modal-btn,
button.uni-modal-btn {
  z-index: 100001 !important;
  position: relative !important;
  pointer-events: auto !important;
}

/* 确保iOS和Android设备上弹窗按钮可点击 */
.uni-modal-btn:before,
.uni-modal-btn:after {
  content: none !important;
}

.uni-modal-btn:active {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

/* 防止弹窗交互问题 */
uni-modal {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
  z-index: 99990 !important;
  pointer-events: auto !important;
}

/* 确保弹窗内容可见 */
uni-modal .uni-modal-dialog {
  background-color: #fff !important;
  z-index: 100000 !important;
}

/* 确保picker和相关组件不会影响系统弹窗 */
.uni-picker-container, 
.uni-picker, 
.uni-select, 
.uni-select-picker,
.uni-picker-view {
  z-index: 20000 !important;
}

/* H5平台特定样式 */
/* #ifdef H5 */
uni-modal {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 99999 !important;
}

.uni-modal, 
.uni-mask, 
.uni-modal-wrapper {
  z-index: 99999 !important;
}

/* 修复H5平台下按钮点击问题 */
.uni-modal-dialog {
  position: relative !important;
  z-index: 100000 !important;
}

.uni-modal-dialog button,
.uni-modal-dialog .uni-modal-btn,
.uni-modal .uni-modal-btn {
  position: relative !important;
  z-index: 100001 !important;
  pointer-events: auto !important;
  background-color: transparent !important; /* 重置背景确保点击有效 */
}

/* 修复H5平台下按钮区域点击问题 */
.uni-modal-dialog .uni-modal-ft {
  position: relative !important;
  z-index: 100001 !important;
  pointer-events: auto !important;
}

/* 阻止页面滚动当模态框打开时 */
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* 修复H5上按钮点击问题 */
uni-modal .uni-modal-btn,
.uni-modal .uni-modal-btn {
  position: relative !important;
  z-index: 10001 !important; 
  pointer-events: auto !important;
  cursor: pointer;
  min-height: 44px;
}

/* 确保弹窗可以正常交互 */
uni-modal,
.uni-modal {
  z-index: 9999 !important;
}

.uni-modal-mask {
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
}

/* 增强模态框内容交互 */
.uni-modal-dialog {
  position: relative;
  z-index: 10000 !important;
  overflow: visible !important;
}

/* 确保图片预览在H5平台正常显示 */
uni-image-viewer,
.uni-image-viewer,
.uni-viewer-container,
.uni-viewer-mask {
  z-index: 9999999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 确保图片预览内容在最顶层 */
.uni-viewer-image-box,
.uni-viewer-image,
.uni-image-viewer-view {
  z-index: 10000000 !important;
  position: relative !important;
}

/* 确保图片预览按钮可点击 */
.uni-viewer-btn-box,
.uni-viewer-btn {
  z-index: 10000001 !important;
  position: relative !important;
  pointer-events: auto !important;
}

/* 修复页面结构，防止预览被截断 */
body,
html,
page,
#app {
  height: 100% !important;
  overflow: auto !important;
}
/* #endif */

/* 微信小程序平台特定样式 */
/* #ifdef MP-WEIXIN */
.uni-modal, 
.wx-modal, 
.modal {
  z-index: 9999 !important;
}
/* #endif */
</style>

<style>
/* 响应式布局全局样式 */
.responsive-container {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  margin: 0 auto;
}

/* 小屏幕设备（手机竖屏） */
@media screen and (max-width: 375px) {
  .responsive-container {
    padding: 0 20rpx;
  }
  
  /* 减小字体大小 */
  .page-title {
    font-size: 40rpx !important;
  }
  
  .section-title {
    font-size: 32rpx !important;
  }
  
  /* 调整卡片间距 */
  .card, .list-item {
    margin-bottom: 16rpx !important;
    padding: 16rpx !important;
  }
  
  /* 调整按钮大小 */
  .btn {
    padding: 16rpx 30rpx !important;
    font-size: 26rpx !important;
  }
}

/* 中等屏幕设备（平板竖屏、手机横屏） */
@media screen and (min-width: 376px) and (max-width: 768px) {
  .responsive-container {
    padding: 0 40rpx;
    max-width: 92%;
  }
  
  /* 网格布局调整 */
  .grid-row {
    display: flex;
    flex-wrap: wrap;
  }
  
  .grid-col-6 {
    width: 50% !important;
  }
}

/* 大屏幕设备（平板横屏、桌面） */
@media screen and (min-width: 769px) {
  .responsive-container {
    padding: 0 60rpx;
    max-width: 90%;
  }
  
  /* 网格布局调整 */
  .grid-col-6 {
    width: 33.33% !important;
  }
  
  .grid-col-4 {
    width: 25% !important;
  }
  
  /* 增大字体和间距 */
  .card, .list-item {
    padding: 30rpx !important;
  }
}

/* 超大屏幕设备 */
@media screen and (min-width: 1200px) {
  .responsive-container {
    max-width: 1200rpx;
  }
}

/* 弹性布局容器 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
}

/* 弹性布局列 */
.flex-col {
  flex: 1;
  padding: 10rpx;
  box-sizing: border-box;
}

.flex-col-12 { width: 100%; }
.flex-col-11 { width: 91.66%; }
.flex-col-10 { width: 83.33%; }
.flex-col-9 { width: 75%; }
.flex-col-8 { width: 66.66%; }
.flex-col-7 { width: 58.33%; }
.flex-col-6 { width: 50%; }
.flex-col-5 { width: 41.66%; }
.flex-col-4 { width: 33.33%; }
.flex-col-3 { width: 25%; }
.flex-col-2 { width: 16.66%; }
.flex-col-1 { width: 8.33%; }

/* 在小屏幕上调整列宽 */
@media screen and (max-width: 768px) {
  .flex-col-sm-12 { width: 100%; }
  .flex-col-sm-6 { width: 50%; }
  .flex-col-sm-4 { width: 33.33%; }
  .flex-col-sm-3 { width: 25%; }
}

/* 响应式间距 */
.responsive-margin {
  margin: 30rpx;
}

.responsive-padding {
  padding: 30rpx;
}

@media screen and (max-width: 375px) {
  .responsive-margin {
    margin: 20rpx;
  }
  
  .responsive-padding {
    padding: 20rpx;
  }
}

@media screen and (min-width: 769px) {
  .responsive-margin {
    margin: 40rpx;
  }
  
  .responsive-padding {
    padding: 40rpx;
  }
}

/* 响应式字体大小 */
.responsive-text-xl {
  font-size: 36rpx;
}

.responsive-text-lg {
  font-size: 32rpx;
}

.responsive-text-md {
  font-size: 28rpx;
}

.responsive-text-sm {
  font-size: 24rpx;
}

@media screen and (max-width: 375px) {
  .responsive-text-xl {
    font-size: 32rpx;
  }
  
  .responsive-text-lg {
    font-size: 28rpx;
  }
  
  .responsive-text-md {
    font-size: 24rpx;
  }
  
  .responsive-text-sm {
    font-size: 22rpx;
  }
}

@media screen and (min-width: 769px) {
  .responsive-text-xl {
    font-size: 40rpx;
  }
  
  .responsive-text-lg {
    font-size: 36rpx;
  }
  
  .responsive-text-md {
    font-size: 32rpx;
  }
  
  .responsive-text-sm {
    font-size: 28rpx;
  }
}
</style>
