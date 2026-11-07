var api = require('../../utils/api.js');

Page({
  data: {
    activity: {
      id: '1',
      title: '篝火晚会',
      status: '报名中',
      date: '2026-06-29',
      zone: '湖畔营地',
      quota: 50,
      joined: 32,
      description: '在星空下围坐篝火，享受音乐、烧烤和轻松愉快的营地氛围。适合家庭、情侣和朋友聚会。'
    },
    loading: false,
    signedUp: false,
    formName: '',
    formPhone: '',
    submitting: false
  },

  onLoad: function (options) {
    this.activityId = options.id;
  },

  onNameInput: function (e) {
    this.setData({ formName: e.detail.value });
  },

  onPhoneInput: function (e) {
    this.setData({ formPhone: e.detail.value });
  },

  doSignup: function () {
    var that = this;
    var formName = that.data.formName;
    var formPhone = that.data.formPhone;

    if (!formName || !formName.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!formPhone || !/^1[3-9]\d{9}$/.test(formPhone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    wx.showToast({ title: '报名成功！', icon: 'success' });
    that.setData({ signedUp: true, submitting: false });
  },

  doCancel: function () {
    var that = this;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showToast({ title: '已取消', icon: 'success' });
          that.setData({ signedUp: false });
        }
      }
    });
  }
});