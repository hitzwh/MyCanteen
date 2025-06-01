/**
 * 消息相关API
 */
import request from '../utils/request';

/**
 * 获取消息列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码(默认1)
 * @param {Number} params.pageSize 每页数量(默认10)
 * @param {Boolean} params.isRead 是否已读(可选)
 */
export function getMessages(params) {
  return request.get('/message', params);
}

/**
 * 获取消息详情
 * @param {String} id 消息ID
 */
export function getMessageDetail(id) {
  return request.get(`/message/${id}`);
}

/**
 * 标记消息已读
 * @param {Object} data 消息信息
 * @param {String} data.messageId 消息ID(可选，不提供则标记所有消息为已读)
 */
export function markMessageRead(data) {
  return request.post('/message/read', data);
} 