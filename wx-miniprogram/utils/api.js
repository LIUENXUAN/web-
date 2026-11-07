const API_BASE = 'http://127.0.0.1:8080/api';

// 微信登录
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: API_BASE + '/wx/login',
            method: 'POST',
            data: { code: res.code },
            success(r) {
              if (r.data && r.data.code === 200) {
                const app = getApp();
                app.globalData.openid = r.data.data.openid;
                app.globalData.token = r.data.data.token;
                resolve(r.data.data);
              } else {
                reject(r.data.msg || '登录失败');
              }
            },
            fail: () => reject('网络错误')
          });
        } else {
          reject('获取 code 失败');
        }
      },
      fail: () => reject('微信登录失败')
    });
  });
}

// 获取活动列表
function getActivities() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/wx/activities',
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data.data);
        } else {
          reject(r.data.msg || '获取失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

// 获取活动详情
function getActivity(id) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/wx/activities/' + id,
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data.data);
        } else {
          reject(r.data.msg || '获取失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

// 报名活动
function signupActivity(activityId, name, phone) {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/wx/activities/' + activityId + '/signup',
      method: 'POST',
      data: {
        openid: app.globalData.openid,
        name: name,
        phone: phone
      },
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data.data);
        } else {
          reject(r.data.msg || '报名失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

// 取消报名
function cancelSignup(activityId) {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/wx/activities/' + activityId + '/signup',
      method: 'DELETE',
      data: { openid: app.globalData.openid },
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data);
        } else {
          reject(r.data.msg || '取消失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

// 我的报名
function getMySignups() {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/wx/my/signups?openid=' + app.globalData.openid,
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data.data);
        } else {
          reject(r.data.msg || '获取失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

// 提交反馈
function submitFeedback(name, content) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + '/feedback',
      method: 'POST',
      data: { name: name, content: content },
      success(r) {
        if (r.data && r.data.code === 200) {
          resolve(r.data);
        } else {
          reject(r.data.msg || '提交失败');
        }
      },
      fail: () => reject('网络错误')
    });
  });
}

module.exports = {
  wxLogin: wxLogin,
  getActivities: getActivities,
  getActivity: getActivity,
  signupActivity: signupActivity,
  cancelSignup: cancelSignup,
  getMySignups: getMySignups,
  submitFeedback: submitFeedback
};
