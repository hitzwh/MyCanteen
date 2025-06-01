<template>
	<view class="register-container">
		<!-- 返回按钮 -->
		<view class="back-button" @click="goBack">
			<text class="iconfont icon-reply-fill"></text>
		</view>
		
		<!-- Logo部分 -->
		<view class="logo-container">
			<view class="logo">
				<text class="logo-icon">C</text>
			</view>
		</view>
		
		<!-- 欢迎文本 -->
		<view class="welcome-text">
			<text class="title">创建账号</text>
			<text class="subtitle">请选择账号类型并填写信息</text>
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
				<!-- 添加密码长度提示 -->
				<text class="password-tip" :class="{ 'error': password.length > 0 && password.length < 6 }">
					密码长度不能少于6位
				</text>
			</view>
			
			<view class="input-group">
				<text class="label">确认密码</text>
				<view class="input-wrapper">
					<input 
						:type="showConfirmPassword ? 'text' : 'password'" 
						v-model="confirmPassword" 
						placeholder="请再次输入您的密码"
						@focus="handleFocus('confirmPassword')"
						@blur="handleBlur('confirmPassword')"
					/>
					<text 
						class="input-icon iconfont" 
						:class="showConfirmPassword ? 'icon-eye-line' : 'icon-eye-close-line'" 
						@click="toggleConfirmPasswordVisibility"
					></text>
				</view>
				<!-- 添加密码匹配提示 -->
				<text class="password-tip" :class="{ 'error': confirmPassword.length > 0 && password !== confirmPassword }">
					两次输入的密码必须一致
				</text>
			</view>
			
			<!-- 注册按钮 -->
			<button class="register-button" @click="register">注 册</button>
			
			<!-- 登录选项 -->
			<view class="login-options">
				<text class="login-text">已有账号?</text>
				<text class="login-link" @click="goToLogin">立即登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { register as registerUserApi } from '../../api/user';
import { register as registerWorkerApi } from '../../api/worker';

// 响应式数据
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const focusedField = ref('');
const userType = ref('student'); // 默认为学生用户

// 在页面加载时获取传递过来的用户类型
onMounted(() => {
	const query = uni.getLaunchOptionsSync().query || {};
	if (query.userType) {
		userType.value = query.userType;
	}
});

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

// 切换确认密码可见性
const toggleConfirmPasswordVisibility = () => {
	showConfirmPassword.value = !showConfirmPassword.value;
};

// 注册方法
const register = () => {
	if (!username.value || !password.value || !confirmPassword.value) {
		uni.showToast({
			title: '请填写完整注册信息',
			icon: 'none'
		});
		return;
	}
	
	// 添加密码长度验证
	if (password.value.length < 6) {
		uni.showToast({
			title: '密码长度不能少于6位',
			icon: 'none',
			duration: 2000
		});
		return;
	}
	
	if (password.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		});
		return;
	}
	
	// 显示注册中提示
	uni.showLoading({
		title: '注册中...'
	});
	
	// 构建注册数据
	const registerData = {
		username: username.value,
		password: password.value,
		confirmPassword: confirmPassword.value
	};
	
	// 打印请求数据，便于调试
	console.log('注册请求数据:', {
		...registerData,
		userType: userType.value
	});
	
	// 根据用户类型选择不同的注册API
	const registerApi = userType.value === 'staff' ? registerWorkerApi : registerUserApi;
	
	// 调用注册API
	registerApi(registerData).then(res => {
		// 注册成功
		console.log('注册成功响应:', res);
		uni.hideLoading();
		
		// 存储token和用户信息
		uni.setStorageSync('token', res.data.token);
		uni.setStorageSync('userInfo', res.data.userInfo);
		uni.setStorageSync('userType', userType.value); // 保存用户类型
		
		uni.showToast({
			title: '注册成功',
			icon: 'success',
			duration: 1500,
			success: () => {
				// 注册成功后跳转到首页
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
		// 注册失败
		console.error('注册失败:', err);
		uni.hideLoading();
		
		// 显示更详细的错误信息
		let errorMsg = '注册失败，请稍后再试';
		
		// 处理HTTP状态码错误
		if (err.statusCode) {
			switch (err.statusCode) {
				case 400:
					errorMsg = '请求参数错误，请检查注册信息';
					break;
				case 500:
					errorMsg = '服务器内部错误，请稍后再试';
					
					// 显示模态框提供更详细的信息
					uni.showModal({
						title: '注册失败',
						content: '服务器出现内部错误(500)，这可能是由于数据库连接问题导致的。请联系系统管理员解决此问题。',
						showCancel: false,
						confirmText: '我知道了'
					});
					return; // 已经显示了模态框，不再显示toast
				default:
					errorMsg = err.message || '注册失败，请稍后再试';
			}
		} 
		// 处理业务错误码
		else if (err.code) {
			switch (err.code) {
				case 1001:
					errorMsg = '参数错误，请检查注册信息';
					break;
				case 2003:
					errorMsg = '用户名已存在，请更换用户名';
					break;
				default:
					errorMsg = err.message || '注册失败，请稍后再试';
			}
		}
		
		// 显示toast提示
		uni.showToast({
			title: errorMsg,
			icon: 'none',
			duration: 2000
		});
	});
};

// 返回上一页
const goBack = () => {
	uni.navigateTo('/pages/login/login');
};

// 前往登录页面
const goToLogin = () => {
	uni.navigateTo('/pages/login/login');
};
</script>

<style lang="scss">
.register-container {
	min-height: 100vh;
	padding: 40rpx 60rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9f7e9 100%);
	display: flex;
	flex-direction: column;
	position: relative;
}

.back-button {
	position: absolute;
	top: 60rpx;
	left: 40rpx;
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.iconfont{
	font-size: 40rpx;
	color: #333;
}

.logo-container {
	display: flex;
	justify-content: center;
	margin-top: 120rpx;
	margin-bottom: 60rpx;
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

/* 添加密码提示样式 */
.password-tip {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
	padding-left: 10rpx;
}

.password-tip.error {
	color: #ff3b30;
}

.register-button {
	background: linear-gradient(135deg, #34c759 0%, #2a9d4a 100%);
	color: white;
	border: none;
	border-radius: 24rpx;
	padding: 32rpx;
	font-size: 32rpx;
	font-weight: 600;
	width: 100%;
	margin-top: 20rpx;
	margin-bottom: 60rpx;
	box-shadow: 0 16rpx 32rpx rgba(52, 199, 89, 0.3);
}

.register-button:active {
	transform: translateY(2rpx);
	box-shadow: 0 10rpx 20rpx rgba(52, 199, 89, 0.3);
}

.login-options {
	text-align: center;
	margin-top: 20rpx;
}

.login-text {
	font-size: 28rpx;
	color: #666;
}

.login-link {
	color: #34c759;
	font-size: 28rpx;
	font-weight: 600;
	margin-left: 10rpx;
}
</style> 