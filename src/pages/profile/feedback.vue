<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">意见反馈</text>
    </view>

    <!-- 反馈表单 -->
    <view class="feedback-form">
      <!-- 问题类型选择 -->
      <view class="form-section">
        <view class="section-title">问题类型</view>
        <view class="type-selector">
          <view 
            v-for="(item, index) in feedbackTypes" 
            :key="index"
            :class="['type-item', selectedType === index ? 'active' : '']"
            @click="selectType(index)"
          >
            {{ item }}
          </view>
        </view>
      </view>
      
      <!-- 反馈内容 -->
      <view class="form-section">
        <view class="section-title">反馈内容</view>
        <view class="textarea-container">
          <textarea 
            class="feedback-textarea" 
            v-model="feedbackContent"
            placeholder="请详细描述您遇到的问题或建议，以便我们更好地为您解决..."
            maxlength="500"
          ></textarea>
          <text class="word-count">{{ feedbackContent.length }}/500</text>
        </view>
      </view>
      
      <!-- 图片上传 -->
      <view class="form-section">
        <view class="section-title">上传截图（选填，最多3张）</view>
        <view class="upload-container">
          <view 
            v-for="(img, index) in uploadedImages" 
            :key="index"
            class="image-item"
          >
            <image :src="img" mode="aspectFill"></image>
            <view class="delete-icon" @tap="deleteImage(index)">
              <text class="iconfont icon-close-circle-line"></text>
            </view>
          </view>
          
          <view class="upload-btn" @tap="chooseImage" v-if="uploadedImages.length < 3">
            <text class="iconfont icon-image-add-fill"></text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>
      
      <!-- 联系方式 -->
      <view class="form-section">
        <view class="section-title">联系方式（选填）</view>
        <input 
          class="contact-input" 
          v-model="contactInfo"
          placeholder="请留下您的手机号或邮箱，方便我们联系您"
        />
      </view>
      
      <!-- 提交按钮 -->
      <view 
        class="submit-button" 
        :class="{ 'disabled': !isFormValid }" 
        @click="submitFeedback"
      >
        <text>提交反馈</text>
      </view>
      
      <!-- 提交成功提示 -->
      <view class="success-tips" v-if="showSuccess">
        <text class="iconfont icon-check-circle"></text>
        <text class="tips-text">感谢您的反馈，我们会尽快处理！</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackTypes: ['功能异常', '体验问题', '内容错误', '新功能建议', '其他'],
      selectedType: -1,
      feedbackContent: '',
      uploadedImages: [],
      contactInfo: '',
      showSuccess: false
    }
  },
  computed: {
    isFormValid() {
      // 至少选择问题类型且填写反馈内容
      return this.selectedType !== -1 && this.feedbackContent.trim().length > 0;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    selectType(index) {
      this.selectedType = index;
    },
    chooseImage() {
      if (this.uploadedImages.length >= 3) {
        uni.showToast({
          title: '最多只能上传3张图片',
          icon: 'none'
        });
        return;
      }
      
      uni.chooseImage({
        count: 3 - this.uploadedImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 预览选择的图片
          const tempFilePaths = res.tempFilePaths;
          this.uploadedImages = [...this.uploadedImages, ...tempFilePaths].slice(0, 3);
        }
      });
    },
    deleteImage(index) {
      this.uploadedImages.splice(index, 1);
    },
    submitFeedback() {
      if (!this.isFormValid) {
        if (this.selectedType === -1) {
          uni.showToast({
            title: '请选择问题类型',
            icon: 'none'
          });
          return;
        }
        
        if (this.feedbackContent.trim().length === 0) {
          uni.showToast({
            title: '请填写反馈内容',
            icon: 'none'
          });
          return;
        }
        
        return;
      }
      
      // 显示加载中
      uni.showLoading({
        title: '提交中...'
      });
      
      // 构建反馈数据
      const feedbackData = {
        type: this.feedbackTypes[this.selectedType],
        content: this.feedbackContent,
        images: this.uploadedImages,
        contactInfo: this.contactInfo,
        timestamp: new Date().getTime()
      };
      
      console.log('提交反馈数据:', feedbackData);
      
      // 模拟提交反馈
      setTimeout(() => {
        uni.hideLoading();
        
        // 显示成功提示
        this.showSuccess = true;
        
        // 重置表单
        setTimeout(() => {
          this.selectedType = -1;
          this.feedbackContent = '';
          this.uploadedImages = [];
          this.contactInfo = '';
          this.showSuccess = false;
          
          // 返回上一页
          this.goBack();
        }, 2000);
      }, 1500);
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

.feedback-form {
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .type-item {
    padding: 16rpx 30rpx;
    border-radius: 40rpx;
    background-color: #f5f5f5;
    font-size: 26rpx;
    color: #666;
    transition: all 0.2s;
    
    &.active {
      background-color: rgba(52, 199, 89, 0.1);
      color: #34c759;
      font-weight: bold;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.textarea-container {
  position: relative;
  
  .feedback-textarea {
    width: 100%;
    height: 300rpx;
    padding: 20rpx;
    box-sizing: border-box;
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
    background-color: #f8f8f8;
    border-radius: 12rpx;
  }
  
  .word-count {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .image-item {
    width: 180rpx;
    height: 180rpx;
    position: relative;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
      object-fit: cover;
    }
    
    .delete-icon {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 24rpx;
        color: #fff;
      }
    }
  }
  
  .upload-btn {
    width: 180rpx;
    height: 180rpx;
    border: 2rpx dashed #ccc;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 50rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .upload-text {
      font-size: 24rpx;
      color: #999;
    }
    
    &:active {
      background-color: #f5f5f5;
    }
  }
}

.contact-input {
  width: 100%;
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
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
  margin-top: 60rpx;
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

.success-tips {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .iconfont {
    font-size: 80rpx;
    color: #34c759;
    margin-bottom: 20rpx;
  }
  
  .tips-text {
    font-size: 28rpx;
    color: #333;
  }
}
</style> 