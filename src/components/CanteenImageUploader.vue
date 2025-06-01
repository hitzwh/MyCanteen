<template>
  <view class="image-uploader">
    <view class="uploader-header">
      <text class="uploader-title">食堂图片</text>
      <text class="uploader-tip">最多上传5张图片</text>
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
import { uploadImage as workerUploadImage } from '@/api/worker';
import request from '@/utils/request';
import { previewImages } from '@/utils/image-preview';

export default {
  name: 'CanteenImageUploader',
  props: {
    // 已有的图片列表
    value: {
      type: Array,
      default: () => []
    },
    // 最大上传数量
    maxCount: {
      type: Number,
      default: 5
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
        if (newVal && newVal.length) {
          // 保持已上传图片的状态
          const currentUrls = this.imageList.filter(img => !img.uploading).map(img => img.url);
          const newUrls = newVal.filter(url => !currentUrls.includes(url));
          
          if (newUrls.length > 0 || newVal.length !== currentUrls.length) {
            console.log('更新组件内部图片列表', newVal);
            this.imageList = newVal.map(url => ({
              url,
              uploading: false
            }));
          }
        } else if (newVal && newVal.length === 0 && this.imageList.length > 0) {
          // 如果父组件的值被清空，也清空本地列表
          console.log('父组件清空了图片列表，同步清空本地列表');
          this.imageList = [];
        }
      },
      immediate: true
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
          const tempFiles = res.tempFiles;
          console.log('选择的图片:', tempFilePaths);
          console.log('选择的图片文件信息:', tempFiles);
          
          if (tempFilePaths && tempFilePaths.length > 0) {
            // 直接开始上传，不显示确认弹窗
            console.log('用户选择了图片，直接开始上传');
            this.processAndUploadImages(tempFilePaths);
          }
          // 重置选择状态在processAndUploadImages完成后会设置
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
    
    // 处理并上传图片
    async processAndUploadImages(filePaths) {
      // 防止重复上传
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
          tempPath: path  // 保存临时路径用于上传
        }));
        
        this.imageList.push(...newImages);
        
        // 上传所有图片
        const uploadPromises = newImages.map(image => 
          this.uploadSingleImage(image)
        );
        
        // 并行上传所有图片
        await Promise.all(uploadPromises);
        
        console.log('所有图片上传完成');
      } catch (error) {
        console.error('上传过程中出错:', error);
      } finally {
        this.isUploading = false;
      }
    },
    
    // 上传单张图片
    async uploadSingleImage(imageItem) {
      try {
        console.log('开始上传图片:', imageItem.tempPath);
        
        // 标记为上传中状态
        imageItem.uploading = true;
        
        try {
          console.log('准备上传图片到服务器');
          
          // 使用worker的uploadImage方法，简化上传过程
          const result = await workerUploadImage(imageItem.tempPath, 'canteen');
          
          console.log('上传结果:', JSON.stringify(result));
          
          // 检查不同的响应格式，提取URL
          let imageUrl = null;
          
          if (result && result.code === 0) {
            // 标准格式: {code: 0, data: {url: '...'}}
            if (result.data && result.data.url) {
              imageUrl = result.data.url;
            } 
            // 替代格式: {code: 0, url: '...'}
            else if (result.url) {
              imageUrl = result.url;
            }
          } 
          // 另一种格式: {success: true, url: '...'}
          else if (result && result.success && result.url) {
            imageUrl = result.url;
          }
          
          if (imageUrl) {
            // 更新URL和状态
            imageItem.url = imageUrl;
            imageItem.uploading = false;
            
            // 增加完成计数
            this.completedUploads++;
            
            console.log('图片上传成功, URL:', imageUrl);
            console.log('更新后的图片项:', JSON.stringify(imageItem));
            
            // 立即触发更新
            this.$nextTick(() => {
              this.emitChange();
            });
            
            // 检查是否所有上传都已完成
            if (this.completedUploads === this.totalUploads) {
              this.isUploading = false;
              console.log('所有图片上传任务已完成');
              
              // 确保完成后再触发一次更新
              setTimeout(() => {
                this.emitChange();
              }, 300);
            }
            
            return result;
          } else {
            console.error('上传成功但返回格式不符合预期:', result);
            throw new Error('上传失败: 返回结果不包含有效的URL');
          }
        } catch (error) {
          console.error('上传请求失败:', error);
          this.handleUploadError(imageItem, error.message || '上传失败');
          throw error;
        }
      } catch (error) {
        console.error('图片上传异常:', error);
        this.handleUploadError(imageItem, '图片上传失败');
        throw error;
      }
    },
    
    // 处理上传错误
    handleUploadError(imageItem, errorMessage) {
      // 移除上传失败的图片
      const index = this.imageList.findIndex(item => item === imageItem);
      if (index !== -1) {
        this.imageList.splice(index, 1);
      }
      
      // 显示错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
      
      // 减少总上传数，因为这张图片已经失败并被移除
      this.totalUploads--;
      
      // 如果所有上传都已处理完毕，重置上传状态
      if (this.completedUploads === this.totalUploads) {
        this.isUploading = false;
        console.log('所有图片上传任务已处理完毕（包含失败的）');
      }
    },
    
    // 获取认证头
    getAuthHeader() {
      const token = uni.getStorageSync('token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    
    // 删除图片
    deleteImage(index) {
      // 如果正在上传，不允许删除
      if (this.imageList[index].uploading) {
        uni.showToast({
          title: '上传中，无法删除',
          icon: 'none'
        });
        return;
      }
      
      // 直接删除图片，不显示确认弹窗
      console.log('删除图片:', this.imageList[index].url);
      this.imageList.splice(index, 1);
      this.emitChange();
    },
    
    // 预览图片
    previewImage(index) {
      const urls = this.imageList.map(item => item.url);
      
      // 使用增强的预览工具函数
      previewImages(urls, urls[index]);
    },
    
    // 向父组件发送更新后的图片列表
    emitChange() {
      // 只取非上传中的图片URL列表
      const urls = this.imageList
        .filter(item => !item.uploading)
        .map(item => item.url);
      
      console.log('向父组件发送更新的图片列表:', urls, '长度:', urls.length);
      console.log('当前图片列表详情:', JSON.stringify(this.imageList));
      
      // 检查URL列表中是否有空值或无效值
      const invalidUrls = urls.filter(url => !url || url === 'undefined' || url === 'null');
      if (invalidUrls.length > 0) {
        console.warn('发现无效的URL值在列表中:', invalidUrls);
        // 过滤掉无效URL
        const validUrls = urls.filter(url => url && url !== 'undefined' && url !== 'null');
        console.log('过滤后的有效URL列表:', validUrls);
        this.$emit('input', JSON.parse(JSON.stringify(validUrls)));
        return;
      }
      
      // 强制创建新数组，确保Vue能检测到变化
      const newUrls = [...urls];
      
      // 向父组件发送值 - 使用深拷贝确保值传递正确
      this.$emit('input', JSON.parse(JSON.stringify(newUrls)));
      this.$emit('update:modelValue', JSON.parse(JSON.stringify(newUrls))); // Vue 3 语法
      this.$emit('change', JSON.parse(JSON.stringify(newUrls))); // 自定义事件
      
      // 使用nextTick确保DOM更新后再次检查
      this.$nextTick(() => {
        // 检查父组件的值是否与我们发送的一致
        if (JSON.stringify(this.value) !== JSON.stringify(newUrls)) {
          console.log('父组件未正确接收图片更新，再次发送:', newUrls);
          
          // 延迟发送，确保父组件能接收到更新
          setTimeout(() => {
            console.log('延迟发送更新，确保父组件接收到:', newUrls);
            this.$emit('input', JSON.parse(JSON.stringify(newUrls)));
          }, 300);
        } else {
          console.log('父组件已正确接收图片更新');
        }
      });
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
        
        .upload-text {
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