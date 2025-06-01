/**
 * 菜品相关API
 */
import request from '../utils/request';

/**
 * 获取所有菜品
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码(默认1)
 * @param {Number} params.pageSize 每页数量(默认10)
 * @param {String} params.canteenId 食堂ID(可选)
 * @param {String} params.windowId 窗口ID(可选)
 * @param {String} params.keyword 关键词(可选)
 * @param {String} params.tags 标签(可选)
 * @param {String} params.sortBy 排序字段(默认createdAt)
 * @param {String} params.sortOrder 排序方式(asc/desc，默认desc)
 */
export function getAllDishes(params) {
  return request.get('/dish', params);
}

/**
 * 获取菜品详情
 * @param {String} id 菜品ID
 */
export function getDishDetail(id) {
  return request.get(`/dish/${id}`);
}

/**
 * 获取窗口下所有菜品
 * @param {String} windowId 窗口ID
 */
export function getDishesByWindow(windowId) {
  return request.get(`/dish/window/${windowId}`);
}

/**
 * 随机推荐菜品
 */
export function getRecommendDish() {
  return request.get('/dish/recommend');
}

/**
 * 添加菜品 (职工权限)
 * @param {Object} data 菜品信息
 * @param {String} data.name 菜品名称
 * @param {String} data.description 菜品描述
 * @param {String} data.image 菜品图片URL
 * @param {Number} data.price 菜品价格
 * @param {String} data.windowId 所属窗口ID
 * @param {String} data.canteenId 所属食堂ID
 * @param {Array} data.tags 标签
 */
export function addDish(data) {
  return request.post('/dish', data);
}

/**
 * 更新菜品信息 (职工权限)
 * @param {String} id 菜品ID
 * @param {Object} data 菜品信息
 * @param {String} data.name 菜品名称
 * @param {String} data.description 菜品描述
 * @param {String} data.image 菜品图片URL
 * @param {Number} data.price 菜品价格
 * @param {String} data.windowId 所属窗口ID
 * @param {String} data.canteenId 所属食堂ID
 * @param {Array} data.tags 标签
 */
export function updateDish(id, data) {
  return request.put(`/dish/${id}`, data);
}

/**
 * 删除菜品 (职工权限)
 * @param {String} id 菜品ID
 */
export function deleteDish(id) {
  return request.del(`/dish/${id}`);
} 