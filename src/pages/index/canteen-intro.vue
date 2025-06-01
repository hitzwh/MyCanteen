<template>
  <view class="container" @click="handleContainerClick">
    <!-- 添加页面背景 -->
    <page-background></page-background>
    
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">餐厅介绍</text>
    </view>

    <!-- 选择器区域 -->
    <view class="basic-selector-area">
      <view class="basic-selector-item">
        <text class="basic-selector-label">餐厅</text>
        <picker 
          :range="canteenOptions" 
          range-key="text" 
          @change="onCanteenChange" 
          :disabled="showCanteenPopup || showWindowPopup"
        >
          <view class="basic-picker-view">
            <text class="basic-picker-text">{{ selectedCanteen ? selectedCanteen.text : '选择餐厅' }}</text>
            <text class="basic-picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="basic-selector-divider"></view>
      <view class="basic-selector-item">
        <text class="basic-selector-label">楼层</text>
        <picker 
          :range="floorOptions" 
          range-key="text" 
          @change="onFloorChange" 
          :disabled="showCanteenPopup || showWindowPopup"
        >
          <view class="basic-picker-view">
            <text class="basic-picker-text">{{ selectedFloor ? selectedFloor.text : '选择楼层' }}</text>
            <text class="basic-picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 食品列表部分改为窗口列表 -->
    <scroll-view class="food-list" scroll-y>
      <view class="window-section" v-if="foodList && foodList.length > 0">
        <view 
          class="window-card card" 
          v-for="(window, index) in foodList" 
          :key="index"
          @tap="directGoToDishList(window)"
        >
          <image class="window-image" :src="window.images && window.images.length > 0 ? window.images[0] : (window.image || '/static/images/white.jpg')" mode="aspectFill"></image>
          <view class="window-info">
            <view class="window-name">{{window.name}}</view>
            <view class="window-desc">{{window.description}}</view>
            <view class="window-times">
              <view class="time-slots">
                <view class="time-tag">营业时间</view>
                <view class="time-value">{{window.openingHours || (window.lunchTime && window.dinnerTime ? window.lunchTime + '，' + window.dinnerTime : '未设置')}}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <image src="/static/images/white.jpg" mode="aspectFit"></image>
        <text>暂无窗口信息</text>
      </view>
    </scroll-view>
    
    <!-- 餐厅详情弹窗 -->
    <view class="popup-mask" v-if="showCanteenPopup" @click="closePopup"></view>
    <view class="canteen-popup card" v-if="showCanteenPopup">
      <view class="popup-header">
        <text class="popup-title">{{ currentCanteen.name }}</text>
        <view class="popup-close" @click="closePopup">
          <text class="iconfont icon-close-circle-line"></text>
        </view>
      </view>
      
      <view class="popup-content">
        <view class="popup-image">
          <image :src="currentCanteen.images && currentCanteen.images.length > 0 ? currentCanteen.images[0] : '/static/images/default.jpg'" mode="aspectFill"></image>
        </view>
        
        <view class="popup-info">
          <view class="info-item">
            <text class="info-label">餐厅简介</text>
            <text class="info-value">{{ currentCanteen.description }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">营业时间</text>
            <view class="time-info">
              <view class="time-item">
                <text class="time-value">{{ currentCanteen.openingHours || (currentCanteen.lunchTime && currentCanteen.dinnerTime ? currentCanteen.lunchTime + '，' + currentCanteen.dinnerTime : '未设置') }}</text>
              </view>
            </view>
          </view>
          
          <view class="info-item">
            <text class="info-label">位置信息</text>
            <view class="location-info">
              <text class="location-value">{{ currentCanteen.location }}</text>
              <view class="location-map" @click.stop="navigateToLocation">
                <text class="iconfont icon-location"></text>
                <text>导航</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="popup-footer">
          <view class="popup-btn btn" @click.stop="viewFoodWindows(currentCanteen)">
            <text>查看窗口</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 窗口详情弹窗 -->
    <view class="popup-mask" v-if="showWindowPopup" @click="closeWindowPopup"></view>
    <view class="window-popup card" v-if="showWindowPopup">
      <view class="popup-header">
        <text class="popup-title">{{ currentWindow.name }}</text>
        <view class="popup-close" @click="closeWindowPopup">
          <text class="iconfont icon-close-circle-line"></text>
        </view>
      </view>
      
      <view class="popup-content">
        <view class="popup-image">
          <image :src="currentWindow.images && currentWindow.images.length > 0 ? currentWindow.images[0] : (currentWindow.image || '/static/images/default.jpg')" mode="aspectFill"></image>
        </view>
        
        <view class="popup-info">
          <view class="info-item">
            <text class="info-label">窗口简介</text>
            <text class="info-value">{{ currentWindow.description }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">营业时间</text>
            <view class="time-info">
              <view class="time-item">
                <text class="time-value">{{ currentWindow.openingHours || (currentWindow.lunchTime && currentWindow.dinnerTime ? currentWindow.lunchTime + '，' + currentWindow.dinnerTime : '未设置') }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="popup-footer">
          <view class="popup-btn btn" @click.stop="directGoToDishList(currentWindow)">
            <text class="btn-icon">&#x1F374;</text>
            <text>查看菜品</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 使用TabBar组件代替自定义底部导航栏 -->
    <tab-bar></tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
import PageBackground from '@/components/PageBackground.vue';
import request from '@/utils/request';

/**
 * 餐厅介绍页面
 * 修复了以下问题:
 * 1. 弹窗打开后屏幕变灰且无法选择的问题
 * 2. 多个弹窗之间可能的冲突问题
 * 3. 页面跳转逻辑错误问题
 * 4. 组件交互和样式问题
 */
export default {
  components: {
    TabBar,
    PageBackground
  },
  data() {
    return {
      selectedCanteen: null,
      selectedFloor: null,
      showCanteenPopup: false,
      showWindowPopup: false,
      currentCanteen: {},
      currentWindow: null,
      // 当前显示的食堂ID
      currentCanteenId: null,
      canteenOptions: [],
      floorOptions: [],
      canteenDetails: [],
      // 默认显示的窗口列表
      foodList: [],
      // 加载状态
      loading: false,
      // 全局遮罩状态
      isGlobalMaskShown: false
    }
  },
  onLoad() {
    // 页面加载时获取所有餐厅列表
    this.fetchCanteenList();
    
    // 添加全局点击事件监听器，用于关闭下拉选择器
    setTimeout(() => {
      try {
        if (typeof document !== 'undefined' && document.body) {
          document.body.addEventListener('click', this.handleGlobalClick);
        }
      } catch (error) {
        console.error('添加事件监听器失败:', error);
      }
    }, 300);
  },
  onShow() {
    // 每次页面显示时重置餐厅选择器状态
    this.resetPickerState();
  },
  onUnmounted() {
    // 移除全局事件监听器
    try {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeEventListener('click', this.handleGlobalClick);
      }
    } catch (error) {
      console.error('移除事件监听器失败:', error);
    }
  },
  watch: {
    // 监控餐厅弹窗状态
    showCanteenPopup(newVal) {
      this.handleMaskStatus();
    },
    // 监控窗口弹窗状态
    showWindowPopup(newVal) {
      this.handleMaskStatus();
    }
  },
  methods: {
    // 全局点击事件处理
    handleGlobalClick(e) {
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
        this.removeMasks();
      } catch (error) {
        console.error('移除遮罩层时出错:', error);
      }
      // #endif
    },
    
    // 移除可能存在的遮罩层
    removeMasks() {
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
      if (!this.removeMasks._isRefreshing) {
        this.removeMasks._isRefreshing = true;
        try {
          this.loading = !this.loading;
          setTimeout(() => {
            this.loading = !this.loading;
            this.removeMasks._isRefreshing = false;
          }, 100);
        } catch (error) {
          console.error('触发视图更新失败:', error);
          this.removeMasks._isRefreshing = false;
        }
      }
    },
    
    // 获取所有餐厅列表
    async fetchCanteenList() {
      this.loading = true;
      try {
        const res = await request.get('/canteen');
        
        if (res && res.data && res.data.length > 0) {
          // 处理餐厅数据
          this.canteenDetails = res.data;
          
          // 生成选择器选项
          this.canteenOptions = res.data.map(canteen => ({
            value: canteen._id,
            text: canteen.name
          }));
          
          // 生成楼层选项（从第一个餐厅中获取）
          if (res.data[0].floors && res.data[0].floors.length > 0) {
            this.floorOptions = res.data[0].floors.map(floor => ({
              value: floor._id,
              text: floor.name
            }));
          } else {
            // 默认楼层选项
            this.floorOptions = [
              { value: '1', text: '一楼' },
              { value: '2', text: '二楼' },
              { value: '3', text: '三楼' }
            ];
          }
          
          // 如果有默认餐厅，显示其窗口
          if (res.data[0]) {
            this.fetchWindowsByCanteen(res.data[0]._id);
          }
        } else {
          // 如果没有获取到餐厅数据，使用默认数据
          this.useDefaultCanteenData();
          uni.showToast({
            title: '获取餐厅列表失败，使用默认数据',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取餐厅列表失败:', error);
        // 使用默认数据
        this.useDefaultCanteenData();
        uni.showToast({
          title: '获取餐厅列表失败，使用默认数据',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 使用默认餐厅数据（当API请求失败时）
    useDefaultCanteenData() {
      // 使用原来的静态数据
      this.canteenOptions = [
        { value: '1', text: '第一食堂' },
        { value: '2', text: '第二食堂' },
        { value: '3', text: '第三食堂' }
      ];
      
      this.floorOptions = [
        { value: '1', text: '一楼' },
        { value: '2', text: '二楼' },
        { value: '3', text: '三楼' }
      ];
      
      this.canteenDetails = [
        {
          _id: '1',
          name: '第一食堂',
          description: '第一食堂位于学校东区，主要提供川菜、粤菜等多种风味的美食，环境整洁舒适，是师生用餐的首选场所。',
          images: ['/static/images/default.jpg'],
          location: '校区东门旁边，综合教学楼一层',
          coordinates: {
            latitude: 30.123456,
            longitude: 120.123456
          },
          lunchTime: '10:30-14:00',
          dinnerTime: '16:30-19:30',
          windows: [
            {
              name: '川菜窗口',
              description: '提供正宗川菜，麻辣鲜香，品种丰富。',
              images: ['/static/images/default.jpg'],
              lunchTime: '10:30-14:00',
              dinnerTime: '16:30-19:30'
            },
            {
              name: '粤菜窗口',
              description: '广东风味，清淡鲜美，营养丰富。',
              images: ['/static/images/default.jpg'],
              lunchTime: '10:30-14:00',
              dinnerTime: '16:30-19:30'
            },
            {
              name: '面食窗口',
              description: '各式面食，现做现卖，口感极佳。',
              images: ['/static/images/default.jpg'],
              lunchTime: '10:30-14:00',
              dinnerTime: '16:30-19:30'
            }
          ]
        },
        {
          _id: '2',
          name: '第二食堂',
          description: '第二食堂位于学校中区，专注于提供北方特色餐饮，有面食窗口、饺子窗口等，价格实惠，深受北方学生喜爱。',
          images: ['/static/images/default.jpg'],
          location: '校区中央，图书馆西侧',
          coordinates: {
            latitude: 30.234567,
            longitude: 120.234567
          },
          lunchTime: '10:50-14:00',
          dinnerTime: '17:00-19:00',
          windows: [
            {
              name: '北方面食窗口',
              description: '正宗北方面食，劲道爽滑，品种多样。',
              images: ['/static/images/default.jpg'],
              lunchTime: '10:50-14:00',
              dinnerTime: '17:00-19:00'
            },
            {
              name: '饺子馄饨窗口',
              description: '现包现煮，馅料丰富，汤鲜味美。',
              images: ['/static/images/default.jpg'],
              lunchTime: '10:50-14:00',
              dinnerTime: '17:00-19:00'
            }
          ]
        },
        {
          _id: '3',
          name: '第三食堂',
          description: '第三食堂是学校最新建成的现代化食堂，提供多种国际美食，包括日韩料理、西式快餐等，环境优雅，设施完善。',
          images: ['/static/images/default.jpg'],
          location: '校区西区，学生宿舍区域',
          coordinates: {
            latitude: 30.345678,
            longitude: 120.345678
          },
          lunchTime: '11:00-13:30',
          dinnerTime: '17:30-20:00',
          windows: [
            {
              name: '日韩料理窗口',
              description: '正宗日韩风味，食材新鲜，制作精细。',
              images: ['/static/images/default.jpg'],
              lunchTime: '11:00-13:30',
              dinnerTime: '17:30-20:00'
            },
            {
              name: '西式快餐窗口',
              description: '各式西餐，制作标准，风味独特。',
              images: ['/static/images/default.jpg'],
              lunchTime: '11:00-13:30',
              dinnerTime: '17:30-20:00'
            },
            {
              name: '创意料理窗口',
              description: '融合中西方元素，创新菜品，别具一格。',
              images: ['/static/images/default.jpg'],
              lunchTime: '11:00-13:30',
              dinnerTime: '17:30-20:00'
            }
          ]
        }
      ];
      
      // 设置默认窗口列表
      this.foodList = this.canteenDetails[0].windows || [];
    },
    
    // 根据餐厅ID获取窗口列表
    async fetchWindowsByCanteen(canteenId) {
      if (!canteenId) {
        console.error('获取窗口列表失败: canteenId为空');
        uni.showToast({
          title: '参数错误',
          icon: 'none'
        });
        return;
      }
      
      console.log('开始获取窗口列表, 餐厅ID:', canteenId);
      this.loading = true;
      
      try {
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
        
        const res = await request.get(`/window/canteen/${canteenId}`);
        
        uni.hideLoading();
        
        if (res && res.data) {
          console.log(`成功获取窗口列表, 共${res.data.length}个窗口`);
          
          // 确保每个窗口数据的完整性
          this.foodList = res.data.map(window => {
            // 处理营业时间
            let openingHours = window.openingHours;
            if (!openingHours && window.lunchTime && window.dinnerTime) {
              openingHours = `${window.lunchTime}，${window.dinnerTime}`;
            }
            
            // 处理图片，优先使用images数组，如果没有则使用单个image字段
            let imageUrl = '/static/images/white.jpg';
            if (window.images && window.images.length > 0) {
              imageUrl = window.images[0];
            } else if (window.image) {
              imageUrl = window.image;
            }
            
            return {
              ...window,
              name: window.name || '未命名窗口',
              description: window.description || '暂无描述',
              image: imageUrl,
              openingHours: openingHours || '未设置'
            };
          });
          
          this.currentCanteenId = canteenId;
        } else {
          console.warn('窗口列表API返回数据为空或格式错误:', res);
          // 如果API请求失败，尝试从本地数据中获取
          this.getWindowsFromLocalData(canteenId);
          
          uni.showToast({
            title: '获取窗口列表失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('获取窗口列表失败:', error);
        // 从本地数据中获取
        this.getWindowsFromLocalData(canteenId);
        
        uni.showToast({
          title: '网络错误，使用本地数据',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 从本地数据中获取窗口列表
    getWindowsFromLocalData(canteenId) {
      console.log('尝试从本地数据获取窗口列表, 餐厅ID:', canteenId);
      const canteen = this.canteenDetails.find(c => c._id === canteenId);
      if (canteen && canteen.windows && canteen.windows.length > 0) {
        console.log(`从本地数据获取到${canteen.windows.length}个窗口`);
        this.foodList = canteen.windows.map(window => {
          // 处理营业时间
          let openingHours = window.openingHours;
          if (!openingHours && window.lunchTime && window.dinnerTime) {
            openingHours = `${window.lunchTime}，${window.dinnerTime}`;
          }
          
          // 处理图片，优先使用images数组，如果没有则使用单个image字段
          let imageUrl = '/static/images/white.jpg';
          if (window.images && window.images.length > 0) {
            imageUrl = window.images[0];
          } else if (window.image) {
            imageUrl = window.image;
          }
          
          return {
            ...window,
            name: window.name || '未命名窗口',
            description: window.description || '暂无描述',
            image: imageUrl,
            openingHours: openingHours || '未设置'
          };
        });
        this.currentCanteenId = canteenId;
      } else {
        console.warn('本地数据中没有找到窗口信息');
        this.foodList = [];
        uni.showToast({
          title: '未找到相关窗口信息',
          icon: 'none'
        });
      }
    },
    
    // 获取餐厅详情
    async fetchCanteenDetail(canteenId) {
      try {
        console.log('开始获取餐厅详情, ID:', canteenId);
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
        
        const res = await request.get(`/canteen/${canteenId}`);
        
        uni.hideLoading();
        
        if (res && res.data) {
          console.log('成功获取餐厅详情:', res.data);
          // 确保数据完整性
          if (!res.data.images) res.data.images = [];
          if (!res.data.floors) res.data.floors = [];
          
          // 处理营业时间
          let openingHours = res.data.openingHours;
          if (!openingHours && res.data.lunchTime && res.data.dinnerTime) {
            openingHours = `${res.data.lunchTime}，${res.data.dinnerTime}`;
          }
          
          // 确保必要字段存在
          const canteen = {
            ...res.data,
            description: res.data.description || '暂无详细介绍',
            location: res.data.location || '详细位置信息暂未提供',
            openingHours: openingHours || '未设置',
            coordinates: res.data.coordinates || null
          };
          
          return canteen;
        } else {
          console.warn('餐厅详情API返回数据为空或格式错误:', res);
          uni.showToast({
            title: '获取餐厅详情失败',
            icon: 'none',
            duration: 2000
          });
          
          // 只有在API确实失败的情况下才从本地数据中获取
          const localCanteen = this.canteenDetails.find(c => c._id === canteenId);
          if (localCanteen) {
            console.log('使用本地缓存的餐厅数据:', localCanteen.name);
            return localCanteen;
          } else {
            console.error('无法获取餐厅详情，本地也没有对应数据');
            return null;
          }
        }
      } catch (error) {
        uni.hideLoading();
        console.error('获取餐厅详情出错:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        
        // 只有在网络错误的情况下才从本地数据中获取
        const localCanteen = this.canteenDetails.find(c => c._id === canteenId);
        if (localCanteen) {
          console.log('网络错误，使用本地缓存的餐厅数据:', localCanteen.name);
          return localCanteen;
        } else {
          console.error('网络错误且本地没有对应数据');
          return null;
        }
      }
    },
    
    // 根据楼层筛选窗口
    async filterWindowsByFloor(canteenId, floorId) {
      try {
        // 将floorId作为URL参数传递
        const res = await request.get(`/canteen/${canteenId}/windows/filter?floorId=${floorId}`);
        
        if (res && res.data) {
          this.foodList = res.data;
        } else {
          // 如果API请求失败，显示提示
          uni.showToast({
            title: '筛选失败，请重试',
            icon: 'none'
          });
        }
        return res;
      } catch (error) {
        console.error('筛选窗口失败:', error);
        uni.showToast({
          title: '筛选失败，请重试',
          icon: 'none'
        });
        throw error; // 重新抛出错误以便调用者可以捕获
      }
    },
    
    resetPickerState() {
      // 清空之前选择的餐厅状态，确保下次能正常弹窗
      this.showCanteenPopup = false;
      this.showWindowPopup = false;
      
      // 关闭可能存在的加载提示
      try {
        uni.hideLoading();
      } catch (e) {
        console.log('尝试关闭loading', e);
      }
      
      // uni-app没有直接操作DOM的方法，使用变通方法
      // 尝试触发一个空事件或延迟操作
      setTimeout(() => {
        // 空操作，让可能卡住的界面有机会刷新
        this.loading = false;
      }, 100);
    },
    
    goBack() {
    //请不要调整goback方法！
       uni.navigateTo({
        url: '/pages/index/index'
      });
    },
    
    async onCanteenChange(e) {
      try {
        // 阻止事件冒泡
        e.stopPropagation && e.stopPropagation();
        
        // 确保其他弹窗已关闭
        this.showCanteenPopup = false;
        this.showWindowPopup = false;
        
        // 更新选中的餐厅
        this.selectedCanteen = this.canteenOptions[e.detail.value];
        
        // 查找对应的餐厅详情
        const canteenId = this.selectedCanteen.value;
        
        // 防止遮罩层显示时间过长
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
        
        // 获取餐厅详情
        const canteen = await this.fetchCanteenDetail(canteenId);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (canteen) {
          // 延迟显示餐厅详情弹窗，确保picker弹窗已关闭
          setTimeout(() => {
            this.showCanteenDetail(canteen);
          }, 300);
        } else {
          // 如果获取餐厅详情失败，显示错误提示
          uni.showToast({
            title: '无法获取餐厅详情',
            icon: 'none',
            duration: 2000
          });
        }
        
        // 安全地尝试移除遮罩层
        try {
          setTimeout(() => {
            this.removeMasks();
          }, 100);
        } catch (error) {
          console.error('移除遮罩层时出错:', error);
        }
      } catch (error) {
        console.error('获取餐厅详情失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '获取餐厅详情失败',
          icon: 'none'
        });
      }
    },
    
    onFloorChange(e) {
      try {
        // 阻止事件冒泡
        e.stopPropagation && e.stopPropagation();
        
        // 确保其他弹窗已关闭
        this.showCanteenPopup = false;
        this.showWindowPopup = false;
        
        this.selectedFloor = this.floorOptions[e.detail.value];
        
        // 显示加载中提示
        uni.showLoading({
          title: '筛选中...',
          mask: false
        });
        
        // 延迟一下，确保picker已关闭
        setTimeout(() => {
          // 根据楼层筛选窗口
          if (this.currentCanteenId && this.selectedFloor) {
            this.filterWindowsByFloor(this.currentCanteenId, this.selectedFloor.value)
              .finally(() => {
                uni.hideLoading();
              });
          } else {
            uni.hideLoading();
          }
        }, 200);
        
        // 安全地尝试移除遮罩层
        try {
          setTimeout(() => {
            this.removeMasks();
          }, 100);
        } catch (error) {
          console.error('移除遮罩层时出错:', error);
        }
      } catch (error) {
        console.error('楼层筛选出错:', error);
        uni.hideLoading();
        uni.showToast({
          title: '筛选失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 根据选择的餐厅和楼层筛选餐厅列表
    filterFoodList() {
      // 这里可以添加筛选逻辑
      console.log('筛选条件：', this.selectedCanteen, this.selectedFloor);
    },
    
    // 点击列表项查看餐厅详情
    async viewCanteenDetail(item) {
      console.log('查看餐厅详情:', item.name || item._id);
      
      // 确保关闭其他弹窗
      this.showWindowPopup = false;
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
        
        // 根据ID查找对应的餐厅详情
        const canteen = await this.fetchCanteenDetail(item._id);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (canteen) {
          this.showCanteenDetail(canteen);
        } else {
          console.error('无法获取餐厅详情:', item._id);
          // 如果API获取失败，尝试使用传入的item作为备选
          if (item && item._id) {
            console.log('使用列表项数据作为备选:', item.name);
            
            // 处理营业时间
            let openingHours = item.openingHours;
            if (!openingHours && item.lunchTime && item.dinnerTime) {
              openingHours = `${item.lunchTime}，${item.dinnerTime}`;
            }
            
            // 确保数据完整性
            const fallbackCanteen = {
              ...item,
              description: item.description || '暂无详细介绍',
              location: item.location || '详细位置信息暂未提供',
              openingHours: openingHours || '未设置',
              coordinates: item.coordinates || null,
              images: item.images || []
            };
            this.showCanteenDetail(fallbackCanteen);
          } else {
            uni.showToast({
              title: '获取餐厅详情失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      } catch (error) {
        uni.hideLoading();
        console.error('查看餐厅详情出错:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },
    
    // 显示餐厅详情弹窗
    async showCanteenDetail(canteen) {
      // 关闭其他弹窗
      this.showWindowPopup = false;
      
      // 确保有完整的餐厅数据
      if (!canteen) {
        console.error('显示餐厅详情失败：没有餐厅数据');
        uni.showToast({
          title: '无法显示餐厅详情',
          icon: 'none'
        });
        return;
      }
      
      console.log('准备显示餐厅详情:', canteen.name);
      
      // 处理营业时间
      let openingHours = canteen.openingHours;
      if (!openingHours && canteen.lunchTime && canteen.dinnerTime) {
        openingHours = `${canteen.lunchTime}，${canteen.dinnerTime}`;
      }
      
      // 检查数据完整性，确保必要字段存在
      this.currentCanteen = {
        ...canteen,
        description: canteen.description || '暂无详细介绍',
        location: canteen.location || '详细位置信息暂未提供',
        openingHours: openingHours || '未设置',
        coordinates: canteen.coordinates || null
      };
      
      // 先关闭再打开弹窗，确保状态正确刷新
      this.showCanteenPopup = false;
      setTimeout(() => {
        this.showCanteenPopup = true;
        console.log('已显示餐厅详情弹窗:', this.currentCanteen.name);
        
        // 获取位置信息
        this.getCanteenLocation(this.currentCanteen);
      }, 50);
    },
    
    viewFoodWindows(item) {
      // 关闭弹窗
      this.showCanteenPopup = false;
      
      // 更新页面标题以反映当前正在查看的食堂窗口
      uni.setNavigationBarTitle({
        title: `${item.name}的窗口`
      });
      
      // 根据所选食堂获取窗口列表
      this.fetchWindowsByCanteen(item._id);
    },
    
    closePopup() {
      this.showCanteenPopup = false;
    },
    
    // 获取餐厅位置信息
    getCanteenLocation(canteen) {
      // 如果餐厅已有坐标信息，直接使用
      if (canteen.coordinates && canteen.coordinates.latitude) {
        console.log('使用预设坐标:', canteen.coordinates);
        return;
      }
      
      // 尝试获取当前位置
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('当前位置:', res);
          // 这里可以将位置信息保存到餐厅数据中
          // 或者可以计算用户与餐厅的距离
        },
        fail: (err) => {
          console.error('获取位置失败:', err);
          uni.showToast({
            title: '获取位置信息失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 导航到餐厅位置
    navigateToLocation() {
      const { coordinates, name } = this.currentCanteen;
      
      if (coordinates && coordinates.latitude) {
        uni.openLocation({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          name: name,
          address: this.currentCanteen.location,
          success: () => {
            console.log('打开位置成功');
          },
          fail: (err) => {
            console.error('打开位置失败:', err);
            uni.showToast({
              title: '打开地图失败',
              icon: 'none'
            });
          }
        });
      } else {
        uni.showToast({
          title: '位置信息不完整',
          icon: 'none'
        });
      }
    },
    
    // 查看窗口详情
    async viewWindowDetail(window) {
      console.log('查看窗口详情:', window.name || window._id);
      
      // 确保关闭其他弹窗
      this.showCanteenPopup = false;
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '加载中...',
          mask: false
        });
        
        // 尝试获取窗口详情
        const res = await request.get(`/window/${window._id}`);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (res && res.data) {
          console.log('成功获取窗口详情:', res.data.name);
          
          // 处理营业时间
          let openingHours = res.data.openingHours;
          if (!openingHours && res.data.lunchTime && res.data.dinnerTime) {
            openingHours = `${res.data.lunchTime}，${res.data.dinnerTime}`;
          }
          
          // 确保数据完整性
          this.currentWindow = {
            ...res.data,
            name: res.data.name || '未命名窗口',
            description: res.data.description || '暂无描述',
            image: res.data.image || '/static/images/white.jpg',
            openingHours: openingHours || '未设置'
          };
        } else {
          console.warn('窗口详情API返回数据为空或格式错误');
          
          // 处理营业时间
          let openingHours = window.openingHours;
          if (!openingHours && window.lunchTime && window.dinnerTime) {
            openingHours = `${window.lunchTime}，${window.dinnerTime}`;
          }
          
          // 使用传入的窗口信息作为备选
          this.currentWindow = {
            ...window,
            name: window.name || '未命名窗口',
            description: window.description || '暂无描述',
            image: window.image || '/static/images/white.jpg',
            openingHours: openingHours || '未设置'
          };
        }
        
        // 显示窗口详情弹窗
        this.showWindowPopup = true;
        
      } catch (error) {
        uni.hideLoading();
        console.error('获取窗口详情失败:', error);
        
        // 处理营业时间
        let openingHours = window.openingHours;
        if (!openingHours && window.lunchTime && window.dinnerTime) {
          openingHours = `${window.lunchTime}，${window.dinnerTime}`;
        }
        
        // 使用传入的窗口信息作为备选
        this.currentWindow = {
          ...window,
          name: window.name || '未命名窗口',
          description: window.description || '暂无描述',
          image: window.image || '/static/images/white.jpg',
          openingHours: openingHours || '未设置'
        };
        
        // 显示窗口详情弹窗
        this.showWindowPopup = true;
        
        // 显示错误提示
        uni.showToast({
          title: '网络错误，使用本地数据',
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    closeWindowPopup() {
      this.showWindowPopup = false;
    },
    
    // 跳转到菜品列表页面
    goToDishList(window) {
      console.log('跳转到菜品列表:', window);
      
      // 先关闭弹窗再跳转
      this.closeWindowPopup();
      
      setTimeout(() => {
        // 直接跳转到菜品列表页面
        uni.navigateTo({
          url: `/pages/index/dish-list?windowId=${window._id || ''}&windowName=${encodeURIComponent(window.name)}`,
          success: () => {
            console.log('跳转到菜品列表页面成功');
          },
          fail: (err) => {
            console.error('跳转到菜品列表页面失败:', err);
            
            // 如果跳转失败，显示错误信息
            uni.showToast({
              title: '跳转失败，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }, 100);
    },
    
    // 直接跳转到菜品列表
    directGoToDishList(window) {
      console.log('直接跳转到菜品列表:', window);
      
      // 先关闭弹窗
      this.showWindowPopup = false;
      
      // 延迟一下再跳转，确保弹窗已经关闭
      setTimeout(() => {
        // 使用navigateTo方法进行跳转
        uni.navigateTo({
          url: `/pages/index/dish-list?windowId=${window._id || ''}&windowName=${encodeURIComponent(window.name)}`,
          success: () => {
            console.log('跳转到菜品列表页面成功');
          },
          fail: (err) => {
            console.error('跳转到菜品列表页面失败:', err);
            
            // 如果navigateTo失败，尝试使用redirectTo
            uni.redirectTo({
              url: `/pages/index/dish-list?windowId=${window._id || ''}&windowName=${encodeURIComponent(window.name)}`,
              fail: (err2) => {
                console.error('redirectTo也失败了:', err2);
                
                uni.showToast({
                  title: '跳转失败，请重试',
                  icon: 'none'
                });
              }
            });
          }
        });
      }, 200);
    },
    
    // 处理页面容器点击事件，用于关闭可能卡住的弹窗
    handleContainerClick(e) {
      // 检查点击事件的来源，如果点击的是选择器或其子元素，则不处理
      if (e && e.target) {
        const target = e.target;
        // 检查是否点击了选择器或其父元素
        if (target.className && 
            (String(target.className).includes('picker') || 
             String(target.className).includes('selector'))) {
          // 如果点击了选择器相关元素，不做任何处理
          return;
        }
      }
      
      // 阻止事件冒泡，防止干扰选择器操作
      e.stopPropagation && e.stopPropagation();
      
      // 如果没有弹窗显示，则不做任何处理
      if (!this.showCanteenPopup && !this.showWindowPopup) {
        // uni-app环境下，通过状态变化来刷新界面
        this.loading = false;
        
        // 尝试关闭可能存在的uni-picker
        try {
          // 通过状态变化尝试关闭可能打开的picker
          this.$nextTick(() => {
            this.loading = false;
          });
        } catch (error) {
          console.error('尝试关闭picker时出错:', error);
        }
      }
    },
    
    // 处理全局遮罩状态
    handleMaskStatus() {
      // 如果任何弹窗打开，显示全局遮罩
      if (this.showCanteenPopup || this.showWindowPopup) {
        this.isGlobalMaskShown = true;
      } else {
        // 延迟关闭全局遮罩，确保过渡效果平滑
        setTimeout(() => {
          this.isGlobalMaskShown = false;
        }, 200);
      }
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: 110rpx;
  box-sizing: border-box;
  position: relative;
  background-color: #f8f8f8;
}

.status-bar {
  height: var(--status-bar-height, 44px);
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  position: relative;
  z-index: 10;
  background-color: transparent;
}

.back-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.back-icon .iconfont {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-right: 60rpx;
}

/* 基础选择器区域样式 */
.basic-selector-area {
  margin: 20rpx 30rpx 40rpx;
  display: flex;
  padding: 24rpx 30rpx;
  border-radius: 20rpx;
  position: relative;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.basic-selector-divider {
  width: 2rpx;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 0 30rpx;
}

.basic-selector-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.basic-selector-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.basic-picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60rpx;
}

.basic-picker-text {
  font-size: 30rpx;
  color: #333;
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.basic-picker-arrow {
  font-size: 24rpx;
  color: #999;
}

/* 窗口列表样式 */
.food-list {
  height: calc(100vh - 300rpx);
  padding: 0 30rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  -webkit-overflow-scrolling: touch;
  margin-top: 20rpx;
}

.window-section {
  padding-bottom: 30rpx;
}

.window-card {
  margin-bottom: 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.window-card:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.1);
}

.window-image {
  width: 100%;
  height: 240rpx;
  object-fit: cover;
}

.window-info {
  padding: 24rpx;
}

.window-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.window-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.window-times {
  display: flex;
  gap: 30rpx;
}

.time-slots {
  display: flex;
  align-items: center;
}

.time-tag {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
  border-radius: 20rpx;
  margin-right: 10rpx;
}

.time-value {
  font-size: 24rpx;
  color: #666;
}

/* 弹窗遮罩层样式增强 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗内容样式增强 */
.canteen-popup,
.window-popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 650rpx;
  max-height: 80vh;
  z-index: 1001;
  border-radius: 24rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { 
    opacity: 0; 
    transform: translate(-50%, -48%) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.popup-close:active {
  background: rgba(0, 0, 0, 0.1);
}

.popup-close .iconfont {
  font-size: 40rpx;
  color: #666;
}

.popup-content {
  padding: 0;
  max-height: calc(80vh - 100rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 增加iOS流畅滚动 */
  background-color: #fff;
}

.popup-image {
  width: 100%;
  height: 300rpx;
  overflow: hidden;
}

.popup-image image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-info {
  padding: 30rpx;
}

.info-item {
  margin-bottom: 30rpx;
}

.info-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  position: relative;
  padding-left: 20rpx;
}

.info-label::before {
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

.info-value {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.time-item {
  display: flex;
  align-items: center;
}

.time-label {
  font-size: 26rpx;
  color: #666;
  width: 100rpx;
}

.time-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.location-value {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}

.location-map {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background: rgba(52, 199, 89, 0.1);
  border-radius: 30rpx;
  color: #34c759;
}

.location-map .iconfont {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.popup-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  justify-content: center;
  background-color: #fff;
  position: relative;
  z-index: 1;
}

.popup-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #34c759, #32ade6);
  box-shadow: 0 8rpx 20rpx rgba(52, 199, 89, 0.3);
  transition: all 0.3s ease;
}

.popup-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(52, 199, 89, 0.2);
}

.btn-icon {
  margin-right: 10rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-state image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-state text {
  font-size: 28rpx;
  color: #999;
}

.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
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