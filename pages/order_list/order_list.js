// pages/order_list/order_list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
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
    that.setData({
      order_type: options.order_type      //订单类型，home或activity
    })
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/order_list', //发送短信接口,
      data: {
        "order_type":options.order_type,
        "openid":wx.getStorageSync('openid') 
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function(res) {
        that.setData({
          orderList:res.data
        })
        console.log(res.data);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 再次发起支付请求，调用后台PHP
  pay_again:function(e){
    var that = this;
    that.setData({
      jid: e.currentTarget.dataset.name,
      act_name: e.currentTarget.dataset.act,
      act_fee: e.currentTarget.dataset.fee,
      mobile: e.currentTarget.dataset.mobile
    })
    console.log('活动订单id = ' + that.data.mobile);
    wx.showModal({
      title: '提示',
      content: '确定要支付吗？',
      success: function (sm) {
        if (sm.confirm) {
    //调用PHP请求，发起支付
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/pay_again',
      data: {
       "jid":that.data.jid,   //活动订单id
       "openid": wx.getStorageSync('openid')
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function(res) {
        console.log(res.data);

        if (res.data.state == 1) {    //活动预支付支付成功
          // --------- 【微信预支付】统一下单订单生成成功，发起支付请求 -----------------
          that.setData({
            order_id: res.data.out_trade_no  //订单号
          })

          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,   //字符串随机数
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            'success': function (res) {  
              console.log(res.errMsg);    //requestPayment:ok==>调用支付成功
              
              wx.redirectTo({  //跳转到应用内页面（次页面）
                url: '../success/success?kind=2',   //活动是2，房间是1
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { }
              }),
                //请求服务器发送短信
                wx.request({
                  url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                  data: {
                    'mobile': that.data.mobile,
                    'jid': that.data.jid, //活动订单id
                    'act_name': that.data.act_name,
                    'act_fee': that.data.act_fee,
                    'type': 'pay_again_activity',
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
      fail: function(res) {
        console.log('pay_again调用失败~');
      },
      complete: function(res) {},
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
  
  }

})