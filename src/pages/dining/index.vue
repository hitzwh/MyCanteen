<template>
  <view class="dining-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <text>加载中...</text>
    </view>
    
    <!-- 头部 -->
    <view class="header">
      <text class="title">今天吃什么？</text>
      <text class="subtitle">让我帮你决定</text>
    </view>
    
    <!-- 老虎机区域 - 只在前三步显示 -->
    <view class="slot-machine" v-if="currentStep <= 3">
      <!-- 步骤指示器 -->
      <view class="steps">
        <view class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <text class="step-number">1</text>
          <text class="step-name">选择餐厅</text>
        </view>
        <view class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <text class="step-number">2</text>
          <text class="step-name">选择窗口</text>
        </view>
        <view class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <text class="step-number">3</text>
          <text class="step-name">选择菜品</text>
        </view>
      </view>
      
      <!-- 老虎机 -->
      <view class="slot-machine-container">
        <view class="slot-title">{{ currentStepTitle }}</view>
        
        <!-- 空状态处理 -->
        <view v-if="currentReelData.length === 0" class="empty-state">
          <text>暂无{{ currentStepTitle }}数据</text>
        </view>
        
        <view class="slot-reels" v-else>
          <!-- 餐厅滚轮 -->
          <view class="slot-reel" v-if="currentStep === 1">
            <view class="reel-mask top"></view>
            <view class="reel-items" :style="{ transform: `translateY(${reelPositions.restaurant}rpx)` }">
              <!-- 顶部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(restaurants, -3)" :key="'restaurant-top-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
              
              <!-- 主要元素 -->
              <view class="reel-item" v-for="(item, index) in restaurants" :key="'restaurant-'+index" :class="{ highlighted: isHighlighted(index, 'restaurant') }">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
              
              <!-- 底部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(restaurants, 0, 3)" :key="'restaurant-bottom-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
            </view>
            <view class="reel-mask bottom"></view>
            <view class="selection-indicator"></view>
          </view>
          
          <!-- 窗口滚轮 -->
          <view class="slot-reel" v-if="currentStep === 2">
            <view class="reel-mask top"></view>
            <view class="reel-items" :style="{ transform: `translateY(${reelPositions.window}rpx)` }">
              <!-- 顶部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(windows, -3)" :key="'window-top-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
              
              <!-- 主要元素 -->
              <view class="reel-item" v-for="(item, index) in windows" :key="'window-'+index" :class="{ highlighted: isHighlighted(index, 'window') }">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
              
              <!-- 底部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(windows, 0, 3)" :key="'window-bottom-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
              </view>
            </view>
            <view class="reel-mask bottom"></view>
            <view class="selection-indicator"></view>
          </view>
          
          <!-- 菜品滚轮 -->
          <view class="slot-reel" v-if="currentStep === 3">
            <view class="reel-mask top"></view>
            <view class="reel-items" :style="{ transform: `translateY(${reelPositions.dish}rpx)` }">
              <!-- 顶部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(dishes, -3)" :key="'dish-top-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
                <text class="item-price">¥{{ item.price }}</text>
              </view>
              
              <!-- 主要元素 -->
              <view class="reel-item" v-for="(item, index) in dishes" :key="'dish-'+index" :class="{ highlighted: isHighlighted(index, 'dish') }">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
                <text class="item-price">¥{{ item.price }}</text>
              </view>
              
              <!-- 底部副本（确保循环滚动时的连续性） -->
              <view class="reel-item" v-for="(item, index) in getSafeSlice(dishes, 0, 3)" :key="'dish-bottom-'+index">
                <image class="item-image" :src="item.image" mode="aspectFill" @error="handleImageError"></image>
                <text class="item-name">{{ item.name }}</text>
                <text class="item-price">¥{{ item.price }}</text>
              </view>
            </view>
            <view class="reel-mask bottom"></view>
            <view class="selection-indicator"></view>
          </view>
        </view>
      </view>
      
      <!-- 操作区域 -->
      <view class="slot-controls">
        <button class="shake-button" :disabled="isShaking" @click="startShake">
          {{ shakeButtonText }}
        </button>
      </view>
    </view>
    
    <!-- 结果展示 -->
    <view class="result-display" v-if="currentStep > 3">
      <view class="result-card">
        <image class="result-image" :src="selectedItem.image" mode="aspectFill" @error="handleImageError"></image>
        <view class="result-info">
          <text class="result-title">今天就吃这个！</text>
          <text class="result-restaurant">餐厅：{{ selectedItem.restaurant }}</text>
          <text class="result-window">窗口：{{ selectedItem.window }}</text>
          <text class="result-name">菜品：{{ selectedItem.dish }}</text>
          <text class="result-price">价格：¥{{ selectedItem.price }}</text>
        </view>
        <button class="restart-button" @click="restart">重新开始</button>
      </view>
    </view>
    
    <!-- 结果模态框 -->
    <view class="modal" v-if="showModal">
      <view class="modal-backdrop" @click="cancelSelection"></view>
      <view class="modal-content">
        <text class="modal-title">{{ modalTitle }}</text>
        <image class="modal-image" :src="selectedItem.image" mode="aspectFill" @error="handleImageError"></image>
        <text class="modal-name">{{ selectedItem.name }}</text>
        
        <!-- 最终结果时显示详细信息 -->
        <view class="modal-details" v-if="currentStep > 3">
          <text class="detail-item">餐厅：{{ selectedItem.restaurant }}</text>
          <text class="detail-item">窗口：{{ selectedItem.window }}</text>
          <text class="detail-item">菜品：{{ selectedItem.dish }}</text>
          <text class="detail-item">价格：¥{{ selectedItem.price }}</text>
        </view>
        
        <view class="modal-actions">
          <!-- 根据当前步骤显示不同的按钮 -->
          <template v-if="currentStep <= 3">
            <button class="dislike-button" @click="cancelSelection">不喜欢</button>
            <button class="like-button" @click="confirmSelection">喜欢</button>
          </template>
          <template v-else>
            <button class="restart-button" @click="restart">重新开始</button>
          </template>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
import { ref, reactive, onMounted, computed } from 'vue';
import { dishApi, windowApi } from '@/api';
// 移除不存在的API导入
// import { canteenApi } from '@/api';
// import { systemApi } from '@/api';

// 使用模拟数据替代不存在的API
const mockRestaurants = [
  { _id: 'r1', name: '第一餐厅', image: '/static/images/restaurant1.jpg' },
  { _id: 'r2', name: '第二餐厅', image: '/static/images/restaurant2.jpg' },
  { _id: 'r3', name: '第三餐厅', image: '/static/images/restaurant3.jpg' },
];

// 模拟随机推荐API
function mockRandomMeal(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据参数返回不同的随机结果
      if (params.windowId) {
        // 第三步：随机菜品
        resolve({
          data: {
            dish: {
              _id: 'dish1',
              name: '随机推荐菜品',
              price: Math.floor(Math.random() * 30) + 10,
              windowId: { _id: params.windowId },
              canteenId: { _id: params.canteenId }
            }
          }
        });
      } else if (params.canteenId) {
        // 第二步：随机窗口
        resolve({
          data: {
            dish: {
              windowId: { _id: 'w1' },
              canteenId: { _id: params.canteenId }
            }
          }
        });
      } else {
        // 第一步：随机餐厅
        resolve({
          data: {
            dish: {
              canteenId: { _id: 'r1' }
            }
          }
        });
      }
    }, 500);
  });
}

export default {
  components: {
    TabBar
  },
  data() {
    return {
      currentStep: 1,
      isShaking: false,
      showModal: false,
      modalTitle: '',
      loading: false,
      
      // 老虎机滚轮位置
      reelPositions: {
        restaurant: -450, // 修改为3个元素的高度
        window: -450,
        dish: -450
      },
      
      // 当前选择的项目
      currentSelection: {
        restaurant: 0,
        window: 0,
        dish: 0
      },
      
      // 最终选择结果
      finalSelection: {
        restaurant: null,
        window: null,
        dish: null
      },
      
      // 高亮索引
      highlightedIndex: -1,
      
      // 音效
      sounds: {
        shake: '/static/sounds/shake.mp3',
        result: '/static/sounds/result.mp3',
        click: '/static/sounds/click.mp3',
        success: '/static/sounds/success.mp3'
      },
      
      // 选中的项目
      selectedItem: null,
      
      // 餐厅数据
      restaurants: [],
      
      // 窗口数据
      windows: [],
      
      // 菜品数据
      dishes: []
    }
  },
  computed: {
    // 当前步骤标题
    currentStepTitle() {
      switch (this.currentStep) {
        case 1:
          return '选择餐厅';
        case 2:
          return '选择窗口';
        case 3:
          return '选择菜品';
        default:
          return '';
      }
    },
    
    // 摇动按钮文本
    shakeButtonText() {
      if (this.isShaking) {
        return '摇动中...';
      }
      return '开始摇一摇';
    },
    // 当前滚轮数据
    currentReelData() {
      if (this.currentStep === 1) return this.restaurants;
      if (this.currentStep === 2) return this.windows;
      return this.dishes;
    },
    // 当前滚轮类型
    currentReelType() {
      return this.currentStep === 1 ? 'restaurant' : 
             this.currentStep === 2 ? 'window' : 'dish';
    }
  },
  onLoad() {
    // 验证数据是否有效
    if (this.restaurants.length < 3) {
      console.warn('餐厅数据不足，可能导致显示问题');
    }
    if (this.windows.length < 3) {
      console.warn('窗口数据不足，可能导致显示问题');
    }
    if (this.dishes.length < 3) {
      console.warn('菜品数据不足，可能导致显示问题');
    }
    
    // 预加载音效
    this.preloadSounds();
    
    // 初始化数据
    this.initData();
  },
  methods: {
    // 预加载音效
    preloadSounds() {
      try {
        // 创建内部音频上下文
        const shakeSound = uni.createInnerAudioContext();
        const resultSound = uni.createInnerAudioContext();
        const clickSound = uni.createInnerAudioContext();
        const successSound = uni.createInnerAudioContext();
        
        // 设置音效路径
        shakeSound.src = this.sounds.shake;
        resultSound.src = this.sounds.result;
        clickSound.src = this.sounds.click;
        successSound.src = this.sounds.success;
        
        // 存储音效对象
        this.soundObjects = {
          shake: shakeSound,
          result: resultSound,
          click: clickSound,
          success: successSound
        };
      } catch (e) {
        console.error('预加载音效失败:', e);
      }
    },
    
    // 获取安全的切片数组
    getSafeSlice(array, start, end) {
      if (!array || array.length === 0) return [];
      
      // 处理数组长度不足的情况
      if (start < 0) {
        const result = [];
        const count = Math.abs(start);
        
        // 确保即使数组长度不足，也能正确循环
        for (let i = 0; i < count; i++) {
          const index = ((array.length - count + i) % array.length + array.length) % array.length;
          result.push(array[index]);
        }
        return result;
      } else if (end !== undefined) {
        // 处理结束索引
        const result = [];
        for (let i = start; i < end; i++) {
          const index = i % array.length;
          result.push(array[index]);
        }
        return result;
      }
      
      return array.slice(start, end);
    },
    
    // 播放音效
    playSound(type) {
      if (!this.sounds[type]) return;
      
      try {
        if (this.soundObjects && this.soundObjects[type]) {
          // 使用预加载的音效对象
          this.soundObjects[type].stop();
          this.soundObjects[type].play();
        } else {
          // 创建新的音效对象
          const innerAudioContext = uni.createInnerAudioContext();
          innerAudioContext.src = this.sounds[type];
          innerAudioContext.play();
        }
      } catch (e) {
        console.error('播放音效失败:', e);
      }
    },
    
    // 初始化数据
    async initData() {
      this.loading = true;
      
      try {
        // 获取所有餐厅
        this.restaurants = mockRestaurants;
        
        // 如果有餐厅数据，获取第一个餐厅的窗口
        if (this.restaurants.length > 0) {
          this.windows = [
            { _id: 'w1', name: '窗口1', image: '/static/images/window1.jpg' },
            { _id: 'w2', name: '窗口2', image: '/static/images/window2.jpg' },
            { _id: 'w3', name: '窗口3', image: '/static/images/window3.jpg' },
          ];
          
          // 如果有窗口数据，获取第一个窗口的菜品
          if (this.windows.length > 0) {
            this.dishes = [
              { _id: 'd1', name: '菜品1', image: '/static/images/dish1.jpg', price: 15 },
              { _id: 'd2', name: '菜品2', image: '/static/images/dish2.jpg', price: 20 },
              { _id: 'd3', name: '菜品3', image: '/static/images/dish3.jpg', price: 25 },
            ];
          }
        }
        
        // 确保数据至少有3个元素，否则可能导致滚动问题
        if (this.restaurants.length < 3) {
          this.restaurants = this.padArray(this.restaurants, 3);
        }
        if (this.windows.length < 3) {
          this.windows = this.padArray(this.windows, 3);
        }
        if (this.dishes.length < 3) {
          this.dishes = this.padArray(this.dishes, 3);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
      
      // 确保有默认选择项
      this.selectedItem = {
        restaurant: '',
        window: '',
        dish: '',
        price: 0,
        image: '/static/images/default.jpg'
      };
      
      // 重置所有状态
      this.currentStep = 1;
      this.isShaking = false;
      this.showModal = false;
      this.highlightedIndex = -1;
      
      // 直接设置初始位置，确保第一个元素位于中间位置
      const initialPosition = -450;
      
      // 直接设置位置，不使用动画
      this.reelPositions = {
        restaurant: initialPosition,
        window: initialPosition,
        dish: initialPosition
      };
      
      console.log('初始化位置设置完成:', this.reelPositions);
      
      // 重置选择
      this.currentSelection = {
        restaurant: 0,
        window: 0,
        dish: 0
      };
      
      this.finalSelection = {
        restaurant: null,
        window: null,
        dish: null
      };
      
      // 调试：计算当前位置对应的索引
      this.debugPositionToIndex();
    },
    
    // 数组填充方法，确保至少有minLength个元素
    padArray(array, minLength) {
      if (!array || array.length === 0) {
        // 如果数组为空，创建默认项
        const defaultItems = [];
        for (let i = 0; i < minLength; i++) {
          defaultItems.push({
            _id: `default-${i}`,
            name: `默认项 ${i+1}`,
            image: '/static/images/default.jpg',
            price: 0
          });
        }
        return defaultItems;
      }
      
      if (array.length >= minLength) {
        return array;
      }
      
      // 复制现有项目，直到达到最小长度
      const result = [...array];
      while (result.length < minLength) {
        for (let i = 0; i < array.length && result.length < minLength; i++) {
          result.push({...array[i]});
        }
      }
      
      return result;
    },
    
    // 开始摇动老虎机 - 修改为使用API
    async startShake() {
      // 如果正在摇动，直接返回
      if (this.isShaking) return;
      
      // 设置正在摇动状态
      this.isShaking = true;
      this.highlightedIndex = -1;
      this.playSound('shake');
      
      try {
        // 根据当前步骤决定API调用参数
        let params = {};
        
        if (this.currentStep === 1) {
          // 第一步：随机选择餐厅
          // 不需要特定参数
        } else if (this.currentStep === 2) {
          // 第二步：随机选择窗口，指定餐厅
          const restaurantIndex = this.finalSelection.restaurant !== null ? 
                                 this.finalSelection.restaurant : 
                                 this.currentSelection.restaurant;
          params.canteenId = this.restaurants[restaurantIndex]._id;
        } else if (this.currentStep === 3) {
          // 第三步：随机选择菜品，指定餐厅和窗口
          const restaurantIndex = this.finalSelection.restaurant !== null ? 
                                 this.finalSelection.restaurant : 
                                 this.currentSelection.restaurant;
          const windowIndex = this.finalSelection.window !== null ? 
                             this.finalSelection.window : 
                             this.currentSelection.window;
          params.canteenId = this.restaurants[restaurantIndex]._id;
          params.windowId = this.windows[windowIndex]._id;
        }
        
        // 调用随机推荐API
        const response = await mockRandomMeal(params);
        
        if (response && response.data && response.data.dish) {
          const randomDish = response.data.dish;
          
          // 根据当前步骤处理结果
          if (this.currentStep === 1 && randomDish.canteenId) {
            // 找到对应的餐厅索引
            const restaurantIndex = this.restaurants.findIndex(
              item => item._id === randomDish.canteenId._id
            );
            
            if (restaurantIndex !== -1) {
              // 设置最终选择
              this.finalSelection.restaurant = restaurantIndex;
              
              // 模拟老虎机动画
              this.simulateSlotAnimation('restaurant', restaurantIndex);
            } else {
              throw new Error('找不到匹配的餐厅');
            }
          } else if (this.currentStep === 2 && randomDish.windowId) {
            // 找到对应的窗口索引
            const windowIndex = this.windows.findIndex(
              item => item._id === randomDish.windowId._id
            );
            
            if (windowIndex !== -1) {
              // 设置最终选择
              this.finalSelection.window = windowIndex;
              
              // 模拟老虎机动画
              this.simulateSlotAnimation('window', windowIndex);
            } else {
              throw new Error('找不到匹配的窗口');
            }
          } else if (this.currentStep === 3 && randomDish._id) {
            // 对于第三步，我们可能需要先加载菜品数据
            if (this.dishes.length === 0 || this.dishes[0]._id === 'default-0') {
              // 使用模拟数据替代API调用
              this.dishes = [
                { _id: 'd1', name: '菜品1', image: '/static/images/dish1.jpg', price: 15 },
                { _id: 'd2', name: '菜品2', image: '/static/images/dish2.jpg', price: 20 },
                { _id: 'd3', name: '菜品3', image: '/static/images/dish3.jpg', price: 25 },
              ];
            }
            
            // 找到对应的菜品索引，或者随机选择一个
            let dishIndex = this.dishes.findIndex(
              item => item._id === randomDish._id
            );
            
            // 如果找不到匹配的菜品，随机选择一个
            if (dishIndex === -1) {
              dishIndex = Math.floor(Math.random() * this.dishes.length);
            }
            
            // 设置最终选择
            this.finalSelection.dish = dishIndex;
            
            // 模拟老虎机动画
            this.simulateSlotAnimation('dish', dishIndex);
          }
        } else {
          throw new Error('随机推荐返回数据格式不正确');
        }
      } catch (error) {
        console.error('随机推荐失败:', error);
        
        // 出错时，随机选择一个结果
        const type = this.currentStep === 1 ? 'restaurant' : 
                    this.currentStep === 2 ? 'window' : 'dish';
        const items = this.currentStep === 1 ? this.restaurants : 
                     this.currentStep === 2 ? this.windows : this.dishes;
        
        // 随机选择一个索引
        const randomIndex = Math.floor(Math.random() * items.length);
        
        // 设置最终选择
        if (this.currentStep === 1) {
          this.finalSelection.restaurant = randomIndex;
        } else if (this.currentStep === 2) {
          this.finalSelection.window = randomIndex;
        } else {
          this.finalSelection.dish = randomIndex;
        }
        
        // 模拟老虎机动画
        this.simulateSlotAnimation(type, randomIndex);
      }
    },
    
    // 模拟老虎机动画
    simulateSlotAnimation(reelType, targetIndex) {
      // 参考原有startShake方法中的动画逻辑
      const itemHeight = 150; // 每个项目的高度
      const items = reelType === 'restaurant' ? this.restaurants : 
                   reelType === 'window' ? this.windows : this.dishes;
      
      // 计算当前位置对应的索引
      const currentPos = this.reelPositions[reelType];
      // 计算当前索引，确保是正确的循环索引值
      let currentIndex = Math.round((-currentPos - 450) / itemHeight);
      // 处理边界情况，确保索引在有效范围内
      while (currentIndex < 0) currentIndex += items.length;
      currentIndex = currentIndex % items.length;
      
      // 设置动画参数
      const speed = 20; // 初始速度
      const minSpeed = 0.2; // 最小速度
      const acceleration = 0.3; // 加速度
      const decayFactor = 0.98; // 减速因子
      
      // 计算目标位置
      // 确保目标位置在当前位置之下（需要向下滚动）
      let finalTargetIndex = targetIndex;
      if (finalTargetIndex <= currentIndex) {
        finalTargetIndex += items.length;
      }
      
      // 额外旋转3-5圈
      const extraRotations = 3 + Math.floor(Math.random() * 3);
      finalTargetIndex += extraRotations * items.length;
      
      // 计算目标位置
      const targetPosition = -(finalTargetIndex * itemHeight) - 450;
      
      // 使用requestAnimationFrame实现平滑动画
      let currentSpeed = speed;
      let currentPosition = currentPos;
      let lastTimestamp = null;
      
      const animate = (timestamp) => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }
        
        // 计算时间差
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // 更新位置
        currentPosition -= currentSpeed * deltaTime / 16; // 标准化为60fps
        
        // 应用位置，同时确保位置值在合理范围内
        // 计算总高度（一圈的高度）
        const totalHeight = items.length * itemHeight;
        
        // 应用位置前进行规范化，确保循环正确
        let normalizedPosition = currentPosition;
        
        // 如果位置超出了一个完整的循环，进行调整
        const offset = normalizedPosition % totalHeight;
        if (offset > 0) {
          // 如果是正数，减去一个完整循环使其变为负数
          normalizedPosition = offset - totalHeight;
        } else if (offset === 0) {
          // 如果恰好是0，设置为-totalHeight确保正确循环
          normalizedPosition = -totalHeight;
        } else {
          // 如果是负数，保持原值
          normalizedPosition = offset;
        }
        
        // 应用规范化后的位置
        this.reelPositions[reelType] = normalizedPosition;
        
        // 计算与目标的距离
        const distance = Math.abs(targetPosition - currentPosition);
        
        // 根据距离调整速度
        if (distance > itemHeight * items.length * 2) {
          // 远距离：加速
          currentSpeed = Math.min(currentSpeed + acceleration, speed * 1.5);
        } else if (distance > itemHeight * items.length) {
          // 中距离：匀速
          currentSpeed = speed;
        } else {
          // 近距离：减速
          currentSpeed *= decayFactor;
        }
        
        // 继续动画或结束
        if (currentSpeed > minSpeed && distance > 5) {
          requestAnimationFrame(animate);
        } else {
          // 当距离很小且速度很慢时，直接设置到最终位置
          const finalPosition = -(targetIndex * itemHeight) - 450;
          this.reelPositions[reelType] = finalPosition;
          
          // 更新选择和状态
          this.currentSelection[reelType] = targetIndex;
          
          // 播放结果音效
          this.playSound('result');
          
          // 等待一段时间后显示结果
          setTimeout(() => {
            this.isShaking = false;
            
            // 如果是最后一步，显示结果
            if (this.currentStep === 3) {
              this.showResult();
            } else {
              // 显示确认模态框
              this.showConfirmationModal(items[targetIndex]);
            }
          }, 300);
        }
      };
      
      // 开始动画
      requestAnimationFrame(animate);
    },
    
    // 显示确认弹窗
    showConfirmationModal(item) {
      this.modalTitle = this.currentStep === 1 ? '选择的餐厅' : this.currentStep === 2 ? '选择的窗口' : '选择的菜品';
      
      // 确保使用正确的项目
      if (!item) {
        const reelType = this.currentReelType;
        const items = this.currentReelData;
        const selectedIndex = this.currentSelection[reelType];
        item = items[selectedIndex];
        console.log(`使用索引 ${selectedIndex} 获取 ${reelType} 项目`);
      }
      
      this.selectedItem = item;
      this.showModal = true;
    },
    
    confirmSelection() {
      this.showModal = false;
      
      // 保存当前选择
      if (this.currentStep === 1) {
        this.finalSelection.restaurant = this.currentSelection.restaurant;
        console.log(`确认餐厅选择: ${this.finalSelection.restaurant}`);
      } else if (this.currentStep === 2) {
        this.finalSelection.window = this.currentSelection.window;
        console.log(`确认窗口选择: ${this.finalSelection.window}`);
      } else if (this.currentStep === 3) {
        this.finalSelection.dish = this.currentSelection.dish;
        console.log(`确认菜品选择: ${this.finalSelection.dish}`);
      }
      
      // 进入下一步
      this.currentStep++;
    },
    
    cancelSelection() {
      this.showModal = false;
      
      // 获取当前类型
      const type = this.currentStep === 1 ? 'restaurant' : this.currentStep === 2 ? 'window' : 'dish';
      console.log(`取消选择，重置 ${type} 位置`);
      
      // 重新摇动当前轮盘
      this.resetReelPosition(type);
    },
    
    showResult() {
      // 构建最终结果
      // 确保使用正确的索引
      const restaurantIndex = this.finalSelection.restaurant !== null ? this.finalSelection.restaurant : this.currentSelection.restaurant;
      const windowIndex = this.finalSelection.window !== null ? this.finalSelection.window : this.currentSelection.window;
      const dishIndex = this.finalSelection.dish !== null ? this.finalSelection.dish : this.currentSelection.dish;
      
      console.log(`最终选择: 餐厅=${restaurantIndex}, 窗口=${windowIndex}, 菜品=${dishIndex}`);
      
      const restaurant = this.restaurants[restaurantIndex];
      const window = this.windows[windowIndex];
      const dish = this.dishes[dishIndex];
      
      // 显示最终结果
      this.modalTitle = '今天吃这个！';
      this.selectedItem = {
        restaurant: restaurant.name,
        window: window.name,
        dish: dish.name,
        price: dish.price,
        image: dish.image
      };
      this.showModal = true;
      
      // 播放成功音效
      this.playSound('success');
    },
    
    // 重新开始
    restart() {
      // 播放点击音效
      this.playSound('click');
      
      // 重置所有状态
      this.initData();
    },
    
    // 判断项目是否高亮
    isHighlighted(index, type) {
      if (this.isShaking) return false;
      
      // 使用currentSelection来确定当前选中的项目
      return this.currentSelection[type] === index;
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      console.error('图片加载失败，使用默认图片替代');
      event.target.src = '/static/images/default.jpg';
      
      // 强制更新视图
      try {
        this.$forceUpdate();
      } catch (e) {
        console.warn('强制更新失败', e);
      }
    },
    
    // 重置轮盘位置
    resetReelPosition(type) {
      // 获取对应的数据数组
      const items = type === 'restaurant' ? this.restaurants : type === 'window' ? this.windows : this.dishes;
      
      if (!items || items.length === 0) return;
      
      // 直接将位置设置为初始状态，确保正确显示第一个元素在中间位置
      const itemHeight = 150;
      const initialPosition = -450; // 这个值确保第一个元素位于中间位置
      
      console.log(`重置 ${type} 位置到 ${initialPosition}`);
      
      // 直接设置位置，不使用动画
      this.reelPositions[type] = initialPosition;
      this.currentSelection[type] = 0;
      this.finalSelection[type] = null;
    },
    
    // 调试方法：计算当前位置对应的索引
    debugPositionToIndex() {
      const itemHeight = 150;
      
      // 计算每个类型的当前索引
      const restaurantIndex = Math.round((-this.reelPositions.restaurant - 450) / itemHeight) % this.restaurants.length;
      const windowIndex = Math.round((-this.reelPositions.window - 450) / itemHeight) % this.windows.length;
      const dishIndex = Math.round((-this.reelPositions.dish - 450) / itemHeight) % this.dishes.length;
      
      console.log('调试 - 位置对应的索引:');
      console.log(`餐厅: 位置=${this.reelPositions.restaurant}, 索引=${restaurantIndex}, 当前选择=${this.currentSelection.restaurant}`);
      console.log(`窗口: 位置=${this.reelPositions.window}, 索引=${windowIndex}, 当前选择=${this.currentSelection.window}`);
      console.log(`菜品: 位置=${this.reelPositions.dish}, 索引=${dishIndex}, 当前选择=${this.currentSelection.dish}`);
      
      // 验证位置是否正确
      if (restaurantIndex !== this.currentSelection.restaurant) {
        console.warn('餐厅位置与选择不匹配！');
      }
      if (windowIndex !== this.currentSelection.window) {
        console.warn('窗口位置与选择不匹配！');
      }
      if (dishIndex !== this.currentSelection.dish) {
        console.warn('菜品位置与选择不匹配！');
      }
    }
  }
}
</script>

<style lang="scss">
.dining-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 150rpx;
  box-sizing: border-box;
  
  /* 加载状态 */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    text {
      font-size: 32rpx;
      color: #34c759;
      font-weight: bold;
    }
  }
  
  /* 空状态 */
  .empty-state {
    padding: 100rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 28rpx;
      color: #ffffff;
    }
  }
  
  /* 头部样式 */
  .header {
    padding: 40rpx 30rpx;
    background: linear-gradient(135deg, #34c759, #2fb750);
    color: #fff;
    text-align: center;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -30rpx;
      left: 0;
      right: 0;
      height: 60rpx;
      background-color: #f8f9fa;
      border-radius: 50% 50% 0 0;
    }
    
    .title {
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .subtitle {
      font-size: 28rpx;
      opacity: 0.8;
      display: block;
    }
  }
  
  /* 老虎机区域 */
  .slot-machine {
    margin: 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    padding: 30rpx;
    transition: all 0.3s ease;
    animation: fadeIn 0.5s ease;
    
    /* 步骤指示器 */
    .steps {
      display: flex;
      justify-content: space-between;
      margin: 20rpx 40rpx 30rpx;
      
      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
        
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 20rpx;
          right: -50%;
          width: 100%;
          height: 2rpx;
          background-color: #dee2e6;
          z-index: 1;
        }
        
        .step-number {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background-color: #dee2e6;
          color: #6c757d;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        
        .step-name {
          font-size: 24rpx;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        
        &.active {
          .step-number {
            background-color: #34c759;
            color: #fff;
          }
          
          .step-name {
            color: #34c759;
            font-weight: bold;
          }
        }
        
        &.completed {
          &::after {
            background-color: #34c759;
          }
        }
      }
    }
    
    .slot-machine-container {
      background-color: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      margin: 0 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }
    
    /* 老虎机滚轮 */
    .slot-reels {
      position: relative;
      width: 100%;
      height: 450rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2rpx;
        background-color: rgba(52, 199, 89, 0.5);
        z-index: 2;
        box-shadow: 0 0 5rpx rgba(52, 199, 89, 0.5);
      }
      
      .slot-reel {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 10rpx;
        background-color: #ffffff;
        box-shadow: inset 0 0 10rpx rgba(0, 0, 0, 0.1);
        
        .reel-mask {
          position: absolute;
          left: 0;
          right: 0;
          height: 150rpx;
          z-index: 3;
          pointer-events: none;
          
          &.top {
            top: 0;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
          }
          
          &.bottom {
            bottom: 0;
            background: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
          }
        }
        
        .reel-items {
          /* 移除transition属性，使用requestAnimationFrame控制动画 */
          will-change: transform; /* 提示浏览器该元素会频繁变化，优化性能 */
          display: flex;
          flex-direction: column;
          transition: transform 0.1s ease; /* 添加一个小的过渡效果，使滚动更平滑 */
        }
        
        .reel-item {
          height: 150rpx;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 10rpx;
          transition: all 0.3s ease;
          box-sizing: border-box;
          
          &.highlighted {
            background-color: rgba(52, 199, 89, 0.1);
            transform: scale(1.05);
            
            .item-image {
              transform: scale(1.1);
              box-shadow: 0 4rpx 15rpx rgba(52, 199, 89, 0.4);
              border: 2rpx solid #34c759;
            }
            
            .item-name {
              color: #34c759;
              font-weight: bold;
            }
            
            .item-price {
              font-weight: bold;
              transform: scale(1.1);
            }
          }
          
          .item-image {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 10rpx;
            border: 2rpx solid #dee2e6;
            transition: all 0.3s ease;
            box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
          }
          
          .item-name {
            font-size: 24rpx;
            color: #495057;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            transition: all 0.3s ease;
          }
          
          .item-price {
            font-size: 22rpx;
            color: #dc3545;
            margin-top: 4rpx;
            transition: all 0.3s ease;
          }
        }
        
        .selection-indicator {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 150rpx;
          transform: translateY(-50%);
          background-color: rgba(52, 199, 89, 0.05);
          border-top: 2rpx solid rgba(52, 199, 89, 0.3);
          border-bottom: 2rpx solid rgba(52, 199, 89, 0.3);
          z-index: 1;
          pointer-events: none;
        }
      }
    }
    
    /* 操作区域 */
    .slot-controls {
      margin-top: 40rpx;
      display: flex;
      justify-content: center;
      
      .shake-button {
        background: linear-gradient(135deg, #34c759, #2fb750);
        color: #fff;
        font-size: 32rpx;
        font-weight: bold;
        border-radius: 50rpx;
        padding: 20rpx 60rpx;
        border: none;
        box-shadow: 0 4rpx 10rpx rgba(52, 199, 89, 0.3);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        &:active {
          transform: scale(0.95);
          
          &::after {
            opacity: 1;
          }
        }
        
        &:disabled {
          background: linear-gradient(135deg, #adb5bd, #868e96);
          box-shadow: none;
        }
      }
    }
  }
  
  /* 结果展示区域 */
  .result-display {
    margin: 30rpx;
    animation: fadeIn 0.5s ease;
    
    .result-card {
      background-color: #fff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.1);
      animation: scaleIn 0.3s ease;
      
      .result-image {
        width: 100%;
        height: 400rpx;
        object-fit: cover;
        border-top-left-radius: 20rpx;
        border-top-right-radius: 20rpx;
      }
      
      .result-info {
        padding: 30rpx;
        
        .result-title {
          font-size: 36rpx;
          font-weight: bold;
          color: #212529;
          margin-bottom: 20rpx;
          text-align: center;
          animation: fadeInUp 0.5s ease 0.1s both;
        }
        
        .result-restaurant {
          font-size: 28rpx;
          color: #6c757d;
          margin-bottom: 10rpx;
          display: block;
          animation: fadeInUp 0.5s ease 0.2s both;
        }
        
        .result-window {
          font-size: 28rpx;
          color: #6c757d;
          margin-bottom: 10rpx;
          display: block;
          animation: fadeInUp 0.5s ease 0.3s both;
        }
        
        .result-name {
          font-size: 40rpx;
          font-weight: bold;
          color: #212529;
          margin-bottom: 10rpx;
          display: block;
          animation: fadeInUp 0.5s ease 0.4s both;
        }
        
        .result-price {
          font-size: 36rpx;
          color: #f03e3e;
          font-weight: bold;
          animation: fadeInUp 0.5s ease 0.5s both;
        }
      }
      
      .restart-button {
        background-color: #34c759;
        color: #fff;
        border: none;
        width: 90%;
        margin: 0 auto 30rpx;
        padding: 20rpx 0;
        border-radius: 50rpx;
        font-size: 32rpx;
        font-weight: bold;
        transition: all 0.3s ease;
        animation: fadeInUp 0.5s ease 0.6s both;
        
        &:active {
          transform: scale(0.95);
          background-color: #2fb750;
        }
      }
    }
  }
  
  /* 结果模态框 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.3s ease;
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
      width: 80%;
      background-color: #fff;
      border-radius: 20rpx;
      padding: 30rpx;
      animation: scaleIn 0.3s ease;
      box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.3);
      
      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #212529;
        margin-bottom: 20rpx;
        text-align: center;
        display: block;
        animation: fadeInDown 0.3s ease;
      }
      
      .modal-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        object-fit: cover;
        margin: 0 auto 20rpx;
        display: block;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
        animation: bounce 0.5s ease;
      }
      
      .modal-name {
        font-size: 32rpx;
        color: #495057;
        text-align: center;
        margin-bottom: 30rpx;
        display: block;
        animation: fadeInUp 0.3s ease;
      }
      
      .modal-details {
        margin-bottom: 20rpx;
        
        .detail-item {
          display: block;
          margin-bottom: 10rpx;
          font-size: 28rpx;
          color: #6c757d;
        }
      }
      
      .modal-actions {
        display: flex;
        justify-content: space-between;
        animation: fadeInUp 0.3s ease 0.1s both;
        
        button {
          flex: 1;
          margin: 0 10rpx;
          padding: 20rpx 0;
          border-radius: 50rpx;
          font-size: 28rpx;
          font-weight: bold;
          border: none;
          transition: all 0.3s ease;
          
          &:active {
            transform: scale(0.95);
          }
        }
        
        .dislike-button {
          background-color: #f1f3f5;
          color: #495057;
          
          &:active {
            background-color: #e9ecef;
          }
        }
        
        .like-button {
          background-color: #34c759;
          color: #fff;
          
          &:active {
            background-color: #2fb750;
          }
        }
        
        .restart-button {
          background-color: #34c759;
          color: #fff;
          
          &:active {
            background-color: #2fb750;
          }
        }
      }
    }
  }
}

/* 动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 