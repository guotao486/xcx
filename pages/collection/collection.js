var getCollection = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/v_collection',
    data: {
      'openid': wx.getStorageSync('openid'),
      "type":"get_home"
    },
    method: 'GET',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    dataType: 'json',
    success: function (res) {
      console.log(res.data);
      that.setData({
        home_collection: res.data
      })
    }
  })
}

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
      title: '加载中..',
      icon: 'loading',
      duration: 1000
    })
    getCollection(that);
  },
  cancel_collection: function (e) {
    var that = this;
    wx.showToast({
      title: '处理中',
      icon: 'loading',
      duration: 1200
    })
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/v_collection',
      data: {
        "openid": wx.getStorageSync("openid"),
        "type": "del_home",
        "id": e.currentTarget.dataset.id, //唯一id
      },
      success: function (res) {
        getCollection(that);
        wx.showToast({
          title: res.data,
          icon: 'success',
          duration: 1000
        })
      }
    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '西厢房-田园生活倡导者',
      desc: '个人中心-我的收藏',
      path: '/pages/collection/collection',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})