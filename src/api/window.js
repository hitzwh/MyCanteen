/**
 * 窗口相关API
 */
import request from '../utils/request';

/**
 * 获取所有窗口
 * @param {Object} params 查询参数
 * @param {String} params.canteenId 食堂ID(可选)
 * @param {String} params.floorId 楼层ID(可选)
 * @param {String} params.tags 标签(可选)
 */
export function getAllWindows(params) {
  return request.get('/window', params);
}

/**
 * 获取窗口详情
 * @param {String} id 窗口ID
 */
export function getWindowDetail(id) {
  return request.get(`/window/${id}`);
}

/**
 * 获取食堂下所有窗口
 * @param {String} canteenId 食堂ID
 */
export function getWindowsByCanteen(canteenId) {
  return request.get(`/window/canteen/${canteenId}`);
}

/**
 * 添加窗口 (职工权限)
 * @param {Object} data 窗口信息
 * @param {String} data.name 窗口名称
 * @param {String} data.description 窗口描述
 * @param {String} data.image 窗口图片URL
 * @param {String} data.canteenId 所属食堂ID
 * @param {String} data.floorId 所在楼层ID
 * @param {Array} data.tags 标签
 */
export function addWindow(data) {
  return request.post('/window', data);
}

/**
 * 更新窗口信息 (职工权限)
 * @param {String} id 窗口ID
 * @param {Object} data 窗口信息
 * @param {String} data.name 窗口名称
 * @param {String} data.description 窗口描述
 * @param {String} data.image 窗口图片URL
 * @param {String} data.canteenId 所属食堂ID
 * @param {String} data.floorId 所在楼层ID
 * @param {Array} data.tags 标签
 */
export function updateWindow(id, data) {
  return request.put(`/window/${id}`, data);
}

/**
 * 删除窗口 (职工权限)
 * @param {String} id 窗口ID
 */
export function deleteWindow(id) {
  return request.del(`/window/${id}`);
} 