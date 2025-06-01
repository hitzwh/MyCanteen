<template>
  <view class="container">
    <!-- 添加背景组件 -->
    <page-background></page-background>
    
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-arrow-left-s-line"></text>
      </view>
      <text class="header-title">发表评价</text>
    </view>

    <!-- 评论内容区域 -->
    <scroll-view class="comment-content" scroll-y>
      <!-- 菜品信息 -->
      <view class="dish-info card">
        <image class="dish-image" :src="dishDetail.image || '/static/images/default.jpg'" mode="aspectFill"></image>
        <view class="dish-detail">
          <text class="dish-name">{{ dishDetail.name }}</text>
          <text class="dish-price">¥{{ dishDetail.price }}</text>
        </view>
      </view>
      
      <!-- 评分区域 -->
      <view class="rating-section card">
        <text class="section-title">评分</text>
        <view class="rating-stars">
          <text 
            v-for="i in 5" 
            :key="i" 
            :class="['iconfont', i <= rating ? 'icon-star-fill' : 'icon-star-line']"
            @click="setRating(i)"
          ></text>
        </view>
        <text class="rating-text">{{ ratingTexts[rating - 1] || '请点击星星评分' }}</text>
      </view>
      
      <!-- 标签选择 -->
      <view class="tags-section card">
        <text class="section-title">添加标签</text>
        <view class="tags-container">
          <view 
            v-for="(tag, index) in tags" 
            :key="index"
            :class="['tag-item', selectedTags.includes(tag) ? 'active' : '']"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>
      
      <!-- 评论文本区域 -->
      <view class="comment-section card">
        <text class="section-title">评价内容</text>
        <view class="textarea-container">
          <textarea 
            class="comment-textarea" 
            v-model="commentText"
            placeholder="请输入您的评价内容，分享您的用餐体验..."
            maxlength="200"
          ></textarea>
          <text class="word-count">{{ commentText.length }}/200</text>
        </view>
      </view>
      
      <!-- 图片上传区域 -->
      <view class="upload-section card">
        <text class="section-title">上传图片（最多3张）</text>
        <view class="upload-container">
          <view 
            v-for="(img, index) in tempFilePaths" 
            :key="index"
            class="image-item"
          >
            <image :src="img" mode="aspectFill" @tap="previewImage(index)"></image>
            <view class="delete-icon" @tap="deleteImage(index)">
              <text class="iconfont icon-close-circle-line"></text>
            </view>
          </view>
          
          <view class="upload-btn" @tap="chooseImage" v-if="tempFilePaths.length < 3">
            <text class="iconfont icon-image-add-fill"></text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>
      
      <!-- 匿名评价选项 -->
      <view class="anonymous-section card">
        <text>匿名评价</text>
        <switch :checked="isAnonymous" @change="toggleAnonymous" color="#34c759" />
      </view>
      
      <!-- 底部空白区域，确保内容不被底部按钮遮挡 -->
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 底部提交按钮 -->
    <view class="bottom-submit safe-area-inset-bottom">
      <view 
        class="submit-button" 
        :class="{ 'disabled': !isFormValid }" 
        @click="submitComment"
      >
        <text>提交评价</text>
      </view>
    </view>
    
    <!-- 提交成功弹窗 -->
    <view class="popup-mask" v-if="showSuccessPopup"></view>
    <view class="success-popup card" v-if="showSuccessPopup">
      <view class="popup-icon">
        <text class="iconfont icon-check-circle-fill"></text>
      </view>
      <text class="popup-title">评价成功</text>
      <text class="popup-desc">感谢您的评价，获得5积分奖励！</text>
      <view class="popup-btn btn" @click="closeSuccessPopup">
        <text>确定</text>
      </view>
    </view>
    
    <!-- 已评价弹窗 -->
    <view class="popup-mask" v-if="showAlreadyRatedPopup"></view>
    <view class="already-rated-popup card" v-if="showAlreadyRatedPopup">
      <view class="popup-icon warning">
        <text class="iconfont icon-information-fill"></text>
      </view>
      <text class="popup-title">提示</text>
      <text class="popup-desc">{{ errorMessage || '您已经评价过该菜品' }}</text>
      <view class="popup-btn btn" @click="closeAlreadyRatedPopup">
        <text>我知道了</text>
      </view>
    </view>
  </view>
</template>

<script>
import PageBackground from '@/components/PageBackground.vue';
import { commentApi } from '@/api';
import { dishApi } from '@/api';
import { systemApi } from '@/api';
import { ref, computed, onMounted } from 'vue';

export default {
  components: {
    PageBackground
  },
  data() {
    return {
      dishId: '',
      windowId: '',
      windowName: '',
      dishDetail: {
        id: '',
        name: '',
        price: '',
        image: '/static/images/default.jpg'
      },
      rating: 5,
      ratingTexts: ['很差', '一般', '还行', '不错', '很好'],
      tags: ['味道好', '分量足', '价格实惠', '服务周到', '环境整洁', '出餐快'],
      selectedTags: [],
      commentText: '',
      uploadedImages: [],
      isAnonymous: false,
      showSuccessPopup: false,
      showAlreadyRatedPopup: false,
      errorMessage: '',
      tempFilePaths: [], // 临时文件路径
      maxImageCount: 3,
      submitting: false
    }
  },
  computed: {
    isFormValid() {
      // 至少需要评分和评论内容
      return this.rating > 0 && this.commentText.trim().length > 0;
    },
    isValid() {
      return this.rating > 0 && this.commentText.trim().length > 0;
    }
  },
  onLoad(options) {
    // 获取传递的菜品ID和窗口信息
    if (options.dishId) {
      this.dishId = options.dishId;
      this.loadDishDetail();
    }
    
    // 保存窗口ID和名称，用于返回时传递
    if (options.windowId) {
      this.windowId = options.windowId;
    }
    if (options.windowName) {
      this.windowName = decodeURIComponent(options.windowName);
    }
    
    console.log('评论页面加载参数:', options);
  },
  methods: {
    goBack() {
      console.log('点击返回按钮');
      
      // 构建返回URL
      let url = '/pages/index/dish-detail';
      const params = [];
      
      if (this.dishId) {
        params.push(`dishId=${this.dishId}`);
      }
      
      if (this.windowId) {
        params.push(`windowId=${this.windowId}`);
      }
      
      if (this.windowName) {
        params.push(`windowName=${encodeURIComponent(this.windowName)}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      console.log('返回到菜品详情页:', url);
      
      // 使用uni.reLaunch直接跳转，避免页面栈问题
      uni.reLaunch({
        url: url,
        success: () => {
          console.log('成功返回到菜品详情页');
        },
        fail: (err) => {
          console.error('reLaunch失败:', err);
          
          // 如果reLaunch失败，尝试使用redirectTo
          uni.redirectTo({
            url: url,
            fail: (err2) => {
              console.error('redirectTo也失败了:', err2);
              
              // 最后尝试返回首页
              uni.switchTab({
                url: '/pages/index/index',
                success: () => {
                  console.log('返回到首页成功');
                },
                fail: (err3) => {
                  console.error('所有导航方法都失败了:', err3);
                  uni.showToast({
                    title: '返回失败，请手动返回',
                    icon: 'none'
                  });
                }
              });
            }
          });
        }
      });
    },
    // 加载菜品详情
    async loadDishDetail() {
      console.log(`加载菜品ID为${this.dishId}的详情`);
      
      try {
        const res = await dishApi.getDishDetail(this.dishId);
        if (res && res.data) {
          const data = res.data;
          this.dishDetail = {
            id: data._id,
            name: data.name,
            price: data.price.toFixed(2),
            image: data.image || '/static/images/default.jpg'
          };
          
          console.log('获取菜品详情成功:', this.dishDetail);
        }
      } catch (error) {
        console.error('获取菜品详情失败:', error);
        uni.showToast({
          title: '获取菜品详情失败',
          icon: 'none'
        });
      }
    },
    // 设置评分
    setRating(value) {
      this.rating = value;
    },
    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index === -1) {
        // 如果标签不在已选列表中，添加它
        this.selectedTags.push(tag);
      } else {
        // 如果标签已在列表中，移除它
        this.selectedTags.splice(index, 1);
      }
    },
    // 选择图片
    chooseImage() {
      if (this.tempFilePaths.length >= this.maxImageCount) {
        uni.showToast({
          title: `最多选择${this.maxImageCount}张图片`,
          icon: 'none'
        });
        return;
      }
      
      uni.chooseImage({
        count: this.maxImageCount - this.tempFilePaths.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 更新临时文件路径
          this.tempFilePaths = [...this.tempFilePaths, ...res.tempFilePaths];
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
        }
      });
    },
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        urls: this.tempFilePaths,
        current: this.tempFilePaths[index]
      });
    },
    // 删除图片
    deleteImage(index) {
      this.tempFilePaths.splice(index, 1);
    },
    // 切换匿名评价
    toggleAnonymous(e) {
      this.isAnonymous = e.detail.value;
    },
    // 上传图片到服务器
    async uploadImage(filePath) {
      try {
        // 使用系统API上传图片，指定类型为dish
        const res = await systemApi.uploadImage(filePath, 'dish');
        if (res && res.data && res.data.url) {
          return res.data.url;
        } else {
          throw new Error('上传失败');
        }
      } catch (error) {
        console.error('上传图片失败:', error);
        throw error;
      }
    },
    // 上传图片
    async uploadImages() {
      if (this.tempFilePaths.length === 0) {
        return [];
      }
      
      uni.showLoading({
        title: '上传图片中...',
        mask: true
      });
      
      try {
        const uploadPromises = this.tempFilePaths.map(filePath => this.uploadImage(filePath));
        const urls = await Promise.all(uploadPromises);
        
        uni.hideLoading();
        return urls;
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        });
        throw error;
      }
    },
    // 提交评论
    async submitComment() {
      if (!this.isValid) {
        uni.showToast({
          title: '请填写评价内容',
          icon: 'none'
        });
        return;
      }
      
      if (!this.dishId) {
        uni.showToast({
          title: '菜品ID不存在',
          icon: 'none'
        });
        return;
      }
      
      if (this.submitting) {
        return;
      }
      
      this.submitting = true;
      uni.showLoading({
        title: '提交中...',
        mask: true
      });
      
      try {
        // 先上传图片
        let imageUrls = [];
        if (this.tempFilePaths.length > 0) {
          imageUrls = await this.uploadImages();
        }
        
        // 提交评论
        const res = await commentApi.submitComment({
          dishId: this.dishId,
          rating: this.rating,
          content: this.commentText.trim(),
          images: imageUrls,
          isAnonymous: this.isAnonymous
        });
        
        uni.hideLoading();
        
        // 提交成功，显示成功弹窗
        this.showSuccessPopup = true;
      } catch (error) {
        uni.hideLoading();
        console.error('提交评论失败:', error);
        
        // 处理"已经评价过该菜品"的错误
        if (error.statusCode === 400 && error.data && error.data.message) {
          this.errorMessage = error.data.message;
          this.showAlreadyRatedPopup = true;
        } else {
          // 其他错误
          uni.showToast({
            title: '提交失败，请重试',
            icon: 'none'
          });
        }
      } finally {
        this.submitting = false;
      }
    },
    // 关闭成功弹窗
    closeSuccessPopup() {
      this.showSuccessPopup = false;
      
      // 延迟一下再返回，让动画效果完成
      setTimeout(() => {
        this.goBack();
      }, 300);
    },
    // 关闭已评价弹窗
    closeAlreadyRatedPopup() {
      this.showAlreadyRatedPopup = false;
      
      // 延迟一下再返回，让动画效果完成
      setTimeout(() => {
        this.goBack();
      }, 300);
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* 防止水平滚动 */
}

.status-bar {
  height: var(--status-bar-height, 44px);
}

.nav-header {
  position: relative;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  z-index: 100;
}

.back-icon {
  position: absolute;
  left: 20rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.back-icon:active {
  transform: scale(0.95);
  background: rgba(234, 234, 234, 0.9);
}

.back-icon .iconfont {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.comment-content {
  flex: 1;
  padding: 20rpx 30rpx;
  margin-bottom: 120rpx; /* 增加底部间距，避免内容被底部按钮遮挡 */
  box-sizing: border-box;
  width: 100%;
}

.dish-info {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.dish-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  object-fit: cover;
  flex-shrink: 0;
}

.dish-detail {
  flex: 1;
  min-width: 0; /* 确保flex子项可以正确缩小 */
}

.dish-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-price {
  font-size: 30rpx;
  color: #ff6200;
  font-weight: 600;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  position: relative;
  padding-left: 20rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 24rpx;
  background: linear-gradient(to bottom, #34c759, #32ade6);
  border-radius: 3rpx;
}

.rating-section,
.tags-section,
.comment-section,
.upload-section,
.anonymous-section {
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.rating-stars {
  display: flex;
  margin-bottom: 20rpx;
  flex-wrap: wrap; /* 允许星星在需要时换行 */
}

.rating-stars .iconfont {
  font-size: 50rpx;
  color: #ddd;
  margin-right: 20rpx;
  margin-bottom: 10rpx;
}

.rating-stars .icon-star-fill {
  color: #ff9500;
}

.rating-text {
  font-size: 28rpx;
  color: #666;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  background-color: #f5f5f5;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
  margin-bottom: 10rpx;
}

.tag-item.active {
  background-color: rgba(52, 199, 89, 0.1);
  color: #34c759;
  font-weight: 600;
}

.tag-item:active {
  transform: scale(0.95);
}

.textarea-container {
  position: relative;
  width: 100%;
}

.comment-textarea {
  width: 100%;
  height: 240rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  background-color: rgba(245, 246, 247, 0.8);
  border-radius: 12rpx;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.word-count {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
}

.image-item image {
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
}

.delete-icon .iconfont {
  font-size: 24rpx;
  color: #fff;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(245, 246, 247, 0.8);
  transition: all 0.3s ease;
}

.upload-btn .iconfont {
  font-size: 50rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-btn .upload-text {
  font-size: 24rpx;
  color: #999;
}

.upload-btn:active {
  background-color: rgba(245, 246, 247, 0.9);
  transform: scale(0.98);
}

.anonymous-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.anonymous-section text {
  font-size: 30rpx;
  color: #333;
}

.bottom-space {
  height: 80rpx; /* 底部额外空间，确保滚动时内容不被底部按钮遮挡 */
}

.bottom-submit {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
}

.submit-button {
  height: 90rpx;
  background: linear-gradient(135deg, #34c759, #32ade6);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 8rpx 20rpx rgba(52, 199, 89, 0.3);
  transition: all 0.3s ease;
}

.submit-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(52, 199, 89, 0.2);
}

.submit-button.disabled {
  background: linear-gradient(135deg, #ccc, #ddd);
  box-shadow: none;
  color: rgba(255, 255, 255, 0.8);
}

/* 成功弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(5px);
}

.success-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  z-index: 101;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  animation: popup-fade-in 0.3s ease;
  box-sizing: border-box;
}

.popup-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: rgba(52, 199, 89, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.popup-icon .iconfont {
  font-size: 80rpx;
  color: #34c759;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.popup-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.popup-btn {
  width: 80%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 20rpx;
}

@keyframes popup-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style> 