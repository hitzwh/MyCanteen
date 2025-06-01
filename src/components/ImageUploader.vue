<template>
  <view class="image-uploader">
    <view class="image-list">
      <!-- 已上传图片列表 -->
      <view 
        v-for="(image, index) in imageList" 
        :key="index" 
        class="image-item"
      >
        <image 
          :src="image.url" 
          mode="aspectFill" 
          @click="previewImage(index)"
        />
        <view class="delete-icon" @click.stop="deleteImage(index)">×</view>
        <view v-if="image.uploading" class="upload-mask">
          <view class="upload-progress">{{image.progress}}%</view>
        </view>
      </view>
      
      <!-- 添加图片按钮 -->
      <view 
        v-if="imageList.length < maxCount" 
        class="add-image" 
        @click="chooseImage"
      >
        <view class="add-icon">+</view>
        <view class="add-text">{{ tips }}</view>
      </view>
    </view>
    
    <!-- 提示信息 -->
    <view v-if="showTips" class="tips">{{ tips }}</view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { uploadImage, uploadBase64Image } from '../api/worker';
import request from '../utils/request';

// 定义组件属性
const props = defineProps({
  // 已有的图片列表
  value: {
    type: Array,
    default: () => []
  },
  // 最大图片数量
  maxCount: {
    type: Number,
    default: 9
  },
  // 图片类型
  imageType: {
    type: String,
    default: 'other' // 可选值: canteen/window/dish/other/avatar
  },
  // 提示文字
  tips: {
    type: String,
    default: '点击添加图片'
  },
  // 是否显示提示
  showTips: {
    type: Boolean,
    default: true
  }
});

// 定义事件
const emit = defineEmits(['update:value', 'upload-success', 'upload-error']);

// 图片列表
const imageList = ref([...props.value]);
// 是否正在上传中
const isUploading = ref(false);

// 监听图片列表变化
watch(() => props.value, (newVal) => {
  imageList.value = [...newVal];
}, { deep: true });

// 监听内部图片列表变化，向父组件发送更新
watch(imageList, (newVal) => {
  emit('update:value', [...newVal]);
}, { deep: true });

// 选择图片
const chooseImage = async () => {
  // 如果正在上传，则不允许选择新图片
  if (isUploading.value) {
    uni.showToast({
      title: '正在上传中，请稍候',
      icon: 'none'
    });
    return;
  }
  
  try {
    const remainCount = props.maxCount - imageList.value.length;
    if (remainCount <= 0) return;
    
    const res = await uni.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    });
    
    if (res && res.tempFilePaths && res.tempFilePaths.length > 0) {
      await processAndUploadImages(res.tempFilePaths);
    }
  } catch (error) {
    console.error('选择图片失败:', error);
    uni.showToast({
      title: '选择图片失败',
      icon: 'none'
    });
  }
};

// 处理并上传图片
const processAndUploadImages = async (filePaths) => {
  isUploading.value = true;
  
  try {
    // 显示上传中提示
    uni.showLoading({
      title: '准备上传...',
      mask: true
    });
    
    // 添加图片到列表，显示为上传中状态
    const newImages = filePaths.map(path => ({
      url: path,
      uploading: true,
      progress: 0,
      retryCount: 0
    }));
    
    // 添加到图片列表
    imageList.value.push(...newImages);
    
    // 压缩并上传图片
    const uploadPromises = newImages.map((image, index) => 
      compressAndUploadImage(image, filePaths[index])
    );
    
    // 并行上传所有图片
    await Promise.all(uploadPromises);
    
    // 隐藏上传中提示
    uni.hideLoading();
  } catch (error) {
    console.error('上传过程中出错:', error);
    uni.hideLoading();
    uni.showToast({
      title: '上传过程中出错',
      icon: 'none'
    });
  } finally {
    isUploading.value = false;
  }
};

// 压缩并上传单张图片
const compressAndUploadImage = async (imageItem, filePath) => {
  try {
    // 压缩图片
    const compressedPath = await compressImage(filePath);
    
    // 上传图片，最多重试3次
    let success = false;
    let error = null;
    
    while (!success && imageItem.retryCount < 3) {
      try {
        const result = await uploadWithProgress(compressedPath, imageItem);
        imageItem.url = result.data.url;
        imageItem.uploading = false;
        imageItem.progress = 100;
        success = true;
        emit('upload-success', result.data);
      } catch (err) {
        error = err;
        imageItem.retryCount++;
        
        if (imageItem.retryCount < 3) {
          console.log(`上传失败，第${imageItem.retryCount}次重试...`);
          // 重试前等待一秒
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!success) {
      throw error || new Error('上传失败，已达到最大重试次数');
    }
  } catch (error) {
    console.error('图片处理或上传失败:', error);
    emit('upload-error', error);
    
    // 从列表中移除上传失败的图片
    const index = imageList.value.findIndex(item => item === imageItem);
    if (index !== -1) {
      imageList.value.splice(index, 1);
    }
    
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    });
  }
};

// 压缩图片
const compressImage = (filePath) => {
  return new Promise((resolve, reject) => {
    // 获取图片信息
    uni.getImageInfo({
      src: filePath,
      success: (imageInfo) => {
        // 如果图片尺寸较大，进行压缩
        if (imageInfo.width > 1024 || imageInfo.height > 1024) {
          // 使用Canvas进行压缩，兼容H5环境
          compressImageByCanvas(filePath, imageInfo, 1024, 0.8)
            .then(compressedPath => {
              resolve(compressedPath);
            })
            .catch(err => {
              console.warn('图片压缩失败，使用原图:', err);
              resolve(filePath); // 压缩失败则使用原图
            });
        } else {
          // 图片尺寸不大，直接使用
          resolve(filePath);
        }
      },
      fail: (err) => {
        console.warn('获取图片信息失败:', err);
        resolve(filePath); // 获取信息失败则使用原图
      }
    });
  });
};

// 使用Canvas压缩图片
const compressImageByCanvas = (src, imageInfo, maxSize, quality) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // 计算压缩后的尺寸，保持宽高比
    let width = imageInfo.width;
    let height = imageInfo.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 处理图片跨域问题
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 导出为base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        
        // 在非H5环境下，需要将base64转为本地临时文件
        // 但在H5环境中，可以直接使用base64
        if (typeof plus !== 'undefined') {
          // App环境
          const bitmap = new plus.nativeObj.Bitmap();
          bitmap.loadBase64Data(base64, () => {
            const fileName = `_doc/compressed_${Date.now()}.jpg`;
            bitmap.save(fileName, {}, () => {
              bitmap.clear();
              resolve(fileName);
            }, (err) => {
              bitmap.clear();
              reject(err);
            });
          }, (err) => {
            reject(err);
          });
        } else {
          // H5环境，直接返回base64
          resolve(base64);
        }
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = (err) => {
      reject(err);
    };
    
    // 加载图片
    img.src = src;
  });
};

// 带进度的上传
const uploadWithProgress = (filePath, imageItem) => {
  return new Promise((resolve, reject) => {
    // 检查是否为base64格式
    const isBase64 = filePath.startsWith('data:image');
    
    if (isBase64) {
      // 处理base64格式的图片数据
      processBase64Upload(filePath, imageItem)
        .then(resolve)
        .catch(reject);
    } else {
      // 处理文件路径
      const uploadTask = uni.uploadFile({
        url: `${request.BASE_URL}/worker/upload/image`,
        filePath,
        name: 'file',
        formData: { type: props.imageType },
        header: getAuthHeader(),
        success: (response) => {
          try {
            const res = JSON.parse(response.data);
            if (res.code !== 0) {
              reject(res);
              return;
            }
            resolve(res);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
      
      // 监听上传进度
      uploadTask.onProgressUpdate((res) => {
        imageItem.progress = res.progress;
      });
    }
  });
};

// 上传base64格式的图片
const processBase64Upload = (base64, imageItem) => {
  return new Promise((resolve, reject) => {
    // 模拟上传进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        imageItem.progress = progress;
      }
    }, 200);
    
    // 从base64中提取图片数据
    const base64Data = base64.split(',')[1];
    const contentType = base64.split(';')[0].split(':')[1];
    
    // 使用导入的uploadBase64Image函数
    uploadBase64Image(base64Data, contentType, props.imageType)
      .then(res => {
        clearInterval(progressInterval);
        imageItem.progress = 100;
        resolve(res);
      })
      .catch(error => {
        clearInterval(progressInterval);
        reject(error);
      });
  });
};

// 获取认证头
const getAuthHeader = () => {
  const token = uni.getStorageSync('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    current: imageList.value[index],
    urls: imageList.value.map(item => item.url)
  });
};

// 删除图片
const deleteImage = (index) => {
  // 如果正在上传，不允许删除
  if (imageList.value[index].uploading) {
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
        imageList.value.splice(index, 1);
      }
    }
  });
};
</script>

<style lang="scss">
.image-uploader {
  width: 100%;
  padding: 20rpx 0;
  
  .image-list {
    display: flex;
    flex-wrap: wrap;
    
    .image-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;
      margin: 10rpx;
      border-radius: 8rpx;
      overflow: hidden;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .delete-icon {
        position: absolute;
        top: 0;
        right: 0;
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 32rpx;
        text-align: center;
        line-height: 36rpx;
        z-index: 10;
      }
      
      .upload-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 5;
        
        .upload-progress {
          font-size: 28rpx;
          color: #fff;
          font-weight: bold;
        }
      }
    }
    
    .add-image {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 200rpx;
      height: 200rpx;
      margin: 10rpx;
      background-color: #f5f5f5;
      border: 1px dashed #ddd;
      border-radius: 8rpx;
      
      .add-icon {
        font-size: 60rpx;
        color: #999;
        line-height: 60rpx;
      }
      
      .add-text {
        font-size: 24rpx;
        color: #999;
        margin-top: 10rpx;
      }
    }
  }
  
  .tips {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    padding-left: 10rpx;
  }
}
</style> 