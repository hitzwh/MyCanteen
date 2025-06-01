/**
 * 评论相关API
 */
import request from '../utils/request';

/**
 * 获取所有评价
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码(默认1)
 * @param {Number} params.pageSize 每页数量(默认10)
 * @param {String} params.windowId 窗口ID(可选)
 * @param {String} params.canteenId 食堂ID(可选)
 * @param {Number} params.minRating 最低评分(可选)
 * @param {Number} params.maxRating 最高评分(可选)
 * @param {String} params.sortBy 排序字段(默认createdAt)
 * @param {String} params.sortOrder 排序方式(asc/desc，默认desc)
 */
export function getAllComments(params) {
  return request.get('/comment', params);
}

/**
 * 获取菜品评价
 * @param {String} dishId 菜品ID
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码(默认1)
 * @param {Number} params.pageSize 每页数量(默认10)
 */
export function getCommentsByDish(dishId, params) {
  return request.get(`/comment/dish/${dishId}`, params);
}

/**
 * 提交菜品评价
 * @param {Object} data 评价信息
 * @param {String} data.dishId 菜品ID
 * @param {Number} data.rating 评分
 * @param {String} data.content 评价内容
 * @param {Array} data.images 图片URL数组
 */
export function submitComment(data) {
  return request.post('/comment', data);
}

/**
 * 回复评论 (职工权限)
 * @param {String} id 评论ID
 * @param {Object} data 回复信息
 * @param {String} data.content 回复内容
 */
export function replyComment(id, data) {
  return request.post(`/comment/reply/${id}`, data);
}

/**
 * 删除评论 (职工权限)
 * @param {String} id 评论ID
 */
export function deleteComment(id) {
  return request.del(`/comment/${id}`);
} 