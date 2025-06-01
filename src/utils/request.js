/**
 * 网络请求工具类
 */

// 基础URL
const BASE_URL = 'https://civctrulzxpa.sealoshzh.site/api';
const UPLOAD_URL = 'https://civctrulzxpa.sealoshzh.site/api'; // 修改上传服务地址，使用与BASE_URL相同的地址

// 请求限流控制
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 2; // 最大并发请求数
const REQUEST_DELAY = 500; // 请求间隔(毫秒)
let activeRequests = 0;
let isProcessingQueue = false;

/**
 * 处理请求队列
 */
function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return;
  }
  
  isProcessingQueue = true;
  
  setTimeout(() => {
    if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
      const nextRequest = requestQueue.shift();
      activeRequests++;
      
      nextRequest.execute()
        .then(res => {
          nextRequest.resolve(res);
        })
        .catch(err => {
          nextRequest.reject(err);
        })
        .finally(() => {
          activeRequests--;
          isProcessingQueue = false;
          processRequestQueue();
        });
    } else {
      isProcessingQueue = false;
    }
  }, REQUEST_DELAY);
}

/**
 * 添加请求到队列
 */
function addToQueue(requestFunction) {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      execute: requestFunction,
      resolve,
      reject
    });
    
    processRequestQueue();
  });
}

/**
 * 请求拦截器
 * @param {Object} config 请求配置
 */
const requestInterceptor = (config) => {
  // 获取token和用户类型
  const token = uni.getStorageSync('token');
  const userType = uni.getStorageSync('userType');
  
  console.log(`请求拦截器: ${config.url}`, {
    token: token ? `${token.substring(0, 10)}...` : '无token',
    userType: userType || '未指定',
    method: config.method
  });
  
  // 如果有token，添加到请求头
  if (token) {
    // 确保token格式正确
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    config.header = {
      ...config.header,
      'Authorization': formattedToken
    };
    
    // 对于职工端的请求，增加额外验证头
    if (userType === 'staff') {
      config.header['X-User-Type'] = 'staff';
    }
  } else {
    console.warn('警告: 请求未携带token，可能导致认证失败');
  }
  
  return config;
};

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 */
const responseInterceptor = (response) => {
  // 记录响应信息
  console.log(`API响应(${response.statusCode}):`, response);
  
  // 处理429错误 - 请求过多
  if (response.statusCode === 429) {
    console.warn('请求过多，系统限流，将延迟重试');
    // 这里不做重试，让调用方处理
    return Promise.reject({
      statusCode: response.statusCode,
      message: '请求过多，请稍后再试',
      response: response
    });
  }
  
  // 处理401错误 - 未授权
  if (response.statusCode === 401) {
    console.warn('认证失败(401)，token可能已过期');
    
    // 获取当前页面路径，判断是否已在登录页
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentPath = currentPage ? currentPage.route : '';
    
    // 已经在登录页，不再跳转，避免循环
    if (currentPath.includes('login')) {
      console.log('当前已在登录页，不再跳转');
      return Promise.reject({
        statusCode: response.statusCode,
        message: '请重新登录',
        response: response
      });
    }
    
    // 清除存储的token和用户信息
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    
    // 显示提示，然后重定向到登录页
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
      duration: 2000
    });
    
    // 使用reLaunch而非navigateTo，确保清除导航栈
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }, 1500);
    
    return Promise.reject({
      statusCode: response.statusCode,
      message: '登录已过期，请重新登录',
      response: response
    });
  }
  
  // 这里可以统一处理错误
  if (response.statusCode !== 200) {
    // 根据状态码提供友好的错误信息
    let errorMsg = '';
    switch (response.statusCode) {
      case 400:
        errorMsg = '请求参数错误';
        break;
      case 403:
        errorMsg = '没有权限访问';
        break;
      case 404:
        errorMsg = '请求的资源不存在';
        break;
      case 500:
        errorMsg = '服务器内部错误';
        break;
      case 502:
        errorMsg = '网关错误';
        break;
      case 503:
        errorMsg = '服务不可用';
        break;
      case 504:
        errorMsg = '网关超时';
        break;
      default:
        errorMsg = `网络错误: ${response.statusCode}`;
    }
    
    console.error(errorMsg, response);
    
    // 不在这里显示toast，让调用方自行处理错误提示
    return Promise.reject({
      statusCode: response.statusCode,
      message: errorMsg,
      response: response
    });
  }
  
  const res = response.data;
  
  // 处理业务错误
  if (res.code !== 0) {
    // 记录业务错误
    console.error(`业务错误(${res.code}):`, res);
    
    // 根据业务错误码提供友好的错误信息
    let errorMsg = res.message || '请求失败';
    
    // 常见业务错误码处理
    switch (res.code) {
      // 通用错误
      case 1001:
        errorMsg = '参数错误: ' + errorMsg;
        break;
      case 1002:
        errorMsg = '登录已过期，请重新登录';
        // 清除token
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        
        // 跳转到登录页
        uni.navigateTo({
          url: '/pages/login/login'
        });
        break;
      case 1003:
        errorMsg = '权限不足: ' + errorMsg;
        break;
      
      // 用户相关错误
      case 2001:
        errorMsg = '用户不存在';
        break;
      case 2002:
        errorMsg = '密码错误';
        break;
      case 2003:
        errorMsg = '用户名已存在';
        break;
      case 2004:
        errorMsg = '工号已存在';
        break;
      
      // 餐厅相关错误
      case 3001:
        errorMsg = '食堂不存在';
        break;
      case 3002:
        errorMsg = '窗口不存在';
        break;
      case 3003:
        errorMsg = '菜品不存在';
        break;
      
      // 其他错误
      case 4001:
        errorMsg = '通用错误: ' + errorMsg;
        break;
      
      // 评论相关错误
      case 5001:
        errorMsg = '评论不存在';
        break;
      case 5002:
        errorMsg = '已经评论过该菜品';
        break;
      
      // 收藏相关错误
      case 6001:
        errorMsg = '已经收藏过该菜品';
        break;
      case 6002:
        errorMsg = '收藏不存在';
        break;
      
      // 消息相关错误
      case 7001:
        errorMsg = '消息不存在';
        break;
    }
    
    // 不在这里显示toast，让调用方自行处理错误提示
    return Promise.reject({
      code: res.code,
      message: errorMsg,
      data: res.data
    });
  }
  
  return res;
};

/**
 * 封装请求方法
 * @param {String} url 请求地址
 * @param {Object} options 请求配置
 */
const request = (url, options = {}) => {
  // 合并配置
  const config = {
    url: `${BASE_URL}${url}`,
    ...options,
    header: {
      'Content-Type': 'application/json',
      ...options.header
    }
  };
  
  // 请求拦截
  const interceptedConfig = requestInterceptor(config);
  
  // 记录请求信息
  console.log(`API请求: ${interceptedConfig.url}`, {
    method: interceptedConfig.method,
    data: interceptedConfig.data
  });
  
  // 创建请求函数
  const executeRequest = () => {
    return new Promise((resolve, reject) => {
      uni.request({
        ...interceptedConfig,
        success: (response) => {
          try {
            const res = responseInterceptor(response);
            resolve(res);
          } catch (error) {
            console.error('响应处理错误:', error);
            reject(error);
          }
        },
        fail: (error) => {
          console.error('请求失败:', error);
          uni.showToast({
            title: '网络请求失败，请检查网络连接',
            icon: 'none'
          });
          reject({
            message: '网络请求失败，请检查网络连接',
            error: error
          });
        }
      });
    });
  };
  
  // 将请求添加到队列中
  return addToQueue(executeRequest);
};

/**
 * GET请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 */
const get = (url, params = {}, options = {}) => {
  return request(url, {
    method: 'GET',
    data: params,
    ...options
  });
};

/**
 * POST请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
const post = (url, data = {}, options = {}) => {
  return request(url, {
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
const put = (url, data = {}, options = {}) => {
  return request(url, {
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
const del = (url, data = {}, options = {}) => {
  return request(url, {
    method: 'DELETE',
    data,
    ...options
  });
};

/**
 * 上传文件
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {String} name 文件字段名
 * @param {Object} formData 其他表单数据
 * @param {Number} maxRetries 最大重试次数
 */
const upload = (url, filePath, name = 'file', formData = {}, maxRetries = 2) => {
  // 获取token
  const token = uni.getStorageSync('token');
  
  console.log(`开始上传文件: ${url}`, {
    filePath: filePath,
    name: name,
    formData: formData
  });
  
  // 使用上传服务的地址
  const uploadUrl = `${UPLOAD_URL}${url}`;
  console.log('上传地址:', uploadUrl);
  
  // 重试函数
  const attemptUpload = (retries) => {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        console.error('上传失败: 无效的文件路径');
        reject(new Error('无效的文件路径'));
        return;
      }
      
      const uploadTask = uni.uploadFile({
        url: uploadUrl,
        filePath,
        name,
        formData,
        header: token ? { 'Authorization': `Bearer ${token}` } : {},
        timeout: 30000, // 设置30秒超时
        success: (response) => {
          try {
            console.log('文件上传响应:', response);
            
            // 上传接口返回的是字符串，需要手动转换
            const res = JSON.parse(response.data);
            console.log('解析后的上传响应:', res);
            
            if (res.code !== 0) {
              console.error('上传业务错误:', res);
              uni.showToast({
                title: res.message || '上传失败',
                icon: 'none'
              });
              reject(res);
              return;
            }
            
            // 确保返回的URL格式正确
            if (res.data && res.data.url) {
              let imageUrl = res.data.url.trim();
              // 如果返回的是完整URL，直接使用
              if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                console.log('使用服务器返回的完整URL:', imageUrl);
              } else {
                // 如果是相对路径，确保以/开头
                if (!imageUrl.startsWith('/')) {
                  imageUrl = '/' + imageUrl;
                }
                // 使用上传服务的域名
                const domain = UPLOAD_URL.split('/api')[0];
                imageUrl = `${domain}${imageUrl}`;
                console.log('构建完整的图片URL:', imageUrl);
              }
              res.data.url = imageUrl;
            }
            
            console.log('上传成功，处理后的响应:', res);
            resolve(res);
          } catch (error) {
            console.error('解析上传响应失败:', error);
            reject(error);
          }
        },
        fail: (error) => {
          console.error('上传请求失败:', error);
          
          // 如果是超时或网络错误，并且还有重试次数，则重试
          if ((error.errMsg.includes('timeout') || error.errMsg.includes('fail')) && retries > 0) {
            console.log(`上传失败，将在1秒后重试，剩余重试次数: ${retries}`);
            
            uni.showToast({
              title: '上传超时，正在重试...',
              icon: 'none',
              duration: 1000
            });
            
            setTimeout(() => {
              attemptUpload(retries - 1).then(resolve).catch(reject);
            }, 1000);
          } else {
            uni.showToast({
              title: '上传失败，请检查网络连接',
              icon: 'none',
              duration: 2000
            });
            reject(error);
          }
        }
      });
      
      // 监听上传进度
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度:', res.progress);
        // 这里可以添加进度回调
      });
    });
  };
  
  return attemptUpload(maxRetries);
};

// 导出
export default {
  get,
  post,
  put,
  delete: del,
  upload,
  BASE_URL, // 导出BASE_URL常量
  UPLOAD_URL // 导出UPLOAD_URL常量
}; 