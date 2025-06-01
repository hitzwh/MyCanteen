<template>
  <view class="image-uploader">
    <view class="uploader-header">
      <text class="uploader-title">菜品图片</text>
      <text class="uploader-tip">最多上传4张图片</text>
    </view>
    
    <view class="image-list">
      <view 
        v-for="(image, index) in imageList" 
        :key="index" 
        class="image-item"
      >
        <image 
          :src="image.url" 
          mode="aspectFill" 
          class="preview-image" 
          @tap="previewImage(index)"
        />
        <view class="delete-btn" @tap.stop="deleteImage(index)">
          <uni-icons type="trash" size="20" color="#ffffff"></uni-icons>
        </view>
        <view v-if="image.uploading" class="upload-mask">
          <view class="upload-text">上传中...</view>
        </view>
      </view>
      
      <view 
        v-if="imageList.length < maxCount" 
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
import request from '@/utils/request';

export default {
  name: 'DishImageUploader',
  props: {
    // 已有的图片列表
    value: {
      type: Array,
      default: () => []
    },
    // 最大上传数量
    maxCount: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      imageList: [],
      isUploading: false,
      totalUploads: 0,  // 总上传任务数
      completedUploads: 0,  // 已完成上传数
      isChoosingImage: false // 标记是否正在选择图片，防止重复触发
    };
  },
  watch: {
    value: {
      handler(newVal) {
        console.log('父组件传入的图片列表发生变化:', newVal);
        if (Array.isArray(newVal)) {
          // 创建新的图片列表对象，避免引用问题
          this.imageList = newVal.map(url => {
            if (!url || typeof url !== 'string') {
              console.warn('收到无效的图片URL:', url);
              return null;
            }
            
            const trimmedUrl = url.trim();
            if (trimmedUrl.includes('example.com')) {
              console.log('过滤示例域名的图片URL:', trimmedUrl);
              return null;
            }
            
            if (trimmedUrl.length === 0) {
              console.log('过滤空URL');
              return null;
            }
            
            console.log('处理有效的图片URL:', trimmedUrl);
            return {
              url: trimmedUrl,
              uploading: false
            };
          }).filter(Boolean); // 过滤掉无效的项
          
          console.log('更新后的组件内部图片列表:', this.imageList);
        } else {
          console.warn('收到的value不是数组:', newVal);
          this.imageList = [];
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 选择图片
    chooseImage() {
      // 如果正在上传或已经在选择图片的过程中，不允许重复操作
      if (this.isUploading) {
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
        count: this.maxCount - this.imageList.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          console.log('选择的图片:', tempFilePaths);
          
          if (tempFilePaths && tempFilePaths.length > 0) {
            console.log('用户选择了图片，开始上传');
            this.processAndUploadImages(tempFilePaths);
          }
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          this.isChoosingImage = false;
          
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        },
        complete: () => {
          // 确保在所有情况下都能重置选择状态
          this.isChoosingImage = false;
        }
      });
    },
    
    // 处理并上传图片
    async processAndUploadImages(filePaths) {
      if (this.isUploading) {
        console.log('已经在上传中，忽略重复上传请求');
        return;
      }
      
      this.isUploading = true;
      this.totalUploads = filePaths.length;
      this.completedUploads = 0;
      
      try {
        console.log('开始处理并上传', filePaths.length, '张图片');
        
        // 添加图片到列表，显示为上传中状态
        const newImages = filePaths.map(path => ({
          url: path,
          uploading: true,
          tempPath: path
        }));
        
        this.imageList.push(...newImages);
        
        // 一次只上传一张图片
        for (let i = 0; i < newImages.length; i++) {
          try {
            await this.uploadSingleImage(newImages[i]);
            console.log(`完成第 ${i+1}/${newImages.length} 张图片上传`);
          } catch (error) {
            console.error(`第 ${i+1} 张图片上传失败:`, error);
          }
        }
        
        console.log('所有图片上传完成');
        
        // 强制更新所有图片状态
        this.imageList.forEach(img => {
          if (img.uploading) {
            console.log('发现图片仍显示为上传中状态，强制更新为已完成');
            img.uploading = false;
          }
        });
        
        // 强制更新视图
        this.$forceUpdate();
        
        // 发送最终的图片列表
        this.emitChange();
      } catch (error) {
        console.error('上传过程中出错:', error);
      } finally {
        this.isUploading = false;
      }
    },
    
    // 上传单张图片
    async uploadSingleImage(imageItem) {
      return new Promise((resolve, reject) => {
        console.log('开始上传菜品图片:', imageItem.tempPath);
        
        // 确保标记为上传中状态
        imageItem.uploading = true;
        this.$forceUpdate();
        
        // 检查文件大小
        uni.getFileInfo({
          filePath: imageItem.tempPath,
          success: async (res) => {
            if (res.size > 5 * 1024 * 1024) {
              this.handleUploadError(imageItem, '图片大小不能超过5MB');
              reject(new Error('图片大小不能超过5MB'));
              return;
            }
            
            try {
              // 显示上传中状态
              uni.showLoading({
                title: '上传中...',
                mask: true
              });
              
              const result = await uploadImage(imageItem.tempPath, 'dish');
              
              // 隐藏加载提示
              uni.hideLoading();
              
              console.log('上传结果:', JSON.stringify(result));
              
              if (result && result.code === 0 && result.data) {
                const { url, isExisting, existingDish } = result.data;
                
                // 更新图片项
                imageItem.url = url;
                imageItem.uploading = false;
                delete imageItem.tempPath;
                
                // 增加完成计数
                this.completedUploads++;
                
                // 如果图片已存在于其他菜品中，显示提示
                if (existingDish) {
                  uni.showToast({
                    title: `图片已存在于菜品"${existingDish.name}"中`,
                    icon: 'none',
                    duration: 3000
                  });
                } else if (isExisting) {
                  uni.showToast({
                    title: '已使用系统中存在的相同图片',
                    icon: 'none',
                    duration: 2000
                  });
                }
                
                console.log('菜品图片上传成功, URL:', url);
                
                // 立即更新视图
                this.$forceUpdate();
                
                // 确保状态更新后再发送数据
                this.$nextTick(() => {
                  this.emitChange();
                });
                
                resolve(url);
              } else {
                this.handleUploadError(imageItem, '上传失败: 返回结果不包含有效的URL');
                reject(new Error('上传失败: 返回结果不包含有效的URL'));
              }
            } catch (error) {
              // 隐藏加载提示
              uni.hideLoading();
              
              console.error('上传请求失败:', error);
              
              // 检查是否为网络错误或超时
              const isNetworkError = error.errMsg && (
                error.errMsg.includes('timeout') || 
                error.errMsg.includes('fail') || 
                error.errMsg.includes('network')
              );
              
              if (isNetworkError) {
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
                      this.uploadSingleImage(imageItem)
                        .then(resolve)
                        .catch(reject);
                    } else {
                      // 用户取消，移除该图片
                      console.log('用户取消重试，移除图片');
                      this.handleUploadError(imageItem, '已取消上传');
                      reject(new Error('用户取消上传'));
                    }
                  }
                });
              } else {
                // 其他错误
                this.handleUploadError(imageItem, error.message || '上传失败');
                reject(error);
              }
            }
          },
          fail: (error) => {
            console.error('获取文件信息失败:', error);
            this.handleUploadError(imageItem, '获取文件信息失败');
            reject(error);
          }
        });
      });
    },
    
    // 检查所有图片状态
    checkAllImagesStatus() {
      let hasUploadingImages = false;
      this.imageList.forEach(item => {
        if (item.uploading) {
          console.log('发现仍在上传中的图片，强制更新状态:', item.url);
          item.uploading = false;
          hasUploadingImages = true;
        }
      });
      
      if (hasUploadingImages) {
        this.$forceUpdate();
        this.emitChange();
      }
    },
    
    // 处理上传错误
    handleUploadError(imageItem, errorMessage) {
      // 从列表中移除失败的图片
      const index = this.imageList.findIndex(item => item === imageItem);
      if (index !== -1) {
        this.imageList.splice(index, 1);
      }
      
      // 增加完成计数
      this.completedUploads++;
      
      // 强制更新视图
      this.$forceUpdate();
      
      uni.showToast({
        title: errorMessage || '上传失败',
        icon: 'none'
      });
    },
    
    // 删除图片
    deleteImage(index) {
      // 如果正在上传，不允许删除
      if (this.imageList[index] && this.imageList[index].uploading) {
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
            this.imageList.splice(index, 1);
            this.emitChange();
          }
        }
      });
    },
    
    // 预览图片
    previewImage(index) {
      const urls = this.imageList.map(item => item.url);
      uni.previewImage({
        urls,
        current: urls[index]
      });
    },
    
    // 向父组件发送更新后的图片列表
    emitChange() {
      // 过滤并清理URL
      const urls = this.imageList
        .filter(item => {
          // 过滤掉上传中和无效URL的图片
          if (item.uploading) {
            console.log('过滤掉上传中的图片:', item.url);
            return false;
          }
          
          if (!item.url || typeof item.url !== 'string') {
            console.log('过滤掉无效URL的图片:', item.url);
            return false;
          }
          
          const trimmedUrl = item.url.trim();
          if (trimmedUrl.length === 0) {
            console.log('过滤掉空URL');
            return false;
          }
          
          // 验证URL格式
          if (trimmedUrl.startsWith('http://') || 
              trimmedUrl.startsWith('https://') || 
              trimmedUrl.startsWith('/')) {
            console.log('有效的图片URL:', trimmedUrl);
            return true;
          } else {
            console.log('过滤格式不正确的URL:', trimmedUrl);
            return false;
          }
        })
        .map(item => item.url.trim());
      
      console.log('向父组件发送更新后的图片列表:', urls);
      
      // 使用Vue.nextTick确保DOM更新后再发送数据
      this.$nextTick(() => {
        // 创建新数组避免引用问题
        const newUrls = [...urls];
        console.log('发送到父组件的最终图片列表:', newUrls);
        this.$emit('input', newUrls);
      });
    },
    
    // 清空图片列表
    clear() {
      this.imageList = [];
      this.$emit('input', []);
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
    margin-bottom: 20rpx;
    
    .uploader-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }
    
    .uploader-tip {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .image-list {
    display: flex;
    flex-wrap: wrap;
    
    .image-item, .add-image {
      width: 150rpx;
      height: 150rpx;
      margin-right: 15rpx;
      margin-bottom: 15rpx;
      position: relative;
      border-radius: 12rpx;
      overflow: hidden;
    }
    
    .image-item {
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .delete-btn {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 40rpx;
        height: 40rpx;
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
        
        .upload-text {
          color: #ffffff;
          font-size: 24rpx;
        }
      }
    }
    
    .add-image {
      border: 1px dashed #dcdfe6;
      background-color: #f8f8f8;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      
      .add-text {
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }
    }
  }
}
</style> 