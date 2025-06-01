<template>
	<view class="login-container">
		<!-- Logo部分 -->
		<view class="logo-container">
			<view class="logo">
				<text class="logo-icon">C</text>
			</view>
		</view>
		
		<!-- 欢迎文本 -->
		<view class="welcome-text">
			<text class="title">欢迎登录</text>
			<text class="subtitle">请选择登录端口并输入账号信息</text>
		</view>
		
		<!-- 用户类型选择 -->
		<view class="user-type-tabs">
			<view 
				class="tab-item" 
				:class="{ 'active': userType === 'student' }" 
				@click="setUserType('student')"
			>
				用户端
			</view>
			<view 
				class="tab-item" 
				:class="{ 'active': userType === 'staff' }" 
				@click="setUserType('staff')"
			>
				职工端
			</view>
		</view>
		
		<!-- 表单部分 -->
		<view class="form-container">
			<view class="input-group">
				<text class="label">账号</text>
				<view class="input-wrapper">
					<input 
						type="text" 
						v-model="username" 
						placeholder="请输入您的账号"
						@focus="handleFocus('username')"
						@blur="handleBlur('username')"
					/>
					<text class="input-icon iconfont icon-user-3-line"></text>
				</view>
			</view>
			
			<view class="input-group">
				<text class="label">密码</text>
				<view class="input-wrapper">
					<input 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入您的密码"
						@focus="handleFocus('password')"
						@blur="handleBlur('password')"
					/>
					<text 
						class="input-icon iconfont" 
						:class="showPassword ? 'icon-eye-line' : 'icon-eye-close-line'" 
						@click="togglePasswordVisibility"
					></text>
				</view>
			</view>
			
			<!-- 忘记密码 -->
			<view class="forgot-password">
				<text @click="forgotPassword">忘记密码?</text>
			</view>
			
			<!-- 登录按钮 -->
			<button class="login-button" @click="login">登 录</button>
			
			<!-- 注册选项 -->
			<view class="signup-options">
				<text class="signup-text">还没有账号?</text>
				<text class="signup-link" @click="goToRegister">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { login as loginUserApi } from '../../api/user';
import { login as loginWorkerApi } from '../../api/worker';

// 响应式数据
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const focusedField = ref('');
const userType = ref('student'); // 默认为学生用户

// 设置用户类型
const setUserType = (type) => {
	userType.value = type;
};

// 处理输入框聚焦
const handleFocus = (field) => {
	focusedField.value = field;
};

// 处理输入框失焦
const handleBlur = (field) => {
	if (focusedField.value === field) {
		focusedField.value = '';
	}
};

// 切换密码可见性
const togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
};

// 登录方法
const login = () => {
	if (!username.value || !password.value) {
		uni.showToast({
			title: '请输入账号和密码',
			icon: 'none'
		});
		return;
	}
	
	// 显示登录中提示
	uni.showLoading({
		title: '登录中...'
	});
	
	// 构建登录数据
	const loginData = {
		username: username.value,
		password: password.value
	};
	
	// 打印请求数据，便于调试
	console.log('登录请求数据:', {
		...loginData,
		userType: userType.value
	});
	
	// 根据用户类型选择不同的登录API
	const loginApi = userType.value === 'staff' ? loginWorkerApi : loginUserApi;
	
	// 调用登录API
	loginApi(loginData).then(res => {
		// 登录成功
		uni.hideLoading();
		
		// 存储token和用户信息
		uni.setStorageSync('token', res.data.token);
		uni.setStorageSync('userInfo', res.data.userInfo);
		uni.setStorageSync('userType', userType.value); // 保存用户类型
		
		uni.showToast({
			title: '登录成功',
			icon: 'success',
			duration: 1500,
			success: () => {
				// 登录成功后跳转到首页
				setTimeout(() => {
					if (userType.value === 'staff') {
						uni.reLaunch({
							url: '/pages/workerindex/index'
						});
					} else {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}
				}, 1500);
			}
		});
	}).catch(err => {
		// 登录失败
		console.error('登录失败:', err);
		uni.hideLoading();
		
		// 根据错误类型显示不同的错误信息
		let errorMsg = '登录失败，请稍后再试';
		
		// 处理HTTP状态码错误
		if (err.statusCode) {
			switch (err.statusCode) {
				case 401:
					errorMsg = '账号或密码错误';
					break;
				case 500:
					errorMsg = '服务器内部错误，请稍后再试';
					break;
				default:
					errorMsg = err.message || '登录失败，请稍后再试';
			}
		} 
		// 处理业务错误码
		else if (err.code) {
			switch (err.code) {
				case 2001:
					errorMsg = '用户不存在，请先注册';
					break;
				case 2002:
					errorMsg = '密码错误，请重新输入';
					break;
				default:
					errorMsg = err.message || '登录失败，请稍后再试';
			}
		}
		
		uni.showToast({
			title: errorMsg,
			icon: 'none',
			duration: 2000
		});
	});
};

// 忘记密码
const forgotPassword = () => {
	uni.showToast({
		title: '忘记密码功能将在后续版本中推出',
		icon: 'none'
	});
};

// 前往注册页面
const goToRegister = () => {
	uni.navigateTo({
		url: '/pages/login/register?userType=' + userType.value // 传递用户类型
	});
};
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	padding: 40rpx 60rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9f7e9 100%);
	display: flex;
	flex-direction: column;
}

.logo-container {
	display: flex;
	justify-content: center;
	margin-top: 120rpx;
	margin-bottom: 80rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	background: linear-gradient(135deg, #34c759 0%, #2a9d4a 100%);
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 16rpx 32rpx rgba(52, 199, 89, 0.3);
}

.logo-icon {
	color: white;
	font-size: 80rpx;
	font-weight: bold;
}

.welcome-text {
	text-align: center;
	margin-bottom: 40rpx;
}

.title {
	font-size: 48rpx;
	color: #333;
	margin-bottom: 16rpx;
	font-weight: 600;
	display: block;
}

.subtitle {
	font-size: 28rpx;
	color: #666;
	display: block;
}

/* 用户类型选择样式 */
.user-type-tabs {
	display: flex;
	background-color: rgba(255, 255, 255, 0.5);
	border-radius: 24rpx;
	margin-bottom: 40rpx;
	padding: 6rpx;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 30rpx;
	color: #666;
	border-radius: 20rpx;
	transition: all 0.3s;
}

.tab-item.active {
	background-color: #fff;
	color: #34c759;
	font-weight: 600;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-container {
	width: 100%;
}

.input-group {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #555;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

input {
	width: 100%;
	height: 100rpx;
	padding: 0 80rpx 0 30rpx; /* 右侧留出图标空间 */
	border: 2rpx solid #ddd;
	border-radius: 24rpx;
	font-size: 30rpx;
	background-color: white;
	transition: all 0.3s;
}

input:focus {
	border-color: #34c759;
	box-shadow: 0 0 0 6rpx rgba(52, 199, 89, 0.2);
}

.input-icon {
	position: absolute;
	right: 30rpx;
	font-size: 36rpx;
	color: #999;
	z-index: 2;
}

.forgot-password {
	text-align: right;
	margin-bottom: 60rpx;
}

.forgot-password text {
	color: #34c759;
	font-size: 28rpx;
}

.login-button {
	background: linear-gradient(135deg, #34c759 0%, #2a9d4a 100%);
	color: white;
	border: none;
	border-radius: 24rpx;
	padding: 32rpx;
	font-size: 32rpx;
	font-weight: 600;
	width: 100%;
	margin-bottom: 60rpx;
	box-shadow: 0 16rpx 32rpx rgba(52, 199, 89, 0.3);
}

.login-button:active {
	transform: translateY(2rpx);
	box-shadow: 0 10rpx 20rpx rgba(52, 199, 89, 0.3);
}

.signup-options {
	text-align: center;
	margin-top: 20rpx;
}

.signup-text {
	font-size: 28rpx;
	color: #666;
}

.signup-link {
	color: #34c759;
	font-size: 28rpx;
	font-weight: 600;
	margin-left: 10rpx;
}
</style> 