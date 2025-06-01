const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validateFile, findExistingFile, calculateFileHash } = require('../controllers/uploadController');

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.body.type || 'other';
    const uploadDir = path.join(__dirname, '../../public/uploads', type);
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 使用时间戳和随机数生成文件名
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${random}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 验证文件
    const validationError = validateFile(file);
    if (validationError) {
      cb(new Error(validationError), false);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 单文件上传
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 1,
        message: '没有上传文件'
      });
    }
    
    const type = req.body.type || 'other';
    const filePath = req.file.path;
    
    // 计算文件哈希
    const fileHash = await calculateFileHash(filePath);
    
    // 检查是否存在相同的文件
    const existingFile = await findExistingFile(fileHash, type);
    
    if (existingFile) {
      // 删除刚上传的文件
      fs.unlinkSync(filePath);
      
      return res.json({
        code: 0,
        data: {
          url: existingFile.url,
          isExisting: true,
          existingDish: existingFile.dish
        }
      });
    }
    
    // 构建URL
    const url = `/uploads/${type}/${path.basename(filePath)}`;
    
    res.json({
      code: 0,
      data: {
        url,
        isExisting: false
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      code: 1,
      message: '文件上传失败: ' + error.message
    });
  }
});

// 多文件上传
router.post('/images', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 1,
        message: '没有上传文件'
      });
    }
    
    const type = req.body.type || 'other';
    const results = [];
    
    for (const file of req.files) {
      try {
        const fileHash = await calculateFileHash(file.path);
        const existingFile = await findExistingFile(fileHash, type);
        
        if (existingFile) {
          // 删除刚上传的文件
          fs.unlinkSync(file.path);
          
          results.push({
            success: true,
            url: existingFile.url,
            isExisting: true,
            existingDish: existingFile.dish
          });
        } else {
          const url = `/uploads/${type}/${path.basename(file.path)}`;
          results.push({
            success: true,
            url,
            isExisting: false
          });
        }
      } catch (error) {
        console.error('处理文件失败:', file.originalname, error);
        results.push({
          success: false,
          originalname: file.originalname,
          error: error.message
        });
      }
    }
    
    res.json({
      code: 0,
      data: results
    });
  } catch (error) {
    console.error('批量上传失败:', error);
    res.status(500).json({
      code: 1,
      message: '批量上传失败: ' + error.message
    });
  }
});

// Base64图片上传
router.post('/base64-image', async (req, res) => {
  try {
    const { base64, contentType, type = 'other' } = req.body;
    
    if (!base64 || !contentType) {
      return res.status(400).json({
        code: 1,
        message: '缺少必要参数'
      });
    }
    
    // 解码Base64
    const buffer = Buffer.from(base64, 'base64');
    
    // 检查文件大小
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        code: 1,
        message: '文件大小不能超过5MB'
      });
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = contentType.split('/')[1];
    const filename = `${timestamp}_${random}.${ext}`;
    
    // 确保目录存在
    const uploadDir = path.join(__dirname, '../../public/uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    
    // 写入文件
    fs.writeFileSync(filePath, buffer);
    
    // 计算文件哈希
    const fileHash = await calculateFileHash(filePath);
    
    // 检查是否存在相同的文件
    const existingFile = await findExistingFile(fileHash, type);
    
    if (existingFile) {
      // 删除刚上传的文件
      fs.unlinkSync(filePath);
      
      return res.json({
        code: 0,
        data: {
          url: existingFile.url,
          isExisting: true,
          existingDish: existingFile.dish
        }
      });
    }
    
    // 构建URL
    const url = `/uploads/${type}/${filename}`;
    
    res.json({
      code: 0,
      data: {
        url,
        isExisting: false
      }
    });
  } catch (error) {
    console.error('Base64图片上传失败:', error);
    res.status(500).json({
      code: 1,
      message: 'Base64图片上传失败: ' + error.message
    });
  }
});

module.exports = router; 