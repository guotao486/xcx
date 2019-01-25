var util = require('../../utils/util.js')
var app = getApp()
var loginStatus = true;//默认授权成功
var getPromission = function (that) {
  util.getPromission(that, app);
}
var msg = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoCard/onload',
    data: {
      'type': 'onload',
      'openid': wx.getStorageSync('openid'),
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      console.log(res);
      if (res.data == 'isnull') {

      } else {
        that.setData({
          cards: res.data,
        })
      }
    }
  });
}

Page({
  data: {
  
  },

  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    // ------------- 1、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
        if (res.errMsg == 'checkSession:ok') {

        }
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })
    //------------ 2、处理授权  ---------- 
    app.getUserInfo(function (userInfo) {
      console.log(userInfo);
      if (userInfo == null) {//拒绝授权
        console.log('ccc');
        getPromission(that);
      } else {                 //授权
        that.setData({
          userInfo: userInfo,
        })
      }
    })
    msg(that);//获取用户所有卡券
  },
  onSwitch: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onReady: function () {
  
  },

  onShow: function () {
  
  },

})