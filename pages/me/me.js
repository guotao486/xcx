var util = require('../../utils/util.js')
var app = getApp()
var loginStatus = true;//默认授权成功
var getPromission = function (that) {
  util.getPromission(that, app);
}

Page({
  data: {
    motto: 'Hello World',
    showModal: false,
    userInfo: {}
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
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: ''
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据，如果用户首次拒绝，那么这里的数据就是null
    // app.getUserInfo(function (userInfo) {
    //   console.log(userInfo);
    //   //更新数据
    //   console.log(that.data.openid);
    // })
    

    /**  根据openid获取space表对应user_type 4=》团体用户  */
    
  },
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    //调用应用实例的方法获取全局数据
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoVip/getUserType',
        data: {
          "type": "vip_user_type",
          "openid": wx.getStorageSync("openid")
        },
        method: 'GET',
        success: function (res) {//未授权，res.data=='您的账户未授权，请您从新进入并授权'
          console.log(res.data);
          that.setData({
            user_type: res.data
          })

        },
      })
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/check_bind',
        data: {
          "openid": wx.getStorageSync("openid")
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log(res);
          that.setData({
            checkBind: res.data.code
          })
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
    
  },
  check_bind:function(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认要绑定手机吗？',
      success: function (sm) {
        if (sm.confirm) {
            // 用户点击了确定 可以调用方法了,除开’套餐‘，’众筹‘

    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/check_bind',
      data: {
        "openid":wx.getStorageSync("openid")
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function(res) {
        console.log(res);
        that.setData({
          checkBind: res.data.code
        })
        wx.navigateTo({
          url: '../bindMobile/bindMobile?code=' + res.data.code+'&msg='+res.data.msg  //调到bindMobile传参
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
        }
      }
    })
  }

  
})