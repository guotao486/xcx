var app = getApp()
Page({
  data: {
  
  },

  onShow: function () {
   
  },
  
  onGotUserInfo: function (e) {
   
    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if(e.detail.errMsg == 'getUserInfo:ok'){
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/register',
        data: {
          'nickName': e.detail.userInfo.nickName,
          'sessionID': wx.getStorageSync('3rdSessionId'),
          'encryptedData': e.detail.encryptedData,
          'iv': e.detail.iv,
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

      app.globalData.userInfo = e.detail.userInfo;  //用户所有信息放在globalData
      console.log(app.globalData.userInfo.avatarUrl);
      wx.setStorageSync('userInfo', e.detail.userInfo);//存储userInfo 
    }
  

    wx.switchTab({
      url: "../storylist/storylist"
    })
  },
})