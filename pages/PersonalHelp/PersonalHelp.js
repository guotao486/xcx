// pages/PersonalHelp/PersonalHelp.js
var util = require('../../utils/util.js')  //引入公共js文件util.js
var app = getApp()
var loginStatus = true;//默认授权成功
var getPromission = function (that) {
  util.getPromission(that, app);
}
var sms = function (that, type, order_id) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms',
    data: {
      'order_id': order_id,
      'type': type,
      'openid': wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      console.log(res);
    },
    complete: function (res) { },
  })
}
var page=1;
var url ='https://m.xxiangfang.com/index.php';
// var url = 'http://www.xxf.cn/index.php';
var getDonationList = function(that,page) {
  wx.request({
    url: url+'/Home/Xiaoxxf/donationList',
    data: {
      'page': page,
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      that.setData({
        donationList: res.data.data.list,
        last:res.data.data.last,
      })
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
  },
  checkDigit:function(e){
    var num = e.detail.value.split('.');
    if(num[1]){
      num[1] = num[1].substring(0, 2)
      this.setData({
        money: num[0]+'.'+num[1]
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1500
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
    // ------------- 1.5、检查用户授权态 ------------------
  },
  /** 弹窗*/
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
       * 隐藏模态对话框
       */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  /** 对话框取消按钮点击事件*/
  onCancel: function () {
    this.hideModal();
  },

  /* 对话框确认按钮点击事件*/
  submitForm: function (e) {
    var that = this;
    console.log(e)
    
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

    var fId = e.detail.formId;
    var fObj = e.detail.value;
    var l = url+'/Home/XiaoApi/send_msg';//微信推送模板
    //var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + that.data.access_token;  //微信规定：api.weixin.qq.com域名不能直接调，只能后台发起调用

    
    if (e.detail.value.data_name.length <= 0 || e.detail.value.data_name.length > 20) {
      
      util.confirm('姓名在1~20字之间!')
    } else if (e.detail.value.data_money == 0 || e.detail.value.data_money == 0.00){
      
      util.confirm('请输入捐赠金额!')
    } else {
      //调用应用实例的方法获取全局数据
      app.getUserInfo(function (userInfo) {
        console.log(userInfo);
        if (userInfo == null) {//拒绝授权
          console.log('ccc');
          getPromission(that);
        } else {                 //授权
          that.setData({
            userInfo: userInfo,
          })
          wx.request({
            url: url + '/Home/Xiaoxxf/make_donation',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              openid: wx.getStorageSync('openid'),
              data_name: e.detail.value.data_name,
              data_money: e.detail.value.data_money,
              data_content: e.detail.value.data_content,
              avatarurl: app.globalData.userInfo.avatarUrl,
              XDEBUG_SESSION_START: 19858,
            },
            success: function (res) {
              console.log(res.data)
              if (res.data.state == 1) {
                that.hideModal();
                console.log(res.data.out_trade_no);
                that.setData({
                  order_id: res.data.out_trade_no  //订单号
                })
                // --------- 【微信预支付】统一下单订单生成成功，发起支付请求 ------------------
                wx.requestPayment({
                  timeStamp: res.data.timeStamp,
                  nonceStr: res.data.nonceStr,   //字符串随机数
                  package: res.data.package,
                  signType: res.data.signType,
                  paySign: res.data.paySign,
                  'success': function (res) {
                    console.log(res.errMsg);    //requestPayment:ok==>调用支付成功
                    // wx.redirectTo({  //跳转到应用内页面（次页面）
                    //   url: '../success/success?kind=' + that.data.kind,
                    //   success: function (res) { },
                    //   fail: function (res) { },
                    //   complete: function (res) { }
                    // })
                    wx.redirectTo({  //跳转到应用内页面（次页面）
                      url: '../PersonalHelp/PersonalHelp',
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { }
                    })

                    // // -----支付成功=》向用户发送微信推送 2、发送短信  -------------
                    // wx.request({
                    //   url: l,   //XiaoApi/send_msg()
                    //   data: {
                    //     "type": "join_pay",
                    //     access_token: that.data.access_token,
                    //     touser: wx.getStorageSync('openid'),
                    //     template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                    //     page: '/pages/index/index',
                    //     form_id: fId,
                    //     keyword1: e.detail.value.data_num || 1,
                    //     keyword2: that.data.data_num * that.data.score,//套餐总金额
                    //     keyword3: that.data.order_id,
                    //     keyword4: e.detail.value.data_name + '您好,您参与的活动' + that.data.act_name + ',已支付成功，活动时间:' + that.data.Start_time + ' - ' + that.data.End_time + ',请记得及时参加哦~',
                    //     color: '#ccc',
                    //     emphasis_keyword: 'keyword1.DATA'
                    //   },
                    //   header: {
                    //     "Content-Type": "application/x-www-form-urlencoded"
                    //   },
                    //   method: 'POST',
                    //   success: function (res) {
                    //     console.log(res.data);
                    //   },
                    //   fail: function (err) {
                    //     console.log(err);
                    //   }
                    // });
                    // //请求服务器发送短信
                    // wx.request({
                    //   url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                    //   data: {
                    //     'type': 'pay_activity',
                    //     "111jid": that.data.order_id,
                    //     'openid': wx.getStorageSync('openid')
                    //   },
                    //   header: {
                    //     'Content-Type': 'application/json'
                    //   },
                    //   method: 'GET',
                    //   success: function (res) {
                    //     if (res.data.code == 1) {
                    //       console.log(res.data.msg);
                    //       //将返回的insertID写入data，供下面submit校验
                    //       that.setData({
                    //         insertID: res.data.msg
                    //       })
                    //     } else if (res.data.code == 0) {
                    //       console.log(res.data.msg);;
                    //     } else {
                    //       console.log(res.data.msg);
                    //     }
                    //   },
                    //   fail: function (res) {
                    //     console.log('发送失败~');
                    //   },
                    //   complete: function (res) { },
                    // });
                  },
                  'fail': function (res) {
                    console.log(res.errMsg);
                  },
                  'complete': function (res) {
                    console.log(res.errMsg);
                  }
                })
              } else if (res.data.code == 400) {   //不成功
                
                util.confirm(res.data.Msg)
              } else {
               
                util.confirm('系统繁忙请再试')
              }
            },
            fail: function (res) {  //make_order2第三方自定义方法失败
              
              util.confirm(res.data.Msg)
            }
          })
        }
      })
    }
  },

  /* 生命周期函数--监听页面初次渲染完成*/
  
  onReady: function () {
    var that = this;
    // ------------- 2、获取后台请求微信的access_token ------------------
    wx.request({
      url: url+'/Home/XiaoApi/get_accessToken',
      data: '',
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        //console.log(res.data);
        that.setData({
          access_token: res.data
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    
    wx.request({
      url: url+'/Home/Xiaoxxf/donationInfo',
      data: {
        
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          info: res.data.data,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    getDonationList(this,1);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    page++;
    getDonationList(this,page);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})