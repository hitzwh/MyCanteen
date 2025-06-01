/**
 * 职工相关API
 */
import request from '../utils/request';

/**
 * 职工注册
 * @param {Object} data 注册信息
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 * @param {String} data.confirmPassword 确认密码
 * @param {String} data.staffId 工号（可选）
 * @param {String} data.phone 电话（可选）
 * @param {String} data.canteenId 食堂ID（可选）
 */
export function register(data) {
  // 构造请求数据
  const requestData = {
    username: data.username,
    password: data.password,
    confirmPassword: data.confirmPassword,
    staffId: data.staffId,
    phone: data.phone,
    canteenId: data.canteenId
  };
  
  console.log('职工注册请求数据:', requestData);
  
  return request.post('/worker/register', requestData);
}

/**
 * 职工登录
 * @param {Object} data 登录信息
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 */
export function login(data) {
  return request.post('/worker/login', data);
}

/**
 * 获取职工信息
 */
export function getWorkerInfo() {
  return request.get('/worker/info');
}

/**
 * 修改职工信息
 * @param {Object} data 职工信息
 * @param {String} data.username 用户名
 * @param {String} data.avatar 头像URL
 * @param {String} data.phone 手机号
 */
export function updateWorkerInfo(data) {
  return request.put('/worker/info', data);
}

/**
 * 修改密码
 * @param {Object} data 密码信息
 * @param {String} data.oldPassword 旧密码
 * @param {String} data.newPassword 新密码
 * @param {String} data.confirmPassword 确认新密码
 */
export function changePassword(data) {
  return request.post('/worker/change-password', data);
}

/**
 * 职工退出登录
 */
export function logout() {
  return request.post('/worker/logout');
}

/**
 * 获取工作统计数据
 */
export function getStatistics() {
  return request.get('/worker/statistics');
}

/**
 * 职工上传单张图片
 * @param {String} filePath 文件路径
 * @param {String} type 图片类型(canteen/window/dish/other/avatar)
 * @returns {Promise} 上传结果
 */
export function uploadImage(filePath, type = 'other') {
  console.log('调用uploadImage函数，文件路径:', filePath, '类型:', type);
  return request.upload('/upload/image', filePath, 'file', { type });
}

/**
 * 职工批量上传图片
 * @param {Array} filePaths 文件路径数组
 * @param {String} type 图片类型(canteen/window/dish/other/avatar)
 * @returns {Promise} 上传结果数组
 */
export function uploadImages(filePaths, type = 'other') {
  const promises = filePaths.map(path => uploadImage(path, type));
  return Promise.all(promises);
}

/**
 * 发送系统消息
 * @param {Object} data 消息信息
 * @param {String} data.title 消息标题
 * @param {String} data.content 消息内容
 * @param {String} data.type 消息类型
 * @param {String|Array} data.targetUsers 目标用户
 * @param {String} data.relatedCanteen 相关食堂ID
 */
export function sendMessage(data) {
  return request.post('/worker/send-message', data);
}

/**
 * 获取已发送消息列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 * @param {String} params.type 消息类型
 */
export function getMessages(params) {
  return request.get('/worker/messages', params);
}

/**
 * 获取发送消息详情
 * @param {String} id 消息ID
 */
export function getMessage(id) {
  return request.get(`/worker/message/${id}`);
}

/**
 * 职工上传base64格式的图片
 * @param {String} base64Data base64格式的图片数据
 * @param {String} contentType 图片类型
 * @param {String} type 图片分类(canteen/window/dish/other/avatar)
 * @returns {Promise} 上传结果
 */
export function uploadBase64Image(base64Data, contentType, type = 'other') {
  return request.post('/upload/base64-image', {
    base64: base64Data,
    contentType,
    type
  });
} 