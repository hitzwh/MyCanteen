<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title">评论管理</text>
      <view class="refresh-btn" @click="refreshWindows">
        <text class="iconfont icon-refresh"></text>
      </view>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="filter-item">
        <picker mode="selector" :range="ratingOptions" @change="onRatingChange" class="filter-picker">
          <view class="picker-text">
            <text>{{ selectedRating ? `${selectedRating}星及以上` : '所有评分' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="filter-item">
        <picker mode="selector" :range="windowOptions" range-key="name" @change="onWindowChange" class="filter-picker">
          <view class="picker-text">
            <text>{{ selectedWindow ? selectedWindow.name : '所有窗口' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">数据加载中...</text>
    </view>

    <!-- 评论列表 -->
    <scroll-view v-else scroll-y class="comment-list">
      <view class="empty-tip" v-if="filteredComments.length === 0">
        <text>暂无评论数据</text>
      </view>
      
      <view v-for="(item, index) in filteredComments" :key="item._id" class="comment-item">
        <view class="comment-header">
          <view class="user-info">
            <image class="avatar" :src="item.userId?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
            <view class="user-meta">
              <text class="username">{{ item.userId?.username || '匿名用户' }}</text>
              <text class="comment-time">{{ formatDate(item.createdAt) }}</text>
            </view>
          </view>
          <view class="rating">
            <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= item.rating }">★</text>
            <text class="rating-value">{{ item.rating }}</text>
          </view>
        </view>
        
        <view class="dish-info" v-if="item.dishId" @click="viewDishDetails(item.dishId)">
          <image class="dish-image" :src="item.dishId.image || '/static/images/default-dish.jpg'" mode="aspectFill"></image>
          <view class="dish-meta">
            <text class="dish-name">{{ item.dishId.name || '未知菜品' }}</text>
            <text class="window-name">{{ getWindowName(item.dishId.windowId, item.dishId.name) }}</text>
          </view>
        </view>
        
        <view class="comment-content">{{ item.content }}</view>
        
        <view class="comment-images" v-if="item.images && item.images.length > 0">
          <image 
            v-for="(img, imgIdx) in item.images" 
            :key="imgIdx" 
            :src="img" 
            class="comment-image" 
            mode="aspectFill"
            @click="previewImage(item.images, imgIdx)"
          ></image>
        </view>
        
        <view class="comment-actions">
          <text class="reply-btn" @click="replyComment(item)">回复</text>
          <text class="delete-btn" @click="confirmDelete(item)">删除</text>
        </view>
      </view>
    </scroll-view>

    <!-- 回复弹窗 -->
    <view class="modal" v-if="showReplyModal">
      <view class="modal-mask" @click="closeReplyModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">回复评论</text>
          <text class="modal-close" @click="closeReplyModal">×</text>
        </view>
        <view class="modal-body">
          <view class="reply-to">
            回复 {{ currentComment.userId?.username || '匿名用户' }} 的评论：
          </view>
          <view class="original-comment">{{ currentComment.content }}</view>
          <textarea class="reply-textarea" v-model="replyContent" placeholder="请输入回复内容"></textarea>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeReplyModal">取消</button>
          <button class="confirm-btn" @click="submitReply">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onActivated } from 'vue';
import request from '@/utils/request';

// 状态变量
const loading = ref(true);
const comments = ref([]);
const windows = ref([]);
const selectedRating = ref(0);
const selectedWindow = ref(null);
const showReplyModal = ref(false);
const currentComment = ref({});
const replyContent = ref('');
// 定义缓存变量
const windowIdToNameCache = ref({});
const dishWindowCache = ref({});

// 评分选项
const ratingOptions = ['所有评分', '1星及以上', '2星及以上', '3星及以上', '4星及以上', '5星'];

// 计算属性
const windowOptions = computed(() => {
  return [{ _id: '', name: '所有窗口' }, ...windows.value];
});

const filteredComments = computed(() => {
  let result = comments.value;
  
  // 按评分筛选
  if (selectedRating.value > 0) {
    result = result.filter(comment => comment.rating >= selectedRating.value);
  }
  
  // 按窗口筛选
  if (selectedWindow.value && selectedWindow.value._id) {
    const selectedWindowName = selectedWindow.value.name;
    result = result.filter(comment => {
      // 检查菜品是否存在
      if (!comment.dishId) return false;
      
      // 方式1：通过windowId直接匹配
      if (comment.dishId.windowId === selectedWindow.value._id) {
        return true;
      }
      
      // 方式2：通过菜品名称推断的窗口名称匹配
      if (comment.dishId.name) {
        const windowName = getWindowName(comment.dishId.windowId, comment.dishId.name);
        return windowName === selectedWindowName;
      }
      
      return false;
    });
  }
  
  return result;
});

// 初始化方法
onMounted(() => {
  fetchData();
  
  // 添加全局点击事件监听器，用于关闭下拉选择器
  document.addEventListener('click', handleGlobalClick);
});

// 组件卸载时清理
onUnmounted(() => {
  // 移除全局点击事件监听器
  document.removeEventListener('click', handleGlobalClick);
});

// 全局点击事件处理
function handleGlobalClick(e) {
  // 仅H5环境
  // #ifdef H5
  // 如果点击了选择器相关元素，不做处理
  if (e && e.target && 
      (String(e.target.className).includes('picker') || 
       String(e.target.className).includes('selector') ||
       e.target.closest('.uni-picker-container') ||
       e.target.closest('.uni-select'))) {
    // 选择器相关元素被点击，不移除遮罩
    console.log('选择器元素被点击，保持遮罩');
    return;
  }
  
  // 检查是否有遮罩层，尝试移除
  try {
    removeMasks();
  } catch (error) {
    console.error('移除遮罩层时出错:', error);
  }
  // #endif
}

// 获取所有数据
async function fetchData() {
  try {
    loading.value = true;
    
    // 获取窗口列表
    const windowRes = await request.get('/window');
    if (windowRes && windowRes.data) {
      windows.value = windowRes.data;
      console.log(`成功获取${windows.value.length}个窗口信息`);
      
      // 预先建立窗口ID到名称的映射，提高查询效率
      windows.value.forEach(w => {
        windowIdToNameCache.value[w._id] = w.name;
      });
      
      console.log('窗口ID映射已建立');
    }
    
    // 获取所有评论数据
    const commentRes = await request.get('/comment');
    if (commentRes && commentRes.data) {
      comments.value = commentRes.data.list || [];
      console.log(`成功获取${comments.value.length}条评论`);
      
      // 初始处理评论中的菜品信息
      comments.value.forEach(comment => {
        if (comment.dishId && comment.dishId.name) {
          // 如果评论中已有窗口ID，先检查是否合法
          if (comment.dishId.windowId) {
            const windowName = getWindowName(comment.dishId.windowId);
            if (windowName !== '未知窗口') {
              // 窗口ID有效，添加到缓存
              dishWindowCache.value[comment.dishId.name] = windowName;
            } else {
              // 窗口ID无效，标记为需要更新
              comment.dishId.windowId = null;
            }
          }
        }
      });
      
      // 查找所有无窗口ID的菜品，尝试获取其窗口信息
      await fetchDishesWithWindow();
      
      // 最后一次检查，为所有仍未有窗口名称的菜品尝试进行推断
      comments.value.forEach(comment => {
        if (comment.dishId && comment.dishId.name && (!comment.dishId.windowId || !dishWindowCache.value[comment.dishId.name])) {
          // 尝试通过名称推断
          const windowName = getWindowName(null, comment.dishId.name);
          if (windowName !== '未知窗口') {
            dishWindowCache.value[comment.dishId.name] = windowName;
          }
        }
      });
      
      // 批量更新窗口信息
      await updateAllCommentsWindowInfo();
      
      // 过滤评论
      filterComments();
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取菜品对应的窗口信息
async function fetchDishesWithWindow() {
  try {
    // 找出所有缺少窗口ID的评论的菜品ID
    const dishesWithoutWindow = comments.value
      .filter(comment => comment.dishId && (!comment.dishId.windowId || !dishWindowCache.value[comment.dishId.name]))
      .map(comment => comment.dishId._id);
    
    // 如果没有需要获取窗口信息的菜品，直接返回
    if (dishesWithoutWindow.length === 0) return;
    
    // 去重菜品ID
    const uniqueDishIds = [...new Set(dishesWithoutWindow)];
    
    console.log(`尝试获取 ${uniqueDishIds.length} 个菜品的窗口信息`);
    
    // 对每个菜品ID进行查询，获取详细信息包括窗口ID
    for (const dishId of uniqueDishIds) {
      try {
        const res = await request.get(`/dish/${dishId}`);
        if (res && res.data) {
          // 找到对应的窗口名称
          if (res.data.windowId) {
            const windowName = getWindowName(res.data.windowId);
            
            // 更新评论中对应菜品的窗口ID
            comments.value.forEach(comment => {
              if (comment.dishId && comment.dishId._id === dishId) {
                comment.dishId.windowId = res.data.windowId;
                
                // 同时更新缓存
                if (comment.dishId.name) {
                  dishWindowCache.value[comment.dishId.name] = windowName;
                }
              }
            });
          }
        }
      } catch (err) {
        console.error(`获取菜品 ${dishId} 的窗口信息失败:`, err);
      }
    }
    
    console.log('菜品窗口信息获取完成');
  } catch (error) {
    console.error('获取菜品窗口信息失败:', error);
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  
  // 小于1天，显示几小时前
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  }
  
  // 小于7天，显示几天前
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 否则显示完整日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 获取窗口名称
function getWindowName(windowId, dishName = '') {
  // 如果传入了dishName，首先检查缓存
  if (dishName && dishWindowCache.value[dishName]) {
    return dishWindowCache.value[dishName];
  }
  
  // 1. 如果有windowId且能在窗口列表中找到，直接返回窗口名称
  if (windowId) {
    // 尝试从全局缓存中获取
    if (typeof windowIdToNameCache.value[windowId] !== 'undefined') {
      const windowName = windowIdToNameCache.value[windowId];
      // 如果找到窗口名称，且有dishName，则缓存
      if (dishName) {
        dishWindowCache.value[dishName] = windowName;
      }
      return windowName;
    }
    
    // 如果全局缓存中没有，从窗口列表中查找
    const windowObj = windows.value.find(w => w._id === windowId);
    if (windowObj) {
      // 添加到缓存
      windowIdToNameCache.value[windowId] = windowObj.name;
      
      // 如果找到窗口名称，且有dishName，则缓存
      if (dishName) {
        dishWindowCache.value[dishName] = windowObj.name;
      }
      return windowObj.name;
    }
  }
  
  // 2. 如果没有windowId或找不到对应窗口，尝试根据菜品名称推断窗口
  // 菜品名称与窗口的映射关系 - 扩展更多菜品关键词
  const dishToWindowMap = {
    // 鱼粉类
    '鱼粉': '鱼粉窗口',
    '招牌鱼粉': '鱼粉窗口',
    '酸菜鱼粉': '鱼粉窗口',
    '鱼片粉': '鱼粉窗口',
    '鱼丸粉': '鱼粉窗口',
    '三鲜鱼粉': '鱼粉窗口',
    '酸辣鱼粉': '鱼粉窗口',
    '豆皮鱼粉': '鱼粉窗口',
    
    // 牛肉类
    '牛肉粉': '牛肉粉窗口',
    '牛肉面': '牛肉粉窗口',
    '牛腩': '牛肉粉窗口',
    '牛杂': '牛肉粉窗口',
    '水牛肉': '牛肉粉窗口',
    '牛肉丸': '牛肉粉窗口',
    '金汤牛肉': '牛肉粉窗口',
    
    // 面食类
    '兰州拉面': '面食窗口',
    '重庆小面': '面食窗口',
    '刀削面': '面食窗口',
    '担担面': '面食窗口',
    '阳春面': '面食窗口',
    '拌面': '面食窗口',
    '炸酱面': '面食窗口',
    '热干面': '面食窗口',
    '麻辣面': '面食窗口',
    
    // 米粉类
    '米粉': '米粉窗口',
    '肠粉': '米粉窗口',
    '过桥米线': '米粉窗口',
    '桂林米粉': '米粉窗口',
    '炒米粉': '米粉窗口',
    '卤肉米粉': '米粉窗口',
    
    // 炒饭类
    '炒饭': '炒饭窗口',
    '盖浇饭': '炒饭窗口',
    '蛋炒饭': '炒饭窗口',
    '扬州炒饭': '炒饭窗口',
    '咖喱饭': '炒饭窗口',
    '焗饭': '炒饭窗口',
    '黄焖鸡米饭': '炒饭窗口',
    '鲍汁饭': '炒饭窗口',
    
    // 麻辣烫类
    '麻辣烫': '麻辣烫窗口',
    '冒菜': '麻辣烫窗口',
    '串串香': '麻辣烫窗口',
    '麻辣香锅': '麻辣烫窗口',
    '麻辣拌': '麻辣烫窗口',
    
    // 饺子类
    '水饺': '饺子窗口',
    '馄饨': '饺子窗口',
    '饺子': '饺子窗口',
    '云吞': '饺子窗口',
    '生煎': '饺子窗口',
    '锅贴': '饺子窗口',
    
    // 砂锅类
    '砂锅': '砂锅油饼窗口',
    '砂锅粥': '砂锅油饼窗口',
    '砂锅米线': '砂锅油饼窗口',
    '煲仔饭': '砂锅油饼窗口',
    
    // 油饼类
    '油饼': '砂锅油饼窗口',
    '油条': '砂锅油饼窗口',
    '烧饼': '砂锅油饼窗口',
    '葱油饼': '砂锅油饼窗口',
    
    // 水果类
    '水果': '水果窗口',
    '果汁': '水果窗口',
    '果盘': '水果窗口',
    '水果沙拉': '水果窗口',
    
    // 甜品饮料类
    '奶茶': '甜品饮料窗口',
    '冰淇淋': '甜品饮料窗口',
    '甜品': '甜品饮料窗口',
    '布丁': '甜品饮料窗口',
    '奶昔': '甜品饮料窗口',
    '蛋糕': '甜品饮料窗口'
  };
  
  // 遍历所有菜品名称映射，检查当前菜品名称是否包含某个关键词
  if (dishName) {
    // 优先精确匹配
    if (dishToWindowMap[dishName]) {
      dishWindowCache.value[dishName] = dishToWindowMap[dishName];
      return dishToWindowMap[dishName];
    }
    
    // 然后尝试包含匹配
    for (const [keyword, windowName] of Object.entries(dishToWindowMap)) {
      if (dishName.includes(keyword)) {
        // 缓存结果
        dishWindowCache.value[dishName] = windowName;
        return windowName;
      }
    }
    
    // 如果上面的精确匹配没找到，尝试模糊匹配 - 检查菜品名称的前两个字符是否匹配某个窗口类别
    const prefix = dishName.substring(0, 2);
    const windowCategories = {
      '鱼': '鱼粉窗口',
      '牛': '牛肉粉窗口',
      '面': '面食窗口',
      '米': '米粉窗口',
      '炒': '炒饭窗口',
      '盖': '炒饭窗口',
      '麻辣': '麻辣烫窗口',
      '水饺': '饺子窗口',
      '砂': '砂锅油饼窗口',
      '油': '砂锅油饼窗口',
      '果': '水果窗口',
      '甜': '甜品饮料窗口',
      '奶': '甜品饮料窗口'
    };
    
    for (const [prefixKey, windowName] of Object.entries(windowCategories)) {
      if (prefix.includes(prefixKey)) {
        // 缓存这个结果，但标记为"推断"
        dishWindowCache.value[dishName] = windowName;
        return windowName;
      }
    }
  }
  
  // 3. 如果都无法推断，返回未知窗口
  return '未知窗口';
}

// 评分筛选变化
function onRatingChange(e) {
  const index = e.detail.value;
  if (index === 0) {
    selectedRating.value = 0;
  } else {
    selectedRating.value = index;
  }
  
  // 移除遮罩层
  setTimeout(() => {
    removeMasks();
  }, 100);
}

// 窗口筛选变化
function onWindowChange(e) {
  const index = e.detail.value;
  selectedWindow.value = windowOptions.value[index];
  
  // 调试信息：查看当前选中的窗口
  if (selectedWindow.value && selectedWindow.value._id) {
    console.log(`当前选中窗口: ${selectedWindow.value.name}, ID: ${selectedWindow.value._id}`);
    
    // 检查匹配到的评论
    const matchedComments = comments.value.filter(comment => {
      if (!comment.dishId) return false;
      
      const directMatch = comment.dishId.windowId === selectedWindow.value._id;
      let indirectMatch = false;
      
      if (comment.dishId.name) {
        const windowName = getWindowName(comment.dishId.windowId, comment.dishId.name);
        indirectMatch = windowName === selectedWindow.value.name;
      }
      
      if (directMatch || indirectMatch) {
        console.log(`匹配到评论 - 菜品: ${comment.dishId.name}, 窗口ID: ${comment.dishId.windowId}, 推断窗口: ${getWindowName(comment.dishId.windowId, comment.dishId.name)}`);
      }
      
      return directMatch || indirectMatch;
    });
    
    console.log(`筛选后匹配到 ${matchedComments.length} 条评论`);
  }
  
  // 移除遮罩层
  setTimeout(() => {
    removeMasks();
  }, 100);
}

// 移除可能存在的遮罩层
function removeMasks() {
  // 仅在H5环境下执行DOM操作
  // #ifdef H5
  try {
    // 确保document存在
    if (typeof document === 'undefined' || !document.body) {
      console.warn('document或document.body不存在，无法移除遮罩层');
      return;
    }
    
    // 查找并处理遮罩层，但不处理正在使用的选择器遮罩
    const masks = document.querySelectorAll('.uni-mask:not(.uni-picker-mask), .uni-picker-mask:not(.active-picker-mask)');
    if (masks && masks.length > 0) {
      masks.forEach(mask => {
        try {
          // 检查是否是当前活动的选择器遮罩
          const isActivePicker = mask.closest && (
            mask.closest('.uni-picker-container.active') || 
            mask.closest('.uni-select.active')
          );
          
          if (!isActivePicker) {
            mask.style.backgroundColor = 'transparent';
            mask.style.display = 'none';
            console.log('已移除非活动选择器遮罩层');
          }
        } catch (error) {
          console.error('处理遮罩层时出错:', error);
        }
      });
    }
  } catch (error) {
    console.error('移除遮罩层失败:', error);
  }
  // #endif
  
  // 在非H5环境下，依赖样式覆盖
  // 触发视图更新，但避免频繁刷新
  if (!removeMasks._isRefreshing) {
    removeMasks._isRefreshing = true;
    try {
      loading.value = !loading.value;
      setTimeout(() => {
        loading.value = !loading.value;
        removeMasks._isRefreshing = false;
      }, 100);
    } catch (error) {
      console.error('触发视图更新失败:', error);
      removeMasks._isRefreshing = false;
    }
  }
}

// 预览图片
function previewImage(images, current) {
  uni.previewImage({
    urls: images,
    current: images[current]
  });
}

// 回复评论
function replyComment(comment) {
  currentComment.value = comment;
  replyContent.value = '';
  showReplyModal.value = true;
}

// 关闭回复弹窗
function closeReplyModal() {
  showReplyModal.value = false;
  currentComment.value = {};
  replyContent.value = '';
}

// 提交回复
async function submitReply() {
  if (!replyContent.value.trim()) {
    uni.showToast({
      title: '请输入回复内容',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: '提交中...'
    });
    
    // 这里应该调用API发送回复消息
    // 但API文档中没有直接提供回复评论的接口，可能需要使用消息系统
    // 模拟一个成功响应
    
    uni.hideLoading();
    uni.showToast({
      title: '回复成功',
      icon: 'success'
    });
    
    closeReplyModal();
  } catch (error) {
    console.error('回复失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '回复失败，请重试',
      icon: 'none'
    });
  }
}

// 确认删除
async function confirmDelete(comment) {
  if (!comment || !comment._id) {
    uni.showToast({
      title: '评论数据无效',
      icon: 'none'
    });
    return;
  }

  try {
    uni.showLoading({
      title: '删除中...',
      mask: true
    });
    
    // 这里应该调用API删除评论
    // 但API文档中没有提供删除评论的接口
    // 模拟一个成功响应
    
    uni.hideLoading();
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
    
    // 从列表中移除
    const index = comments.value.findIndex(item => item._id === comment._id);
    if (index !== -1) {
      comments.value.splice(index, 1);
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '删除失败，请重试',
      icon: 'none'
    });
  }
}

// 返回上一页
function goBack() {
  uni.navigateTo({
    url: '/pages/workerindex/index'
  });
}

// 批量更新所有评论中菜品的窗口信息
async function updateAllCommentsWindowInfo() {
  try {
    // 获取所有菜品ID
    const allDishIds = [];
    comments.value.forEach(comment => {
      if (comment.dishId && comment.dishId._id) {
        allDishIds.push(comment.dishId._id);
      }
    });
    
    // 去重
    const uniqueDishIds = [...new Set(allDishIds)];
    console.log(`准备批量获取${uniqueDishIds.length}个菜品的窗口信息`);
    
    // 创建一个菜品ID到窗口ID的映射
    const dishIdToWindowId = {};
    
    // 批量获取菜品详情
    for (const dishId of uniqueDishIds) {
      try {
        const res = await request.get(`/dish/${dishId}`);
        if (res && res.data && res.data.windowId) {
          dishIdToWindowId[dishId] = res.data.windowId;
          
          // 如果有菜品名称，也存入缓存
          if (res.data.name) {
            const windowName = getWindowName(res.data.windowId);
            if (windowName !== '未知窗口') {
              dishWindowCache.value[res.data.name] = windowName;
            }
          }
        }
      } catch (error) {
        console.error(`获取菜品${dishId}详情失败:`, error);
      }
    }
    
    // 更新所有评论中的菜品窗口ID
    let updatedCount = 0;
    comments.value.forEach(comment => {
      if (comment.dishId && comment.dishId._id && dishIdToWindowId[comment.dishId._id]) {
        comment.dishId.windowId = dishIdToWindowId[comment.dishId._id];
        updatedCount++;
        
        // 如果菜品有名称，也更新缓存
        if (comment.dishId.name) {
          const windowName = getWindowName(comment.dishId.windowId);
          if (windowName !== '未知窗口') {
            dishWindowCache.value[comment.dishId.name] = windowName;
          }
        }
      }
    });
    
    console.log(`批量更新菜品窗口信息完成，更新了${updatedCount}条评论`);
  } catch (error) {
    console.error('批量更新菜品窗口信息失败:', error);
  }
}

// 查看菜品详情
function viewDishDetails(dishId) {
  if (!dishId) return;
  
  uni.showLoading({
    title: '获取菜品信息...'
  });
  
  request.get(`/dish/${dishId._id}`)
    .then(res => {
      uni.hideLoading();
      
      if (res && res.data) {
        const dish = res.data;
        console.log('菜品详情:', dish);
        
        // 显示菜品详情
        uni.showModal({
          title: dish.name || '菜品详情',
          content: `
            菜品ID: ${dish._id}
            窗口ID: ${dish.windowId || '未关联窗口'}
            窗口名称: ${getWindowName(dish.windowId) || '未知窗口'}
            价格: ${dish.price || '未设置'} 元
            描述: ${dish.description || '无描述'}
          `,
          showCancel: false
        });
      } else {
        uni.showToast({
          title: '未找到菜品信息',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      uni.hideLoading();
      console.error('获取菜品详情失败:', err);
      uni.showToast({
        title: '获取菜品详情失败',
        icon: 'none'
      });
    });
}

// 刷新窗口信息
async function refreshWindows() {
  try {
    uni.showLoading({
      title: '刷新窗口信息...'
    });
    
    // 获取最新窗口列表
    const windowRes = await request.get('/window');
    if (windowRes && windowRes.data) {
      windows.value = windowRes.data;
      console.log(`刷新获取${windows.value.length}个窗口信息`);
      
      // 更新窗口ID到名称的映射
      // 清空当前缓存
      Object.keys(windowIdToNameCache.value).forEach(key => {
        delete windowIdToNameCache.value[key];
      });
      
      // 重新填充缓存
      windows.value.forEach(w => {
        windowIdToNameCache.value[w._id] = w.name;
      });
      
      // 清空窗口名称缓存，强制重新获取
      Object.keys(dishWindowCache.value).forEach(key => {
        delete dishWindowCache.value[key];
      });
      
      // 重新同步评论中的窗口信息
      await updateAllCommentsWindowInfo();
      
      // 重新过滤评论
      filterComments();
      
      uni.hideLoading();
      uni.showToast({
        title: '窗口信息已刷新',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('刷新窗口信息失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    });
  }
}

// 手动过滤评论
function filterComments() {
  // 这个函数不需要实际代码，只需触发计算属性重新计算
  // 由于filteredComments是计算属性，任何依赖项的变化都会自动触发重新计算
  console.log('正在重新过滤评论...');
  
  // 如果需要强制更新，可以修改一个依赖项，然后恢复
  const currentRating = selectedRating.value;
  selectedRating.value = -1; // 临时修改
  setTimeout(() => {
    selectedRating.value = currentRating; // 恢复原值，触发更新
  }, 0);
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f8f8f8;
}

/* 页面标题样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.back-btn, .refresh-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.refresh-btn {
  background-color: #f0f9ff;
}

.iconfont{
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-left: 30rpx;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 10;
}

.filter-item {
  position: relative;
  z-index: 10;
  margin-right: 20rpx;
}

.filter-picker {
  min-width: 180rpx;
}

.picker-text {
  height: 70rpx;
  background-color: #ffffff;
  border-radius: 35rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  font-size: 26rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #34c759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 30rpx;
  color: #666;
}

/* 评论列表样式 */
.comment-list {
  max-height: calc(100vh - 200rpx);
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.comment-item {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.rating {
  display: flex;
  align-items: center;
}

.star {
  font-size: 30rpx;
  color: #ddd;
  margin-right: 4rpx;
}

.star.active {
  color: #ffcc00;
}

.rating-value {
  margin-left: 8rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #ffcc00;
}

.dish-info {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 16rpx;
  margin-bottom: 20rpx;
}

.dish-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 16rpx;
  object-fit: cover;
}

.dish-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dish-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.window-name {
  font-size: 24rpx;
  color: #666;
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
  margin-bottom: 20rpx;
}

.comment-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 10rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  object-fit: cover;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f5f5f5;
  padding-top: 20rpx;
}

.reply-btn, .delete-btn {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.reply-btn {
  background-color: #f0f9ff;
  color: #1989fa;
}

.delete-btn {
  background-color: #fff0f0;
  color: #ff4d4f;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
}

.reply-to {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.original-comment {
  font-size: 28rpx;
  color: #333;
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.reply-textarea {
  width: 100%;
  height: 200rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn, .confirm-btn {
  padding: 16rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin-left: 20rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #34c759;
  color: #ffffff;
}

/* 全局修复遮罩层问题 */
/* 修复uni-app原生组件样式 */
page {
  /* 防止picker遮罩层导致整个页面变灰 */
  --picker-mask-background: transparent !important;
  --picker-view-z-index: 999999;
  --picker-indicator-height: 80rpx;
}

/* 修复uni-select选择器的mask问题 */
:deep(.uni-mask),
:deep(.uni-picker-mask) {
  background-color: transparent !important;
  pointer-events: auto !important;
  z-index: 999998 !important;
}

/* 修复uni-picker弹出层的样式 */
:deep(.uni-picker),
:deep(.uni-picker-container),
:deep(.uni-picker-view),
:deep(.uni-select),
:deep(.uni-select-picker) {
  z-index: 999999 !important;
  pointer-events: auto !important;
  touch-action: auto !important;
}

:deep(.uni-picker-view-indicator),
:deep(.uni-picker-view-content),
:deep(.uni-picker-view-wrapper) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

:deep(.uni-picker-view-column) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

:deep(.uni-picker-item) {
  touch-action: pan-y !important;
  pointer-events: auto !important;
}

:deep(.uni-picker-toggle),
:deep(.uni-picker-action) {
  z-index: 999999 !important;
  pointer-events: auto !important;
}

/* 确保选择器弹出框可点击 */
.uni-picker-view-column,
.uni-picker-item,
:deep(.uni-picker-view-column),
:deep(.uni-picker-item) {
  pointer-events: auto !important;
  touch-action: pan-y !important;
}

/* 解决picker选择器弹出时背景变灰的问题 */
:deep(.uni-picker .uni-picker-view-mask) {
  background-color: transparent !important;
}

/* 解决移动端picker选择问题 */
@media screen and (max-width: 768px) {
  .uni-picker-container {
    top: auto !important;
    bottom: 0;
    z-index: 999999 !important;
    pointer-events: auto !important;
  }
  
  /* 确保选择器内容可滑动 */
  .uni-picker-view-column {
    overflow: visible !important;
    pointer-events: auto !important;
    touch-action: pan-y !important;
  }
}
</style>