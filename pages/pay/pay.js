var util = require('../../utils/util.js')  //引入公共js文件util.js
var app = getApp()

var getAD = function (that) {  //获取报名页广告图
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getAD',
    data: {
      "type": "home and activity"
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          yuding: res.data
        })
      }
    }
  })
}



Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: true,  
    needyx:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    
    // -------------  获取报名广告图片  ------------------
    getAD(that);
    //------------ 处理授权  ---------- 
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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

  submitForm: function (e) {
    console.log(e);
    var that = this;
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
    

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
    var l = 'https://m.xxiangfang.com/index.php/Home/XiaoApi/send_msg';
    //var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + that.data.access_token;  //微信规定：api.weixin.qq.com域名不能直接调，只能后台发起调用
      console.log(typeof (e.detail.value.price));
    if (e.detail.value.price == 0 || e.detail.value.price == '') {
      
      util.confirm('请输入金额?')
    } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.phone)) {
      util.confirm('请输入有效11位手机号码!')
    }else {   //报名参加youxue活动--传参
      wx.showModal({
        title: '提示',
        content: '确认要支付吗？',
        success: function (sm) {
          //http://www.xxf.cn/index.php/QiyiXCC/YouXue/new_make_order
          if (sm.confirm) {
            // 用户点击了确定 可以调用方法了,除开’套餐‘，’众筹‘
              wx.request({
                url: 'https://m.xxiangfang.com/index.php/Home/xiaoxxf/make_order_common',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: { 
                  openid: wx.getStorageSync('openid'),
                  data_total: e.detail.value.price,
                  nickname: userInfo.nickName,
                  avatar: userInfo.avatarUrl,
                  phone:e.detail.value.phone
                  },
                success: function (res) {
                  console.log();
                  console.log(res.data);//return ;
                  if (res.data.state == 1) {
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
                        // util.confirm('支付成功！')
                        wx.navigateBack({

                          delta: -1

                        })
                        // wx.redirectTo({  //跳转到应用内页面（次页面）
                        //   url: '../activity_detail/activity_detail?id=' + that.data.a_id,
                        //   success: function (res) { },
                        //   fail: function (res) { },
                        //   complete: function (res) { }
                        // }),

                          // -----支付成功=》向用户发送微信推送 2、发送短信  -------------

                          // wx.request({
                          //   url: l,   //XiaoApi/send_msg
                          //   data: {
                          //     "type": "join_pay",
                          //     access_token: that.data.access_token,
                          //     touser: wx.getStorageSync('openid'),
                          //     template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                          //     page: '/pages/index/index',
                          //     form_id: fId,
                          //     keyword1: e.detail.value.data_num,
                          //     keyword2: that.data.unitPrice * e.detail.value.data_num,
                          //     keyword3: that.data.order_id,
                          //     keyword4: e.detail.value.data_name + '您好,您参与的活动:' + that.data.act_name + ',已支付成功,活动时间:' + that.data.Start_time + ' - ' + that.data.End_time + ',请记得及时参加哦',
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
                        //请求服务器发送短信
                        wx.request({
                          url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                          data: {
                            'type': 'pay_common',
                            "id": that.data.order_id,
                            'openid': wx.getStorageSync('openid')
                          },
                          header: {
                            'Content-Type': 'application/json'
                          },
                          method: 'GET',
                          success: function (res) {
                            if (res.data.code == 1) {
                              console.log(res.data.msg);
                              //将返回的insertID写入data，供下面submit校验
                              that.setData({
                                insertID: res.data.msg
                              })
                            } else if (res.data.code == 0) {
                              console.log(res.data.msg);;
                            } else {
                              console.log(res.data.msg);
                            }
                          },
                          fail: function (res) {
                            console.log('发送失败~');
                          },
                          complete: function (res) { },
                        });
                      },
                      'fail': function (res) {
                        console.log(res.errMsg);
                      },
                      'complete': function (res) {
                        console.log(res.errMsg);
                      }
                    })
                
                  } else if (res.data.state == 0) {
                    
                    util.confirm(res.data.Msg)
                  } else {
                    
                    util.confirm('系统繁忙，请稍后重试~')
                  }

                },
                fail: function (res) {  //make_order2第三方自定义方法失败

                }
              })
            
          }
        }
      })

    } 
  }

  },


})