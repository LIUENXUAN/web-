Page({
  data: {
    loggedIn: false,
    userName: '',
    signups: [
      { id: '1', name: '篝火晚会', phone: '138****8000', createdAt: '2026-06-28' }
    ],
    loading: false
  },

  onShow: function () {
    var app = getApp();
    if (app.globalData.openid) {
      this.setData({ loggedIn: true, userName: app.globalData.userInfo || '微信用户' });
    }
  },

  doLogin: function () {
    var that = this;
    wx.showLoading({ title: '登录中...' });
    setTimeout(function () {
      wx.hideLoading();
      var app = getApp();
      app.globalData.openid = 'test_openid';
      app.globalData.userInfo = '微信用户';
      that.setData({ loggedIn: true, userName: app.globalData.userInfo });
      wx.showToast({ title: '登录成功', icon: 'success' });
    }, 1000);
  },

  goFeedback: function () {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  goDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});