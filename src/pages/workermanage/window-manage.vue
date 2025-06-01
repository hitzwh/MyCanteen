<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="title">窗口管理</text>
      <view class="add-btn" @click="showAddModal">
        <text class="iconfont icon-add-fill"></text>
      </view>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="filter-item picker-wrapper">
        <picker mode="selector" :range="canteenOptions" range-key="name" @change="onCanteenChange" class="filter-picker">
          <view class="picker-text">
            <text>{{ selectedCanteen ? selectedCanteen.name : '选择食堂' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="filter-item picker-wrapper">
        <picker mode="selector" :range="floorOptions" range-key="name" @change="onFloorChange" class="filter-picker" :disabled="!selectedCanteen">
          <view class="picker-text" :class="{ disabled: !selectedCanteen }">
            <text>{{ selectedFloor ? selectedFloor.name : '选择楼层' }}</text>
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

    <!-- 窗口列表 -->
    <scroll-view v-else scroll-y class="window-list">
      <view class="empty-tip" v-if="filteredWindows.length === 0">
        <text>{{ selectedCanteen ? '当前条件下暂无窗口数据，点击右上角添加' : '请先选择食堂' }}</text>
      </view>
      
      <view v-for="(item, index) in filteredWindows" :key="item._id" class="window-item">
        <image 
          class="window-image" 
          :src="getWindowImageUrl(item)"
          mode="aspectFill" 
          @click="previewImage(getWindowImageUrl(item))"
          @error="handleImageError(item)"
        ></image>
        <view class="window-info">
          <view class="window-header">
            <text class="window-name">{{ item.name }}</text>
            <view class="window-actions">
              <text class="edit-btn" @click.stop="showEditModal(item)">编辑</text>
              <text class="delete-btn" @click.stop="confirmDelete(item)">删除</text>
            </view>
          </view>
          <text class="window-desc">{{ item.description || '暂无描述' }}</text>
          <view class="window-meta">
            <text class="meta-item">
              <text class="meta-label">所属食堂：</text>
              <text>{{ item.canteenId?.name || '未知' }}</text>
            </text>
            <text class="meta-item">
              <text class="meta-label">所在楼层：</text>
              <text>{{ getFloorName(item.floorId) || '未知' }}</text>
            </text>
          </view>
          <view class="tag-list" v-if="item.tags && item.tags.length > 0">
            <text class="tag" v-for="(tag, idx) in item.tags" :key="idx">{{ tag }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑窗口弹窗 -->
    <view class="modal" v-if="showModal" @click.stop>
      <view class="modal-mask" @click="closeModal"></view>
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑窗口' : '添加窗口' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">窗口名称</text>
            <input type="text" v-model="windowForm.name" placeholder="请输入窗口名称" class="form-input" />
          </view>
          
          <view class="form-item picker-item picker-wrapper">
            <text class="form-label">所属食堂</text>
            <picker mode="selector" :range="canteenOptions" range-key="name" @change="onFormCanteenChange" class="form-picker">
              <view class="picker-value">
                <text>{{ getCanteenName(windowForm.canteenId) || '请选择食堂' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item picker-item picker-wrapper">
            <text class="form-label">所在楼层</text>
            <picker mode="selector" :range="formFloorOptions" range-key="name" @change="onFormFloorChange" class="form-picker" :disabled="!windowForm.canteenId">
              <view class="picker-value" :class="{ disabled: !windowForm.canteenId }">
                <text>{{ getFloorName(windowForm.floorId) || '请选择楼层' }}</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">窗口描述</text>
            <textarea v-model="windowForm.description" placeholder="请输入窗口描述" class="form-textarea"></textarea>
          </view>
          
          <view class="form-item">
            <text class="form-label">窗口图片</text>
            <WindowImageUploader v-model="windowForm.image" @input="handleImageChange" />
          </view>
          
          <view class="form-item">
            <text class="form-label">标签</text>
            <view class="tags-input">
              <view class="tag-input-list">
                <view class="tag-item" v-for="(tag, idx) in windowForm.tags" :key="idx">
                  {{ tag }}
                  <text class="tag-delete" @click="removeTag(idx)">×</text>
                </view>
              </view>
              <view class="tag-add">
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
import { ref, reactive, computed, onMounted } from 'vue';
import request from '@/utils/request';
import WindowImageUploader from '@/components/WindowImageUploader.vue';

// 状态变量
const loading = ref(true);
const windows = ref([]);
const canteens = ref([]);
const selectedCanteen = ref(null);
const selectedFloor = ref(null);
const showModal = ref(false);
const isEditing = ref(false);
const currentWindowId = ref('');
const newTag = ref('');

// 表单数据
const windowForm = reactive({
  name: '',
  description: '',
  image: '',
  canteenId: '',
  floorId: '',
  tags: []
});

// 计算属性
const canteenOptions = computed(() => {
  return canteens.value;
});

const floorOptions = computed(() => {
  if (selectedCanteen.value && selectedCanteen.value.floors) {
    return selectedCanteen.value.floors;
  }
  return [];
});

const formFloorOptions = computed(() => {
  if (!windowForm.canteenId) return [];
  
  const canteen = canteens.value.find(c => c._id === windowForm.canteenId);
  return canteen && canteen.floors ? canteen.floors : [];
});

const filteredWindows = computed(() => {
  let result = windows.value;
  
  if (selectedCanteen.value) {
    result = result.filter(window => window.canteenId?._id === selectedCanteen.value._id);
    
    if (selectedFloor.value) {
      result = result.filter(window => window.floorId === selectedFloor.value._id);
    }
  }
  
  return result;
});

// 初始化方法
onMounted(() => {
  fetchData();
});

// 获取所有数据
async function fetchData() {
  try {
    loading.value = true;
    
    // 获取食堂列表
    const canteenRes = await request.get('/canteen');
    if (canteenRes && canteenRes.data) {
      canteens.value = canteenRes.data;
    }
    
    // 获取窗口列表
    const windowRes = await request.get('/window');
    if (windowRes && windowRes.data) {
      console.log('获取到窗口列表数据:', windowRes.data.length || 0, '条');
      
      // 预处理窗口数据，确保图片URL格式正确
      const processedWindows = windowRes.data.map(window => {
        // 确保window是对象
        if (!window) return null;
        
        // 优先使用images数组中的URL
        if (window.images && window.images.length > 0) {
          console.log('窗口使用images数组中的图片URL:', window.name, window.images[0]);
          window.image = window.images[0]; // 将images[0]赋值给image字段，确保显示正确
        }
        // 其次才处理image字段
        else if (window.image) {
          console.log('窗口使用image字段的图片URL:', window.name, window.image);
          
          // 确保图片URL格式正确
          if (typeof window.image === 'string' && window.image.trim().length > 0) {
            // 图片URL格式正确，保持不变
            if (window.image.includes('example.com')) {
              console.warn('检测到示例URL，这可能不是实际图片:', window.image);
            }
          } else {
            console.warn('窗口图片URL格式不正确:', window.name, window.image);
            window.image = '';
          }
        }
        
        return window;
      }).filter(window => window !== null);
      
      windows.value = processedWindows;
      console.log('处理后的窗口列表数据:', windows.value.length, '条');
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

// 食堂选择变化
function onCanteenChange(e) {
  const index = e.detail.value;
  selectedCanteen.value = canteenOptions.value[index];
  selectedFloor.value = null;
}

// 楼层选择变化
function onFloorChange(e) {
  if (!selectedCanteen.value) return;
  
  const index = e.detail.value;
  selectedFloor.value = floorOptions.value[index];
}

// 表单食堂选择变化
function onFormCanteenChange(e) {
  const index = e.detail.value;
  windowForm.canteenId = canteenOptions.value[index]._id;
  windowForm.floorId = ''; // 清空已选择的楼层
}

// 表单楼层选择变化
function onFormFloorChange(e) {
  if (!windowForm.canteenId) return;
  const index = e.detail.value;
  windowForm.floorId = formFloorOptions.value[index]._id;
}

// 检测是否是H5或App环境
function isH5orApp() {
  // #ifdef H5 || APP-PLUS
  return true;
  // #endif
  
  return false;
}

// 获取食堂名称
function getCanteenName(canteenId) {
  if (!canteenId) return '';
  
  const canteen = canteens.value.find(c => c._id === canteenId);
  return canteen ? canteen.name : '';
}

// 获取楼层名称
function getFloorName(floorId) {
  if (!floorId) return '';
  
  for (const canteen of canteens.value) {
    if (canteen.floors && canteen.floors.length > 0) {
      const floor = canteen.floors.find(f => f._id === floorId);
      if (floor) return floor.name;
    }
  }
  
  return '';
}

// 获取窗口图片URL
function getWindowImageUrl(item) {
  // 优先使用images数组
  if (item.images && item.images.length > 0) {
    return item.images[0];
  }
  // 其次使用image字段
  else if (item.image) {
    return item.image;
  }
  // 默认图片
  return '/static/images/white.jpg';
}

// 图片加载错误处理
function handleImageError(item) {
  console.error('窗口图片加载失败:', item.name, getWindowImageUrl(item));
  // 可以在这里设置一个默认图片或其他处理
}

// 预览图片
function previewImage(url) {
  if (!url || url === '/static/images/white.jpg') return;
  
  console.log('预览窗口图片:', url);
  uni.previewImage({
    urls: [url],
    current: url
  });
}

// 添加标签
function addTag() {
  const tag = newTag.value.trim();
  
  if (tag && !windowForm.tags.includes(tag)) {
    windowForm.tags.push(tag);
    newTag.value = '';
  } else if (windowForm.tags.includes(tag)) {
    uni.showToast({
      title: '标签已存在',
      icon: 'none'
    });
  }
}

// 删除标签
function removeTag(index) {
  windowForm.tags.splice(index, 1);
}

// 显示添加弹窗
function showAddModal() {
  isEditing.value = false;
  currentWindowId.value = '';
  
  // 重置表单
  resetForm();
  
  showModal.value = true;
}

// 显示编辑弹窗
function showEditModal(item) {
  isEditing.value = true;
  currentWindowId.value = item._id;
  
  // 设置表单数据
  initFormData(item);
  
  showModal.value = true;
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
  // 重置表单
  resetForm();
}

// 重置表单
function resetForm() {
  windowForm.name = '';
  windowForm.description = '';
  windowForm.image = '';
  windowForm.canteenId = '';
  windowForm.floorId = '';
  windowForm.tags = [];
  newTag.value = '';
}

// 初始化表单数据
function initFormData(item) {
  windowForm.name = item.name || '';
  windowForm.description = item.description || '';
  
  // 处理图片URL
  if (item.image) {
    console.log('初始化窗口图片URL:', item.image);
    windowForm.image = item.image;
  } else {
    windowForm.image = '';
    console.log('窗口没有图片，设置为空字符串');
  }
  
  windowForm.canteenId = item.canteenId?._id || item.canteenId || '';
  windowForm.floorId = item.floorId || '';
  windowForm.tags = item.tags ? [...item.tags] : [];
  newTag.value = '';
}

// 处理图片URL变化
function handleImageChange(newImageUrl) {
  console.log('窗口管理页面接收到图片变化:', newImageUrl);
  windowForm.image = newImageUrl;
  console.log('窗口表单中的图片URL已更新为:', windowForm.image);
}

// 提交表单
async function submitForm() {
  // 表单验证
  if (!windowForm.name) {
    uni.showToast({
      title: '请输入窗口名称',
      icon: 'none'
    });
    return;
  }
  
  if (!windowForm.canteenId) {
    uni.showToast({
      title: '请选择所属食堂',
      icon: 'none'
    });
    return;
  }
  
  if (!windowForm.floorId) {
    uni.showToast({
      title: '请选择所在楼层',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: isEditing.value ? '更新中...' : '添加中...'
    });
    
    // 确保图片数据是字符串
    if (typeof windowForm.image !== 'string') {
      windowForm.image = '';
      console.warn('图片数据不是字符串，已重置为空字符串');
    }
    
    // 移除无效的图片URL（例如空字符串、null或undefined）
    const validImage = windowForm.image && windowForm.image.trim().length > 0 ? windowForm.image.trim() : '';
    windowForm.image = validImage;
    
    // 输出调试信息
    console.log('准备保存窗口信息:', {
      id: isEditing.value ? currentWindowId.value : '新建',
      name: windowForm.name,
      image: windowForm.image,
      imageLength: windowForm.image.length
    });
    
    // 创建要发送的数据副本，防止引用问题
    const formData = {
      name: windowForm.name,
      description: windowForm.description,
      canteenId: windowForm.canteenId,
      floorId: windowForm.floorId,
      tags: [...windowForm.tags]
    };
    
    if (windowForm.image && windowForm.image.length > 0) {
      // 验证URL格式
      if (windowForm.image.startsWith('http://') || windowForm.image.startsWith('https://') || windowForm.image.startsWith('/')) {
        // 同时设置image和images字段，确保兼容性
        formData.image = windowForm.image;
        formData.images = [windowForm.image]; // 将单个图片URL放入images数组
        console.log('添加有效的图片URL到请求数据中:', formData.image);
        console.log('同时添加到images数组:', formData.images);
      } else {
        console.warn('图片URL格式可能不正确:', windowForm.image);
        // 尝试修复URL，如果是相对路径，可能需要添加域名前缀
        if (!windowForm.image.startsWith('/')) {
          const fixedUrl = '/' + windowForm.image;
          formData.image = fixedUrl;
          formData.images = [fixedUrl];
          console.log('尝试修复图片URL格式:', fixedUrl);
        } else {
          formData.image = windowForm.image;
          formData.images = [windowForm.image];
        }
      }
    } else {
      console.log('没有图片数据，不添加到请求中');
    }
    
    console.log('最终发送的数据:', JSON.stringify(formData));
    
    let res;
    if (isEditing.value) {
      // 更新窗口
      res = await request.put(`/worker/window/${currentWindowId.value}`, formData);
    } else {
      // 添加窗口
      res = await request.post('/worker/window', formData);
    }
    
    if (res && res.code === 0) {
      // 记录响应
      console.log('保存窗口成功，服务器响应:', JSON.stringify(res.data));
      
      uni.hideLoading();
      uni.showToast({
        title: isEditing.value ? '更新成功' : '添加成功',
        icon: 'success'
      });
      
      // 保存成功后，确保窗口图片信息正确
      if (res.data) {
        // 检查多种可能的图片URL返回格式
        let returnedImageUrl = null;
        
        // 优先使用images数组中的URL（这是新上传的图片）
        if (res.data.images && res.data.images.length > 0) {
          // 作为images数组返回
          returnedImageUrl = res.data.images[0];
          console.log('服务器返回的图片URL在data.images[0]中:', returnedImageUrl);
        } 
        // 其次才使用image字段
        else if (res.data.image) {
          // 直接包含在data.image中
          returnedImageUrl = res.data.image;
          console.log('服务器返回的图片URL在data.image中:', returnedImageUrl);
        } else if (res.image) {
          // 直接在res.image中
          returnedImageUrl = res.image;
          console.log('服务器返回的图片URL在res.image中:', returnedImageUrl);
        }
        
        if (returnedImageUrl) {
          // 更新本地表单中的图片URL，确保下次显示正确
          windowForm.image = returnedImageUrl;
          console.log('已更新窗口表单中的图片URL:', windowForm.image);
        }
      }
      
      // 关闭弹窗
      closeModal();
      
      // 刷新数据
      fetchData();
      
      // 可以延迟一点时间再次刷新，确保数据最新
      setTimeout(() => {
        console.log('延迟刷新数据，确保最新状态');
        fetchData();
      }, 500);
    } else {
      throw new Error(res.message || (isEditing.value ? '更新失败' : '添加失败'));
    }
  } catch (error) {
    console.error(isEditing.value ? '更新窗口失败:' : '添加窗口失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || (isEditing.value ? '更新失败，请重试' : '添加失败，请重试'),
      icon: 'none'
    });
  }
}

// 删除窗口（无需确认）
async function confirmDelete(item) {
  if (!item || !item._id) {
    uni.showToast({
      title: '窗口数据无效',
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
    
    // 直接调用删除API
    const res = await request.delete(`/worker/window/${item._id}`);
    
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
      fetchData();
    } else {
      throw new Error(res?.message || '删除失败');
    }
  } catch (error) {
    console.error('删除窗口失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '删除失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
}

// 返回上一页
function goBack() {
  uni.navigateTo({
    url: '/pages/workerindex/index'
  });
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

/* 筛选区域样式 */
.filter-section {
  display: flex;
  margin-bottom: 30rpx;
  position: relative;
  z-index: 10;
}

.filter-item {
  margin-right: 20rpx;
  position: relative;
  z-index: 10;
}

.filter-picker {
  height: 70rpx;
  background-color: #ffffff;
  border-radius: 35rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
}

.picker-text {
  font-size: 26rpx;
  color: #333;
  line-height: 70rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.picker-text.disabled {
  color: #999;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
  margin-left: 10rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  line-height: 80rpx;
  color: #333;
  position: relative;
}

.picker-value.disabled {
  color: #999;
}

/* 为不同区域的picker-wrapper设置不同的z-index */
/* 头部筛选区的picker-wrapper */
.filter-section .picker-wrapper {
  position: relative;
  z-index: 10; /* 低于弹窗 */
}

/* 弹窗内的picker-wrapper */
.modal-content .picker-wrapper {
  position: relative;
  z-index: 1003; /* 高于弹窗内容 */
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

/* 窗口列表样式 */
.window-list {
  max-height: calc(100vh - 250rpx);
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.window-item {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.window-image {
  width: 100%;
  height: 240rpx;
  object-fit: cover;
}

.window-info {
  padding: 20rpx;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.window-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.window-actions {
  display: flex;
}

.edit-btn, .delete-btn {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  margin-left: 10rpx;
}

.edit-btn {
  background-color: #f0f9ff;
  color: #1989fa;
}

.delete-btn {
  background-color: #fff0f0;
  color: #ff4d4f;
}

.window-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp:2;
  overflow: hidden;
}

.window-meta {
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
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

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 901;
  pointer-events: auto;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 700rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 902;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
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
  overflow-y: auto;
  flex: 1;
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
  font-weight: bold;
}

.form-input, .form-picker {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #ffffff;
  box-sizing: border-box;
  position: relative;
  z-index: 950;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #ffffff;
  box-sizing: border-box;
}

.picker-value {
  line-height: 80rpx;
  color: #333;
  padding-right: 40rpx;
  position: relative;
}

.picker-value.disabled {
  color: #999;
}

/* 图片上传样式 */
.image-uploader {
  width: 100%;
  margin-top: 10rpx;
}

.upload-btn {
  width: 240rpx;
  height: 240rpx;
  border: 1px dashed #ddd;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.upload-icon {
  font-size: 60rpx;
  color: #ddd;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.uploaded-image {
  width: 240rpx;
  height: 240rpx;
  border-radius: 10rpx;
  object-fit: cover;
}

/* 标签输入样式 */
.tags-input {
  width: 100%;
}

.tag-input-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: #f0f9ff;
  color: #1989fa;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 26rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}

.tag-delete {
  margin-left: 8rpx;
  font-size: 28rpx;
}

.tag-add {
  display: flex;
  align-items: center;
}

.tag-input {
  flex: 1;
  height: 70rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx 0 0 10rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}

.tag-add-btn {
  height: 70rpx;
  line-height: 70rpx;
  background-color: #1989fa;
  color: white;
  padding: 0 20rpx;
  font-size: 26rpx;
  border-radius: 0 10rpx 10rpx 0;
}

/* 表单样式 */
.picker-item {
  position: relative;
  z-index: 1003;
}

/* 修复选择器内容无法滑动的问题 */
/* 确保uni原生选择器弹窗在最上层 */
.uni-picker-container, 
.uni-picker, 
.uni-select, 
.uni-select-picker,
.uni-picker-view {
  z-index: 999999 !important;
  pointer-events: auto !important;
  touch-action: auto !important;
}

.uni-picker-view-indicator,
.uni-picker-view-content,
.uni-picker-view-wrapper {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

.uni-picker-view-column {
  touch-action: pan-y !important;
  pointer-events: auto !important;
  overflow: visible !important;
}

.uni-picker-item {
  touch-action: pan-y !important;
  pointer-events: auto !important;
}

.uni-mask {
  z-index: 999998 !important;
  pointer-events: auto !important;
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

/* 全局选择器样式覆盖 */
page {
  /* 确保所有选择器都能正确显示 */
  --picker-view-z-index: 999999;
  --picker-indicator-height: 80rpx;
}

/* 兼容不同平台的选择器 */
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

/* 确保蒙层正常工作 */
.uni-mask,
:deep(.uni-mask),
:deep(.uni-picker-mask) {
  pointer-events: auto !important;
}
</style> 