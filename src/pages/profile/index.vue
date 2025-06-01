<template>
  <!-- 整个页面的容器 -->
  <view class="profile-container">
    <!-- 添加背景组件 -->
    <page-background></page-background>
    
    <!-- 状态栏占位：用于适配不同手机顶部状态栏的高度 -->
    <view class="status-bar"></view>
    
    <!-- 顶部用户信息区域 -->
    <view class="user-info-box card">
      <view class="avatar-box">
        <!-- 直接使用userInfo中的avatar，已经预设了默认值 -->
        <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill" />
      </view>
      <view class="user-details">
        <view class="user-name">{{ userInfo.username }}</view>
        <view class="user-desc">{{ userInfo.description }}</view>
      </view>
      <view class="edit-profile" @click="onMenuClick('编辑资料')">
        <text class="iconfont icon-edit-line"></text>
      </view>
    </view>

    <!-- 功能按钮区域 -->
    <view class="function-area card">
      <view class="function-item" @click="onFunctionClick('待充')">
        <text class="iconfont icon-more-fill function-icon"></text>
        <text class="function-text">待充</text>
      </view>
      <view class="function-item" @click="onFunctionClick('浏览历史')">
        <text class="iconfont icon-pie-chart-line function-icon"></text>
        <text class="function-text">浏览历史</text>
      </view>
      <view class="function-item" @click="onFunctionClick('帮助')">
        <text class="iconfont icon-question-line function-icon"></text>
        <text class="function-text">帮助</text>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list card">
      <!-- 我的预订 -->
      <view class="menu-item" @click="onMenuClick('我的预订')">
        <view class="menu-icon-box">
          <text class="iconfont icon-task-line"></text>
        </view>
        <view class="menu-content">
          <text class="menu-title">我的预订</text>
        </view>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <!-- 我的收藏 -->
      <view class="menu-item" @click="onMenuClick('我的收藏')">
        <view class="menu-icon-box">
          <text class="iconfont icon-star-line"></text>
        </view>
        <view class="menu-content">
          <text class="menu-title">我的收藏</text>
          <text class="menu-subtitle" v-if="favorites.length > 0">{{ favorites.length }}个收藏</text>
        </view>
        <text class="iconfont icon-arrow-right"></text>
      </view>

      <!-- 设置 -->
      <view class="menu-item" @click="onMenuClick('设置')">
        <view class="menu-icon-box">
          <text class="iconfont icon-settings-3-line"></text>
        </view>
        <view class="menu-content">
          <text class="menu-title">设置</text>
        </view>
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>

    <!-- 使用TabBar组件 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script setup>
// 导入Vue的ref函数，用于创建响应式数据
import { ref, onMounted, onUnmounted } from 'vue';
import TabBar from '@/components/TabBar.vue';
import PageBackground from '@/components/PageBackground.vue';
import { getUserInfo, getFavorites } from '@/api/user';

// 用户信息
const userInfo = ref({
  username: '',
  avatar: '/static/images/white.jpg',
  description: '',
  points: 0
});

// 用户收藏列表
const favorites = ref([]);

// 获取用户信息
async function fetchUserInfo() {
  try {
    // 首先尝试从缓存中获取用户信息
    const cachedUserInfo = uni.getStorageSync('userInfo');
    if (cachedUserInfo) {
      userInfo.value = {
        ...userInfo.value,
        ...cachedUserInfo
      };
      console.log('从缓存获取用户信息成功:', userInfo.value);
    }
    
    // 然后从服务器获取最新的用户信息
    const res = await getUserInfo();
    if (res && res.data) {
      // 获取头像URL，优先使用服务器返回的，如果没有则尝试从本地存储获取，最后使用默认头像
      let avatar = res.data.avatar;
      
      // 如果服务器没有返回头像URL，尝试从本地存储获取
      if (!avatar) {
        try {
          avatar = uni.getStorageSync('userAvatar');
        } catch (e) {
          console.error('从本地存储获取头像URL失败:', e);
        }
      }
      
      // 如果仍然没有头像URL，使用默认头像
      avatar = avatar || '/static/images/white.jpg';
      
      // 使用新的头像预加载
      try {
        await preloadImage(avatar);
        // 头像加载完成后再更新用户信息
        userInfo.value = {
          ...res.data,
          avatar: avatar
        };
        console.log('获取用户信息成功:', userInfo.value);
      } catch (error) {
        // 如果预加载失败，使用默认头像
        userInfo.value = {
          ...res.data,
          avatar: '/static/images/white.jpg'
        };
        console.log('头像加载失败，使用默认头像');
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 检查是否是未登录错误
    if (error && error.code === 1002) {
      // 未登录，可以跳转到登录页面
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
  }
}

// 获取用户收藏列表
async function fetchFavorites() {
  try {
    const params = {
      page: 1,
      pageSize: 10
    };
    const res = await getFavorites(params);
    if (res && res.data && res.data.list) {
      favorites.value = res.data.list;
      console.log('获取收藏列表成功:', favorites.value);
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    // 静默处理错误，不影响页面显示
    favorites.value = [];
  }
}

// 预加载图片
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = (err) => {
      console.error('图片预加载失败:', err);
      reject(err);
    };
  });
}

// 菜单项点击事件处理函数
function onMenuClick(item) {
  // 根据不同菜单项执行不同操作
  if (item === '设置') {
    // 跳转到设置页面
    uni.navigateTo({
      url: '/pages/profile/settings'
    });
  } else if (item === '我的收藏') {
    // 跳转到收藏页面，可以传递收藏列表数据
    uni.navigateTo({
      url: '/pages/profile/favorites'
    });
  } else if (item === '编辑资料') {
    // 跳转到编辑资料页面，并传递当前用户信息
    uni.navigateTo({
      url: `/pages/profile/edit-profile?username=${encodeURIComponent(userInfo.value.username)}&avatar=${encodeURIComponent(userInfo.value.avatar)}&description=${encodeURIComponent(userInfo.value.description || '')}`
    });
  } else {
    // 其他菜单项暂时只显示提示
    uni.showToast({ title: item, icon: 'none' });
  }
}

// 功能按钮点击事件处理函数
function onFunctionClick(item) {
  if (item === '浏览历史') {
    // 跳转到浏览历史页面
    uni.navigateTo({
      url: '/pages/profile/history'
    });
  } else {
    // 显示提示框，内容为功能按钮文字
    uni.showToast({ title: item, icon: 'none' });
  }
}

// 刷新用户信息方法（供其他页面调用）
function refreshUserInfo() {
  console.log('刷新用户信息');
  // 重新获取用户信息
  fetchUserInfo();
  // 重新获取收藏列表
  fetchFavorites();
}

// 页面加载时执行
onMounted(() => {
  console.log('个人中心页面加载');
  // 获取用户信息
  fetchUserInfo();
  // 获取收藏列表
  fetchFavorites();
  
  // 监听用户信息更新事件
  uni.$on('userInfoUpdated', (updatedUserInfo) => {
    console.log('接收到用户信息更新事件:', updatedUserInfo);
    if (updatedUserInfo) {
      // 更新本地用户信息
      userInfo.value = {
        ...userInfo.value,
        ...updatedUserInfo
      };
    }
    // 刷新收藏列表
    fetchFavorites();
  });
});

// 页面卸载时执行
onUnmounted(() => {
  // 移除事件监听，防止内存泄漏
  uni.$off('userInfoUpdated');
});
</script>

<style lang="scss">
/* 页面容器样式 */
.profile-container {
  min-height: 100vh;                /* 最小高度为视口高度 */
  padding-bottom: 120rpx;           /* 底部内边距，为底部导航栏留出空间 */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
  position: relative;               /* 相对定位，作为子元素定位的参考 */
}

/* 状态栏占位样式 */
.status-bar {
  height: var(--status-bar-height, 44px); /* 高度：状态栏高度 */
}

/* 用户信息区域样式 */
.user-info-box {
  width: calc(100% - 60rpx);        /* 宽度：100%减去左右间距 */
  padding: 30rpx;                   /* 内边距：30rpx */
  display: flex;                    /* 弹性布局 */
  align-items: center;              /* 交叉轴对齐：居中 */
  border-radius: 24rpx;             /* 圆角：24rpx */
  margin: 20rpx 30rpx;              /* 外边距：上下20rpx，左右30rpx */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
  position: relative;               /* 相对定位 */
}

/* 头像区域样式 */
.avatar-box {
  width: 120rpx;                    /* 宽度：120rpx */
  height: 120rpx;                   /* 高度：120rpx */
  border-radius: 50%;               /* 圆角：50%，形成圆形 */
  overflow: hidden;                 /* 溢出隐藏：裁剪超出部分 */
  background: linear-gradient(135deg, #e6f7ff, #d9f2ff); /* 渐变背景 */
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1); /* 阴影效果 */
  border: 4rpx solid rgba(255, 255, 255, 0.8); /* 边框 */
  flex-shrink: 0;                   /* 防止头像被压缩 */
  position: relative;               /* 相对定位 */
}

/* 头像图片样式 */
.avatar-img {
  width: 100%;                      /* 宽度：100% */
  height: 100%;                     /* 高度：100% */
  object-fit: cover;                /* 图片填充方式：保持纵横比填充整个容器 */
}

/* 用户详情样式 */
.user-details {
  margin-left: 24rpx;               /* 左外边距：24rpx */
  flex: 1;                          /* 弹性伸缩：占用剩余空间 */
  overflow: hidden;                 /* 溢出隐藏 */
  padding-right: 10rpx;             /* 右内边距，防止文字贴近边缘 */
}

/* 用户名样式 */
.user-name {
  font-size: 32rpx;                 /* 字体大小：32rpx */
  font-weight: 600;                 /* 字体粗细：600 */
  color: #333;                      /* 文字颜色：深灰色 */
  margin-bottom: 8rpx;              /* 下外边距：8rpx */
  white-space: nowrap;              /* 防止文字换行 */
  overflow: hidden;                 /* 超出部分隐藏 */
  text-overflow: ellipsis;         /* 超出部分显示省略号 */
}

/* 用户描述样式 */
.user-desc {
  font-size: 24rpx;                 /* 字体大小：24rpx */
  color: #666;                      /* 文字颜色：灰色 */
  white-space: nowrap;              /* 防止文字换行 */
  overflow: hidden;                 /* 超出部分隐藏 */
  text-overflow: ellipsis;         /* 超出部分显示省略号 */
}

/* 编辑资料按钮 */
.edit-profile {
  position: absolute;
  right: 30rpx;
  top: 50%;                      /* 从顶部30rpx改为50% */
  transform: translateY(-50%);   /* 使用transform实现垂直居中 */
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 199, 89, 0.1);
  border-radius: 50%;
  color: #34c759;
  transition: all 0.3s ease;
}

.edit-profile:active {
  transform: translateY(-50%) scale(0.95);  /* 保持垂直居中的同时添加缩放效果 */
  background: rgba(52, 199, 89, 0.2);
}

.edit-profile .iconfont {
  font-size: 40rpx;
}

/* 功能按钮区域样式 */
.function-area {
  display: flex;                    /* 弹性布局 */
  justify-content: space-around;    /* 主轴对齐：均匀分布 */
  width: calc(100% - 60rpx);        /* 宽度：100%减去左右间距 */
  margin: 20rpx 30rpx 30rpx;        /* 外边距：上20rpx，左右30rpx，下30rpx */
  padding: 30rpx;                   /* 内边距：30rpx */
  border-radius: 24rpx;             /* 圆角：24rpx */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
}

/* 功能按钮项样式 */
.function-item {
  display: flex;                    /* 弹性布局 */
  flex-direction: column;           /* 主轴方向：垂直 */
  align-items: center;              /* 交叉轴对齐：居中 */
  width: 160rpx;                    /* 宽度：160rpx */
  transition: all 0.3s ease;        /* 过渡效果 */
}

.function-item:active {
  transform: translateY(-2rpx);
}

/* 功能按钮图标样式 */
.function-icon {
  font-size: 48rpx;                 /* 字体大小：48rpx */
  color: #34c759;                   /* 文字颜色：绿色 */
  margin-bottom: 12rpx;             /* 下外边距：12rpx */
  background: linear-gradient(135deg, #34c759, #32ade6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2rpx 8rpx rgba(52, 199, 89, 0.3);
}

/* 功能按钮文字样式 */
.function-text {
  font-size: 24rpx;                 /* 字体大小：24rpx */
  color: #666;                      /* 文字颜色：中灰色 */
  font-weight: 500;                 /* 字体粗细 */
}

/* 功能菜单列表样式 */
.menu-list {
  width: calc(100% - 60rpx);        /* 宽度：100%减去左右间距 */
  margin: 30rpx 30rpx 40rpx;        /* 外边距：上30rpx，左右30rpx，下40rpx */
  border-radius: 24rpx;             /* 圆角：24rpx */
  overflow: hidden;                 /* 溢出隐藏：裁剪超出部分 */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
}

/* 菜单项样式 */
.menu-item {
  display: flex;                    /* 弹性布局 */
  align-items: center;              /* 交叉轴对齐：居中 */
  padding: 30rpx;                   /* 内边距：30rpx */
  position: relative;               /* 相对定位，作为子元素定位的参考 */
  transition: all 0.3s ease;        /* 过渡效果 */
}

.menu-item:active {
  background: rgba(0, 0, 0, 0.02);
}

/* 除最后一个菜单项外，其他菜单项添加底部边框 */
.menu-item:not(:last-child) {
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05); /* 底部边框 */
}

/* 菜单项图标容器样式 */
.menu-icon-box {
  width: 60rpx;                     /* 宽度：60rpx */
  height: 60rpx;                    /* 高度：60rpx */
  display: flex;                    /* 弹性布局 */
  align-items: center;              /* 交叉轴对齐：居中 */
  justify-content: center;          /* 主轴对齐：居中 */
  background: linear-gradient(135deg, #34c759, #32ade6); /* 渐变背景 */
  border-radius: 16rpx;             /* 圆角 */
  margin-right: 20rpx;              /* 右外边距：20rpx */
  color: #fff;                      /* 文字颜色：白色 */
  flex-shrink: 0;                   /* 防止图标被压缩 */
  box-shadow: 0 4rpx 10rpx rgba(52, 199, 89, 0.2); /* 阴影效果 */
}

/* 菜单项内容样式 */
.menu-content {
  flex: 1;                          /* 弹性伸缩：占用剩余空间 */
  overflow: hidden;                 /* 溢出隐藏 */
}

/* 菜单项标题样式 */
.menu-title {
  font-size: 30rpx;                 /* 字体大小：30rpx */
  color: #333;                      /* 文字颜色：深灰色 */
  font-weight: 500;                 /* 字体粗细：500 */
}

/* 菜单项副标题样式 */
.menu-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 右箭头图标样式 */
.icon-arrow-right {
  font-size: 36rpx;                 /* 字体大小：36rpx */
  color: #ccc;                      /* 文字颜色：浅灰色 */
  margin-left: 20rpx;               /* 左外边距：20rpx */
}

/* 适配不同屏幕 */
@media screen and (max-width: 375px) {
  .function-item {
    width: 140rpx;
  }
  
  .function-icon {
    font-size: 44rpx;
  }
  
  .function-text {
    font-size: 22rpx;
  }
  
  .menu-item {
    padding: 26rpx;
  }
  
  .menu-icon-box {
    width: 54rpx;
    height: 54rpx;
  }
  
  .menu-title {
    font-size: 28rpx;
  }
}

/* 移除所有不需要的样式 */
.edit-avatar-hint,
.edit-icon,
.avatar-box:active,
.avatar-box:hover,
.user-name:active,
.user-name:hover {
  opacity: 1;
  transform: none;
  background: none;
  display: block;
}
</style> 