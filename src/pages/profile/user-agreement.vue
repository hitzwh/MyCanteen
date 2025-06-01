<template>
  <view class="container">
    <!-- 顶部安全区域，适配不同手机状态栏 -->
    <view class="status-bar safe-area-inset-top"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-icon" @click="goBack">
        <text class="iconfont icon-reply-fill"></text>
      </view>
      <text class="header-title">用户协议</text>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y>
      <view class="agreement-container">
        <view class="agreement-title">掌上食堂用户协议</view>
        <view class="agreement-date">更新日期：2023年12月1日</view>
        
        <view class="agreement-section">
          <view class="section-title">1. 协议的接受与修改</view>
          <view class="section-content">
            <view class="paragraph">
              欢迎您使用掌上食堂服务。本协议是您与掌上食堂应用的开发者及运营方（以下简称"我们"）之间关于您使用掌上食堂应用及相关服务所订立的协议。
            </view>
            <view class="paragraph">
              您在使用我们的服务之前，请仔细阅读本协议。您通过点击"同意"或实际使用我们的服务，即表示您已充分理解并接受本协议的全部内容。如果您不同意本协议的任何内容，请不要注册或使用我们的服务。
            </view>
            <view class="paragraph">
              我们保留随时修改本协议的权利。当本协议条款发生变更时，我们会在应用内显著位置发布最新版本并提醒您。若您在协议修改后继续使用我们的服务，即表示您已同意修改后的协议内容。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">2. 账号注册与安全</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">2.1 账号注册</text>
              您在注册掌上食堂账号时，需要提供真实、准确、完整的个人信息。如个人信息发生变更，您应及时更新。
            </view>
            <view class="paragraph">
              <text class="bold">2.2 账号安全</text>
              您应妥善保管账号及密码信息，对于因账号密码泄露所导致的一切损失由您自行承担。如发现任何未经授权使用您账号的情况，应立即通知我们。
            </view>
            <view class="paragraph">
              <text class="bold">2.3 实名认证</text>
              为了确保校园食堂服务的安全性，我们可能要求您进行学生或教职工身份认证。您应当提供真实有效的认证信息。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">3. 服务内容与规则</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">3.1 服务内容</text>
              掌上食堂为用户提供校园食堂信息浏览、菜品查询、在线点餐、评价反馈等服务。具体服务内容以应用实际提供的功能为准。
            </view>
            <view class="paragraph">
              <text class="bold">3.2 服务规则</text>
              您在使用我们的服务时，必须遵守中华人民共和国相关法律法规及学校规定。您不得利用我们的服务从事任何违法或不当的活动，包括但不限于：
              <view class="list-item">- 发布虚假信息，误导或欺骗他人</view>
              <view class="list-item">- 侵犯他人知识产权或其他合法权益</view>
              <view class="list-item">- 传播淫秽、暴力、恐怖或其他违法信息</view>
              <view class="list-item">- 干扰或破坏系统正常运行</view>
              <view class="list-item">- 其他违反法律法规、社会公德的行为</view>
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">4. 用户内容</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">4.1 内容责任</text>
              您通过掌上食堂发布的评价、图片等内容由您自行负责，您应确保拥有发布该等内容的权利或已获得必要授权。
            </view>
            <view class="paragraph">
              <text class="bold">4.2 内容授权</text>
              您同意授予我们对您发布内容的全球性、免费、非独家、可转授权的使用许可，我们有权在提供服务所必需的范围内使用、复制、修改、改编、出版、翻译或创建衍生作品。
            </view>
            <view class="paragraph">
              <text class="bold">4.3 内容审核</text>
              我们有权但无义务对您发布的内容进行审核，对于违反法律法规、校规校纪或本协议的内容，我们有权采取删除、屏蔽等措施。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">5. 交易规则</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">5.1 订单生成</text>
              您通过掌上食堂提交的订单，经系统确认后即具有法律效力。您应当按照订单的约定完成支付及取餐。
            </view>
            <view class="paragraph">
              <text class="bold">5.2 订单取消</text>
              对于已生成的订单，您可以根据应用规定的时间和条件申请取消。超出规定时间或条件的，可能无法取消或需要承担相应的违约责任。
            </view>
            <view class="paragraph">
              <text class="bold">5.3 支付安全</text>
              您在使用支付功能时，应确保使用安全的支付环境，并妥善保管支付账号和密码。对于因您自身原因导致的支付风险和损失，我们不承担责任。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">6. 知识产权</view>
          <view class="section-content">
            <view class="paragraph">
              掌上食堂应用及相关服务中的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、代码等的知识产权归我们或相关权利人所有。未经我们或相关权利人的书面许可，任何人不得以任何方式使用、复制、修改、传播或发布上述内容。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">7. 免责声明</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">7.1 服务中断</text>
              我们会尽最大努力确保服务的连续性和安全性，但不能保证服务不会中断或没有故障。对于因不可抗力、计算机病毒或黑客攻击、系统不稳定、用户所在位置、用户关闭设备通信功能、其他类似情况导致的服务中断或故障，我们不承担责任。
            </view>
            <view class="paragraph">
              <text class="bold">7.2 信息准确性</text>
              我们会尽力确保应用中提供的食堂和菜品信息的准确性和及时性，但由于各种客观原因，实际情况可能与应用显示的信息有所差异，请以实际情况为准。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">8. 协议终止</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">8.1 主动终止</text>
              您可以通过注销账号的方式终止本协议。注销账号后，您将无法使用该账号及相关服务，且我们将依据法律法规的要求处理您的个人信息。
            </view>
            <view class="paragraph">
              <text class="bold">8.2 被动终止</text>
              如您严重违反本协议或相关法律法规，我们有权终止向您提供服务，并保留追究您法律责任的权利。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">9. 法律适用与争议解决</view>
          <view class="section-content">
            <view class="paragraph">
              本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，应友好协商解决；协商不成时，任何一方均可向我们所在地有管辖权的人民法院提起诉讼。
            </view>
          </view>
        </view>
        
        <view class="agreement-section">
          <view class="section-title">10. 其他条款</view>
          <view class="section-content">
            <view class="paragraph">
              <text class="bold">10.1 完整协议</text>
              本协议构成您与我们之间就使用掌上食堂服务达成的完整协议，取代您与我们先前就相同事项达成的任何口头或书面协议。
            </view>
            <view class="paragraph">
              <text class="bold">10.2 条款独立性</text>
              如本协议中的任何条款无论因何种原因完全或部分无效或不具有执行力，本协议的其余条款仍应有效并且有约束力。
            </view>
            <view class="paragraph">
              <text class="bold">10.3 联系方式</text>
              如您对本协议或我们的服务有任何问题，可以通过以下方式与我们联系：
              <view class="list-item">- 电子邮件：support@zhangshangshitang.com</view>
              <view class="list-item">- 客服电话：400-123-4567</view>
            </view>
          </view>
        </view>
        
        <view class="agreement-footer">
          感谢您阅读本协议。请您务必审慎阅读、充分理解各条款内容，特别是免除或者限制责任的条款。
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

.agreement-container {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: calc(100% - 60rpx);
  box-sizing: border-box;
}

.agreement-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10rpx;
}

.agreement-date {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}

.agreement-section {
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

.agreement-footer {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-top: 60rpx;
  line-height: 1.6;
  padding: 0 20rpx;
}
</style> 