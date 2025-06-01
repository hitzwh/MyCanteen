<template>
  <!-- 底部导航栏：实现页面切换 -->
  <view class="tabbar">
    <!-- 
      遍历tabbar数组，为每个导航项创建一个tabbar-item元素
      v-for：循环指令，遍历tabbar数组
      :key：为每个项提供唯一标识符
      :class：动态绑定CSS类，当当前路径匹配导航项路径时添加active类
      @click：绑定点击事件处理函数
    -->
    <view class="tabbar-item" v-for="(tab, idx) in tabbar" :key="tab.text" 
          :class="{active: isActive(tab.path)}" @click="onTabClick(idx, $event)">
      <!-- 导航图标容器 -->
      <view class="tabbar-icon">
        <!-- 
          使用iconfont字体图标
          :class：动态绑定图标类名
        -->
        <text class="iconfont" :class="tab.icon"></text>
      </view>
      <!-- 导航文字 -->
      <text class="tabbar-text">{{ tab.text }}</text>
      <!-- 
        导航徽标：用于显示未读消息等提醒
        v-if：条件渲染，只有当tab.badge为true时才显示
      -->
      <view v-if="tab.badge" class="tab-badge"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onActivated, computed } from 'vue';

// 底部导航栏数据：定义页面导航
const tabbar = [
  { icon: 'icon-home-3-line', text: '首页', path: '/pages/index/index' },
  { icon: 'icon-mail-line', text: '消息', badge: true, path: '/pages/message/index' },
  { icon: 'icon-store-3-line', text: '开饭', badge: true, path: '/pages/dining/index' },
  { icon: 'icon-message-3-line', text: '评价', path: '/pages/evaluate/index' },
  { icon: 'icon-user-3-line', text: '我的', badge: true, path: '/pages/profile/index' },
];

// 使用uni全局状态存储当前激活的索引，避免组件重载时状态丢失
if (!getApp().globalData) {
  getApp().globalData = {};
}
if (typeof getApp().globalData.activeTabIndex === 'undefined') {
  getApp().globalData.activeTabIndex = 0;
}

// 当前激活的索引，使用计算属性与全局状态同步
const activeIndex = computed({
  get: () => getApp().globalData.activeTabIndex,
  set: (val) => {
    getApp().globalData.activeTabIndex = val;
  }
});

// 当前路径，使用全局状态存储
if (typeof getApp().globalData.currentTabPath === 'undefined') {
  getApp().globalData.currentTabPath = '';
}
const currentPath = computed({
  get: () => getApp().globalData.currentTabPath,
  set: (val) => {
    getApp().globalData.currentTabPath = val;
  }
});

/**
 * 检查路径是否匹配当前路径
 * 使用简单的字符串比较，更可靠地判断当前激活的导航项
 * 
 * @param {string} path - 要检查的路径
 * @return {boolean} - 如果路径匹配当前路径，返回true
 */
const isActive = (path) => {
  try {
    // 获取当前页面路由
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage.route;
      
      // 从path中提取路径的最后部分
      const pathSegments = path.split('/');
      const pathEnd = pathSegments[pathSegments.length - 2] + '/' + pathSegments[pathSegments.length - 1];
      
      // 特殊处理：如果当前页面是餐厅介绍或窗口介绍相关页面，且检查的是首页路径，则返回true
      if (path === '/pages/index/index' && 
          (currentRoute.includes('index/canteen-intro') || 
           currentRoute.includes('index/dish-list') || 
           currentRoute.includes('index/dish-detail'))) {
        console.log('当前在餐厅/窗口介绍相关页面，激活首页图标');
        return true;
      }
      
      // 检查当前路由是否包含路径的最后部分
      return currentRoute.includes(pathEnd);
    }
    
    // 如果无法获取当前页面，使用activeIndex作为备用
    const idx = tabbar.findIndex(tab => tab.path === path);
    return idx === activeIndex.value;
  } catch (error) {
    console.error('路径比较出错:', error);
    // 出错时回退到索引比较
    return tabbar.findIndex(tab => tab.path === path) === activeIndex.value;
  }
};

/**
 * 更新当前路径
 * 
 * 流程：
 * 1. 获取当前页面栈
 * 2. 获取栈顶页面（当前页面）
 * 3. 构造页面路径
 * 4. 更新currentPath
 */
const updateCurrentPath = () => {
  try {
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const path = `/${currentPage.route}`;
      
      // 更新当前路径
      currentPath.value = path;
      
      // 特殊处理：如果当前页面是餐厅介绍或窗口介绍相关页面，将activeIndex设置为首页索引(0)
      if (currentPage.route.includes('index/canteen-intro') || 
          currentPage.route.includes('index/dish-list') || 
          currentPage.route.includes('index/dish-detail')) {
        console.log('当前在餐厅/窗口介绍相关页面，设置activeIndex为首页索引');
        activeIndex.value = 0;
        return;
      }
      
      // 更新activeIndex
      for (let i = 0; i < tabbar.length; i++) {
        const tab = tabbar[i];
        const pathSegments = tab.path.split('/');
        const pathEnd = pathSegments[pathSegments.length - 2] + '/' + pathSegments[pathSegments.length - 1];
        
        if (currentPage.route.includes(pathEnd)) {
          activeIndex.value = i;
          break;
        }
      }
    }
  } catch (error) {
    console.error('获取当前页面路径失败:', error);
  }
};

// 页面加载时初始化当前路径
onMounted(() => {
  // 如果已经有路径，不再重新初始化
  if (!currentPath.value) {
    updateCurrentPath();
  }
});

// 每次页面激活时更新当前路径
onActivated(() => {
  updateCurrentPath();
});

/**
 * 底部导航点击事件处理函数
 * 
 * 动画流程：
 * 1. 用户点击导航项
 * 2. 检查是否为当前已激活的导航项，如果是则不处理
 * 3. 立即更新activeIndex，提供即时视觉反馈
 * 4. 开始页面跳转
 * 
 * @param {number} idx - 被点击的导航项索引
 * @param {Event} event - 点击事件对象
 */
const onTabClick = (idx, event) => {
  // 获取当前页面路由
  const pages = getCurrentPages();
  const currentPage = pages && pages.length > 0 ? pages[pages.length - 1].route : '';
  
  // 检查是否在餐厅介绍或窗口介绍相关页面，且点击了首页图标
  const isInRelatedPages = currentPage.includes('index/canteen-intro') || 
                           currentPage.includes('index/dish-list') || 
                           currentPage.includes('index/dish-detail');
  
  // 如果在相关页面点击了首页图标，需要特殊处理
  if (isInRelatedPages && idx === 0) {
    console.log('在餐厅/窗口介绍相关页面点击首页图标，跳转到首页');
    uni.redirectTo({
      url: '/pages/index/index',
      fail: (err) => {
        console.error('跳转到首页失败:', err);
        uni.reLaunch({ url: '/pages/index/index' });
      }
    });
    return;
  }
  
  // 如果点击当前页面，不做处理
  if (activeIndex.value === idx && !isInRelatedPages) return;
  
  // 立即更新activeIndex，提供即时视觉反馈
  activeIndex.value = idx;
  
  // 根据索引直接跳转到对应页面
  const url = tabbar[idx].path;
  console.log('跳转到:', url);
  
  // 使用navigateTo进行跳转
  uni.navigateTo({
    url,
    fail: (err) => {
      console.error('navigateTo失败:', err);
      // 如果navigateTo失败，尝试使用redirectTo
      uni.redirectTo({ 
        url,
        fail: (redirectErr) => {
          console.error('redirectTo也失败:', redirectErr);
          // 最后尝试reLaunch
          uni.reLaunch({ url });
        }
      });
    }
  });
};
</script>

<style lang="scss">
/* 底部导航栏样式 */
.tabbar {
  position: fixed;                  /* 固定定位：相对于视口 */
  left: 0;                          /* 左偏移：0 */
  bottom: 0;                        /* 底部偏移：0 */
  width: 100%;                      /* 宽度：100% */
  height: 110rpx;                   /* 高度：110rpx */
  background: #fff;                 /* 背景色：白色 */
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08); /* 增强上阴影效果 */
  display: flex;                    /* 弹性布局 */
  justify-content: space-around;    /* 主轴对齐：均匀分布 */
  align-items: center;              /* 交叉轴对齐：居中 */
  z-index: 999;                     /* 增加层级，确保显示在最上方 */
  border-top: none;                 /* 移除顶部边框 */
  padding-top: 8rpx;                /* 增加顶部内边距 */
  padding-bottom: env(safe-area-inset-bottom); /* 底部安全区域 */
  
  /* 添加一个伪元素来覆盖系统tabBar的边框 */
  &::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: 0;
    width: 100%;
    height: 2rpx;
    background-color: #fff;
    z-index: 1000;
  }
}

/* 
 * 底部导航项样式 
 * 动画说明：所有属性在0.3秒内平滑过渡
 */
.tabbar-item {
  flex: 1;                          /* 弹性伸缩：平均分配空间 */
  height: 100%;                     /* 高度：100% */
  display: flex;                    /* 弹性布局 */
  flex-direction: column;           /* 主轴方向：垂直 */
  align-items: center;              /* 交叉轴对齐：居中 */
  justify-content: center;          /* 主轴对齐：居中 */
  color: #999;                      /* 文字颜色：灰色 */
  font-size: 24rpx;                 /* 字体大小：24rpx */
  position: relative;               /* 相对定位，作为徽标定位的参考 */
  transition: all 0.3s ease;        /* 过渡效果：所有属性，0.3秒，平滑 */
  will-change: transform, color;    /* 提示浏览器哪些属性会变化，优化性能 */
  padding: 0 6rpx;                  /* 添加左右内边距，防止内容过宽 */
  box-sizing: border-box;           /* 确保内边距不增加总宽度 */
}

/* 
 * 底部导航项激活状态样式 
 * 动画说明：
 * 1. 文字颜色从灰色(#999)变为绿色(#34c759)
 * 2. 整体向上移动6rpx
 */
.tabbar-item.active {
  color: #34c759;                   /* 文字颜色：绿色 */
  transform: translateY(-6rpx);     /* 变换：向上移动6rpx */
}

/* 
 * 底部导航图标样式 
 * 动画说明：所有属性在0.3秒内平滑过渡
 */
.tabbar-icon {
  position: relative;               /* 相对定位 */
  height: 56rpx;                    /* 高度：56rpx */
  width: 56rpx;                     /* 宽度：56rpx */
  display: inline-flex;             /* 内联弹性布局 */
  align-items: center;              /* 垂直居中 */
  justify-content: center;          /* 水平居中 */
  margin-bottom: 6rpx;              /* 底部外边距：6rpx */
}

/* 底部导航图标字体 */
.tabbar-icon .iconfont {
  font-size: 44rpx;                 /* 字体大小：44rpx */
  line-height: 1;                   /* 行高：1，确保图标垂直居中 */
  color: inherit;                   /* 继承父元素的颜色 */
  display: inline-flex;             /* 内联弹性布局 */
  align-items: center;              /* 垂直居中 */
  justify-content: center;          /* 水平居中 */
}

/* 
 * 添加图标动画效果 
 * 动画说明：
 * 1. 图标颜色从灰色(#999)变为绿色(#34c759)
 * 2. 图标放大到原来的1.1倍
 */
.tabbar-item.active .tabbar-icon {
  color: #34c759;                   /* 图标颜色：绿色 */
  transform: scale(1.1);            /* 放大效果 */
}

/* 
 * 添加图标点击波纹效果 
 * 动画说明：
 * 1. 创建一个伪元素作为波纹
 * 2. 初始状态：透明且大小为0
 * 3. 过渡效果：所有属性在0.4秒内平滑过渡
 */
.tabbar-icon::after {
  content: "";                      /* 伪元素内容 */
  position: absolute;               /* 绝对定位 */
  width: 100%;                      /* 宽度：100% */
  height: 100%;                     /* 高度：100% */
  background: radial-gradient(circle, rgba(52, 199, 89, 0.2) 0%, rgba(52, 199, 89, 0) 70%); /* 径向渐变 */
  border-radius: 50%;               /* 圆角：50%，形成圆形 */
  opacity: 0;                       /* 透明度：0，初始不可见 */
  transform: scale(0);              /* 变换：缩放为0，初始不可见 */
  transition: all 0.4s ease;        /* 过渡效果：所有属性，0.4秒，平滑 */
  will-change: opacity, transform;  /* 提示浏览器哪些属性会变化，优化性能 */
}

/* 
 * 激活状态下的波纹效果 
 * 动画说明：
 * 1. 波纹从透明变为可见(opacity: 0 → 1)
 * 2. 波纹从中心向外扩散(transform: scale(0) → scale(1.5))
 */
.tabbar-item.active .tabbar-icon::after {
  opacity: 1;                       /* 透明度：1，完全可见 */
  transform: scale(1.5);            /* 变换：放大到1.5倍 */
}

/* 
 * 底部导航文字样式 
 * 动画说明：所有属性在0.3秒内平滑过渡
 */
.tabbar-text {
  font-size: 24rpx;                 /* 字体大小：24rpx */
  transform: scale(0.9);            /* 缩小变换，使文字更精致 */
  transform-origin: center center;  /* 变换原点：中心 */
  color: inherit;                   /* 继承父元素的颜色 */
  line-height: 1;                   /* 行高：1，保持紧凑 */
  margin-top: 4rpx;                 /* 顶部外边距：4rpx */
  transition: all 0.25s;            /* 过渡效果：所有属性，0.25秒 */
}

/* 
 * 激活状态下的文字效果 
 * 动画说明：
 * 1. 文字轻微放大(transform: scale(1.05))
 * 2. 添加文字阴影效果
 */
.tabbar-item.active .tabbar-text {
  transform: scale(1.05);           /* 文字轻微放大 */
  text-shadow: 0 0 4rpx rgba(52, 199, 89, 0.2); /* 添加文字阴影 */
}

/* 
 * 底部导航徽标样式 
 * 动画说明：脉冲动画，持续1.5秒，无限循环
 */
.tab-badge {
  position: absolute;               /* 绝对定位 */
  top: 6rpx;                        /* 顶部偏移：6rpx */
  right: 50%;                       /* 右偏移：50% */
  margin-right: -36rpx;             /* 右外边距：-36rpx，向左偏移 */
  width: 16rpx;                     /* 宽度：16rpx */
  height: 16rpx;                    /* 高度：16rpx */
  background: #ff4e50;              /* 背景色：红色 */
  border-radius: 50%;               /* 圆角：50%，形成圆形 */
  border: 2rpx solid #fff;          /* 边框：2rpx实线白色 */
  box-shadow: 0 0 4rpx rgba(255, 78, 80, 0.5); /* 阴影效果 */
  animation: pulse 1.5s infinite;   /* 脉冲动画：1.5秒一次，无限循环 */
}

/* 
 * 脉冲动画关键帧 
 * 动画说明：
 * 1. 0%：初始状态，正常大小，完全不透明
 * 2. 50%：放大到1.2倍，透明度降低到0.8
 * 3. 100%：恢复到初始状态
 */
@keyframes pulse {
  0% {
    transform: scale(1);            /* 变换：正常大小 */
    opacity: 1;                     /* 透明度：1，完全不透明 */
  }
  50% {
    transform: scale(1.2);          /* 变换：放大到1.2倍 */
    opacity: 0.8;                   /* 透明度：0.8，轻微透明 */
  }
  100% {
    transform: scale(1);            /* 变换：恢复正常大小 */
    opacity: 1;                     /* 透明度：1，完全不透明 */
  }
}

/* 适配大屏幕手机 */
@media screen and (min-width: 400px) {
  .tabbar-icon {
    font-size: 52rpx;
  }
  
  .tabbar-text {
    font-size: 26rpx;
  }
}

/* 适配小屏幕手机 */
@media screen and (max-width: 320px) {
  .tabbar-icon {
    font-size: 42rpx;
  }
  
  .tabbar-text {
    font-size: 22rpx;
  }
  
  .tabbar-item {
    padding: 0 2rpx;
  }
}
</style> 