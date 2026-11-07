Page({
  data: {
    name: '',
    content: '',
    submitting: false
  },

  onNameInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  onContentInput: function (e) {
    this.setData({ content: e.detail.value });
  },

  doSubmit: function () {
    var that = this;
    var content = that.data.content;

    if (!content || !content.trim()) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }

    wx.showToast({ title: '反馈已提交，感谢您！', icon: 'success' });
    that.setData({ name: '', content: '', submitting: false });
    setTimeout(function () {
      wx.navigateBack();
    }, 1500);
  }
});