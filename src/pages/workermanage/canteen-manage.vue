image.png<template>
  <view class="container responsive-container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title responsive-text-xl">食堂管理</text>
      <view class="add-btn" @click="showAddModal">
        <text class="iconfont icon-add-fill"></text>
      </view>
    </view>

    <!-- 加载中提示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text responsive-text-md">数据加载中...</text>
    </view>

    <!-- 食堂列表 -->
    <scroll-view v-else scroll-y class="canteen-list">
      <view class="empty-tip" v-if="canteens.length === 0">
        <text class="responsive-text-md">暂无食堂数据，点击右上角添加</text>
      </view>
      
      <view class="flex-container">
        <transition-group name="canteen-list" tag="div" class="canteen-list-container">
          <view 
            v-for="(item, index) in canteens" 
            :key="item._id" 
            class="canteen-item flex-col-12"
            @click="showDetailModal(item, '卡片区域')"
            :class="{ 'with-animation': animationsEnabled }"
            :style="animationsEnabled ? { animationDelay: index * 0.1 + 's' } : {}"
          >
            <view class="canteen-image-container" @click.stop="showDetailModal(item, '图片容器')">
              <image class="canteen-image" 
                :src="item.images && item.images.length > 0 ? item.images[0] : '/static/images/default-canteen.jpg'" 
                mode="aspectFill"
                @click.stop="showDetailModal(item, '图片')"
              />
              <text v-if="item.images && item.images.length > 1" class="image-badge responsive-text-sm">{{ item.images.length }}张</text>
            </view>
            <view class="canteen-info responsive-padding">
              <view class="canteen-header">
                <text class="canteen-name responsive-text-lg">{{ item.name }}</text>
                <view class="canteen-actions">
                  <text class="edit-btn responsive-text-sm" @click.stop="showEditModal(item)">编辑</text>
                  <text class="delete-btn responsive-text-sm" @click.stop="confirmDelete(item)">删除</text>
                </view>
              </view>
              <text class="canteen-desc responsive-text-md">{{ item.description || '暂无描述' }}</text>
              <view class="canteen-meta">
                <text class="meta-item responsive-text-sm">
                  <text class="meta-label">位置：</text>
                  <text>{{ item.location || '未设置' }}</text>
                </text>
                <text class="meta-item responsive-text-sm">
                  <text class="meta-label">营业时间：</text>
                  <text>{{ item.openingHours || '未设置' }}</text>
                </text>
              </view>
              <view class="floor-tags">
                <text class="floor-label responsive-text-sm">楼层：</text>
                <text 
                  v-for="(floor, idx) in item.floors" 
                  :key="floor._id" 
                  class="floor-tag responsive-text-sm"
                >
                  {{ floor.name }}
                </text>
                <text v-if="!item.floors || item.floors.length === 0" class="floor-tag empty responsive-text-sm">暂无楼层</text>
              </view>
            </view>
          </view>
        </transition-group>
      </view>
    </scroll-view>

    <!-- 添加/编辑食堂弹窗 -->
    <view class="modal" v-if="showModal">
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title responsive-text-lg">{{ isEdit ? '编辑食堂' : '添加食堂' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body responsive-padding">
          <view class="form-item">
            <text class="form-label responsive-text-md">食堂名称</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入食堂名称" />
          </view>
          <view class="form-item">
            <CanteenImageUploader v-model="formData.images" />
          </view>
          <view class="form-item">
            <text class="form-label responsive-text-md">食堂描述</text>
            <textarea class="form-textarea" v-model="formData.description" placeholder="请输入食堂描述" />
          </view>
          <view class="form-item">
            <text class="form-label responsive-text-md">食堂位置</text>
            <view class="location-input-container">
              <input class="form-input location-input" v-model="formData.location" placeholder="请输入食堂位置" />
              <button class="get-location-btn" @click="getLocationCoordinates">
                <text class="location-btn-icon">📍</text>
                <text class="location-btn-text responsive-text-sm">选择位置</text>
              </button>
            </view>
            <text class="location-tip responsive-text-sm">点击"选择位置"按钮在地图上选择精确位置</text>
            <view class="coordinates-info" v-if="formData.coordinates && formData.coordinates.latitude">
              <text class="coordinates-text responsive-text-sm">已设置坐标: {{ formData.coordinates.latitude.toFixed(6) }}, {{ formData.coordinates.longitude.toFixed(6) }}</text>
              <text class="coordinates-clear responsive-text-sm" @click="clearCoordinates">清除</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label responsive-text-md">营业时间</text>
            <input class="form-input" v-model="formData.openingHours" placeholder="例如：07:00-21:00" />
          </view>
          <view class="form-item">
            <text class="form-label responsive-text-md">楼层管理</text>
            <view class="floor-list">
              <view v-for="(floor, index) in formData.floors" :key="index" class="floor-item responsive-margin">
                <input class="floor-input" v-model="floor.name" placeholder="楼层名称" />
                <textarea class="floor-textarea" v-model="floor.description" placeholder="楼层描述" />
                <text class="floor-delete responsive-text-sm" @click="removeFloor(index)">删除</text>
              </view>
              <view class="add-floor" @click="addFloor">
                <text class="responsive-text-md">添加楼层</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn responsive-text-md" @click="closeModal">取消</button>
          <button class="confirm-btn responsive-text-md" @click="saveCanteen">确定</button>
        </view>
      </view>
    </view>

    <!-- 食堂详情弹窗 -->
    <view class="modal detail-modal-container" v-if="showDetailView">
      <view class="modal-mask detail-modal-mask" @click="closeDetailModal"></view>
      <view class="modal-content detail-modal">
        <view class="modal-header">
          <text class="modal-title responsive-text-lg">食堂详情</text>
          <text class="modal-close" @click="closeDetailModal">×</text>
        </view>
        <view class="modal-body responsive-padding">
          <!-- 图片轮播 - 添加所有可能的事件阻止 -->
          <view class="swiper-container" 
            @click.stop.prevent @tap.stop.prevent @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent>
            <swiper class="detail-swiper" circular indicator-dots autoplay interval="5000" duration="500" 
              @click.stop.prevent @tap.stop.prevent @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent
              v-if="currentCanteen.images && currentCanteen.images.length > 0">
              <swiper-item v-for="(image, index) in currentCanteen.images" :key="index"
                @click.stop.prevent @tap.stop.prevent @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent>
                <image class="detail-image" :src="image" mode="aspectFill" 
                  @click.stop.prevent @tap.stop.prevent @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent></image>
              </swiper-item>
            </swiper>
            <image v-else class="detail-image" src="/static/images/default-canteen.jpg" mode="aspectFill"
              @click.stop.prevent @tap.stop.prevent @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent></image>
          </view>
          
          <!-- 图片控制区域 - 完全独立的容器 -->
          <view class="image-control-container" @click.stop @tap.stop>
            <view class="image-controls" v-if="currentCanteen.images && currentCanteen.images.length > 0">
              <text v-if="currentCanteen.images.length > 1" class="image-counter responsive-text-sm">
                {{ currentCanteen.images.length }}张图片
              </text>
              <view class="preview-btn-container">
                <button type="primary" class="preview-btn" @click.stop="previewAllImages($event)" @tap.stop="previewAllImages($event)">
                  <uni-icons type="eye" size="14" color="#34c759"></uni-icons>
                  <text class="preview-text responsive-text-sm">查看大图</text>
                </button>
              </view>
            </view>
          </view>
          
          <view class="detail-title responsive-text-xl">{{ currentCanteen.name }}</view>
          <view class="detail-section">
            <text class="section-title responsive-text-lg">基本信息</text>
            <view class="detail-item">
              <text class="detail-label responsive-text-md">位置：</text>
              <text class="detail-value responsive-text-md">{{ currentCanteen.location || '未设置' }}</text>
            </view>
            <view class="detail-item" v-if="currentCanteen.coordinates && currentCanteen.coordinates.latitude">
              <text class="detail-label responsive-text-md">坐标：</text>
              <text class="detail-value responsive-text-md">{{ currentCanteen.coordinates.latitude.toFixed(6) }}, {{ currentCanteen.coordinates.longitude.toFixed(6) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label responsive-text-md">营业时间：</text>
              <text class="detail-value responsive-text-md">{{ currentCanteen.openingHours || '未设置' }}</text>
            </view>
          </view>
          <view class="detail-section">
            <text class="section-title responsive-text-lg">食堂描述</text>
            <text class="detail-desc responsive-text-md">{{ currentCanteen.description || '暂无描述' }}</text>
          </view>
          <view class="detail-section">
            <text class="section-title responsive-text-lg">楼层信息</text>
            <view v-if="currentCanteen.floors && currentCanteen.floors.length > 0">
              <view 
                v-for="(floor, index) in currentCanteen.floors" 
                :key="floor._id"
                class="floor-detail"
              >
                <text class="floor-detail-name responsive-text-md">{{ floor.name }}</text>
                <text class="floor-detail-desc responsive-text-md">{{ floor.description || '暂无描述' }}</text>
              </view>
            </view>
            <view v-else class="no-floor">
              <text class="responsive-text-md">暂无楼层信息</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn responsive-text-md" @click="closeDetailModal">关闭</button>
          <button class="confirm-btn responsive-text-md" @click="showEditModal(currentCanteen)">编辑</button>
        </view>
      </view>
    </view>
  </view>

  <!-- 自定义图片预览容器 - 确保在页面最外层 -->
  <view class="custom-preview-container" v-if="showCustomPreview" @click.stop>
    <view class="custom-preview-mask" @click="closeCustomPreview"></view>
    <view class="custom-preview-content">
      <swiper class="custom-preview-swiper" 
        :current="currentPreviewIndex"
        @change="onPreviewChange"
        circular
        indicator-dots>
        <swiper-item v-for="(image, index) in previewImages" :key="index" @click.stop>
          <image class="custom-preview-image" 
            :src="image" 
            mode="aspectFit"
            @click.stop></image>
        </swiper-item>
      </swiper>
      <view class="custom-preview-controls">
        <text class="custom-preview-counter responsive-text-md">{{ currentPreviewIndex + 1 }}/{{ previewImages.length }}</text>
        <button class="custom-preview-close-btn responsive-text-md" @click.stop="closeCustomPreview">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onUnmounted } from 'vue';
import request from '@/utils/request';
import CanteenImageUploader from '@/components/CanteenImageUploader.vue';

// 状态变量
const loading = ref(true);
const canteens = ref([]);
const showModal = ref(false);
const showDetailView = ref(false);
const isEdit = ref(false);
const currentCanteen = ref({});
const showCustomPreview = ref(false);
const currentPreviewIndex = ref(0);
const previewImages = ref([]);
const animationsEnabled = ref(true);

// 表单数据
const formData = reactive({
  _id: '',
  name: '',
  images: [],
  description: '',
  location: '',
  openingHours: '',
  floors: [],
  coordinates: null
});

// 监听图片列表变化
watch(() => formData.images, (newImages) => {
  if (!newImages) {
    formData.images = [];
    return;
  }
  console.log('图片列表已更新:', JSON.stringify(newImages), '长度:', newImages.length);
}, { deep: true });

// 初始化方法
onMounted(() => {
  fetchCanteens();
  console.log('食堂管理页面已加载');
});

// 组件卸载时清理
onUnmounted(() => {
  console.log('食堂管理页面已卸载');
});

// 获取所有食堂数据
async function fetchCanteens() {
  try {
    loading.value = true;
    const res = await request.get('/canteen');
    if (res && res.data) {
      // 先清空数组，避免动画问题
      canteens.value = [];
      
      // 检查是否支持动画
      checkAnimationSupport();
      
      // 延迟加载数据，以便动画效果更好
      setTimeout(() => {
        canteens.value = res.data;
      }, 100);
    }
  } catch (error) {
    console.error('获取食堂列表失败:', error);
    uni.showToast({
      title: '获取食堂列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 检查设备是否支持动画
function checkAnimationSupport() {
  try {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    
    // 低端设备或低版本系统可能不支持复杂动画
    if (systemInfo.platform === 'android' && parseInt(systemInfo.system.split(' ')[1]) < 7) {
      animationsEnabled.value = false;
      console.log('检测到低版本Android系统，已禁用复杂动画');
    }
    
    // 低内存设备禁用动画
    if (systemInfo.memory && systemInfo.memory < 2048) {
      animationsEnabled.value = false;
      console.log('检测到低内存设备，已禁用复杂动画');
    }
  } catch (e) {
    console.error('检查动画支持失败:', e);
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
  isEdit.value = false;
  resetForm();
  showModal.value = true;
}

// 显示编辑弹窗
function showEditModal(item) {
  isEdit.value = true;
  // 确保设置currentCanteen
  currentCanteen.value = { ...item };
  console.log('设置当前食堂:', currentCanteen.value);
  
  initFormData(item);
  showModal.value = true;
  // 如果是从详情页来的，关闭详情页
  if (showDetailView.value) {
    showDetailView.value = false;
  }
}

// 显示详情弹窗
function showDetailModal(item, source) {
  console.log('显示详情弹窗，食堂:', item.name, source ? `点击来源: ${source}` : '');
  currentCanteen.value = { ...item };
  showDetailView.value = true;
}

// 关闭详情弹窗
function closeDetailModal() {
  showDetailView.value = false;
  currentCanteen.value = {};
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
  // 只有在添加模式下才重置表单
  if (!isEdit.value) {
    resetForm();
  }
  // 退出编辑模式
  isEdit.value = false;
}

// 重置表单
function resetForm() {
  formData._id = '';
  formData.name = '';
  formData.images = [];
  formData.description = '';
  formData.location = '';
  formData.openingHours = '';
  formData.coordinates = null;
  formData.floors = [];
}

// 初始化表单数据
function initFormData(item) {
  console.log('开始初始化表单数据:', item.name);
  
  // 确保包含ID
  formData._id = item._id;
  formData.name = item.name || '';
  
  // 重置图片数组
  formData.images = [];
  
  // 确保图片列表是数组格式并且复制一份
  if (item.images && Array.isArray(item.images)) {
    // 过滤无效的图片URL
    const validImages = item.images.filter(url => {
      const isValid = typeof url === 'string' && url.trim().length > 0;
      if (!isValid) {
        console.warn('初始化时发现无效的图片URL，已被过滤:', url);
      }
      return isValid;
    });
    
    // 使用扩展运算符创建新数组，防止引用问题
    formData.images = [...validImages];
    
    console.log('初始化食堂图片成功:', formData.images);
    console.log('图片数量:', formData.images.length);
  } else {
    console.log('食堂没有图片或图片格式错误');
  }
  
  formData.description = item.description || '';
  formData.location = item.location || '';
  formData.openingHours = item.openingHours || '';
  
  // 处理坐标信息
  formData.coordinates = item.coordinates ? { ...item.coordinates } : null;
  
  // 处理楼层数据
  formData.floors = [];
  if (item.floors && item.floors.length > 0) {
    item.floors.forEach(floor => {
      formData.floors.push({
        _id: floor._id,
        name: floor.name,
        description: floor.description || ''
      });
    });
  }
  
  // 如果编辑的是当前展示的食堂，也更新currentCanteen
  if (showDetailView.value && currentCanteen.value._id === item._id) {
    currentCanteen.value = { ...item };
  }
  
  console.log('表单数据初始化完成:', {
    id: formData._id,
    name: formData.name,
    images: formData.images,
    imagesLength: formData.images.length,
    floors: formData.floors.length,
    coordinates: formData.coordinates
  });
  
  // 触发nextTick以确保视图更新
  nextTick(() => {
    console.log('表单初始化后的nextTick检查 - 图片数量:', formData.images.length);
  });
}

// 添加楼层
function addFloor() {
  formData.floors.push({
    name: '',
    description: ''
  });
}

// 删除楼层
function removeFloor(index) {
  formData.floors.splice(index, 1);
}

// 保存食堂信息
async function saveCanteen() {
  // 表单验证
  if (!formData.name) {
    uni.showToast({
      title: '请输入食堂名称',
      icon: 'none'
    });
    return;
  }
  
  // 检查楼层名称是否填写
  const invalidFloor = formData.floors.find(floor => !floor.name);
  if (invalidFloor) {
    uni.showToast({
      title: '请填写所有楼层名称',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: isEdit.value ? '保存中...' : '添加中...'
    });
    
    // 确保图片数据是一个有效的数组
    if (!Array.isArray(formData.images)) {
      formData.images = [];
      console.warn('图片数据不是数组，已重置为空数组');
    }
    
    // 移除无效的图片URL（例如空字符串、null或undefined）
    const validImages = formData.images.filter(url => {
      const isValid = typeof url === 'string' && url.trim().length > 0;
      if (!isValid) {
        console.warn('发现无效的图片URL，已被过滤:', url);
      }
      return isValid;
    });
    
    // 确保有效的图片列表被使用
    if (validImages.length !== formData.images.length) {
      console.log('过滤前图片数量:', formData.images.length, '过滤后:', validImages.length);
      formData.images = [...validImages];
    }
    
    // 输出调试信息
    console.log('准备保存食堂信息:', {
      id: isEdit.value ? (formData._id || currentCanteen.value._id) : '新建',
      name: formData.name,
      images: formData.images,
      imagesLength: formData.images.length,
      floors: formData.floors.length
    });
    
    // 创建要发送的数据副本，防止引用问题
    const dataToSend = {
      _id: formData._id,
      name: formData.name,
      images: [...formData.images], // 创建新数组
      description: formData.description,
      location: formData.location,
      openingHours: formData.openingHours,
      floors: formData.floors.map(floor => ({ ...floor })), // 深拷贝楼层数据
      coordinates: formData.coordinates
    };
    
    console.log('最终发送的数据:', JSON.stringify(dataToSend));
    
    let res;
    if (isEdit.value) {
      // 编辑已有食堂
      const canteenId = formData._id || currentCanteen.value._id;
      res = await request.put(`/canteen/${canteenId}`, dataToSend);
    } else {
      // 添加新食堂
      res = await request.post('/canteen', dataToSend);
    }
    
    if (res && res.code === 0) {
      console.log('食堂保存成功:', res.data);
      uni.hideLoading();
      uni.showToast({
        title: isEdit.value ? '保存成功' : '添加成功',
        icon: 'success'
      });
      
      // 关闭弹窗并刷新列表
      closeModal();
      fetchCanteens();
    } else {
      throw new Error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('保存食堂信息失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none'
    });
  }
}

// 删除食堂（无需确认）
function confirmDelete(item) {
  // 直接显示加载提示
  uni.showLoading({
    title: '删除中...',
    mask: true
  });
  
  // 直接调用删除API
  request.delete(`/canteen/${item._id}`)
    .then(function(res) {
      // 隐藏加载提示
      uni.hideLoading();
      
      if (res && res.code === 0) {
        // 删除成功
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
        });
        
        // 刷新列表
        fetchCanteens();
        
        // 如果正在查看该食堂的详情，关闭详情弹窗
        if (showDetailView.value && currentCanteen.value._id === item._id) {
          showDetailView.value = false;
        }
      } else {
        // 删除失败，显示错误提示
        uni.showToast({
          title: res?.message || '删除失败',
          icon: 'none',
          duration: 2000
        });
      }
    })
    .catch(function(error) {
      // 处理错误
      uni.hideLoading();
      uni.showToast({
        title: '删除失败，请重试',
        icon: 'none',
        duration: 2000
      });
      console.error('删除食堂失败:', error);
    });
}

// 预览所有图片 - 只从按钮调用
function previewAllImages(event) {
  console.log('预览函数被调用!', event ? '有事件对象' : '无事件对象');
  
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('已阻止事件冒泡');
  }
  
  if (!currentCanteen.value.images || currentCanteen.value.images.length === 0) {
    console.log('当前没有图片可预览');
    uni.showToast({
      title: '没有可预览的图片',
      icon: 'none'
    });
    return;
  }
  
  console.log('准备预览图片，图片数量:', currentCanteen.value.images.length);
  console.log('第一张图片地址:', currentCanteen.value.images[0]);
  
  // 暂时关闭详情弹窗，使预览显示在最上层
  const currentDetailViewState = showDetailView.value;
  showDetailView.value = false;
  console.log('已暂时关闭详情弹窗，原状态:', currentDetailViewState);
  
  // 立即调用预览，不再使用延迟
  uni.previewImage({
    urls: currentCanteen.value.images,
    current: currentCanteen.value.images[0],
    success: () => {
      console.log('预览图片打开成功');
      // 预览结束后恢复详情弹窗状态
      setTimeout(() => {
        showDetailView.value = currentDetailViewState;
        console.log('已恢复详情弹窗状态');
      }, 500);
    },
    fail: (err) => {
      console.error('预览图片失败:', err);
      // 出错时也恢复详情弹窗状态
      showDetailView.value = currentDetailViewState;
      
      // 显示错误提示
      uni.showToast({
        title: '图片预览失败',
        icon: 'none'
      });
    }
  });
}

// 打开自定义图片预览容器
function openCustomPreview(images, index) {
  console.log('打开自定义预览，图片数量:', images.length, '起始索引:', index);
  
  // 设置数据
  previewImages.value = [...images]; // 使用新数组
  currentPreviewIndex.value = index || 0;
  
  // 立即显示
  showCustomPreview.value = true;
  console.log('自定义预览状态已设置为显示');
}

// 关闭自定义图片预览容器
function closeCustomPreview() {
  console.log('关闭自定义预览');
  showCustomPreview.value = false;
  // 清理数据
  setTimeout(() => {
    previewImages.value = [];
    currentPreviewIndex.value = 0;
  }, 200);
}

// 预览图片变化
function onPreviewChange(event) {
  const newIndex = event.detail.current;
  console.log('预览图片滑动，当前索引:', newIndex);
  currentPreviewIndex.value = newIndex;
}

// 获取位置坐标
function getLocationCoordinates() {
  // 关闭所有弹窗前先记录状态
  const modalWasOpen = showModal.value;
  const detailViewWasOpen = showDetailView.value;
  const customPreviewWasOpen = showCustomPreview.value;
  
  // 关闭所有可能遮挡的弹窗
  showModal.value = false;
  showDetailView.value = false;
  showCustomPreview.value = false;
  
  // 确保DOM更新完成后再显示选择器
  nextTick(() => {
    // 直接使用地图选择器
    uni.chooseLocation({
      success: function (res) {
        console.log('选择位置成功:', res);
        // 更新表单数据
        formData.location = res.address || res.name || '';
        formData.coordinates = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        
        // 显示成功提示
        uni.showToast({
          title: '位置已选择',
          icon: 'success',
          duration: 1500
        });
        
        // 恢复弹窗状态
        setTimeout(() => {
          if (modalWasOpen) showModal.value = true;
          if (detailViewWasOpen) showDetailView.value = true;
          if (customPreviewWasOpen) showCustomPreview.value = true;
        }, 500);
      },
      fail: function (err) {
        console.error('选择位置失败:', err);
        uni.showToast({
          title: '选择位置失败',
          icon: 'none',
          duration: 2000
        });
        
        // 恢复弹窗状态
        setTimeout(() => {
          if (modalWasOpen) showModal.value = true;
          if (detailViewWasOpen) showDetailView.value = true;
          if (customPreviewWasOpen) showCustomPreview.value = true;
        }, 500);
      },
      complete: function() {
        console.log('位置选择操作完成');
      }
    });
  });
}

// 清除坐标信息
function clearCoordinates() {
  formData.coordinates = null;
  uni.showToast({
    title: '已清除坐标信息',
    icon: 'none'
  });
}
</script>

<style lang="scss">
/* 页面全局样式 */
page {
  /* 确保地图选择器相关组件始终在最上层 */
  :deep(.uni-map),
  :deep(.uni-map-container),
  :deep(.uni-map-view),
  :deep(.uni-choose-location),
  :deep(.uni-choose-location-container),
  :deep(.uni-location-picker),
  :deep(.uni-map-box),
  :deep(.uni-map-mask) {
    z-index: 999999999 !important;
  }
}

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

/* 食堂列表样式 */
.canteen-list {
  max-height: calc(100vh - 140rpx);
  width: 100%;
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.flex-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.canteen-item {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 只有启用动画的元素才应用动画效果 */
.canteen-item.with-animation {
  animation: fadeInUp 0.5s ease both;
  opacity: 0;
}

.canteen-item:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);
}

.canteen-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background: linear-gradient(to right, #34c759, #32ade6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.canteen-item:hover::after {
  transform: scaleX(1);
}

.canteen-image-container {
  position: relative;
  cursor: pointer;
  height: 240rpx;
  overflow: hidden;
}

.canteen-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none !important;
  transition: transform 0.5s ease;
}

.canteen-item:hover .canteen-image {
  transform: scale(1.05);
}

.image-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.canteen-info {
  padding: 24rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canteen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16rpx;
}

.canteen-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  position: relative;
  padding-left: 16rpx;
}

.canteen-name::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(to bottom, #34c759, #32ade6);
  border-radius: 3rpx;
}

.canteen-actions {
  display: flex;
}

.edit-btn, .delete-btn {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  margin-left: 10rpx;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #f0f9ff;
  color: #1989fa;
  border: 1px solid rgba(25, 137, 250, 0.2);
}

.edit-btn:active {
  background-color: #e0f0ff;
  transform: scale(0.95);
}

.delete-btn {
  background-color: #fff0f0;
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.2);
}

.delete-btn:active {
  background-color: #ffe0e0;
  transform: scale(0.95);
}

.canteen-desc {
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

.canteen-meta {
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

.floor-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.floor-label {
  font-size: 26rpx;
  color: #999;
  margin-right: 10rpx;
}

.floor-tag {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 6rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.floor-tag:active {
  background-color: #e8e8e8;
  border-color: #ddd;
}

.floor-tag.empty {
  color: #999;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000; /* 低于图片预览的z-index */
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
  z-index: 999; /* 确保低于内容区域 */
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 700rpx;
  max-height: 90vh;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 1001; /* 高于遮罩但低于预览 */
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
  max-height: 70vh;
  overflow-y: auto;
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

/* 表单样式 */
.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.image-upload {
  width: 100%;
  margin-top: 20rpx;
}

.preview-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  object-fit: cover;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 1px dashed #ccc;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #ccc;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.floor-list {
  margin-top: 20rpx;
}

.floor-item {
  padding: 20rpx;
  border: 1px solid #f0f0f0;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.floor-input {
  width: 100%;
  height: 70rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.floor-textarea {
  width: 100%;
  height: 120rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.floor-delete {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.add-floor {
  padding: 20rpx 0;
  text-align: center;
  border: 1px dashed #ccc;
  border-radius: 10rpx;
  color: #1989fa;
  font-size: 28rpx;
}

/* 详情弹窗样式 */
.detail-modal-container {
  z-index: 900; /* 比普通弹窗低，也比图片预览弹窗低 */
}

.detail-modal-mask {
  z-index: 899;
}

.detail-modal {
  z-index: 901;
}

.swiper-container {
  position: relative;
  width: 100%;
  pointer-events: none !important;
}

.detail-swiper {
  width: 100%;
  height: 400rpx;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 0;
  pointer-events: none !important;
}

.detail-image {
  width: 100%;
  height: 400rpx;
  object-fit: cover;
  border-radius: 20rpx;
  pointer-events: none !important;
}

.image-control-container {
  position: relative;
  z-index: 902;
  pointer-events: auto !important;
  width: 100%;
  margin-bottom: 20rpx;
}

.image-controls {
  pointer-events: auto !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 0 0 20rpx 20rpx;
  width: 100%;
}

.image-counter {
  font-size: 24rpx;
  color: #666;
}

.preview-btn-container {
  pointer-events: auto !important;
  z-index: 903;
  position: relative;
}

.preview-btn {
  padding: 8rpx 20rpx !important;
  background-color: rgba(52, 199, 89, 0.1) !important;
  color: #34c759 !important;
  border-radius: 30rpx !important;
  font-size: 24rpx !important;
  border: 1px solid rgba(52, 199, 89, 0.2) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6rpx !important;
  min-height: unset !important;
  height: auto !important;
  line-height: 1.5 !important;
}

.preview-text {
  margin-left: 4rpx;
  font-size: 24rpx;
}

.preview-btn:active {
  background-color: rgba(52, 199, 89, 0.2) !important;
}

.preview-btn-container:active {
  opacity: 0.8;
}

/* 全局禁用uni-app默认图片预览 */
image {
  pointer-events: none !important;
}

/* 确保预览弹窗相关类能使用指针事件 */
:deep(.uni-image-viewer image),
:deep(.uni-preview-image image) {
  pointer-events: auto !important;
}

/* 确保图片预览弹窗显示在最顶层 */
:deep(.uni-image-viewer__wrapper),
:deep(.uni-image-viewer),
:deep(.uni-preview-image),
:deep(.uni-image-viewer-mask),
:deep(.uni-image-viewer-view),
:deep(.uni-image-viewer__image),
:deep(.uni-popup-dialog) {
  z-index: 99999999 !important; /* 使用极高的z-index值 */
  position: fixed !important;
}

/* 解决图片预览按钮不可点击问题 */
:deep(.uni-image-viewer-btn),
:deep(.uni-preview-image-btn),
:deep(.uni-image-viewer__control),
:deep(.uni-image-viewer__operate) {
  z-index: 99999999 !important;
  position: relative !important;
  pointer-events: auto !important;
}

/* 确保编辑弹窗不会遮挡图片预览 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000; /* 低于图片预览的z-index */
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  margin: 30rpx 0 20rpx;
  text-align: center;
}

.detail-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  padding-left: 16rpx;
  border-left: 4rpx solid #34c759;
}

.detail-item {
  display: flex;
  margin-bottom: 10rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #999;
  width: 160rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.detail-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.floor-detail {
  margin-bottom: 20rpx;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.floor-detail-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.floor-detail-desc {
  font-size: 26rpx;
  color: #666;
}

.no-floor {
  padding: 30rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 自定义图片预览容器样式 */
.custom-preview-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000000; /* 极高的z-index确保在最上层 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9); /* 更深的黑色背景 */
}

.custom-preview-content {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.custom-preview-swiper {
  width: 100%;
  height: 90vh; /* 更大的高度 */
}

.custom-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片完整显示 */
  pointer-events: auto !important; /* 允许交互 */
}

.custom-preview-controls {
  position: absolute;
  bottom: 30rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
}

.custom-preview-counter {
  font-size: 28rpx;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
}

.custom-preview-close-btn {
  padding: 12rpx 30rpx;
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 50rpx;
  font-size: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 位置信息输入相关样式 */
.location-input-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
}

.location-input {
  flex: 1;
}

.get-location-btn {
  flex-shrink: 0;
  padding: 0 20rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  background: linear-gradient(135deg, #34c759, #32ade6);
  color: #ffffff;
  border-radius: 10rpx;
  margin: 0;
  box-shadow: 0 4rpx 12rpx rgba(50, 173, 230, 0.3);
  transition: all 0.3s ease;
}

.get-location-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 6rpx rgba(50, 173, 230, 0.2);
}

.location-btn-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.location-btn-text {
  font-weight: 500;
}

.location-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  padding-left: 10rpx;
}

.coordinates-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.coordinates-text {
  font-size: 24rpx;
  color: #666;
}

.coordinates-clear {
  font-size: 24rpx;
  color: #ff4d4f;
  padding: 4rpx 10rpx;
}

.coordinates-clear:active {
  opacity: 0.7;
}

/* 确保地图选择器和位置选择器显示在所有弹窗之上 */
:deep(.uni-map),
:deep(.uni-map-container),
:deep(.uni-map-view),
:deep(.uni-map-box),
:deep(.uni-map-mask),
:deep(.uni-choose-location),
:deep(.uni-choose-location-container),
:deep(.uni-location-picker) {
  z-index: 999999999 !important; /* 极高的z-index值 */
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: auto !important;
}

/* 确保地图选择器的控件可交互 */
:deep(.uni-map-control),
:deep(.uni-map-button),
:deep(.uni-map-callout),
:deep(.uni-map-marker),
:deep(.uni-map-cover-view),
:deep(.uni-map-cover-image) {
  z-index: 999999999 !important;
  pointer-events: auto !important;
}

/* 修复地图选择器弹窗样式 */
:deep(.uni-picker-container),
:deep(.uni-picker-view),
:deep(.uni-picker),
:deep(.uni-picker-action) {
  z-index: 999999999 !important;
  position: relative !important;
}

/* 确保位置选择器相关元素显示在最上层 */
:deep(.uni-page-head),
:deep(.uni-page-wrapper),
:deep(.uni-page-body),
:deep(.uni-page-refresh),
:deep(.uni-actionsheet),
:deep(.uni-mask),
:deep(.uni-popup) {
  z-index: auto !important;
}

/* 响应式调整 */
@media screen and (max-width: 375px) {
  .container {
    padding: 20rpx;
  }
  
  .canteen-item {
    margin-bottom: 20rpx;
  }
  
  .canteen-info {
    padding: 20rpx;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .canteen-image-container {
    height: 200rpx;
  }
}

@media screen and (min-width: 768px) {
  .container {
    padding: 40rpx;
  }
  
  .canteen-item {
    margin: 0 auto 30rpx;
    max-width: 800rpx;
  }
  
  .canteen-image-container {
    height: 280rpx;
  }
  
  .modal-content {
    max-width: 800rpx;
  }
}

@media screen and (min-width: 1200px) {
  .canteen-item {
    max-width: 1000rpx;
  }
  
  .canteen-image-container {
    height: 320rpx;
  }
}

/* 列表容器 */
.canteen-list-container {
  width: 100%;
}

/* 列表过渡效果 */
.canteen-list-enter-active, .canteen-list-leave-active {
  transition: all 0.5s ease;
}

.canteen-list-enter-from, .canteen-list-leave-to {
  opacity: 0;
  transform: translateY(30rpx);
}

.canteen-list-move {
  transition: transform 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 