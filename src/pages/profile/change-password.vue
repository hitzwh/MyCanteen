<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">修改密码</text>
    </view>

    <!-- 修改密码表单 -->
    <view class="form-container">
      <view class="form-group">
        <view class="input-item">
          <view class="input-label">
            <text class="iconfont icon-lock"></text>
            <text>当前密码</text>
          </view>
          <input 
            class="input-field" 
            type="password" 
            v-model="oldPassword" 
            placeholder="请输入当前密码" 
            password
          />
        </view>
        
        <view class="input-item">
          <view class="input-label">
            <text class="iconfont icon-lock"></text>
            <text>新密码</text>
          </view>
          <input 
            class="input-field" 
            type="password" 
            v-model="newPassword" 
            placeholder="请输入新密码（8-20位字母和数字组合）" 
            password
          />
        </view>
        
        <view class="input-item">
          <view class="input-label">
            <text class="iconfont icon-lock"></text>
            <text>确认新密码</text>
          </view>
          <input 
            class="input-field" 
            type="password" 
            v-model="confirmPassword" 
            placeholder="请再次输入新密码" 
            password
          />
        </view>
      </view>
      
      <view class="form-tips">
        <text class="tip-item">• 密码长度为8-20位</text>
        <text class="tip-item">• 必须包含字母和数字</text>
        <text class="tip-item">• 区分大小写</text>
      </view>
      
      <view 
        class="submit-button" 
        :class="{ 'disabled': !isFormValid }" 
        @click="submitForm"
      >
        <text>确认修改</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  computed: {
    isFormValid() {
      // 检查所有字段是否填写
      const allFilled = this.oldPassword && this.newPassword && this.confirmPassword;
      
      // 检查新密码是否符合规则（8-20位，包含字母和数字）
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
      const isPasswordValid = passwordRegex.test(this.newPassword);
      
      // 检查两次输入的新密码是否一致
      const isPasswordMatch = this.newPassword === this.confirmPassword;
      
      return allFilled && isPasswordValid && isPasswordMatch;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    submitForm() {
      if (!this.isFormValid) {
        // 如果表单无效，给出相应提示
        if (!this.oldPassword) {
          this.showToast('请输入当前密码');
          return;
        }
        
        if (!this.newPassword) {
          this.showToast('请输入新密码');
          return;
        }
        
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(this.newPassword)) {
          this.showToast('新密码必须为8-20位字母和数字组合');
          return;
        }
        
        if (!this.confirmPassword) {
          this.showToast('请确认新密码');
          return;
        }
        
        if (this.newPassword !== this.confirmPassword) {
          this.showToast('两次输入的新密码不一致');
          return;
        }
        
        return;
      }
      
      // 显示加载中
      uni.showLoading({
        title: '提交中...'
      });
      
      // 模拟API请求
      setTimeout(() => {
        uni.hideLoading();
        
        // 模拟成功响应
        uni.showToast({
          title: '密码修改成功',
          icon: 'success',
          duration: 2000
        });
        
        // 2秒后返回上一页
        setTimeout(() => {
          this.goBack();
        }, 2000);
      }, 1500);
    },
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
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

.form-container {
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-group {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.input-item {
  padding: 30rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
  
  .input-label {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .iconfont {
      font-size: 36rpx;
      color: #34c759;
      margin-right: 16rpx;
    }
    
    text {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
  
  .input-field {
    width: 100%;
    height: 80rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }
}

.form-tips {
  padding: 0 20rpx;
  margin-bottom: 60rpx;
  
  .tip-item {
    font-size: 24rpx;
    color: #999;
    line-height: 1.8;
    display: block;
  }
}

.submit-button {
  height: 90rpx;
  background: linear-gradient(90deg, #34c759, #4cd964);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 6rpx 16rpx rgba(52, 199, 89, 0.2);
  width: 100%;
  box-sizing: border-box;
  
  &:active {
    opacity: 0.9;
  }
  
  &.disabled {
    background: linear-gradient(90deg, #ccc, #ddd);
    box-shadow: none;
    color: rgba(255, 255, 255, 0.8);
  }
}
</style> 