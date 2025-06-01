/**
 * 增强的图片预览工具函数
 * 确保图片预览弹窗始终显示在最上层
 */

/**
 * 预览图片列表
 * @param {Array} urls 图片URL列表
 * @param {String|Number} current 当前显示图片的URL或索引
 * @param {Object} options 额外选项
 */
export const previewImages = (urls, current, options = {}) => {
  if (!urls || urls.length === 0) {
    uni.showToast({
      title: '没有可预览的图片',
      icon: 'none'
    });
    return;
  }

  console.log('预览图片:', current);
  console.log('所有图片:', urls);
  
  // 尝试关闭或隐藏可能干扰的弹窗
  try {
    // 针对H5平台，尝试提前处理可能存在的遮挡元素
    if (typeof document !== 'undefined') {
      // 找到所有可能遮挡预览的元素
      const maskElements = document.querySelectorAll('.modal-mask, .uni-mask');
      if (maskElements && maskElements.length > 0) {
        console.log('找到可能遮挡预览的遮罩层:', maskElements.length);
        maskElements.forEach(el => {
          // 先保存原始z-index
          const originalZIndex = el.style.zIndex;
          el.setAttribute('data-original-z-index', originalZIndex);
          // 临时降低z-index
          el.style.zIndex = '800';
        });
        
        // 5秒后恢复原始z-index，以防止预览关闭后遮罩层仍然是低z-index
        setTimeout(() => {
          maskElements.forEach(el => {
            const originalZIndex = el.getAttribute('data-original-z-index');
            if (originalZIndex) {
              el.style.zIndex = originalZIndex;
            }
          });
        }, 5000);
      }
    }
  } catch (e) {
    console.error('处理遮挡元素失败:', e);
  }
  
  // 默认选项
  const defaultOptions = {
    indicator: 'number', // 显示页码指示器
    loop: true, // 允许循环预览
    longPressActions: {
      itemList: ['保存图片', '收藏'],
      success: function(data) {
        console.log('长按菜单点击:', data.tapIndex);
      }
    }
  };
  
  // 合并选项
  const finalOptions = {
    ...defaultOptions,
    ...options,
    urls,
    current
  };

  // 调用uni-app的预览接口
  uni.previewImage(finalOptions);
  
  // 多次尝试确保预览窗口在最上层
  setTimeout(() => ensurePreviewOnTop(), 100);
  setTimeout(() => ensurePreviewOnTop(), 300);
  setTimeout(() => ensurePreviewOnTop(), 600);
  setTimeout(() => ensurePreviewOnTop(), 1000);
};

/**
 * 确保预览窗口在最上层
 */
const ensurePreviewOnTop = () => {
  // 尝试获取预览相关元素
  const previewSelectors = [
    '.uni-image-viewer', 
    '.uni-preview-image', 
    '.uni-image-viewer-mask', 
    '.uni-image-viewer-view',
    '.uni-popup-view',
    '.uni-image-swiper',
    'uni-image-viewer',
    'uni-previewImage',
    '.uni-previewImage'
  ];
  
  try {
    // 针对H5平台
    if (typeof document !== 'undefined') {
      previewSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements && elements.length > 0) {
          console.log('找到预览元素:', selector, elements.length);
          elements.forEach(el => {
            el.style.zIndex = 2000000;
            
            // 确保预览元素是可见的
            el.style.visibility = 'visible';
            el.style.display = 'block';
            
            // 尝试找到预览元素内的按钮元素
            const btnElements = el.querySelectorAll('button, .uni-btn, .uni-image-viewer-btn');
            if (btnElements && btnElements.length > 0) {
              btnElements.forEach(btn => {
                btn.style.zIndex = 2000001;
                btn.style.position = 'relative';
                btn.style.pointerEvents = 'auto';
              });
            }
          });
        }
      });
      
      // 特殊处理: 确保body上没有设置overflow:hidden
      if (document.body) {
        document.body.style.overflow = 'auto';
      }
    }
  } catch (e) {
    console.error('设置预览层级失败:', e);
  }
};

export default {
  previewImages
}; 