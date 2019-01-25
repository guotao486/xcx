// pages/auth/auth.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    authType:'two'
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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            withCredentials: true,    //要求校验登录态
            success: function (res) {
              console.log(res);
              console.log(wx.getStorageSync('3rdSessionId'));
              // --------- 4、发起后台注册请求（私人定制） ------------------
              wx.request({
                url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/register',
                data: {
                  'nickName': res.userInfo.nickName,
                  'sessionID': wx.getStorageSync('3rdSessionId'),
                  'encryptedData': res.encryptedData,
                  'iv': res.iv,
                  'openid': wx.getStorageSync('openid')
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: 'POST',
                dataType: 'JSON',
                success: function (res) {
                  console.log(0);
                  console.log(res.data);
                },
                fail: function (res) {
                  console.log(1);
                },
                complete: function (res) {
                  console.log(2);
                },
              })

              app.globalData.userInfo = res.userInfo;  //用户所有信息放在globalData
              console.log(app.globalData.userInfo.avatarUrl);
              wx.setStorageSync('userInfo', res.userInfo);//存储userInfo  

              wx.navigateBack({
                delta: 1
              })
            },
            fail: function (res) {
              console.log(res);
            },
            complete: function (res) { }
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
  
  }
})