/**
 * 食堂相关API
 */
import request from '../utils/request';

/**
 * 获取所有食堂
 */
export function getAllCanteens() {
  return request.get('/canteen');
}

/**
 * 获取食堂详情
 * @param {String} id 食堂ID
 */
export function getCanteenDetail(id) {
  return request.get(`/canteen/${id}`);
}

/**
 * 根据楼层筛选窗口
 * @param {String} canteenId 食堂ID
 * @param {String} floorId 楼层ID
 */
export function getWindowsByFloor(canteenId, floorId) {
  return request.get(`/canteen/${canteenId}/windows/filter?floorId=${floorId}`);
}

/**
 * 添加食堂 (职工权限)
 * @param {Object} data 食堂信息
 * @param {String} data.name 食堂名称
 * @param {String} data.image 食堂图片URL
 * @param {String} data.description 食堂描述
 * @param {String} data.location 食堂位置
 * @param {String} data.openingHours 营业时间
 * @param {Array} data.floors 楼层信息
 */
export function addCanteen(data) {
  return request.post('/canteen', data);
}

/**
 * 更新食堂信息 (职工权限)
 * @param {String} id 食堂ID
 * @param {Object} data 食堂信息
 * @param {String} data.name 食堂名称
 * @param {String} data.image 食堂图片URL
 * @param {String} data.description 食堂描述
 * @param {String} data.location 食堂位置
 * @param {String} data.openingHours 营业时间
 * @param {Array} data.floors 楼层信息
 */
export function updateCanteen(id, data) {
  return request.put(`/canteen/${id}`, data);
}

/**
 * 删除食堂 (职工权限)
 * @param {String} id 食堂ID
 */
export function deleteCanteen(id) {
  return request.delete(`/canteen/${id}`);
} 