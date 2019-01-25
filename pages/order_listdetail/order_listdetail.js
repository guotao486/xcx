Page({

  /**
   * 页面的初始数据
   */
  data: {
    jid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1200
    })
    that.setData({
      jid:options.jid
    })
    console.log(options.jid);
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/act_order_detail?jid='+options.jid,
      data: '',
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function(res) {
        that.setData({
          order_msg:res.data    //活动订单详情
        })
        console.log(res.data);
      },
      fail: function(res) {},
      complete: function(res) {},
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
  
  },

  surplusPay:function(){
    var that = this
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/xiaoxxf/make_order_surplus',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: { jid: this.options.jid, openid: wx.getStorageSync('openid')},
      success: function (res) {
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
              wx.redirectTo({  //跳转到应用内页面（次页面）
                url: '../order_list/order_list?order_type=activity&openid=' + wx.getStorageSync('openid'),
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { }
              })
            },
            'fail': function (res) {
              console.log(res.errMsg);
            },
            'complete': function (res) {
              console.log(res.errMsg);
            }
          })
        } else if (res.data.state == 4) {

          util.confirm(res.data.msg)
        } else {

          util.confirm('系统繁忙，请稍后重试~')
        }

      },
      fail: function (res) {  //make_order2第三方自定义方法失败

      }
    })
  }
})