var util = require('../../utils/util.js')  //引入公共js文件util.js
var Getlist = function(that){//全部订单
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/order_list', 
    data: {
      "order_type": that.data.order_type,
      "openid": wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      that.setData({
        homeorderList: res.data
      })
      console.log(res.data);
    }
  })
}
var Getlist1 = function (that) {//未付款
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/order_list', 
    data: {
      "order_type": that.data.order_type,
      "order_status":"wait",
      "openid": wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      that.setData({
        homeorderList: res.data
      })
      console.log(res.data);
    }
  })
}
var Getlist2 = function (that) {//已完成
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/order_list', 
    data: {
      "order_type": that.data.order_type,
      "order_status": "ok",
      "openid": wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      that.setData({
        homeorderList: res.data
      })
      console.log(res.data);
    }
  })
}
var Getlist3 = function (that) {//待评价
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/order_list',
    data: {
      "order_type": that.data.order_type,
      "order_status": "stand_comment",
      "openid": wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      that.setData({
        homeorderList: res.data
      })
      console.log(res.data);
    }
  })
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
    that.setData({
      order_type: options.order_type      //订单类型，home或activity
    })
    // Getlist(that);
  },
  // 再次发起支付请求，调用后台PHP
  pay_again: function (e) {
    var that = this;
    that.setData({
      order_id: e.currentTarget.dataset.name,
      goods: e.currentTarget.dataset.goods,
      days: e.currentTarget.dataset.days,
      fee: e.currentTarget.dataset.fee,
      mobile: e.currentTarget.dataset.mobile
    })
    console.log('客房订单id = ' + that.data.mobile);
    wx.showModal({
      title: '提示',
      content: '确定要支付吗？',
      success: function (sm) {
        if (sm.confirm) {
    //调用PHP请求，发起支付
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/pay_again',
      data: {
        "order_id": that.data.order_id,  //房间订单id(两者选其一)
        "openid": wx.getStorageSync('openid')
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);

        if (res.data.state == 1) {    //酒店预支付支付成功
          // --------- 【微信预支付】统一下单订单生成成功，发起支付请求 -----------------
          that.setData({
            order_id: res.data.out_trade_no  //微信返回用户自定义订单号
          })

          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,   //字符串随机数
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            'success': function (res) {   //酒店支付成功，需要推送消息
              console.log(res.errMsg);    //requestPayment:ok==>调用支付成功
              
              wx.redirectTo({  //跳转到应用内页面（次页面）
                url: '../success/success?kind=1',   //活动是2，房间是1
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { }
              }),
                //请求服务器发送短信
                wx.request({
                  url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                  data: {
                    'mobile': that.data.mobile,
                    'goods': that.data.goods,
                    'days': that.data.days,
                    'fee': that.data.fee,
                    'type': 'pay_again_home',
                    "order_id":that.data.order_id,
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
                })

            }
          })
        }
      },
      fail: function (res) {
        console.log('pay_again调用失败~');
      },
      complete: function (res) { },
    })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShow: function () {
    var selected = this.options.selected
    console.log(selected)
    var that = this
    switch(selected){
      case '1':
        that.selected()    
        break;
      case '2':
        that.selected1()  
        break;
      case '3':
        that.selected2()  
        break;
      case '4':
        that.selected3()  
        break;
      default:
        that.selected()
        break;
    }
  },
  //申请退款 -xzz1008
  refund:function(e){
    var that = this;
      that.setData({
        order_id: e.currentTarget.dataset.oid,
      })
      console.log('退款订单id = ' + that.data.order_id);
      wx.showModal({
        title: '提示',
        content: '确定要申请退款吗？',
        success: function (sm) {
          if (sm.confirm) {
            //调用PHP请求，发起支付
            wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/home_refund',
            //url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/refund',
              data: {
                  "type":"home",
                  "order_id":that.data.order_id,
                  "openid":wx.getStorageSync("openid"),
              },
              header: {
                'Content-Type': 'application/json'
                //"Content-Type": "application/x-www-form-urlencoded"
              },
              method: 'GET',
              //method: 'POST',
              success: function(res) {
                console.log(res);
                if(res.data.state==0){//备选流
                  
                  util.confirm(res.data.msg)
                }else{//基本流
                  that.setData({
                    homeorderList: res.data,
                  })
                }
              },
              fail: function(res) {},
              complete: function(res) {},
            })
          }
        }
      })
  },

  data: {
    selected: true,
    selected1: false,
    selected2: false,
  },
  selected: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    that.setData({
      selected: true,
      selected1: false,
      selected2: false,
      selected3: false,
    })
    Getlist(that);
  },
  selected1: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    that.setData({
      selected: false,
      selected2: false,
      selected1: true,
      selected3: false,
    })
    Getlist1(that);
  },
  selected2: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 800
    })
    that.setData({
      selected: false,
      selected2: true,
      selected1: false,
      selected3: false,
    })
    Getlist2(that);
  },
    selected3: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 800
    })
    that.setData({
      selected: false,
      selected2:false,
      selected3: true,
      selected1: false,
    })
    Getlist3(that);
  }


})