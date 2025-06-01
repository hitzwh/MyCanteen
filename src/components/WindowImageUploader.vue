<template>
  <view class="image-uploader">
    <view class="uploader-header">
      <text class="uploader-title">窗口图片</text>
      <text class="uploader-tip">请上传一张窗口图片</text>
    </view>
    
    <view class="image-list">
      <view 
        v-if="imageUrl" 
        class="image-item"
      >
        <image 
          :src="imageUrl" 
          mode="aspectFill" 
          class="preview-image" 
          @tap="previewImage"
        />
        <view class="delete-btn" @tap.stop="deleteImage">
          <uni-icons type="trash" size="20" color="#ffffff"></uni-icons>
        </view>
        <view v-if="uploading" class="upload-mask">
          <view class="upload-progress">{{uploadProgress}}%</view>
        </view>
      </view>
      
      <view 
        v-if="!imageUrl" 
        class="add-image" 
        @tap="chooseImage"
      >
        <uni-icons type="plusempty" size="30" color="#999999"></uni-icons>
        <text class="add-text">添加图片</text>
      </view>
    </view>
  </view>
</template>

<script>
import { uploadImage } from '@/api/worker';

export default {
  name: 'WindowImageUploader',
  props: {
    // 已有的图片URL
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageUrl: '',
      uploading: false,
      uploadProgress: 0,
      isChoosingImage: false // 标记是否正在选择图片，防止重复触发
    };
  },
  watch: {
    value: {
      handler(newVal) {
        console.log('父组件传入的图片URL发生变化:', newVal);
        if (newVal) {
          this.imageUrl = newVal;
          this.uploading = false;
          this.uploadProgress = 100;
          console.log('已更新组件内部图片URL:', this.imageUrl);
        } else {
          this.imageUrl = '';
          console.log('已清空组件内部图片URL');
        }
      },
      immediate: true
    }
  },
  methods: {
    // 选择图片
    chooseImage() {
      // 如果正在上传或已经在选择图片的过程中，不允许重复操作
      if (this.uploading) {
        uni.showToast({
          title: '正在上传中，请稍候',
          icon: 'none'
        });
        return;
      }
      
      if (this.isChoosingImage) {
        console.log('已经在选择图片过程中，防止重复触发');
        return;
      }
      
      // 标记开始选择图片
      this.isChoosingImage = true;
      
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          console.log('选择的图片:', filePath);
          
          if (filePath) {
            // 直接开始上传，不显示确认弹窗
            console.log('用户选择了图片，开始上传');
            this.uploadSingleImage(filePath);
          }
          this.isChoosingImage = false;
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          // 选择失败时重置选择状态
          this.isChoosingImage = false;
          
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        },
        complete: () => {
          // 确保在所有情况下都能重置选择状态
          if (this.isChoosingImage) {
            console.log('选择图片完成，重置选择状态');
            this.isChoosingImage = false;
          }
        }
      });
    },
    
    // 上传图片
    async uploadSingleImage(filePath) {
      console.log('开始上传图片:', filePath);
      
      this.imageUrl = filePath; // 先显示本地图片
      this.uploading = true;
      this.uploadProgress = 0;
      
      try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += 10;
            console.log('上传进度:', this.uploadProgress);
          }
        }, 200);
        
        try {
          console.log('准备上传图片到服务器');
          
          // 显示上传中状态
          uni.showLoading({
            title: '上传中...',
            mask: true
          });
          
          // 使用worker的uploadImage方法上传
          const result = await uploadImage(filePath, 'window');
          
          // 隐藏加载提示
          uni.hideLoading();
          
          console.log('上传结果:', JSON.stringify(result));
          
          // 清除进度条定时器
          clearInterval(progressInterval);
          
          // 检查不同的响应格式，提取URL
          let imageUrl = null;
          
          if (result && result.code === 0) {
            // 标准格式: {code: 0, data: {url: '...'}}
            if (result.data && result.data.url) {
              imageUrl = result.data.url;
              console.log('从标准格式响应中提取URL:', imageUrl);
            } 
            // 替代格式: {code: 0, url: '...'}
            else if (result.url) {
              imageUrl = result.url;
              console.log('从替代格式响应中提取URL:', imageUrl);
            }
            // 直接在data字段中的URL
            else if (result.data && typeof result.data === 'string') {
              imageUrl = result.data;
              console.log('从data字符串中提取URL:', imageUrl);
            }
          } 
          // 另一种格式: {success: true, url: '...'}
          else if (result && result.success && result.url) {
            imageUrl = result.url;
            console.log('从另一种格式响应中提取URL:', imageUrl);
          }
          
          if (imageUrl) {
            // 更新URL和状态
            this.imageUrl = imageUrl;
            this.uploading = false;
            this.uploadProgress = 100;
            
            console.log('图片上传成功, URL:', imageUrl);
            
            // 立即触发更新
            this.$nextTick(() => {
              this.emitChange();
              
              // 特殊处理：强制同步到父组件
              this.forceSyncToParent(imageUrl);
            });
            
            return result;
          } else {
            console.error('上传成功但返回格式不符合预期:', result);
            throw new Error('上传失败: 返回结果不包含有效的URL');
          }
        } catch (error) {
          // 隐藏加载提示
          uni.hideLoading();
          
          console.error('上传请求失败:', error);
          clearInterval(progressInterval);
          
          // 检查是否为网络错误或超时
          const isNetworkError = error.errMsg && (
            error.errMsg.includes('timeout') || 
            error.errMsg.includes('fail') || 
            error.errMsg.includes('network')
          );
          
          if (isNetworkError) {
            // 询问用户是否重试
            return new Promise((resolve, reject) => {
              uni.showModal({
                title: '上传失败',
                content: '网络连接不稳定，是否重新尝试上传？',
                confirmText: '重试',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    // 重新尝试上传
                    console.log('用户选择重试上传');
                    // 递归调用自身重试
                    this.uploadSingleImage(filePath)
                      .then(resolve)
                      .catch(reject);
                  } else {
                    // 用户取消，清空图片
                    console.log('用户取消重试，移除图片');
                    this.handleUploadError('已取消上传');
                    reject(new Error('用户取消上传'));
                  }
                }
              });
            });
          } else {
            // 其他错误
            this.handleUploadError(error.message || '上传失败');
            throw error;
          }
        }
      } catch (error) {
        console.error('图片上传异常:', error);
        this.handleUploadError('图片上传失败');
        throw error;
      }
    },
    
    // 处理上传错误
    handleUploadError(errorMessage) {
      this.imageUrl = '';
      this.uploading = false;
      this.uploadProgress = 0;
      
      // 显示错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
      
      // 更新父组件
      this.emitChange();
    },
    
    // 删除图片
    deleteImage() {
      // 如果正在上传，不允许删除
      if (this.uploading) {
        uni.showToast({
          title: '上传中，无法删除',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '提示',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('删除图片:', this.imageUrl);
            this.imageUrl = '';
            this.emitChange();
          }
        }
      });
    },
    
    // 预览图片
    previewImage() {
      if (!this.imageUrl) return;
      
      console.log('预览图片:', this.imageUrl);
      uni.previewImage({
        urls: [this.imageUrl],
        current: this.imageUrl
      });
    },
    
    // 向父组件发送更新后的图片URL
    emitChange() {
      const newUrl = this.uploading ? '' : this.imageUrl;
      console.log('发送更新给父组件:', newUrl);
      
      this.$emit('input', newUrl);
      
      // 延迟再次发送，确保父组件能接收到更新
      this.$nextTick(() => {
        // 检查父组件的值是否与我们发送的一致
        if (this.value !== newUrl) {
          console.log('父组件未正确接收图片更新，再次发送:', newUrl);
          
          // 延迟发送，确保父组件能接收到更新
          setTimeout(() => {
            console.log('延迟发送更新，确保父组件接收到:', newUrl);
            this.$emit('input', newUrl);
          }, 300);
        } else {
          console.log('父组件已正确接收图片更新');
        }
      });
    },
    
    // 强制同步到父组件
    forceSyncToParent(imageUrl) {
      // 使用不同的事件名称，避免可能的冲突
      console.log('强制同步图片URL到父组件:', imageUrl);
      this.$emit('update:value', imageUrl);
      this.$emit('input', imageUrl);
      
      // 使用不同的延迟时间，确保更新
      setTimeout(() => {
        console.log('延迟500ms再次强制同步图片URL:', imageUrl);
        this.$emit('input', imageUrl);
      }, 500);
      
      setTimeout(() => {
        console.log('延迟1000ms最后同步图片URL:', imageUrl);
        this.$emit('input', imageUrl);
      }, 1000);
    }
  }
};
</script>

<style lang="scss" scoped>
.image-uploader {
  padding: 10px 0;
  
  .uploader-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .uploader-title {
      font-size: 16px;
      font-weight: bold;
    }
    
    .uploader-tip {
      font-size: 12px;
      color: #999;
    }
  }
  
  .image-list {
    display: flex;
    flex-wrap: wrap;
    
    .image-item, .add-image {
      width: 100px;
      height: 100px;
      margin-right: 8px;
      margin-bottom: 8px;
      position: relative;
    }
    
    .image-item {
      .preview-image {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      
      .delete-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
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
        border-radius: 4px;
        
        .upload-progress {
          color: #ffffff;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
    
    .add-image {
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      
      .add-text {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}
</style> 