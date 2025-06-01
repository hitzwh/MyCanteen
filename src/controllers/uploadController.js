const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Dish } = require('../models/dish');
const { errorResponse, successResponse } = require('../utils/response');
const ERROR_CODES = require('../constants/errorCodes');

// 配置
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const UPLOAD_PATH = path.join(__dirname, '../../public/uploads');

// 工具函数：计算文件hash
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', error => reject(error));
  });
}

// 工具函数：检查文件是否已存在
async function findExistingFile(hash, type) {
  const uploadDir = path.join(UPLOAD_PATH, type);
  const files = await fs.promises.readdir(uploadDir);
  
  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const fileHash = await calculateFileHash(filePath);
    if (fileHash === hash) {
      return file;
    }
  }
  
  return null;
}

// 工具函数：验证文件
function validateFile(file) {
  // 检查文件是否存在
  if (!file) {
    return { valid: false, error: '请上传文件' };
  }
  
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '图片大小不能超过5MB' };
  }
  
  // 检查文件类型
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return { valid: false, error: '只支持JPG、PNG、GIF和WebP格式的图片' };
  }
  
  return { valid: true };
}

// @desc    上传单张图片
// @route   POST /api/worker/upload/image
// @access  Private/Worker
exports.uploadImage = async (req, res) => {
  try {
    console.log('开始处理图片上传请求');
    console.log('请求体:', req.body);
    console.log('请求文件:', req.file);
    
    // 验证文件
    const validation = validateFile(req.file);
    if (!validation.valid) {
      return errorResponse(res, ERROR_CODES.PARAM_ERROR, validation.error);
    }
    
    // 确保上传目录存在
    const uploadDir = path.join(UPLOAD_PATH, req.body.type || 'other');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 计算文件hash
    const fileHash = await calculateFileHash(req.file.path);
    console.log('文件hash:', fileHash);
    
    // 检查是否已存在相同文件
    const existingFile = await findExistingFile(fileHash, req.body.type || 'other');
    
    let fileName;
    let fileUrl;
    
    if (existingFile) {
      // 如果文件已存在，删除新上传的文件
      fs.unlinkSync(req.file.path);
      fileName = existingFile;
      console.log('找到已存在的相同文件:', fileName);
    } else {
      // 如果是新文件，重命名为hash值
      const extname = path.extname(req.file.originalname);
      fileName = `${fileHash}${extname}`;
      const newPath = path.join(uploadDir, fileName);
      
      fs.renameSync(req.file.path, newPath);
      console.log('保存新文件:', fileName);
    }
    
    // 构建文件URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    fileUrl = `${baseUrl}/uploads/${req.body.type || 'other'}/${fileName}`;
    
    // 如果是菜品图片，检查是否已被使用
    let existingDish = null;
    if (req.body.type === 'dish') {
      existingDish = await Dish.findOne({
        $or: [
          { image: fileUrl },
          { images: fileUrl }
        ]
      });
      
      if (existingDish) {
        console.log('图片已存在于菜品:', existingDish.name);
      }
    }
    
    return successResponse(res, '上传成功', {
      url: fileUrl,
      filename: fileName,
      size: req.file.size,
      mimetype: req.file.mimetype,
      isExisting: !!existingFile,
      existingDish: existingDish ? {
        id: existingDish._id,
        name: existingDish.name
      } : null
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    
    // 清理临时文件
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return errorResponse(res, ERROR_CODES.GENERAL_ERROR, '上传图片失败: ' + error.message);
  }
};

// @desc    批量上传图片
// @route   POST /api/worker/upload/images
// @access  Private/Worker
exports.uploadImages = async (req, res) => {
  try {
    console.log('开始处理批量图片上传请求');
    console.log('请求体:', req.body);
    console.log('请求文件数量:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, ERROR_CODES.PARAM_ERROR, '请上传文件');
    }
    
    // 确保上传目录存在
    const uploadDir = path.join(UPLOAD_PATH, req.body.type || 'other');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const results = [];
    const errors = [];
    
    // 处理每个文件
    for (const file of req.files) {
      try {
        // 验证文件
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push({
            originalname: file.originalname,
            error: validation.error
          });
          continue;
        }
        
        // 计算文件hash
        const fileHash = await calculateFileHash(file.path);
        
        // 检查是否已存在相同文件
        const existingFile = await findExistingFile(fileHash, req.body.type || 'other');
        
        let fileName;
        let fileUrl;
        
        if (existingFile) {
          // 如果文件已存在，删除新上传的文件
          fs.unlinkSync(file.path);
          fileName = existingFile;
        } else {
          // 如果是新文件，重命名为hash值
          const extname = path.extname(file.originalname);
          fileName = `${fileHash}${extname}`;
          const newPath = path.join(uploadDir, fileName);
          
          fs.renameSync(file.path, newPath);
        }
        
        // 构建文件URL
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        fileUrl = `${baseUrl}/uploads/${req.body.type || 'other'}/${fileName}`;
        
        // 如果是菜品图片，检查是否已被使用
        let existingDish = null;
        if (req.body.type === 'dish') {
          existingDish = await Dish.findOne({
            $or: [
              { image: fileUrl },
              { images: fileUrl }
            ]
          });
        }
        
        results.push({
          originalname: file.originalname,
          url: fileUrl,
          filename: fileName,
          size: file.size,
          mimetype: file.mimetype,
          isExisting: !!existingFile,
          existingDish: existingDish ? {
            id: existingDish._id,
            name: existingDish.name
          } : null
        });
      } catch (error) {
        console.error('处理文件失败:', file.originalname, error);
        
        // 清理临时文件
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        errors.push({
          originalname: file.originalname,
          error: error.message
        });
      }
    }
    
    return successResponse(res, '上传完成', {
      success: results,
      errors: errors
    });
  } catch (error) {
    console.error('批量上传图片失败:', error);
    
    // 清理所有临时文件
    if (req.files) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    return errorResponse(res, ERROR_CODES.GENERAL_ERROR, '批量上传图片失败: ' + error.message);
  }
};

// @desc    上传Base64格式的图片
// @route   POST /api/worker/upload/base64-image
// @access  Private/Worker
exports.uploadBase64Image = async (req, res) => {
  try {
    console.log('开始处理Base64图片上传请求');
    
    const { base64, contentType, type = 'other' } = req.body;
    
    if (!base64 || !contentType) {
      return errorResponse(res, ERROR_CODES.PARAM_ERROR, '请提供图片数据和内容类型');
    }
    
    // 验证内容类型
    if (!ALLOWED_TYPES.includes(contentType)) {
      return errorResponse(res, ERROR_CODES.PARAM_ERROR, '不支持的图片格式');
    }
    
    // 解码Base64数据
    const buffer = Buffer.from(base64, 'base64');
    
    // 检查文件大小
    if (buffer.length > MAX_FILE_SIZE) {
      return errorResponse(res, ERROR_CODES.PARAM_ERROR, '图片大小不能超过5MB');
    }
    
    // 确保上传目录存在
    const uploadDir = path.join(UPLOAD_PATH, type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 计算数据hash
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    
    // 检查是否已存在相同文件
    const existingFile = await findExistingFile(hash, type);
    
    let fileName;
    let fileUrl;
    
    if (existingFile) {
      fileName = existingFile;
      console.log('找到已存在的相同文件:', fileName);
    } else {
      // 根据内容类型确定文件扩展名
      const extname = contentType.split('/')[1];
      fileName = `${hash}.${extname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // 写入文件
      await fs.promises.writeFile(filePath, buffer);
      console.log('保存新文件:', fileName);
    }
    
    // 构建文件URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    fileUrl = `${baseUrl}/uploads/${type}/${fileName}`;
    
    // 如果是菜品图片，检查是否已被使用
    let existingDish = null;
    if (type === 'dish') {
      existingDish = await Dish.findOne({
        $or: [
          { image: fileUrl },
          { images: fileUrl }
        ]
      });
      
      if (existingDish) {
        console.log('图片已存在于菜品:', existingDish.name);
      }
    }
    
    return successResponse(res, '上传成功', {
      url: fileUrl,
      filename: fileName,
      size: buffer.length,
      mimetype: contentType,
      isExisting: !!existingFile,
      existingDish: existingDish ? {
        id: existingDish._id,
        name: existingDish.name
      } : null
    });
  } catch (error) {
    console.error('上传Base64图片失败:', error);
    return errorResponse(res, ERROR_CODES.GENERAL_ERROR, '上传Base64图片失败: ' + error.message);
  }
}; 