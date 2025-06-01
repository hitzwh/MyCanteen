const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

// 导入路由
const uploadRouter = require('./routes/upload');

// 创建Express应用
const app = express();

// 中间件配置
app.use(morgan('dev')); // 日志
app.use(helmet()); // 安全头
app.use(compression()); // 压缩
app.use(cors()); // CORS
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 路由配置
app.use('/api/upload', uploadRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    code: 1,
    message: '服务器内部错误: ' + err.message
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 