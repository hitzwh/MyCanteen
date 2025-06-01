<template>
  <view class="page-background">
    <view class="bg-decoration bg-decoration-1"></view>
    <view class="bg-decoration bg-decoration-2"></view>
    <view class="bg-pattern"></view>
  </view>
</template>

<script setup>
// 无需额外逻辑
</script>

<style lang="scss">
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

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
  animation: float 15s infinite ease-in-out;
}

.bg-decoration-2 {
  bottom: 10%;
  left: -10%;
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 59, 48, 0.15));
  animation: float 20s infinite ease-in-out reverse;
}

.bg-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.4;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20rpx, 20rpx) rotate(5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}
</style> 