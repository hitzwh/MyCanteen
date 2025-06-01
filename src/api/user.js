/**
 * 用户相关API
 */
import request from '../utils/request';

/**
 * 用户注册
 * @param {Object} data 注册信息
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 * @param {String} data.confirmPassword 确认密码
 */
export function register(data) {
  return request.post('/user/register', data);
}

/**
 * 用户登录
 * @param {Object} data 登录信息
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 */
export function login(data) {
  return request.post('/user/login', data);
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get('/user/info');
}

/**
 * 修改用户信息
 * @param {Object} data 用户信息
 * @param {String} data.username 用户名
 * @param {String} data.avatar 头像URL
 * @param {String} data.description 简介
 */
export function updateUserInfo(data) {
  return request.put('/user/info', data);
}

/**
 * 修改密码
 * @param {Object} data 密码信息
 * @param {String} data.oldPassword 旧密码
 * @param {String} data.newPassword 新密码
 * @param {String} data.confirmPassword 确认新密码
 */
export function changePassword(data) {
  return request.post('/user/change-password', data);
}

/**
 * 用户退出登录
 */
export function logout() {
  return request.post('/user/logout');
}

/**
 * 获取用户收藏列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 */
export function getFavorites(params) {
  return request.get('/user/favorites', params);
}

/**
 * 添加/取消收藏
 * @param {Object} data 收藏信息
 * @param {String} data.dishId 菜品ID
 * @param {String} data.action 操作，add或remove
 */
export function toggleFavorite(data) {
  return request.post('/user/favorites', data);
}

/**
 * 获取浏览历史
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 */
export function getHistory(params) {
  return request.get('/user/history', params);
}

/**
 * 记录浏览历史
 * @param {Object} data 历史记录
 * @param {String} data.dishId 菜品ID
 */
export function recordHistory(data) {
  return request.post('/user/history', data);
}

/**
 * 用户上传图片
 * @param {String} filePath 文件路径
 * @returns {Promise} 上传结果
 */
export function uploadUserImage(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${request.BASE_URL}/system/upload`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (res) => {
        try {
          // 上传接口返回的是字符串，需要手动转换
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data);
          } else {
            reject(data);
          }
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 上传单张图片
 * @param {File} file 文件对象
 * @param {String} type 图片类型(canteen/window/dish/other/avatar)
 */
export function uploadImage(file, type) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  return request.post('/upload/image', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 批量上传图片
 * @param {Array} files 文件对象数组
 * @param {String} type 图片类型(canteen/window/dish/other/avatar)
 */
export function uploadImages(files, type) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('type', type);
  
  return request.post('/upload/images', formData, {
    header: {
      'Content-Type': 'multipart/form-data'
    }
  });
} 