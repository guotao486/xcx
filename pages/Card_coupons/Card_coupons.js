var util = require('../../utils/util.js')
var app = getApp()
var loginStatus = true;//默认授权成功

Page({
  data: {
    data_date: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
    data_date_tip:'请选择入住时间',

  },
  datePickerBindchange: function (e) {
    var that = this;
    this.setData({
      data_date: e.detail.value,
      data_date_tip: e.detail.value,
    })
  } ,
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

  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    that.setData({
      id:options.id,//卡券活动id
    })
  },

  onReady: function () {
  
  },

  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo')
    var that = this;
    if (!userInfo) {
      that.onShowModal()
    }else{
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/xiaoUser/cardInfo',
        header: {
          "Content-Type": "application/json"
        },
        method: "get",
        data: {
          id:that.data.id
        },
        success: function (res) {
          that.setData({
            info:res.data
          })
        }
      })
    }
   
  },
  onSwitch:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  /**
  * 自定义方法，校验form数据
  */
  submitForm: function (e) {
    var that = this;
    console.log(e);
    // ------------- 3、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })

    if (e.detail.value.data_name.length <= 0 || e.detail.value.data_name.length > 20) {
      
      util.confirm('姓名在1~20字之间!')
    } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {
      
      util.confirm('手机号码有误!')
    } else if (!that.data.data_date ){
     
      util.confirm('日期不可为空')
    }else{
      var date1 = new Date(Date.parse(that.data.data_date.replace(/-/g, "/")));
      var date_in = date1.getTime();
      if (date_in < Date.parse(new Date()) - 86400000) {
        
        util.confirm('不能小于当前时间')
        return;
      }
      wx.showModal({
        title: '提示',
        content: '请确认申请,谢谢!',
        success: function (sm) {
          if (sm.confirm) {
            
            wx.request({
              url: 'https://m.xxiangfang.com/index.php/Home/XiaoCard/submit',
              data: {
                'data_id':that.data.id,//卡券活动id
                'data_name': e.detail.value.data_name,
                'data_phone': e.detail.value.data_phone,
                'data_date':date_in,
                'type': 'submit',
                'openid': wx.getStorageSync('openid'),
              },
              header: {
                'Content-Type': 'application/json'
              },
              method: 'GET',
              success: function (res) {
                console.log(res);
                if(res.data.state==1){
                  
                  util.confirm(res.data.msg)
                }else{
                  
                  util.confirm(res.data)
                }
              },
              complete: function (res) { },
            });
            return;            
          }
        }
      })
    }

  },


})