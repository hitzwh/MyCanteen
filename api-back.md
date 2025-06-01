# 校园食堂应用后端API文档

## 基础URL
```
https://civctrulzxpa.sealoshzh.site/api
```

## 1. 用户相关接口

### 1.1 注册
- **URL**: `/user/register`
- **方法**: `POST`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "confirmPassword": "确认密码",
    "avatar": "头像URL(可选)"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "注册成功",
    "data": {
      "token": "JWT令牌",
      "userInfo": {
        "_id": "用户ID",
        "username": "用户名",
        "avatar": "头像URL"
      }
    }
  }
  ```

### 1.2 登录
- **URL**: `/user/login`
- **方法**: `POST`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "userInfo": {
        "_id": "用户ID",
        "username": "用户名",
        "avatar": "头像URL"
      }
    }
  }
  ```

### 1.3 获取用户信息
- **URL**: `/user/info`
- **方法**: `GET`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "用户ID",
      "username": "用户名",
      "avatar": "头像URL"
    }
  }
  ```

### 1.4 修改用户信息
- **URL**: `/user/info`
- **方法**: `PUT`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "username": "新用户名(可选)",
    "avatar": "新头像URL(可选)"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "修改成功",
    "data": null
  }
  ```

### 1.5 修改密码
- **URL**: `/user/change-password`
- **方法**: `POST`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码",
    "confirmPassword": "确认新密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "修改成功",
    "data": null
  }
  ```

### 1.6 退出登录
- **URL**: `/user/logout`
- **方法**: `POST`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "退出成功",
    "data": null
  }
  ```

## 2. 职工相关接口

### 2.1 注册
- **URL**: `/worker/register`
- **方法**: `POST`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "confirmPassword": "确认密码",
    "staffId": "工号(可选)",
    "phone": "电话(可选)",
    "canteenId": "食堂ID(可选)"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "注册成功",
    "data": {
      "token": "JWT令牌",
      "userInfo": {
        "_id": "职工ID",
        "username": "用户名",
        "avatar": "头像URL",
        "staffId": "工号",
        "phone": "电话",
        "position": "职位",
        "canteenId": "食堂ID"
      }
    }
  }
  ```

### 2.2 登录
- **URL**: `/worker/login`
- **方法**: `POST`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "userInfo": {
        "_id": "职工ID",
        "username": "用户名",
        "avatar": "头像URL",
        "staffId": "工号",
        "phone": "电话",
        "position": "职位",
        "canteenId": "食堂ID"
      }
    }
  }
  ```

### 2.3 获取职工信息
- **URL**: `/worker/info`
- **方法**: `GET`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "职工ID",
      "username": "用户名",
      "avatar": "头像URL",
      "staffId": "工号",
      "phone": "电话",
      "position": "职位",
      "canteenId": "食堂ID"
    }
  }
  ```

### 2.4 修改职工信息
- **URL**: `/worker/info`
- **方法**: `PUT`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "username": "新用户名(可选)",
    "avatar": "新头像URL(可选)",
    "phone": "新电话(可选)"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "修改成功",
    "data": null
  }
  ```

### 2.5 修改密码
- **URL**: `/worker/change-password`
- **方法**: `POST`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码",
    "confirmPassword": "确认新密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "修改成功",
    "data": null
  }
  ```

### 2.6 退出登录
- **URL**: `/worker/logout`
- **方法**: `POST`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "退出成功",
    "data": null
  }
  ```

### 2.7 获取工作统计数据
- **URL**: `/worker/statistics`
- **方法**: `GET`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "daysWorked": 30,
      "repliedComments": 15,
      "dishesManaged": 25
    }
  }
  ```

### 2.8 职工上传图片
- **URL**: `/worker/upload/image`
- **方法**: `POST`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `file`: 文件
  - `type`: 图片类型(canteen/window/dish/other/avatar)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "上传成功",
    "data": {
      "url": "图片URL",
      "filename": "文件名",
      "size": "文件大小",
      "mimetype": "文件类型"
    }
  }
  ```

### 2.9 职工批量上传图片
- **URL**: `/worker/upload/images`
- **方法**: `POST`
- **权限**: 需要职工登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `files`: 多个文件
  - `type`: 图片类型(canteen/window/dish/other/avatar)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "上传成功",
    "data": [
      {
        "url": "图片1URL",
        "filename": "文件1名",
        "size": "文件1大小",
        "mimetype": "文件1类型"
      },
      {
        "url": "图片2URL",
        "filename": "文件2名",
        "size": "文件2大小",
        "mimetype": "文件2类型"
      }
    ]
  }
  ```

## 3. 食堂相关接口

### 3.1 获取所有食堂
- **URL**: `/canteen`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "食堂ID",
        "name": "食堂名称",
        "image": "食堂图片",
        "description": "食堂描述",
        "location": "食堂位置",
        "openingHours": "营业时间",
        "status": "营业状态",
        "floors": [
          {
            "name": "楼层名称",
            "description": "楼层描述",
            "_id": "楼层ID"
          }
        ]
      }
    ]
  }
  ```

### 3.2 获取食堂详情
- **URL**: `/canteen/:id`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "食堂ID",
      "name": "食堂名称",
      "image": "食堂图片",
      "description": "食堂描述",
      "location": "食堂位置",
      "openingHours": "营业时间",
      "status": "营业状态",
      "floors": [
        {
          "name": "楼层名称",
          "description": "楼层描述",
          "_id": "楼层ID"
        }
      ]
    }
  }
  ```

### 3.3 根据楼层筛选窗口
- **URL**: `/canteen/:canteenId/windows/filter`
- **方法**: `GET`
- **权限**: 公开
- **参数**: `floorId=楼层ID`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "窗口ID",
        "name": "窗口名称",
        "description": "窗口描述",
        "image": "窗口图片",
        "canteenId": "食堂ID",
        "floorId": "楼层ID",
        "tags": ["标签1", "标签2"],
        "status": "营业状态"
      }
    ]
  }
  ```

## 4. 窗口相关接口

### 4.1 获取所有窗口
- **URL**: `/window`
- **方法**: `GET`
- **权限**: 公开
- **参数**: 
  - `canteenId`: 食堂ID(可选)
  - `floorId`: 楼层ID(可选)
  - `tags`: 标签(可选)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "窗口ID",
        "name": "窗口名称",
        "description": "窗口描述",
        "image": "窗口图片",
        "canteenId": {
          "_id": "食堂ID",
          "name": "食堂名称"
        },
        "floorId": "楼层ID",
        "tags": ["标签1", "标签2"],
        "status": "营业状态",
        "averageRating": 4.5
      }
    ]
  }
  ```

### 4.2 获取窗口详情
- **URL**: `/window/:id`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "窗口ID",
      "name": "窗口名称",
      "description": "窗口描述",
      "image": "窗口图片",
      "canteenId": {
        "_id": "食堂ID",
        "name": "食堂名称"
      },
      "floorId": "楼层ID",
      "tags": ["标签1", "标签2"],
      "status": "营业状态",
      "averageRating": 4.5,
      "dishes": [
        {
          "_id": "菜品ID",
          "name": "菜品名称",
          "image": "菜品图片",
          "price": 15.5,
          "rating": 4.8
        }
      ]
    }
  }
  ```

## 5. 菜品相关接口

### 5.1 获取所有菜品
- **URL**: `/dish`
- **方法**: `GET`
- **权限**: 公开
- **参数**: 
  - `page`: 页码(默认1)
  - `pageSize`: 每页数量(默认10)
  - `canteenId`: 食堂ID(可选)
  - `windowId`: 窗口ID(可选)
  - `keyword`: 关键词(可选)
  - `tags`: 标签(可选)
  - `status`: 菜品状态(可选，可选值:"available"或"soldout")
  - `sortBy`: 排序字段(默认createdAt)
  - `sortOrder`: 排序方式(asc/desc，默认desc)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "total": 100,
      "list": [
        {
          "_id": "菜品ID",
          "name": "菜品名称",
          "description": "菜品描述",
          "image": "菜品图片",
          "price": 15.5,
          "windowId": {
            "_id": "窗口ID",
            "name": "窗口名称"
          },
          "canteenId": {
            "_id": "食堂ID",
            "name": "食堂名称"
          },
          "tags": ["标签1", "标签2"],
          "status": "available",
          "ratingStats": {
            "rating": 4.8,
            "ratingCount": 25
          }
        }
      ]
    }
  }
  ```

### 5.2 批量获取所有菜品（无分页）
- **URL**: `/dish/all`
- **方法**: `GET`
- **权限**: 公开
- **参数**: 
  - `canteenId`: 食堂ID(可选)
  - `windowId`: 窗口ID(可选)
  - `keyword`: 关键词(可选)
  - `tags`: 标签(可选)
  - `status`: 菜品状态(可选，可选值:"available"或"soldout")
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "菜品ID",
        "name": "菜品名称",
        "description": "菜品描述",
        "image": "菜品图片",
        "price": 15.5,
        "windowId": {
          "_id": "窗口ID",
          "name": "窗口名称"
        },
        "canteenId": {
          "_id": "食堂ID",
          "name": "食堂名称"
        },
        "tags": ["标签1", "标签2"],
        "status": "available"
      }
    ]
  }
  ```

### 5.3 获取菜品详情
- **URL**: `/dish/:id`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "菜品ID",
      "name": "菜品名称",
      "description": "菜品描述",
      "image": "菜品图片",
      "price": 15.5,
      "windowId": {
        "_id": "窗口ID",
        "name": "窗口名称"
      },
      "canteenId": {
        "_id": "食堂ID",
        "name": "食堂名称"
      },
      "tags": ["标签1", "标签2"],
      "status": "available",
      "rating": 4.8,
      "ratingCount": 25,
      "isFavorite": false
    }
  }
  ```

### 5.4 获取窗口下所有菜品
- **URL**: `/dish/window/:windowId`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "菜品ID",
        "name": "菜品名称",
        "description": "菜品描述",
        "image": "菜品图片",
        "price": 15.5,
        "tags": ["标签1", "标签2"],
        "status": "available",
        "rating": 4.8,
        "ratingCount": 25
      }
    ]
  }
  ```

### 5.5 随机推荐菜品
- **URL**: `/dish/recommend`
- **方法**: `GET`
- **权限**: 公开
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "菜品ID",
      "name": "菜品名称",
      "description": "菜品描述",
      "image": "菜品图片",
      "price": 15.5,
      "windowId": {
        "_id": "窗口ID",
        "name": "窗口名称"
      },
      "canteenId": {
        "_id": "食堂ID",
        "name": "食堂名称"
      },
      "tags": ["标签1", "标签2"],
      "status": "available",
      "rating": 4.8,
      "ratingCount": 25
    }
  }
  ```

## 6. 评论相关接口

### 6.1 获取所有评价
- **URL**: `/comment`
- **方法**: `GET`
- **权限**: 公开
- **参数**: 
  - `page`: 页码(默认1)
  - `pageSize`: 每页数量(默认10)
  - `windowId`: 窗口ID(可选)
  - `canteenId`: 食堂ID(可选)
  - `minRating`: 最低评分(可选)
  - `maxRating`: 最高评分(可选)
  - `sortBy`: 排序字段(默认createdAt)
  - `sortOrder`: 排序方式(asc/desc，默认desc)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "total": 100,
      "list": [
        {
          "_id": "评论ID",
          "userId": {
            "_id": "用户ID",
            "username": "用户名",
            "avatar": "头像URL"
          },
          "dishId": {
            "_id": "菜品ID",
            "name": "菜品名称",
            "image": "菜品图片",
            "windowId": {
              "_id": "窗口ID",
              "name": "窗口名称"
            }
          },
          "rating": 4,
          "content": "评论内容",
          "images": ["图片URL1", "图片URL2"],
          "replies": [
            {
              "workerId": "职工ID",
              "content": "回复内容",
              "createdAt": "回复时间"
            }
          ],
          "createdAt": "评论时间"
        }
      ]
    }
  }
  ```

### 6.2 获取菜品评价
- **URL**: `/comment/dish/:dishId`
- **方法**: `GET`
- **权限**: 公开
- **参数**: 
  - `page`: 页码(默认1)
  - `pageSize`: 每页数量(默认10)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "total": 20,
      "list": [
        {
          "_id": "评论ID",
          "userId": {
            "_id": "用户ID",
            "username": "用户名",
            "avatar": "头像URL"
          },
          "dishId": "菜品ID",
          "rating": 4,
          "content": "评论内容",
          "images": ["图片URL1", "图片URL2"],
          "replies": [
            {
              "workerId": "职工ID",
              "content": "回复内容",
              "createdAt": "回复时间"
            }
          ],
          "createdAt": "评论时间"
        }
      ]
    }
  }
  ```

### 6.3 提交菜品评价
- **URL**: `/comment`
- **方法**: `POST`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "dishId": "菜品ID",
    "rating": 4,
    "content": "评论内容",
    "images": ["图片URL1", "图片URL2"]
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "评价成功",
    "data": null
  }
  ```

## 7. 上传相关接口

### 7.1 上传单张图片
- **URL**: `/upload/image`
- **方法**: `POST`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `file`: 文件
  - `type`: 图片类型(canteen/window/dish/other/avatar)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "上传成功",
    "data": {
      "url": "图片URL",
      "filename": "文件名",
      "size": "文件大小",
      "mimetype": "文件类型"
    }
  }
  ```

### 7.2 批量上传图片
- **URL**: `/upload/images`
- **方法**: `POST`
- **权限**: 需要登录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `files`: 多个文件
  - `type`: 图片类型(canteen/window/dish/other/avatar)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "上传成功",
    "data": [
      {
        "url": "图片1URL",
        "filename": "文件1名",
        "size": "文件1大小",
        "mimetype": "文件1类型"
      },
      {
        "url": "图片2URL",
        "filename": "文件2名",
        "size": "文件2大小",
        "mimetype": "文件2类型"
      }
    ]
  }
  ```

## 8. 管理员相关接口

### 8.1 管理员登录
- **URL**: `/admin/auth/login`
- **方法**: `POST`
- **权限**: 公开
- **请求体**:
  ```json
  {
    "username": "管理员用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "adminInfo": {
        "id": "管理员ID",
        "username": "管理员用户名",
        "role": "管理员角色"
      }
    }
  }
  ```

### 8.2 获取管理员信息
- **URL**: `/admin/auth/profile`
- **方法**: `GET`
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "_id": "管理员ID",
      "username": "管理员用户名",
      "role": "管理员角色",
      "lastLogin": "最后登录时间"
    }
  }
  ```

### 8.3 更多管理员接口
管理员接口众多，包括管理食堂、窗口、菜品、评论、消息等，详见代码中的`adminRoutes.js`文件。

## 9. 错误码说明

```
// 通用错误
PARAM_ERROR: 1001,         // 参数错误
UNAUTHORIZED: 1002,        // 未授权
FORBIDDEN: 1003,           // 禁止访问

// 用户相关错误
USER_NOT_EXIST: 2001,      // 用户不存在
PASSWORD_ERROR: 2002,      // 密码错误
USERNAME_EXIST: 2003,      // 用户名已存在
STAFF_ID_EXIST: 2004,      // 工号已存在

// 餐厅相关错误
CANTEEN_NOT_EXIST: 3001,   // 餐厅不存在
WINDOW_NOT_EXIST: 3002,    // 窗口不存在
DISH_NOT_EXIST: 3003,      // 菜品不存在

// 其他错误
GENERAL_ERROR: 4001,       // 通用错误

// 评论相关错误
COMMENT_NOT_EXIST: 5001,   // 评论不存在
ALREADY_COMMENTED: 5002,   // 已经评论过

// 收藏相关错误
ALREADY_FAVORITE: 6001,    // 已经收藏
FAVORITE_NOT_EXIST: 6002,  // 收藏不存在

// 消息相关错误
MESSAGE_NOT_EXIST: 7001,   // 消息不存在
```

## 10. 响应格式说明

所有API响应均遵循以下格式：
```json
{
  "code": 0,           // 0表示成功，其他值表示错误码
  "message": "消息",    // 成功或错误消息
  "data": {}           // 响应数据，可能是对象、数组或null
}
```

## 11. 职工菜品管理接口

### 11.1 获取菜品列表（职工）
- **URL**: `/worker/dish`
- **方法**: `GET`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **参数**: 
  - `page`: 页码(默认1)
  - `pageSize`: 每页数量(默认10)
  - `canteenId`: 食堂ID(可选)
  - `windowId`: 窗口ID(可选)
  - `keyword`: 关键词(可选)
  - `tags`: 标签(可选)
  - `sortBy`: 排序字段(默认createdAt)
  - `sortOrder`: 排序方式(asc/desc，默认desc)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "total": 100,
      "list": [
        {
          "_id": "菜品ID",
          "name": "菜品名称",
          "description": "菜品描述",
          "image": "菜品图片",
          "price": 15.5,
          "windowId": {
            "_id": "窗口ID",
            "name": "窗口名称"
          },
          "canteenId": {
            "_id": "食堂ID",
            "name": "食堂名称"
          },
          "tags": ["标签1", "标签2"],
          "status": "available"
        }
      ]
    }
  }
  ```

### 11.2 批量获取所有菜品（职工，无分页）
- **URL**: `/worker/dish/all`
- **方法**: `GET`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **参数**: 
  - `canteenId`: 食堂ID(可选)
  - `windowId`: 窗口ID(可选)
  - `keyword`: 关键词(可选)
  - `tags`: 标签(可选)
  - `status`: 状态(可选)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "菜品ID",
        "name": "菜品名称",
        "description": "菜品描述",
        "image": "菜品图片",
        "price": 15.5,
        "windowId": {
          "_id": "窗口ID",
          "name": "窗口名称"
        },
        "canteenId": {
          "_id": "食堂ID",
          "name": "食堂名称"
        },
        "tags": ["标签1", "标签2"],
        "status": "available"
      }
    ]
  }
  ```

### 11.3 获取窗口下所有菜品（职工）
- **URL**: `/worker/dish/window/:windowId`
- **方法**: `GET`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "_id": "菜品ID",
        "name": "菜品名称",
        "description": "菜品描述",
        "image": "菜品图片",
        "price": 15.5,
        "tags": ["标签1", "标签2"],
        "status": "available",
        "rating": 4.8,
        "ratingCount": 25
      }
    ]
  }
  ```

### 11.4 创建菜品（职工）
- **URL**: `/worker/dish`
- **方法**: `POST`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "菜品名称",
    "description": "菜品描述",
    "image": "菜品图片URL",
    "price": 15.5,
    "windowId": "窗口ID",
    "canteenId": "食堂ID",
    "tags": ["标签1", "标签2"]
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "创建成功",
    "data": {
      "_id": "菜品ID",
      "name": "菜品名称"
    }
  }
  ```

### 11.5 更新菜品（职工）
- **URL**: `/worker/dish/:id`
- **方法**: `PUT`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "菜品名称",
    "description": "菜品描述",
    "image": "菜品图片URL",
    "price": 15.5,
    "status": "available",
    "tags": ["标签1", "标签2"]
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "更新成功",
    "data": null
  }
  ```

### 11.6 删除菜品（职工）
- **URL**: `/worker/dish/:id`
- **方法**: `DELETE`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "删除成功",
    "data": null
  }
  ```

### 11.7 更新菜品状态（职工）
- **URL**: `/worker/dish/:id/status`
- **方法**: `PUT`
- **权限**: 需要职工权限
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "status": "soldout" // 可选值: "available"(可购买), "soldout"(已售罄)
  }
  ```
- **响应**:
  ```json
  {
    "code": 0,
    "message": "状态更新成功",
    "data": null
  }
  ```
