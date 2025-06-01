<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">隐私政策</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y>
      <view class="policy-container">
        <view class="policy-title">掌上食堂隐私政策</view>
        <view class="policy-date">更新日期：2023年12月1日</view>
        
        <view class="policy-section">
          <view class="section-title">1. 引言</view>
          <view class="section-content">
            <view class="paragraph">
              感谢您使用掌上食堂应用程序。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">2. 我们如何收集和使用您的个人信息</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">2.1 账号信息</text>
              当您注册掌上食堂账号时，我们会收集您的手机号码、学号或工号、姓名等信息，用于创建账号并提供相关服务。
            </view>
            <view class="paragraph">
              <text class="bold">2.2 位置信息</text>
              为了向您提供更准确的食堂和窗口信息，我们可能会收集您的位置信息。您可以通过设备的设置功能随时关闭定位功能。
            </view>
            <view class="paragraph">
              <text class="bold">2.3 订单信息</text>
              当您使用我们的点餐服务时，我们会收集您的订单信息，包括所选菜品、支付金额、配送地址等，以便完成订单处理和配送服务。
            </view>
            <view class="paragraph">
              <text class="bold">2.4 评价信息</text>
              当您对食堂或菜品进行评价时，我们会收集您提供的评分、评论内容和上传的图片，用于展示给其他用户参考。
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">3. 我们如何使用Cookie和同类技术</view>
          <view class="section-content">
            <view class="paragraph">
              Cookie和同类技术是我们为了提供更好的服务体验而使用的常见技术。当您使用我们的应用程序时，我们可能会使用这些技术来存储您的偏好设置、记录您的浏览数据，以便为您提供个性化的服务和内容推荐。
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">4. 我们如何共享、转让、公开披露您的个人信息</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">4.1 共享</text>
              我们不会与任何公司、组织和个人共享您的个人信息，但以下情况除外：
              <view class="list-item">- 在获取明确同意的情况下共享：获得您的明确同意后，我们会与其他方共享您的个人信息。</view>
              <view class="list-item">- 在法定情形下的共享：根据法律法规、法律程序、诉讼或政府主管部门强制性要求。</view>
            </view>
            <view class="paragraph">
              <text class="bold">4.2 转让</text>
              我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：
              <view class="list-item">- 在获取明确同意的情况下转让：获得您的明确同意后，我们会向其他方转让您的个人信息。</view>
              <view class="list-item">- 在涉及合并、收购或破产清算时，如涉及到个人信息转让，我们会要求新的持有您个人信息的公司、组织继续受此隐私政策的约束。</view>
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">5. 我们如何保护您的个人信息</view>
          <view class="section-content">
            <view class="paragraph">
              我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">6. 您的权利</view>
          <view class="section-content">
            <view class="paragraph">
              按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
              <view class="list-item">- 访问您的个人信息</view>
              <view class="list-item">- 更正您的个人信息</view>
              <view class="list-item">- 删除您的个人信息</view>
              <view class="list-item">- 撤回同意</view>
              <view class="list-item">- 注销账号</view>
              <view class="list-item">- 获取个人信息副本</view>
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">7. 本隐私政策如何更新</view>
          <view class="section-content">
            <view class="paragraph">
              我们可能会根据产品和服务的更新情况，不时更新本隐私政策。当我们对隐私政策作出重大变更时，我们会在应用程序中显著位置发布变更通知。您可以在应用程序的设置页面查看最新版本的隐私政策。
            </view>
          </view>
        </view>
        
        <view class="policy-section">
          <view class="section-title">8. 如何联系我们</view>
          <view class="section-content">
            <view class="paragraph">
              如果您对本隐私政策有任何疑问、意见或建议，您可以通过以下方式与我们联系：
              <view class="list-item">- 电子邮件：privacy@zhangshangshitang.com</view>
              <view class="list-item">- 客服电话：400-123-4567</view>
            </view>
            <view class="paragraph">
              我们将在收到您的问题后30天内回复您的请求。
            </view>
          </view>
        </view>
        
        <view class="policy-footer">
          感谢您花时间了解我们的隐私政策。掌上食堂重视您的隐私保护，我们将继续致力于保护您个人信息的安全。
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.status-bar {
  width: 100%;
  height: var(--status-bar-height);
  background-color: #ffffff;
}

.nav-header {
  position: relative;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
  z-index: 100;

  .back-icon {
    position: absolute;
    left: 20rpx;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.03);
    font-size: 40rpx;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
    
    .iconfont {
      font-size: 36rpx;
    }
  }

  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -8rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background-color: #34c759;
      border-radius: 3rpx;
      opacity: 0.8;
    }
  }
}

.content-scroll {
  height: calc(100vh - 90rpx - var(--status-bar-height));
  width: 100%;
  box-sizing: border-box;
}

.policy-container {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: calc(100% - 60rpx);
  box-sizing: border-box;
}

.policy-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10rpx;
}

.policy-date {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}

.policy-section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .section-content {
    .paragraph {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20rpx;
      text-align: justify;
      
      .bold {
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 10rpx;
      }
      
      .list-item {
        margin-top: 10rpx;
        padding-left: 20rpx;
      }
    }
  }
}

.policy-footer {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-top: 60rpx;
  line-height: 1.6;
  padding: 0 20rpx;
}
</style>