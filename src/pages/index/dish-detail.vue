<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">菜品详情</text>
    </view>

    <!-- 菜品详情内容 -->
    <scroll-view class="dish-detail-content" scroll-y>
      <!-- 菜品图片 -->
      <view class="dish-image-container">
        <image class="dish-image" :src="dishDetail.image || '/static/images/white.jpg'" mode="aspectFill"></image>
        <view class="sold-out-overlay" v-if="dishDetail.status === 'soldout'">
          <text>已售罄</text>
        </view>
        <view class="dish-favorite" @tap="toggleFavorite">
          <text :class="['iconfont', isFavorite ? 'icon-heart-fill' : 'icon-heart-line']"></text>
        </view>
      </view>
      
      <!-- 菜品基本信息 -->
      <view class="dish-info-container">
        <view class="dish-name-price">
          <text class="dish-name">{{ dishDetail.name }}</text>
          <text class="dish-price">¥ {{ dishDetail.price }}</text>
        </view>
        
        <view class="dish-status" v-if="dishDetail.status === 'soldout'">
          <text class="iconfont icon-error-warning-line"></text>
          <text>该菜品已售罄，暂不可预订</text>
        </view>
        
        <view class="dish-rating">
          <text class="rating-label">评分：</text>
          <view class="rating-stars">
            <text 
              v-for="i in 5" 
              :key="i" 
              :class="['iconfont', i <= dishDetail.rating ? 'icon-star-fill' : 'icon-star-line']"
            ></text>
          </view>
          <text class="rating-value">{{ dishDetail.rating || 4.5 }}</text>
        </view>
        
        <!-- 添加预订次数提示 -->
        <view class="order-limit-tip">
          <text class="iconfont icon-notification-4-line"></text>
          <text>今日剩余预订次数：{{ maxOrderCount - orderCount }}</text>
        </view>
        
        <view class="dish-description">
          <text>{{ dishDetail.description }}</text>
        </view>
      </view>
      
      <!-- 评价区域 -->
      <view class="comment-section">
        <view class="section-header">
          <text class="section-title">
            <text class="iconfont icon-message-3-line"></text>
            <text class="title-text">评价</text>
          </text>
          <view class="comment-tabs">
            <view 
              v-for="(tab, index) in commentTabs" 
              :key="index" 
              :class="['tab-item', currentTab === index ? 'active' : '']"
              @tap="switchTab(index)"
            >
              {{ tab.text }}
            </view>
          </view>
        </view>
        
        <!-- 评论列表 -->
        <view class="comment-list">
          <view 
            class="comment-item" 
            v-for="(comment, index) in filteredComments" 
            :key="index"
          >
            <view class="comment-user">
              <image class="user-avatar" :src="comment.avatar || '/static/images/default.jpg'" mode="aspectFill"></image>
              <view class="user-info">
                <text class="user-name">{{ comment.userName }}</text>
                <text class="comment-date">{{ comment.date }}</text>
              </view>
              <view class="comment-like" @tap="likeComment(comment)">
                <text :class="['iconfont', 'icon-thumb-up-line', comment.isLiked ? 'liked' : '']"></text>
                <text class="like-count">{{ comment.likeCount || 0 }}</text>
              </view>
            </view>
            <view class="comment-content">
              <text>{{ comment.content }}</text>
            </view>
            <view class="comment-images" v-if="comment.images && comment.images.length > 0">
              <image 
                v-for="(img, imgIndex) in comment.images" 
                :key="imgIndex" 
                :src="img" 
                mode="aspectFill"
                @tap="previewImage(comment.images, imgIndex)"
              ></image>
            </view>
          </view>
          
          <!-- 无评论提示 -->
          <view class="empty-comment" v-if="filteredComments.length === 0">
            <text class="iconfont icon-message-3-line"></text>
            <text>暂无评论</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作区 -->
    <view class="bottom-actions safe-area-inset-bottom">
      <view class="action-btn comment-btn" @tap="showCommentInput">
        <text class="iconfont icon-message-3-line"></text>
        <text>评价</text>
      </view>
      <view 
        :class="['action-btn', 'order-btn', dishDetail.status === 'soldout' ? 'disabled-btn' : '']" 
        @tap="showOrderConfirm"
      >
        <text class="iconfont" :class="dishDetail.status === 'soldout' ? 'icon-close-circle-line' : 'icon-add-circle-line'"></text>
        <text>{{ dishDetail.status === 'soldout' ? '已售罄' : '预订' }}</text>
      </view>
    </view>
    
    <!-- 预订确认弹窗 -->
    <view class="popup-mask" v-if="showOrderPopup" @click="closeOrderPopup"></view>
    <view class="order-popup" v-if="showOrderPopup">
      <view class="popup-header">
        <text class="popup-title">预订确认</text>
        <view class="popup-close" @click="closeOrderPopup">
          <text class="iconfont icon-close-circle-line"></text>
        </view>
      </view>
      
      <view class="popup-content">
        <view v-if="!orderSuccess">
          <view class="order-dish-info">
            <image class="order-dish-image" :src="dishDetail.image || '/static/images/default.jpg'" mode="aspectFill"></image>
            <view class="order-dish-detail">
              <text class="order-dish-name">{{ dishDetail.name }}</text>
              <text class="order-dish-price">¥ {{ dishDetail.price }}</text>
            </view>
          </view>
          
          <view class="order-quantity">
            <text class="quantity-label">数量</text>
            <view class="quantity-control">
              <view class="quantity-btn" @tap="changeQuantity(-1)">
                <text class="iconfont">-</text>
              </view>
              <text class="quantity-value">{{ orderQuantity }}</text>
              <view class="quantity-btn" @tap="changeQuantity(1)">
                <text class="iconfont">+</text>
              </view>
            </view>
          </view>
          
          <view class="order-notice">
            <text class="iconfont icon-notification-4-line"></text>
            <text>每人每天最多可预订3次</text>
          </view>
          
          <view class="order-total">
            <text class="total-label">合计</text>
            <text class="total-price">¥ {{ (dishDetail.price * orderQuantity).toFixed(2) }}</text>
          </view>
        </view>
        
        <view v-else class="order-success">
          <view class="success-icon">
            <text class="iconfont icon-check-fill"></text>
          </view>
          <text class="success-title">预订成功</text>
          <text class="success-desc">您已成功预订{{ orderQuantity }}份{{ dishDetail.name }}</text>
          <text class="success-tip">今日剩余预订次数：{{ maxOrderCount - orderCount }}</text>
        </view>
      </view>
      
      <view class="popup-footer" v-if="!orderSuccess">
        <view class="popup-btn cancel-btn" @tap="closeOrderPopup">
          <text>取消</text>
        </view>
        <view class="popup-btn confirm-btn" :class="{ 'loading': orderLoading }" @tap="submitOrder">
          <text v-if="!orderLoading">确认预订</text>
          <view v-else class="loading-icon"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { dishApi } from '@/api';
import { commentApi } from '@/api';
import { userApi } from '@/api';

export default {
  data() {
    return {
      dishId: '',
      windowId: '',
      windowName: '',
      isFavorite: false,
      loading: false,
      commentLoading: false,
      // 添加预订相关数据
      orderCount: 0, // 今日已预订次数
      maxOrderCount: 3, // 每日最大预订次数
      showOrderPopup: false, // 是否显示预订弹窗
      orderQuantity: 1, // 预订数量
      orderLoading: false, // 预订加载状态
      orderSuccess: false, // 预订成功状态
      dishDetail: {
        id: '',
        name: '',
        price: '0.00',
        description: '',
        image: '/static/images/white.jpg',
        rating: 0,
        ratingCount: 0
      },
      commentTabs: [
        { value: 'all', text: '全部评论' },
        { value: 'good', text: '好评' },
        { value: 'medium', text: '中评' },
        { value: 'bad', text: '差评' }
      ],
      currentTab: 0,
      comments: [],
      currentPage: 1,
      pageSize: 10,
      hasMore: true
    }
  },
  computed: {
    filteredComments() {
      if (this.currentTab === 0) {
        return this.comments;
      } else {
        const tabType = this.commentTabs[this.currentTab].value;
        return this.comments.filter(comment => comment.type === tabType);
      }
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
    
    // 加载用户今日预订次数
    this.loadOrderCount();
    
    // 加载评论
    this.loadComments();
  },
  methods: {
    goBack() {
      // 尝试返回上一页
      if (this.windowId || this.windowName) {
        // 如果有窗口信息，则返回到对应的菜品列表页
        let url = '/pages/index/dish-list';
        if (this.windowId) {
          url += `?windowId=${this.windowId}`;
        }
        if (this.windowName) {
          url += `${this.windowId ? '&' : '?'}windowName=${encodeURIComponent(this.windowName)}`;
        }
        
        uni.redirectTo({
          url: url,
          success: () => {
            console.log('成功返回到菜品列表页');
          },
          fail: (err) => {
            console.error('返回菜品列表页失败:', err);
            // 如果redirectTo失败，尝试navigateTo
            uni.navigateTo({
              url: url,
              fail: (err2) => {
                console.error('navigateTo也失败了:', err2);
                // 最后尝试返回首页
                uni.switchTab({
                  url: '/pages/index/index'
                });
              }
            });
          }
        });
      } else {
        // 尝试普通的返回
          fail: () => {
            // 如果返回失败，则跳转到菜品列表页
            uni.redirectTo({
              url: '/pages/index/dish-list',
              fail: () => {
                // 如果redirectTo失败，尝试navigateTo
                uni.navigateTo({
                  url: '/pages/index/dish-list'
                });
              }
            });
          }
        };
      },
    // 加载菜品详情
    async loadDishDetail() {
      if (!this.dishId) {
        uni.showToast({
          title: '菜品ID不存在',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      try {
        const res = await dishApi.getDishDetail(this.dishId);
        if (res && res.data) {
          const data = res.data;
          this.dishDetail = {
            id: data._id,
            name: data.name,
            price: data.price.toFixed(2),
            description: data.description || '暂无描述',
            image: data.image || '/static/images/default.jpg',
            rating: data.rating || 0,
            ratingCount: data.ratingCount || 0,
            status: data.status || 'available'
          };
          
          // 设置收藏状态
          this.isFavorite = !!data.isFavorite;
          
          // 如果有窗口信息，保存窗口ID和名称
          if (data.windowId && !this.windowId) {
            this.windowId = data.windowId._id;
            this.windowName = data.windowId.name;
          }
          
          console.log('获取菜品详情成功:', this.dishDetail);
        }
      } catch (error) {
        console.error('获取菜品详情失败:', error);
        uni.showToast({
          title: '获取菜品详情失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载评论
    async loadComments(refresh = false) {
      if (!this.dishId) return;
      if (this.commentLoading) return;
      
      // 如果刷新，重置页码
      if (refresh) {
        this.currentPage = 1;
        this.hasMore = true;
      }
      
      // 如果没有更多数据，直接返回
      if (!this.hasMore && !refresh) return;
      
      this.commentLoading = true;
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        };
        
        const res = await commentApi.getCommentsByDish(this.dishId, params);
        if (res && res.data) {
          const commentList = res.data.list.map(item => {
            // 根据评分判断评价类型
            let type = 'medium';
            if (item.rating >= 4) {
              type = 'good';
            } else if (item.rating <= 2) {
              type = 'bad';
            }
            
            return {
              id: item._id,
              userName: item.userId.username,
              avatar: item.userId.avatar || '/static/images/default.jpg',
              date: this.formatDate(item.createdAt),
              content: item.content,
              type: type,
              rating: item.rating,
              likeCount: 0, // API中没有点赞数据，默认为0
              isLiked: false,
              images: item.images || []
            };
          });
          
          // 如果是刷新，替换数据；否则，追加数据
          if (refresh) {
            this.comments = commentList;
          } else {
            this.comments = [...this.comments, ...commentList];
          }
          
          // 更新分页信息
          this.hasMore = commentList.length === this.pageSize;
          if (this.hasMore) {
            this.currentPage++;
          }
          
          console.log('获取评论成功:', commentList);
        }
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        this.commentLoading = false;
      }
    },
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      return `${year}/${month}/${day}`;
    },
    
    // 切换评论标签
    switchTab(index) {
      this.currentTab = index;
    },
    // 预览图片
    previewImage(images, current) {
      uni.previewImage({
        urls: images,
        current: images[current]
      });
    },
    // 显示评论输入框
    showCommentInput() {
      // 跳转到评论页面
      let url = '/pages/index/dish-comment';
      if (this.dishId) {
        url += `?dishId=${this.dishId}`;
        if (this.windowId) {
          url += `&windowId=${this.windowId}`;
        }
        if (this.windowName) {
          url += `&windowName=${encodeURIComponent(this.windowName)}`;
        }
      }
      
      uni.navigateTo({
        url: url,
        fail: (err) => {
          console.error('跳转到评论页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 收藏/取消收藏
    async toggleFavorite() {
      try {
        const action = this.isFavorite ? 'remove' : 'add';
        await userApi.toggleFavorite({
          dishId: this.dishId,
          action: action
        });
        
        this.isFavorite = !this.isFavorite;
        uni.showToast({
          title: this.isFavorite ? '已收藏' : '已取消收藏',
          icon: 'success'
        });
      } catch (error) {
        console.error('收藏操作失败:', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    // 点赞评论
    likeComment(comment) {
      comment.isLiked = !comment.isLiked;
      if (comment.isLiked) {
        comment.likeCount = (comment.likeCount || 0) + 1;
      } else {
        comment.likeCount = Math.max(0, (comment.likeCount || 1) - 1);
      }
    },
    // 加载用户今日预订次数
    loadOrderCount() {
      // 实际项目中，应该从服务器或本地存储获取用户今日已预订次数
      // 这里使用模拟数据
      this.orderCount = Math.floor(Math.random() * 3); // 随机生成0-2的数字作为已预订次数
      console.log(`今日已预订次数: ${this.orderCount}`);
    },
    
    // 点击预订按钮
    showOrderConfirm() {
      // 如果菜品已售罄，显示提示并直接返回
      if (this.dishDetail.status === 'soldout') {
        uni.showToast({
          title: '该菜品已售罄，无法预订',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 检查是否还有预订次数
      if (this.orderCount >= this.maxOrderCount) {
        uni.showToast({
          title: '今日预订次数已用完',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 显示预订确认弹窗
      this.showOrderPopup = true;
    },
    
    // 关闭预订弹窗
    closeOrderPopup() {
      this.showOrderPopup = false;
      // 如果预订成功后，重置状态
      if (this.orderSuccess) {
        setTimeout(() => {
          this.orderSuccess = false;
          this.orderQuantity = 1;
        }, 300);
      }
    },
    
    // 修改预订数量
    changeQuantity(delta) {
      const newQuantity = this.orderQuantity + delta;
      if (newQuantity >= 1 && newQuantity <= 5) { // 限制预订数量在1-5之间
        this.orderQuantity = newQuantity;
      }
    },
    
    // 提交预订
    submitOrder() {
      if (this.orderLoading) return; // 防止重复提交
      
      this.orderLoading = true;
      
      // 模拟提交预订请求
      setTimeout(() => {
        this.orderLoading = false;
        this.orderSuccess = true;
        this.orderCount++; // 增加已预订次数
        
        // 显示成功提示
        uni.showToast({
          title: '预订成功',
          icon: 'success',
          duration: 1500
        });
        
        // 3秒后自动关闭弹窗
        setTimeout(() => {
          this.closeOrderPopup();
        }, 1500);
      }, 1000);
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
  display: flex;
  flex-direction: column;
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
      background-color: #ff9500;
      border-radius: 3rpx;
      opacity: 0.8;
    }
  }
}

.dish-detail-content {
  flex: 1;
  overflow: hidden;
  
  .dish-image-container {
    width: 100%;
    height: 500rpx;
    overflow: hidden;
    position: relative;
    
    .dish-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .sold-out-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      
      text {
        font-size: 48rpx;
        color: #fff;
        font-weight: bold;
        padding: 20rpx 40rpx;
        background-color: rgba(255, 0, 0, 0.7);
        border-radius: 10rpx;
        transform: rotate(-15deg);
      }
    }
    
    .dish-favorite {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      width: 80rpx;
      height: 80rpx;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .iconfont {
        font-size: 40rpx;
        color: #ff6200;
      }
    }
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60rpx;
      background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
    }
  }
  
  .dish-info-container {
    padding: 30rpx;
    background-color: #ffffff;
    margin-bottom: 20rpx;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    
    .dish-name-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .dish-name {
        font-size: 40rpx;
        font-weight: bold;
        color: #333;
      }
      
      .dish-price {
        font-size: 40rpx;
        font-weight: bold;
        color: #ff6200;
      }
    }
    
    .dish-status {
      display: flex;
      align-items: center;
      margin: 10rpx 0 20rpx;
      padding: 10rpx 20rpx;
      background-color: rgba(255, 0, 0, 0.1);
      border-radius: 8rpx;
      
      .iconfont {
        font-size: 28rpx;
        color: #ff4d4f;
        margin-right: 10rpx;
      }
      
      text {
        font-size: 24rpx;
        color: #ff4d4f;
      }
    }
    
    .dish-rating {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .rating-label {
        font-size: 26rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .rating-stars {
        display: flex;
        
        .iconfont {
          font-size: 30rpx;
          color: #ff9500;
          margin-right: 6rpx;
        }
      }
      
      .rating-value {
        font-size: 26rpx;
        color: #ff9500;
        font-weight: bold;
        margin-left: 10rpx;
      }
    }
    
    .order-limit-tip {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 10rpx 20rpx;
      background-color: rgba(255, 149, 0, 0.1);
      border-radius: 8rpx;
      
      .iconfont {
        font-size: 28rpx;
        color: #ff9500;
        margin-right: 10rpx;
      }
      
      text {
        font-size: 24rpx;
        color: #ff9500;
      }
    }
    
    .dish-description {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .comment-section {
    background-color: #ffffff;
    padding: 30rpx;
    
    .section-header {
      margin-bottom: 30rpx;
      
      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
        display: flex;
        align-items: center;
        
        .iconfont {
          font-size: 36rpx;
          margin-right: 10rpx;
          color: #ff9500;
        }
      }
      
      .comment-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .tab-item {
          padding: 10rpx 20rpx;
          border-radius: 30rpx;
          font-size: 24rpx;
          background-color: #f5f5f5;
          color: #666;
          
          &.active {
            background-color: #ff9500;
            color: #fff;
          }
        }
      }
    }
    
    .comment-list {
      .comment-item {
        padding: 30rpx 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .comment-user {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          
          .user-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 20rpx;
          }
          
          .user-info {
            flex: 1;
            
            .user-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #333;
              margin-bottom: 6rpx;
              display: block;
            }
            
            .comment-date {
              font-size: 24rpx;
              color: #999;
            }
          }
          
          .comment-like {
            display: flex;
            align-items: center;
            
            .iconfont {
              font-size: 30rpx;
              color: #999;
              margin-right: 6rpx;
              
              &.liked {
                color: #ff6200;
              }
            }
            
            .like-count {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
        
        .comment-content {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
          margin-bottom: 20rpx;
        }
        
        .comment-images {
          display: flex;
          flex-wrap: wrap;
          gap: 10rpx;
          
          image {
            width: 180rpx;
            height: 180rpx;
            border-radius: 8rpx;
            object-fit: cover;
          }
        }
      }
      
      .empty-comment {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 0;
        
        .iconfont {
          font-size: 60rpx;
          color: #ccc;
          margin-bottom: 20rpx;
        }
        
        text {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}

.bottom-actions {
  height: 100rpx;
  background-color: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 0 30rpx;
  
  .action-btn {
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 500;
    margin: 10rpx 0;
    
    .iconfont {
      font-size: 32rpx;
      margin-right: 10rpx;
    }
    
    &.comment-btn {
      flex: 1;
      background-color: #f5f5f5;
      color: #666;
      margin-right: 20rpx;
    }
    
    &.order-btn {
      flex: 2;
      background: linear-gradient(90deg, #ff9500, #ff6200);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(255, 101, 0, 0.2);
    }
  }
}

/* 预订弹窗样式优化 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

.order-popup {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 901;
  overflow: hidden;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  animation: popup-slide-up 0.3s ease;
  
  .popup-header {
    padding: 24rpx 30rpx;
    border-bottom: 1px solid #f2f2f2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .popup-close {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 32rpx;
        color: #666;
      }
    }
  }
  
  .popup-content {
    padding: 30rpx;
    
    .order-dish-info {
      display: flex;
      margin-bottom: 30rpx;
      
      .order-dish-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        object-fit: cover;
        margin-right: 20rpx;
      }
      
      .order-dish-detail {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .order-dish-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
        
        .order-dish-price {
          font-size: 32rpx;
          color: #ff6200;
          font-weight: bold;
        }
      }
    }
    
    .order-quantity {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .quantity-label {
        font-size: 28rpx;
        color: #333;
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .iconfont {
            font-size: 36rpx;
            color: #333;
          }
          
          &:active {
            background-color: #e5e5e5;
          }
        }
        
        .quantity-value {
          width: 80rpx;
          text-align: center;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
      }
    }
    
    .order-notice {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background-color: rgba(255, 149, 0, 0.1);
      border-radius: 8rpx;
      margin-bottom: 30rpx;
      
      .iconfont {
        font-size: 28rpx;
        color: #ff9500;
        margin-right: 10rpx;
      }
      
      text {
        font-size: 24rpx;
        color: #ff9500;
      }
    }
    
    .order-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .total-label {
        font-size: 28rpx;
        color: #333;
      }
      
      .total-price {
        font-size: 36rpx;
        color: #ff6200;
        font-weight: bold;
      }
    }
    
    .order-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40rpx 0;
      
      .success-icon {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background-color: #4cd964;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30rpx;
        
        .iconfont {
          font-size: 60rpx;
          color: #fff;
        }
      }
      
      .success-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .success-desc {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }
      
      .success-tip {
        font-size: 24rpx;
        color: #ff9500;
        padding: 10rpx 20rpx;
        background-color: rgba(255, 149, 0, 0.1);
        border-radius: 30rpx;
      }
    }
  }
  
  .popup-footer {
    display: flex;
    padding: 20rpx 30rpx 40rpx;
    
    .popup-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: 500;
      
      &.cancel-btn {
        background-color: #f5f5f5;
        color: #666;
        margin-right: 20rpx;
      }
      
      &.confirm-btn {
        background: linear-gradient(90deg, #ff9500, #ff6200);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(255, 101, 0, 0.2);
        
        &.loading {
          opacity: 0.8;
        }
        
        .loading-icon {
          width: 40rpx;
          height: 40rpx;
          border: 3rpx solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }
  }
}

@keyframes popup-slide-up {
  from {
    transform: translate(-50%, 100%);
  }
  to {
    transform: translate(-50%, 0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.disabled-btn {
  background: linear-gradient(90deg, #cccccc, #999999) !important;
  opacity: 0.8;
  box-shadow: none !important;
  position: relative;
}

.disabled-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 40rpx;
}
</style> 