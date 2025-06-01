<template>
  <view class="avatar-uploader">
    <view class="avatar-container" @tap="chooseImage">
      <image 
        v-if="avatarUrl" 
        :src="avatarUrl" 
        class="avatar-image" 
        mode="aspectFill"
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
import { uploadImage } from '@/api/worker';

export default {
  name: 'AvatarUploader',
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
      progress: 0
    };
  },
  watch: {
    value: {
      handler(newVal) {
        this.avatarUrl = newVal;
      },
      immediate: true
    }
  },
  methods: {
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
      
      uploadImage(filePath, 'avatar')
        .then(res => {
          clearInterval(progressInterval);
          this.uploading = false;
          this.progress = 100;
          this.avatarUrl = res.data.url;
          this.$emit('input', res.data.url);
          uni.showToast({
            title: '头像上传成功',
            icon: 'success'
          });
        })
        .catch(err => {
          clearInterval(progressInterval);
          this.uploading = false;
          uni.showToast({
            title: '头像上传失败',
            icon: 'none'
          });
          // 如果原来有头像，恢复原头像
          this.avatarUrl = this.value;
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