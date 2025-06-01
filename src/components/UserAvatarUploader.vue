<template>
  <view class="avatar-uploader">
    <view class="avatar-container" @tap="chooseImage">
      <image 
        v-if="avatarUrl" 
        :src="avatarUrl" 
        class="avatar-image" 
        mode="aspectFill"
        @error="handleImageError"
      />
      <view v-else class="avatar-placeholder">
        <uni-icons type="person" size="30" color="#999999"></uni-icons>
      </view>
      
      <view v-if="uploading" class="upload-mask">
        <view class="upload-progress">{{progress}}%</view>
      </view>
      
      <view class="edit-icon">
        <uni-icons type="camera" size="16" color="#ffffff"></uni-icons>
      </view>
    </view>
    <text class="upload-tip">点击更换头像</text>
  </view>
</template>

<script>
import { uploadUserImage } from '@/api/user';

export default {
  name: 'UserAvatarUploader',
  props: {
    // 已有的头像URL
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      avatarUrl: '',
      uploading: false,
      progress: 0,
      defaultAvatar: '/static/images/default-avatar.png'
    };
  },
  watch: {
    value: {
      handler(newVal) {
        // 如果传入的值为空或无效URL，则使用默认头像
        if (!newVal) {
          this.avatarUrl = this.defaultAvatar;
        } else {
          this.avatarUrl = newVal;
          // 预加载图片，检查是否可访问
          this.preloadImage(newVal).catch(() => {
            this.avatarUrl = this.defaultAvatar;
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    // 预加载图片，检查是否可访问
    preloadImage(url) {
      return new Promise((resolve, reject) => {
        // 如果是本地图片路径，直接返回
        if (url.startsWith('/static/')) {
          resolve(url);
          return;
        }
        
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => {
          console.warn('图片加载失败:', url);
          reject(new Error('图片加载失败'));
        };
        img.src = url;
      });
    },
    
    // 处理图片加载错误
    handleImageError() {
      console.warn('头像加载失败，使用默认头像');
      this.avatarUrl = this.defaultAvatar;
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadAvatar(tempFilePath);
        }
      });
    },
    
    // 上传头像
    uploadAvatar(filePath) {
      this.uploading = true;
      this.progress = 0;
      
      // 先显示本地图片
      this.avatarUrl = filePath;
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        if (this.progress < 90) {
          this.progress += 10;
        }
      }, 200);
      
      // 使用用户上传图片API
      uploadUserImage(filePath)
        .then(res => {
          clearInterval(progressInterval);
          this.uploading = false;
          this.progress = 100;
          
          if (res && res.data && res.data.url) {
            this.avatarUrl = res.data.url;
            this.$emit('input', res.data.url);
            uni.showToast({
              title: '头像上传成功',
              icon: 'success'
            });
          } else {
            throw new Error('上传返回数据格式错误');
          }
        })
        .catch(err => {
          clearInterval(progressInterval);
          this.uploading = false;
          console.error('上传头像失败:', err);
          uni.showToast({
            title: '头像上传失败',
            icon: 'none'
          });
          // 如果原来有头像，恢复原头像
          if (this.value) {
            this.avatarUrl = this.value;
          } else {
            this.avatarUrl = this.defaultAvatar;
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .avatar-container {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    background-color: #f5f5f5;
    
    .avatar-image {
      width: 100%;
      height: 100%;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e0e0e0;
    }
    
    .upload-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      
      .upload-progress {
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
      }
    }
    
    .edit-icon {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  .upload-tip {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
  }
}
</style> 