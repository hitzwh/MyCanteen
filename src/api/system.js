/**
 * 系统相关API
 */
import request from '../utils/request';

/**
 * 获取应用版本信息
 */
export function getVersionInfo() {
  return request.get('/system/version');
}

/**
 * 获取标签列表
 */
export function getTags() {
  return request.get('/system/tags');
}

/**
 * 上传图片
 * @param {String} filePath 文件路径
 * @param {String} type 图片类型(canteen/window/dish/other)
 * @returns {Promise} 返回上传结果
 */
export function uploadImage(filePath, type) {
  return request.upload('/upload/image', filePath, 'file', { type });
}

/**
 * 批量上传图片
 * @param {Array<String>} filePaths 文件路径数组
 * @param {String} type 图片类型(canteen/window/dish/other)
 * @returns {Promise} 返回上传结果
 */
export function uploadImages(filePaths, type) {
  const promises = filePaths.map(path => {
    return request.upload('/upload/images', path, 'files', { type });
  });
  return Promise.all(promises);
}

/**
 * "今天吃什么"随机推荐
 * @param {Object} params 查询参数
 * @param {String} params.canteenId 餐厅ID（可选）
 * @param {String} params.windowId 窗口ID（可选）
 * @param {String} params.tags 标签，多个标签用逗号分隔（可选）
 */
export function getRandomMeal(params) {
  return request.get('/system/random-meal', params);
} 