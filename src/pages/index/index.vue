<template>
  <!-- 整个页面的容器 -->
  <view class="canteen-container">
    <!-- 引入背景组件 -->
    <page-background></page-background>
    
    <!-- 状态栏占位：用于适配不同手机顶部状态栏的高度 -->
    <view class="status-bar"></view>
    
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">校园食堂</text>
      <text class="page-subtitle">美味与健康的选择</text>
    </view>
    
    <!-- 顶部图片轮播区域 -->
    <view class="banner-box">
      <!-- 
        swiper组件：实现图片轮播效果
        circular：循环播放
        indicator-dots：显示指示点
        indicator-color：指示点颜色
        indicator-active-color：当前指示点颜色
        autoplay：自动播放
        interval：播放间隔时间(毫秒)
      -->
      <swiper class="banner-swiper" circular indicator-dots indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#ffffff" autoplay interval="3000">
        <!-- 
          遍历banners数组，为每张图片创建swiper-item
          v-for：循环指令
          :key：为每个项提供唯一标识符
          idx：当前项的索引
        -->
        <swiper-item v-for="(img, idx) in banners" :key="idx">
          <!-- 
            image组件：显示图片
            :src：图片链接
            mode="aspectFill"：保持纵横比缩放图片，使图片的短边能完全显示出来
          -->
          <image :src="img" class="banner-img" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 宫格按钮区域：显示功能入口 -->
    <view class="grid-container">
      <!-- 第一行按钮 -->
      <view class="grid-row">
        <view 
          class="grid-btn card" 
          v-for="(item, idx) in gridBtns.slice(0,2)" 
          :key="item.text" 
          @click="onGridClick(item)"
          :class="getButtonClass(idx, 0)"
        >
          <text class="grid-icon">{{ item.unicode }}</text>
          <text class="grid-text">{{ item.text }}</text>
          <view v-if="item.badge" class="badge"></view>
        </view>
      </view>
      
      <!-- 第二行按钮 -->
      <view class="grid-row">
        <view 
          class="grid-btn card" 
          v-for="(item, idx) in gridBtns.slice(2,4)" 
          :key="item.text" 
          @click="onGridClick(item)"
          :class="getButtonClass(idx, 1)"
        >
          <text class="grid-icon">{{ item.unicode }}</text>
          <text class="grid-text">{{ item.text }}</text>
          <view v-if="item.badge" class="badge"></view>
        </view>
      </view>
      
      <!-- 第三行按钮 -->
      <view class="grid-row">
        <view 
          class="grid-btn wide-btn card" 
          v-for="(item, idx) in gridBtns.slice(4,5)" 
          :key="item.text" 
          @click="onGridClick(item)"
          :class="getButtonClass(idx, 2)"
        >
          <text class="grid-icon">{{ item.unicode }}</text>
          <text class="grid-text">{{ item.text }}</text>
          <view v-if="item.badge" class="badge"></view>
        </view>
      </view>
    </view>

    <!-- 使用TabBar组件 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script setup>
// 导入Vue的ref函数，用于创建响应式数据
import { ref, onMounted } from 'vue';
import TabBar from '@/components/TabBar.vue';
import PageBackground from '@/components/PageBackground.vue';

// 轮播图数据：包含图片链接的数组
const banners = ref([
  '/static/images/default.jpg', // 使用实际存在的图片
  '/static/images/default.jpg', // 使用实际存在的图片
]);

// 餐厅数据
const canteens = ref([]);

// 宫格按钮数据：定义功能入口
const gridBtns = [
  { text: '餐厅介绍', badge: true, unicode: '🍴' },
  { text: '饮食指导', unicode: '📆' },
  { text: '天猫美食', unicode: '🍝' },
  { text: '预定包厢', badge: true, unicode: '🏠' },
  { text: '后续开发', unicode: '🛠' },
];

// 获取按钮的样式类
function getButtonClass(index, rowIndex) {
  const classes = [];
  
  // 根据行和列设置颜色类
  if (rowIndex === 0) {
    classes.push(index === 0 ? 'green-btn' : 'orange-btn');
  } else if (rowIndex === 1) {
    classes.push(index === 0 ? 'blue-btn' : 'purple-btn');
  } else {
    classes.push('pink-btn');
  }
  
  return classes.join(' ');
}

// 宫格按钮点击事件处理函数
function onGridClick(item) {
  // 根据按钮文字判断跳转逻辑
  if (item.text === '餐厅介绍') {
    uni.navigateTo({
      url: 'canteen-intro'
    });
  } else {
    // 其他按钮暂时保持原来的提示
    uni.showToast({ title: item.text, icon: 'none' });
  }
}

// 页面加载完成后执行
onMounted(() => {
  console.log('首页加载完成');
});
</script>

<style lang="scss">
/* 页面容器样式 */
.canteen-container {
  min-height: 100vh;                /* 最小高度为视口高度 */
  padding-bottom: 120rpx;           /* 底部内边距，为底部导航栏留出空间 */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
  position: relative;               /* 相对定位，作为子元素定位的参考 */
  width: 100%;
}

/* 状态栏占位样式 */
.status-bar {
  height: 44rpx;                    /* 高度：通常为状态栏高度 */
  width: 100%;                      /* 宽度：100% */
}

/* 页面标题样式 */
.page-header {
  padding: 20rpx 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
  background: linear-gradient(135deg, #34c759, #32ade6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 轮播图容器样式 */
.banner-box {
  width: 90%;                      /* 宽度：90%，与功能块保持一致 */
  max-width: 800rpx;
  margin: 20rpx auto 0;            /* 上下外边距，左右自动（居中） */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
}

/* 轮播组件样式 */
.banner-swiper {
  width: 100%;                      /* 宽度：100% */
  height: 280rpx;                   /* 高度：280rpx */
  border-radius: 24rpx;             /* 圆角：24rpx */
  overflow: hidden;                 /* 溢出隐藏：裁剪超出部分 */
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1); /* 阴影效果 */
  transform: translateZ(0);         /* 启用硬件加速 */
}

/* 轮播图片样式 */
.banner-img {
  width: 100%;                      /* 宽度：100% */
  height: 280rpx;                   /* 高度：280rpx */
  object-fit: cover;                /* 图片填充方式：保持纵横比填充整个容器 */
  transition: transform 0.3s ease;  /* 添加过渡效果 */
}

/* 宫格容器样式 */
.grid-container {
  width: 90%;
  max-width: 800rpx;
  margin: 60rpx auto 0;            /* 上下外边距，左右自动（居中） */
  display: flex;                    /* 弹性布局 */
  flex-direction: column;           /* 主轴方向：垂直 */
  gap: 30rpx;                       /* 元素间距：40rpx */
  box-sizing: border-box;           /* 盒模型：边框和内边距包含在宽高中 */
}

/* 宫格行样式 */
.grid-row {
  display: flex;                    /* 弹性布局 */
  justify-content: space-between;   /* 主轴对齐：居中 */
  width: 100%;                      /* 宽度：100% */
}

/* 宫格按钮基础样式 */
.grid-btn {
  flex: 1;                          /* 弹性伸缩：平均分配空间 */
  height: 180rpx;                   /* 高度：200rpx */
  margin: 0 10rpx;                  /* 左右内边距：10rpx */
  padding: 20rpx;                   /* 内边距：20rpx */
  border-radius: 24rpx;             /* 圆角：24rpx */
  box-shadow: 0 8rpx 20rpx rgba(32, 35, 32, 0.15); /* 阴影效果 */
  display: flex;                    /* 弹性布局 */
  flex-direction: column;           /* 主轴方向：垂直 */
  align-items: center;              /* 交叉轴对齐：居中 */
  justify-content: center;          /* 主轴对齐：居中 */
  position: relative;               /* 相对定位，作为徽标定位的参考 */
  transition: all 0.3s ease;        /* 过渡效果：所有属性，0.3秒，平滑 */
  overflow: hidden;                 /* 溢出隐藏，确保光效不超出按钮边界 */
  min-width: 180rpx;                /* 最小宽度，确保按钮不会太窄 */
  backdrop-filter: blur(5px);       /* 背景模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 半透明边框 */
}

/* 按钮点击状态 */
.grid-btn:active {
  transform: translateY(4rpx) scale(0.98);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 宽按钮样式 */
.wide-btn {
  width: 60%;
  margin: 0 auto;
  max-width: 500rpx;
}

/* 图标样式 */
.grid-icon {
  font-size: 60rpx;                /* 字体大小 */
  margin-bottom: 15rpx;             /* 底部外边距：15rpx */
  line-height: 1;                  /* 确保行高为1 */
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2); /* 文字阴影 */
  transition: transform 0.3s ease; /* 添加过渡效果 */
}

/* 文字样式 */
.grid-text {
  font-size: 30rpx;                /* 字体大小：32rpx */
  font-weight: 600;                /* 字体粗细：600 */
  color: #ffffff;                  /* 文字颜色：白色 */
  text-align: center;              /* 文字对齐：居中 */
  /* 添加文字阴影效果，提高在渐变背景上的可读性 */
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;             /* 字间距 */
}

/* 徽标样式 */
.badge {
  position: absolute;              /* 绝对定位 */
  top: 20rpx;                      /* 顶部偏移：20rpx */
  right: 20rpx;                    /* 右侧偏移：20rpx */
  width: 16rpx;                    /* 宽度：16rpx */
  height: 16rpx;                   /* 高度：16rpx */
  background: #ffffff;             /* 背景色：白色 */
  border-radius: 50%;              /* 圆角：50%，形成圆形 */
  box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.8); /* 添加发光效果 */
  /* 添加脉冲动画 */
  animation: pulse 1.5s infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

/* 颜色样式 */
.green-btn {
  background: linear-gradient(135deg, rgba(110, 235, 175, 0.9) 0%, rgba(31, 204, 121, 0.9) 100%);
}

.orange-btn {
  background: linear-gradient(135deg, rgba(255, 175, 75, 0.9) 0%, rgba(255, 112, 95, 0.9) 100%);
}

.blue-btn {
  background: linear-gradient(135deg, rgba(116, 182, 247, 0.9) 0%, rgba(94, 114, 235, 0.9) 100%);
}

.purple-btn {
  background: linear-gradient(135deg, rgba(134, 143, 254, 0.9) 0%, rgba(179, 55, 245, 0.9) 100%);
}

.pink-btn {
  background: linear-gradient(135deg, rgba(255, 126, 179, 0.9) 0%, rgba(255, 107, 129, 0.9) 100%);
}

/* 鼠标悬停效果 */
.grid-btn:hover .grid-icon {
  transform: translateY(-5rpx) scale(1.1);
}

/* 媒体查询：适配不同屏幕大小 */
@media screen and (min-width: 768px) {
  /* 大屏幕 */
  .grid-container {
    width: 80%;
  }
  
  .grid-btn {
    height: 220rpx;
  }
  
  .grid-icon {
    font-size: 70rpx;
  }
  
  .grid-text {
    font-size: 34rpx;
  }
}

@media screen and (max-width: 375px) {
  /* 小屏幕 */
  .grid-container {
    width: 95%;
  }
  
  .grid-btn {
    height: 160rpx;
    margin: 0 5rpx;
  }
  
  .grid-icon {
    font-size: 50rpx;
  }
  
  .grid-text {
    font-size: 28rpx;
  }
}
</style>
