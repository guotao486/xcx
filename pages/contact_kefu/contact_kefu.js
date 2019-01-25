// pages/contact_kefu/contact_kefu.js
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
  
  },

  /**
   * 自定义函数--拨打电话
   */
  phoneCall: function () {
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoKeFu/getPhone',
      data: {},
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        wx.makePhoneCall({
          phoneNumber: res.data,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
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
  
  },

})