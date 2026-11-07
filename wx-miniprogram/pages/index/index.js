Page({
  data: {
    activities: [],
    loading: true
  },

  onLoad: function() {
    console.log('index page loaded');
    var that = this;
    setTimeout(function() {
      that.setData({
        loading: false,
        activities: [
          { id: '1', title: '篝火晚会', status: '报名中', date: '2026-06-29', zone: '湖畔营地', quota: 50, joined: 32 },
          { id: '2', title: '星空观测', status: '报名中', date: '2026-06-30', zone: '星空营地', quota: 30, joined: 18 }
        ]
      });
    }, 500);
  },

  goDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  }
});