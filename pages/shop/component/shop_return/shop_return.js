// pages/shop/component/shop_return/shop_return.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    content:'',
    areaIndex: 0,
    area: ['请选择', '不喜欢/不想要', '与卖家协商不一致', '未按照约定时间发货', '快递/物流一直未送达', '快递/物流无跟踪物流', "破损、少错件"],
  },

  bindPickerChange: function (e) {
    var that = this;
    console.log(e);
    this.setData({
      areaIndex: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      orderType: this.options.orderType
    })
    console.log(this.options)
    var orderId = this.options.orderId;
    var that = this
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/refundInfo',
      data: {
        openid: wx.getStorageSync('openid'),
        orderId: orderId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          that.setData({
            amount: res.data.data.amount,
            goods: res.data.data.goods,
          })
        }
      }
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  returnContent(e){
    this.data.content = e.detail.value;
  },
  returnSave(){
    var orderId = this.options.orderId;
    var content = this.data.content;
    if(content == ''){
      wx.showToast({
        title: '请填写退款原因',
        icon:'none'
      })
      return
    }
    var that = this
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderRefund',
      data: {
        openid: wx.getStorageSync('openid'),
        orderId: orderId,
        content: content
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          wx.showToast({
            title: res.data.msg,
            duration: 1000
          })
          setTimeout(
            function () {
              wx.navigateBack({
                delta: 1
              })
            }, 1000
          )
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration: 1000
          })
        }
      }
    })
  }
})