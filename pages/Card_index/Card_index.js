var util = require('../../utils/util.js')
var app = getApp()
var msg = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoCard/onload',
    data: {
      'type': 'total',
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
          num: res.data,
        })
      }
    }
  });
}
var total = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoCard/onload',
    data: {
      'type': 'index',
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
          total: res.data.total,
          act: res.data.act,//所有卡券活动列表
        })
      }
    }
  });
}

Page({

  data: {
    num:0,
    total:0,
    act:'',
  },

  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    total(that);//获取当前活动
    msg(that);//获取用户所有卡券
  },

  onReady: function () {
  
  },
  onGotUserInfo: function (e) {
    var that = this;
    util.onGotUserInfo(that, app, e);
  },
  onCancel: function () {
    this.setData({
      showModal: false
    });
  },
  onShowModal: function () {
    this.setData({
      showModal: true
    })
  },
  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo) {
      this.onShowModal()
    }
  },

  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 卡券',
      desc: '一间西厢房，心安即吾乡',
      path: '/pages/Card_index/Card_index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})