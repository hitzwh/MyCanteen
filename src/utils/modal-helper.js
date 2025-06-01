/**
 * 模态框辅助工具
 * 用于处理模态框与图片预览之间的交互
 */

/**
 * 临时降低所有模态框和遮罩层的z-index
 * 以便图片预览弹窗能够显示在最上层
 */
export const lowerModalZIndexForPreview = () => {
  try {
    // 针对H5平台
    if (typeof document !== 'undefined') {
      // 找到所有模态框和遮罩层
      const modalSelectors = [
        '.modal', 
        '.modal-mask', 
        '.uni-mask',
        '.uni-modal',
        '.uni-modal-mask'
      ];
      
      modalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          console.log('找到模态元素:', selector, elements.length);
          
          elements.forEach(el => {
            // 保存原始z-index
            if (!el.hasAttribute('data-original-z-index')) {
              el.setAttribute('data-original-z-index', el.style.zIndex || '');
              
              // 临时降低z-index
              el.style.zIndex = '500';
              console.log('降低模态元素z-index:', selector);
            }
          });
        }
      });
    }
  } catch (e) {
    console.error('降低模态框z-index失败:', e);
  }
};

/**
 * 恢复所有模态框和遮罩层的原始z-index
 */
export const restoreModalZIndex = () => {
  try {
    // 针对H5平台
    if (typeof document !== 'undefined') {
      // 找到所有模态框和遮罩层
      const elements = document.querySelectorAll('[data-original-z-index]');
      
      if (elements && elements.length > 0) {
        console.log('恢复模态元素z-index:', elements.length);
        
        elements.forEach(el => {
          const originalZIndex = el.getAttribute('data-original-z-index');
          if (originalZIndex) {
            el.style.zIndex = originalZIndex;
            el.removeAttribute('data-original-z-index');
          }
        });
      }
    }
  } catch (e) {
    console.error('恢复模态框z-index失败:', e);
  }
};

/**
 * 自动处理图片预览
 * 降低模态框z-index，预览图片，然后恢复模态框z-index
 */
export const handleImagePreview = (urls, current, options = {}) => {
  // 降低模态框z-index
  lowerModalZIndexForPreview();
  
  // 调用uni-app的预览接口
  uni.previewImage({
    urls,
    current,
    ...options,
    success: (res) => {
      console.log('图片预览成功');
      if (options.success) options.success(res);
    },
    fail: (err) => {
      console.error('图片预览失败:', err);
      if (options.fail) options.fail(err);
    },
    complete: () => {
      console.log('图片预览完成，恢复模态框z-index');
      
      // 延迟恢复模态框z-index，确保预览完全关闭
      setTimeout(() => {
        restoreModalZIndex();
        if (options.complete) options.complete();
      }, 500);
    }
  });
};

/**
 * 安全的弹窗显示函数，防止重复弹窗
 * @param {Object} options - uni.showModal的选项
 */
export const showSafeModal = (options) => {
  // 初始化全局弹窗状态变量
  if (typeof window._modalShowing === 'undefined') {
    window._modalShowing = false;
  }
  
  // 防止重复显示弹窗
  if (window._modalShowing) {
    console.log('已有弹窗显示中，忽略新的弹窗请求');
    return;
  }
  
  // 设置弹窗显示标志
  window._modalShowing = true;
  
  // 关闭所有可能存在的弹窗
  try {
    uni.hideLoading();
    // 尝试关闭可能存在的其他弹窗
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.$vm && currentPage.$vm._popups) {
        currentPage.$vm._popups.forEach(popup => {
          try {
            popup.close();
          } catch (e) {
            console.error('关闭弹窗失败:', e);
          }
        });
      }
    }
  } catch (e) {
    console.error('关闭已有弹窗失败:', e);
  }
  
  // 修改原始options的success回调，确保弹窗状态正确管理
  const originalSuccess = options.success;
  const originalFail = options.fail;
  
  options.success = (res) => {
    // 释放弹窗显示标志
    window._modalShowing = false;
    // 调用原始成功回调
    if (typeof originalSuccess === 'function') {
      originalSuccess(res);
    }
  };
  
  options.fail = (err) => {
    // 释放弹窗显示标志
    window._modalShowing = false;
    // 调用原始失败回调
    if (typeof originalFail === 'function') {
      originalFail(err);
    }
  };
  
  // 确保等待一段时间后再显示新弹窗
  setTimeout(() => {
    uni.showModal(options);
  }, 300);
};

export default {
  lowerModalZIndexForPreview,
  restoreModalZIndex,
  handleImagePreview,
  showSafeModal
}; 