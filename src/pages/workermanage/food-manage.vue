<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title">菜品管理</text>
      <view class="add-btn" @click="showAddModal">
        <text class="iconfont icon-add-fill"></text>
      </view>
    </view>

    <!-- 搜索和筛选区域 -->
    <view class="filter-section">
      <view class="search-box">
        <input type="text" v-model="searchText" placeholder="搜索菜品名称" class="search-input" />
        <text class="search-icon">🔍</text>
      </view>
      <view class="filter-options">
        <view class="filter-item">
          <picker 
            mode="selector" 
            :range="windowOptions" 
            range-key="name" 
            @change="onWindowChange" 
            class="standard-picker"
          >
            <view class="picker-text">
              <text>{{ selectedWindow ? selectedWindow.name : '所有窗口' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">数据加载中...</text>
    </view>

    <!-- 菜品列表 -->
    <scroll-view v-else scroll-y class="dish-list">
      <view class="empty-tip" v-if="!selectedWindow || !selectedWindow._id">
        <text>请先选择一个窗口查看菜品</text>
      </view>
      
      <view class="empty-tip" v-else-if="filteredDishes.length === 0">
        <text>当前窗口暂无菜品数据，点击右上角添加</text>
      </view>
      
      <view v-for="(item, index) in filteredDishes" :key="item._id" class="dish-item">
        <view class="status-badge" v-if="item.status === 'soldout'">已售罄</view>
        <image 
          class="dish-image" 
          :src="getDishImage(item)" 
          mode="aspectFill"
        ></image>
        <view class="dish-info">
          <view class="dish-header">
            <text class="dish-name">{{ item.name }}</text>
            <text class="dish-price">¥{{ item.price || '0.00' }}</text>
          </view>
          <text class="dish-desc">{{ item.description || '暂无描述' }}</text>
          <view class="dish-meta">
            <text class="meta-item">
              <text class="meta-label">所属窗口：</text>
              <text>{{ getWindowName(item.windowId) || '未知' }}</text>
            </text>
            <text class="meta-item">
              <text class="meta-label">评分：</text>
              <text class="rating">{{ item.rating ? item.rating.toFixed(1) : '0.0' }} ⭐</text>
              <text class="rating-count">({{ item.ratingCount || 0 }}人评价)</text>
            </text>
          </view>
          <view class="tag-list" v-if="item.tags && item.tags.length > 0">
            <text class="tag" v-for="(tag, idx) in item.tags" :key="idx">{{ tag }}</text>
          </view>
          <view class="dish-actions">
            <text 
              :class="['status-btn', isUpdatingDishStatus ? 'disabled-btn' : '']" 
              @click.stop.prevent="toggleDishStatus(item)"
            >
              {{ item.status === 'soldout' ? '标记为可售' : '标记为售罄' }}
              <text v-if="isUpdatingDishStatus" class="loading-dot">...</text>
            </text>
            <text class="edit-btn" @click.stop="showEditModal(item)">编辑</text>
            <text class="delete-btn" @click.stop="confirmDelete(item)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑菜品弹窗 -->
    <view class="modal" v-if="showModal" @click.stop>
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑菜品' : '添加菜品' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <view class="form-item">
              <text class="form-label">菜品名称</text>
              <input type="text" v-model="dishForm.name" placeholder="请输入菜品名称" class="form-input" />
            </view>
            
            <view class="form-item">
              <text class="form-label">菜品价格</text>
              <input type="digit" v-model="dishForm.price" placeholder="请输入菜品价格" class="form-input" />
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">所属窗口</text>
            <picker 
              mode="selector" 
              :range="windows" 
              range-key="name" 
              @change="onFormWindowChange" 
              class="form-picker"
            >
              <view class="picker-view">
                <text>{{ getWindowName(dishForm.windowId) || '请选择窗口' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">菜品描述</text>
            <textarea v-model="dishForm.description" placeholder="请输入菜品描述" class="form-textarea"></textarea>
          </view>
          
          <view class="form-item">
            <DishImageUploader 
              v-model="dishForm.images" 
              @input="handleImageChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">标签</text>
            <view class="tags-container">
              <view class="tag-list">
                <view class="tag-item" v-for="(tag, idx) in dishForm.tags" :key="idx">
                  {{ tag }}
                  <text class="tag-delete" @click="removeTag(idx)">×</text>
                </view>
              </view>
              <view class="tag-input-wrapper">
                <input 
                  type="text" 
                  v-model="newTag" 
                  placeholder="输入标签按回车添加" 
                  class="tag-input"
                  @confirm="addTag" 
                />
                <text class="tag-add-btn" @click="addTag">添加</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="submitForm">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onActivated } from 'vue';
import request from '@/utils/request';
import DishImageUploader from '@/components/DishImageUploader.vue';

// 状态变量
const loading = ref(true);
const dishes = ref([]);
const windows = ref([]);
const searchText = ref('');
const selectedWindow = ref({ _id: '', name: '所有窗口' });
const showModal = ref(false);
const isEditing = ref(false);
const currentDishId = ref('');
const newTag = ref('');
const isUpdatingDishStatus = ref(false); // 添加本地状态变量替代全局变量

// 表单数据
const dishForm = reactive({
  name: '',
  price: '',
  description: '',
  images: [],
  windowId: '',
  tags: []
});

// 计算属性
const windowOptions = computed(() => {
  return [{ _id: '', name: '所有窗口' }, ...windows.value];
});

const filteredDishes = computed(() => {
  let result = dishes.value;
  
  // 按名称搜索
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    result = result.filter(dish => 
      dish.name && dish.name.toLowerCase().includes(keyword) ||
      dish.description && dish.description.toLowerCase().includes(keyword)
    );
  }
  
  return result;
});

// 初始化方法
onMounted(() => {
  setTimeout(() => {
    fetchData();
  }, 100);
  
  setTimeout(() => {
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.addEventListener('click', handleGlobalClick);
      }
    } catch (error) {
      console.error('添加事件监听器失败:', error);
    }
  }, 300);
});

// 页面显示时
onActivated(() => {
  console.log('页面激活，重置状态');
  // 重置状态变量，防止从其他页面返回后状态错误
  isUpdatingDishStatus.value = false;
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
    console.log('开始获取菜品管理数据...');
    
    // 获取窗口列表
    console.log('获取窗口列表...');
    try {
      const windowRes = await request.get('/window');
      console.log('窗口列表响应:', windowRes);
      
      if (windowRes && windowRes.code === 0 && windowRes.data) {
        windows.value = windowRes.data;
        console.log(`获取到${windows.value.length}个窗口:`, windows.value.map(w => w.name));
        
        // 确保selectedWindow正确初始化为"所有窗口"选项
        selectedWindow.value = { _id: '', name: '所有窗口' };
        console.log('初始化窗口选择:', selectedWindow.value.name);
        
        // 初始化时不加载菜品数据，等待用户选择窗口
        dishes.value = [];
      } else {
        console.warn('获取窗口列表失败或为空:', windowRes);
        throw new Error(windowRes?.message || '获取窗口列表失败');
      }
    } catch (windowError) {
      console.error('获取窗口列表失败:', windowError);
      uni.showToast({
        title: windowError.message || '获取窗口列表失败',
        icon: 'none'
      });
      windows.value = [];
      selectedWindow.value = { _id: '', name: '所有窗口' };
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    });
    dishes.value = [];
    windows.value = [];
    selectedWindow.value = { _id: '', name: '所有窗口' };
  } finally {
    loading.value = false;
    console.log('窗口数据获取完成，等待用户选择窗口');
  }
}

// 根据窗口ID获取菜品
async function fetchDishesByWindow(windowId) {
  try {
    loading.value = true;
    console.log(`开始获取窗口(ID: ${windowId})的菜品数据...`);
    
    let result = [];
    
    if (!windowId) {
      // 如果选择的是"所有窗口"，则获取所有菜品
      console.log('获取所有窗口的菜品...');
      try {
        // 修改为使用与特定窗口相同的数据处理方式
        const allDishesRes = await request.get('/worker/dish/all', {
          populate: 'windowId,canteenId' // 请求时添加populate参数，确保返回窗口和食堂信息
        });
        
        if (allDishesRes && allDishesRes.code === 0 && allDishesRes.data) {
          result = allDishesRes.data;
          console.log(`获取到${result.length}个菜品`);
          
          // 为每个菜品获取评分信息
          result = await Promise.all(
            result.map(async (dish) => {
              try {
                // 获取菜品详情以获取评分信息
                const dishDetailRes = await request.get(`/worker/dish/${dish._id}`);
                if (dishDetailRes && dishDetailRes.code === 0 && dishDetailRes.data) {
                  // 合并评分信息
                  dish.rating = dishDetailRes.data.rating || 0;
                  dish.ratingCount = dishDetailRes.data.ratingCount || 0;
                  
                  // 确保窗口信息正确
                  if (dishDetailRes.data.windowId && typeof dishDetailRes.data.windowId === 'object') {
                    dish.windowId = dishDetailRes.data.windowId;
                  }
                }
              } catch (error) {
                console.error(`获取菜品${dish._id}评分信息失败:`, error);
              }
              return dish;
            })
          );
        } else {
          console.warn('获取所有菜品失败或为空:', allDishesRes);
          throw new Error(allDishesRes?.message || '获取菜品失败');
        }
      } catch (error) {
        console.error('获取所有菜品失败:', error);
        uni.showToast({
          title: error.message || '获取菜品失败',
          icon: 'none'
        });
      }
    } else {
      // 获取指定窗口的菜品
      console.log(`获取窗口(ID: ${windowId})的菜品...`);
      try {
        const dishesRes = await request.get(`/worker/dish/window/${windowId}`);
        if (dishesRes && dishesRes.code === 0 && dishesRes.data) {
          result = dishesRes.data;
          console.log(`获取到${result.length}个菜品`);
        } else {
          console.warn('获取窗口菜品失败或为空:', dishesRes);
          throw new Error(dishesRes?.message || '获取菜品失败');
        }
      } catch (error) {
        console.error(`获取窗口(ID: ${windowId})菜品失败:`, error);
        uni.showToast({
          title: error.message || '获取菜品失败',
          icon: 'none'
        });
      }
    }
    
    // 处理每个菜品的图片数据
    result = result.map(dish => {
      console.log(`处理第${result.indexOf(dish)+1}个菜品的图片数据:`, dish.name);
      
      // 打印原始数据，用于调试
      console.log('菜品原始数据:', JSON.stringify(dish));
      
      // 确保images字段是数组
      if (!dish.images) {
        dish.images = [];
      }
      
      // 如果有单个image字段但没有images数组，将image添加到images数组
      if (dish.image && typeof dish.image === 'string' && dish.image.trim().length > 0) {
        if (!dish.images.includes(dish.image.trim())) {
          dish.images.unshift(dish.image.trim());
          console.log(`将单个image字段添加到images数组开头:`, dish.image);
        }
      }
      
      // 过滤掉无效的图片URL
      dish.images = dish.images.filter(url => {
        if (!url || typeof url !== 'string') {
          console.log('过滤掉无效的图片URL:', url);
          return false;
        }
        const trimmedUrl = url.trim();
        if (trimmedUrl.length === 0) {
          console.log('过滤掉空URL');
          return false;
        }
        if (trimmedUrl.includes('example.com')) {
          console.log('过滤掉示例域名URL:', trimmedUrl);
          return false;
        }
        return true;
      });
      
      // 记录图片信息
      if (dish.images && dish.images.length) {
        console.log(`菜品 "${dish.name}" 有${dish.images.length}张图片:`, dish.images);
      } else {
        console.log(`菜品 "${dish.name}" 没有图片`);
      }
      
      // 确保status字段存在，如果不存在则默认为available
      if (!dish.status) {
        dish.status = 'available';
      }
      
      return dish;
    });
    
    dishes.value = result;
    
  } catch (error) {
    console.error('获取菜品数据失败:', error);
    dishes.value = [];
  } finally {
    loading.value = false;
    console.log('菜品数据获取完成');
  }
}

// 获取窗口名称
function getWindowName(windowId) {
  // 如果windowId是对象（已经populate过），直接返回name属性
  if (windowId && typeof windowId === 'object' && windowId.name) {
    return windowId.name;
  }
  
  // 如果windowId是字符串（ID），在窗口列表中查找
  if (windowId && typeof windowId === 'string') {
    const window = windows.value.find(w => w._id === windowId);
    return window ? window.name : '未知窗口';
  }
  
  return '未知窗口';
}

// 窗口筛选变化
function onWindowChange(e) {
  const index = e.detail.value;
  if (index !== undefined && windowOptions.value && windowOptions.value[index]) {
    selectedWindow.value = windowOptions.value[index] || { _id: '', name: '所有窗口' };
    console.log('窗口选择已更改为:', selectedWindow.value.name, '(ID:', selectedWindow.value._id, ')');
    
    // 根据选择的窗口获取菜品
    fetchDishesByWindow(selectedWindow.value._id);
    
    // 安全地尝试移除遮罩层
    try {
      setTimeout(() => {
        removeMasks();
      }, 100);
    } catch (error) {
      console.error('移除遮罩层时出错:', error);
    }
  }
}

// 返回上一页
function goBack() {
  uni.navigateTo({
    url: '/pages/workerindex/index'
  });
}

// 显示添加弹窗
function showAddModal() {
  isEditing.value = false;
  resetForm();
  
  // 如果已经选择了窗口（不是"所有窗口"），默认设置为该窗口
  if (selectedWindow.value && selectedWindow.value._id) {
    dishForm.windowId = selectedWindow.value._id;
    console.log('添加菜品时默认设置窗口:', getWindowName(dishForm.windowId), '(ID:', dishForm.windowId, ')');
  } else {
    // 如果当前是"所有窗口"，则提示用户先选择一个窗口
    uni.showToast({
      title: '请先选择一个窗口',
      icon: 'none'
    });
    return;
  }
  
  showModal.value = true;
}

// 显示编辑弹窗
function showEditModal(item) {
  isEditing.value = true;
  currentDishId.value = item._id;
  initFormData(item);
  showModal.value = true;
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
  resetForm();
  console.log('弹窗已关闭，表单已重置');
}

// 重置表单
function resetForm() {
  console.log('重置菜品表单数据');
  
  dishForm.name = '';
  dishForm.price = '';
  dishForm.description = '';
  dishForm.images = []; // 确保是一个新的空数组
  dishForm.windowId = selectedWindow.value && selectedWindow.value._id ? selectedWindow.value._id : '';
  dishForm.tags = []; // 确保是一个新的空数组
  newTag.value = '';
  
  // 重置编辑状态
  currentDishId.value = '';
  
  console.log('表单已重置，当前窗口:', getWindowName(dishForm.windowId) || '未选择');
}

// 初始化表单数据
function initFormData(item) {
  console.log('开始初始化菜品表单数据:', item.name);
  
  dishForm.name = item.name || '';
  dishForm.price = item.price || '';
  dishForm.description = item.description || '';
  
  // 重置图片数组
  dishForm.images = [];
  
  // 处理图片数据
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    // 过滤无效的图片URL和示例域名
    const validImages = item.images.filter(url => {
      if (!url || typeof url !== 'string') {
        console.log('过滤无效的图片URL:', url);
        return false;
      }
      
      const trimmedUrl = url.trim();
      if (trimmedUrl.includes('example.com')) {
        console.log('过滤示例域名的图片URL:', trimmedUrl);
        return false;
      }
      
      if (trimmedUrl.length === 0) {
        console.log('过滤空URL');
        return false;
      }
      
      return true;
    });
    
    // 直接赋值有效的图片URL
    dishForm.images = validImages;
    
    console.log('初始化菜品图片成功，数组内容:', dishForm.images);
    console.log('有效图片数量:', dishForm.images.length);
  } else if (item.image && typeof item.image === 'string') {
    // 处理单张图片的情况
    const imageUrl = item.image.trim();
    if (!imageUrl.includes('example.com') && imageUrl.length > 0) {
      dishForm.images = [imageUrl];
      console.log('初始化单张图片成功:', imageUrl);
    } else {
      console.log('单张图片URL无效或为示例域名:', imageUrl);
      dishForm.images = [];
    }
  } else {
    dishForm.images = [];
    console.log('菜品没有图片，设置为空数组');
  }
  
  // 设置窗口ID
  if (item.windowId) {
    dishForm.windowId = item.windowId;
    console.log('初始化菜品窗口ID:', dishForm.windowId);
  } else {
    dishForm.windowId = '';
    console.warn('菜品没有窗口ID');
  }
  
  // 处理标签数据
  dishForm.tags = item.tags && Array.isArray(item.tags) ? [...item.tags] : [];
  newTag.value = '';
  
  console.log('表单数据初始化完成:', {
    name: dishForm.name,
    images: dishForm.images,
    imagesLength: dishForm.images.length,
    windowId: dishForm.windowId,
    tags: dishForm.tags.length
  });
}

// 添加标签
function addTag() {
  if (newTag.value && !dishForm.tags.includes(newTag.value)) {
    dishForm.tags.push(newTag.value);
    newTag.value = '';
  }
}

// 删除标签
function removeTag(index) {
  dishForm.tags.splice(index, 1);
}

// 处理图片变化
function handleImageChange(newImages) {
  console.log('接收到图片变化:', newImages);
  if (Array.isArray(newImages)) {
    dishForm.images = [...newImages];
    console.log('更新表单中的图片数据:', dishForm.images);
  } else {
    console.warn('收到的图片数据不是数组:', newImages);
    dishForm.images = [];
  }
}

// 提交表单
async function submitForm() {
  // 表单验证
  if (!dishForm.name) {
    uni.showToast({
      title: '请输入菜品名称',
      icon: 'none'
    });
    return;
  }
  
  if (!dishForm.price) {
    uni.showToast({
      title: '请输入菜品价格',
      icon: 'none'
    });
    return;
  }
  
  if (!dishForm.windowId) {
    uni.showToast({
      title: '请选择所属窗口',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: isEditing.value ? '保存中...' : '添加中...'
    });
    
    console.log('准备提交菜品表单数据...');
    console.log('当前表单数据:', {
      name: dishForm.name,
      price: dishForm.price,
      description: dishForm.description?.substring(0, 20) + '...',
      windowId: dishForm.windowId,
      imagesCount: dishForm.images?.length || 0,
      tagsCount: dishForm.tags?.length || 0
    });
    
    // 创建要发送的数据副本
    const formData = {
      name: dishForm.name,
      price: parseFloat(dishForm.price),
      description: dishForm.description,
      windowId: dishForm.windowId,
      tags: [...dishForm.tags]
    };
    
    // 处理图片数据
    if (Array.isArray(dishForm.images) && dishForm.images.length > 0) {
      // 过滤并验证图片URL
      const validImages = dishForm.images.filter(url => {
        if (!url || typeof url !== 'string') {
          console.log('过滤无效的图片URL:', url);
          return false;
        }
        
        const trimmedUrl = url.trim();
        if (trimmedUrl.length === 0) {
          console.log('过滤空URL');
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
      });
      
      if (validImages.length > 0) {
        // 同时设置image和images字段，确保兼容性
        formData.image = validImages[0];
        formData.images = validImages;
        console.log('添加有效的图片URL到请求数据中:', {
          mainImage: formData.image,
          allImagesCount: formData.images.length
        });
      } else {
        console.warn('没有有效的图片URL');
        formData.images = [];
        formData.image = '';
      }
    } else {
      console.warn('没有图片数据');
      formData.images = [];
      formData.image = '';
    }
    
    console.log('最终提交的表单数据准备完成');
    
    let res;
    if (isEditing.value) {
      console.log(`准备更新菜品(ID: ${currentDishId.value})...`);
      res = await request.put(`/worker/dish/${currentDishId.value}`, formData);
      console.log(`更新菜品API响应:`, res ? `状态码: ${res.code}` : '无响应');
    } else {
      console.log('准备添加新菜品...');
      res = await request.post('/worker/dish', formData);
      console.log(`添加菜品API响应:`, res ? `状态码: ${res.code}` : '无响应');
    }
    
    if (res && res.code === 0) {
      console.log('保存菜品成功，服务器返回数据ID:', res.data?._id);
      
      uni.hideLoading();
      uni.showToast({
        title: isEditing.value ? '保存成功' : '添加成功',
        icon: 'success',
        duration: 1500
      });
      
      // 关闭弹窗并刷新菜品列表
      closeModal();
      await fetchDishesByWindow(selectedWindow.value._id);
    } else {
      throw new Error(res?.message || '操作失败，服务器返回错误');
    }
  } catch (error) {
    console.error('保存菜品失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
}

// 删除菜品（无需确认）
async function confirmDelete(item) {
  if (!item || !item._id) {
    uni.showToast({
      title: '菜品数据无效',
      icon: 'none'
    });
    return;
  }

  try {
    // 显示加载提示
    uni.showLoading({
      title: '删除中...',
      mask: true
    });
    
    console.log(`准备删除菜品(ID: ${item._id})...`);
    const res = await request.delete(`/worker/dish/${item._id}`);
    console.log('删除菜品响应:', JSON.stringify(res));
    
    // 隐藏加载提示
    uni.hideLoading();
    
    if (res && res.code === 0) {
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1500
      });
      
      // 刷新当前窗口的菜品列表
      fetchDishesByWindow(selectedWindow.value._id);
    } else {
      throw new Error(res?.message || '删除失败，服务器返回错误');
    }
  } catch (error) {
    console.error('删除菜品失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '删除失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
}

// 表单窗口选择器变化
function onFormWindowChange(e) {
  const index = e.detail.value;
  console.log('窗口选择器变化，选择索引:', index, '可用窗口:', windows.value);
  
  if (index !== undefined && windows.value && windows.value[index]) {
    const selectedWindow = windows.value[index];
    dishForm.windowId = selectedWindow._id;
    console.log('表单窗口选择已更改为:', selectedWindow.name, '(ID:', dishForm.windowId, ')');
    
    // 确保任何残留的遮罩层被移除
    setTimeout(() => {
      removeMasks();
    }, 100);
  } else {
    console.warn('窗口选择无效:', index, '可用窗口数量:', windows.value?.length || 0);
  }
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

// 组件卸载时清理
onUnmounted(() => {
  // 移除全局事件监听（仅H5环境）
  // #ifdef H5
  try {
    if (typeof document !== 'undefined' && document.body) {
      document.body.removeEventListener('click', handleGlobalClick);
    }
  } catch (error) {
    console.error('移除事件监听器失败:', error);
  }
  // #endif
});

// 获取菜品图片
function getDishImage(item) {
  if (item.images && item.images.length > 0) {
    return item.images[0];
  } else if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
    return item.image;
  } else {
    return '/static/images/default-dish.jpg';
  }
}

// 切换菜品售罄状态
async function toggleDishStatus(dish) {
  // 防止重复触发
  if (isUpdatingDishStatus.value) {
    console.log('状态更新操作正在进行中，请稍候...');
    return;
  }

  if (!dish || !dish._id) {
    uni.showToast({
      title: '菜品数据无效',
      icon: 'none'
    });
    return;
  }
  
  const newStatus = dish.status === 'soldout' ? 'available' : 'soldout';
  const statusText = newStatus === 'soldout' ? '售罄' : '可售';
  
  // 设置防重复标志
  isUpdatingDishStatus.value = true;
  
  try {
    // 显示加载提示
    uni.showLoading({
      title: '更新中...',
      mask: true
    });
    
    console.log(`更新菜品(ID: ${dish._id})状态为${newStatus}...`);
    
    // 调用API更新菜品状态
    const apiRes = await request.put(`/worker/dish/${dish._id}/status`, {
      status: newStatus
    });
    
    // 隐藏加载提示
    uni.hideLoading();
    
    if (apiRes && apiRes.code === 0) {
      // 更新本地数据
      dish.status = newStatus;
      
      uni.showToast({
        title: `已标记为${statusText}`,
        icon: 'success',
        duration: 1500
      });
    } else {
      throw new Error(apiRes?.message || '更新失败');
    }
  } catch (error) {
    console.error('更新菜品状态失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '更新失败，请重试',
      icon: 'none'
    });
  } finally {
    // 确保状态标志被重置
    isUpdatingDishStatus.value = false;
  }
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

.back-btn, .add-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.iconfont{
  font-size: 40rpx;
  color: #333;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 搜索和筛选区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 10;
}

.search-box {
  flex: 1;
  position: relative;
  margin-right: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #ffffff;
  padding: 0 80rpx 0 30rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36rpx;
  color: #999;
}

.filter-options {
  display: flex;
  align-items: center;
}

.filter-item {
  position: relative;
  z-index: 10;
}

.standard-picker {
  width: 100%;
}

.picker-text {
  height: 80rpx;
  background-color: #ffffff;
  border-radius: 40rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.filter-item {
  min-width: 180rpx;
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

/* 菜品列表样式 */
.dish-list {
  max-height: calc(100vh - 250rpx);
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.dish-item {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.status-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(255, 0, 0, 0.7);
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  z-index: 2;
}

.status-btn {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 6rpx;
  background-color: #f5f8ff;
  color: #5a8eff;
  margin-right: 20rpx;
}

.dish-image {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
}

.dish-info {
  padding: 20rpx;
}

.dish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.dish-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dish-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.dish-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.dish-meta {
  margin-bottom: 20rpx;
}

.meta-item {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.meta-label {
  color: #999;
}

.rating {
  color: #ffaa00;
}

.rating-count {
  color: #999;
  margin-left: 10rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.tag {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 6rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.dish-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f5f5f5;
  padding-top: 20rpx;
}

.edit-btn, .delete-btn {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.edit-btn {
  background-color: #f0f9ff;
  color: #1989fa;
}

.delete-btn {
  background-color: #fff0f0;
  color: #ff4d4f;
}

/* 添加/编辑菜品弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 901;
}

.modal-content {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 20rpx;
  width: 90%;
  max-width: 650rpx;
  max-height: 90vh;
  position: relative;
  z-index: 902;
  overflow-y: auto;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0 30rpx;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  cursor: pointer;
  height: 60rpx;
  width: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.modal-close:active {
  background-color: #f5f5f5;
}

.modal-body {
  margin-bottom: 30rpx;
}

.form-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.form-group .form-item {
  width: 48%;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 15rpx;
}

.form-input, .form-textarea, .form-picker, .picker-view {
  width: 100%;
  height: 80rpx;
  border-radius: 12rpx;
  background-color: #f8f8f8;
  padding: 0 25rpx;
  font-size: 28rpx;
  border: 1px solid #eaeaea;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  border-color: #1989fa;
  background-color: #fff;
}

.form-textarea {
  height: 160rpx;
  padding: 20rpx 25rpx;
  line-height: 1.5;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

.tags-container {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  border: 1px solid #eaeaea;
  padding: 15rpx 20rpx;
  display: flex;
  flex-direction: column;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15rpx;
}

.tag-item {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  background-color: #e6f7ff;
  color: #1989fa;
  border-radius: 30rpx;
  margin-right: 15rpx;
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
}

.tag-delete {
  font-size: 24rpx;
  color: #1989fa;
  margin-left: 10rpx;
  height: 36rpx;
  width: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag-delete:active {
  background-color: rgba(25, 137, 250, 0.1);
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
}

.tag-input {
  flex: 1;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #ffffff;
  padding: 0 25rpx;
  font-size: 26rpx;
  border: 1px solid #eaeaea;
}

.tag-add-btn {
  font-size: 26rpx;
  color: #1989fa;
  cursor: pointer;
  margin-left: 15rpx;
  background-color: #e6f7ff;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn, .confirm-btn {
  font-size: 28rpx;
  padding: 12rpx 30rpx;
  border-radius: 12rpx;
  margin-left: 20rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #1989fa;
  color: #ffffff;
}

/* 修复移动端样式 */
@media screen and (max-width: 768px) {
  /* 提高选择器点击区域 */
  .picker-text {
    padding: 0 20rpx;
  }
}

/* 确保表单中的选择器样式一致 */
.form-item .standard-picker {
  display: block;
  width: 100%;
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

/* 添加按钮禁用和加载样式 */
.status-btn.disabled-btn {
  opacity: 0.7;
  background-color: #e5e5e5;
  color: #999;
  pointer-events: none;
}

.loading-dot {
  display: inline-block;
  animation: loading-dots 1.5s infinite;
}

@keyframes loading-dots {
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
</style> 