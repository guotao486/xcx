//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    this.getUserInfo();
  },
  getUserInfo:function(cb){
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
     // --------- 1、调用登录接口 ------------------
      wx.login({
            success: function (res) {
              console.log('微信账号登录成功');
              typeof cb == "function" && cb(that.globalData.userInfo)

              // --------- 2、发送凭证 ------------------
              /*将登录凭证发往你的服务端，并在你的服务端使用该凭证向微信服务器
              换取该微信用户的唯一标识(openid)和会话密钥(session_key)*/
              var code = res.code; //用户允许登录后，回调内容会带上 code（有效期五分钟）
              console.log('获取用户登录凭证：' + code);
              //console.log(that.globalData.userInfo);
              wx.request({
                url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/onlogin',
                data: { code: code },
                method: 'POST',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                success: function (res) {
                  console.log(res.data);
                  console.log('code带回的sessionID:'+res.data.sessionID);
                  console.log('code带回的openid:' + res.data.openid);
                  //将3rdSessionId同步放入小程序缓存
                  wx.setStorageSync('3rdSessionId', res.data.sessionID);
                  wx.setStorageSync('openid', res.data.openid)  //同步

                  //sessionId: wx.getStorageSync('3rdSessionId') //同步获取第三方sessionID

                }
              })
              
         // --------- 3、获取用户所有信息,西厢房平台用户必须得到昵称才能进行注册 ------
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
                      'openid':wx.getStorageSync('openid')                    },
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: 'POST',
                    dataType: 'JSON',
                    success: function(res) {
                      console.log(0);
                      console.log(res.data);
                    },
                    fail: function(res) {
                      console.log(1);
                    },
                    complete: function(res) {
                      console.log(2);
                    },
                  })

                  that.globalData.userInfo = res.userInfo;  //用户所有信息放在globalData
                  console.log(that.globalData.userInfo.avatarUrl);
                  wx.setStorageSync('userInfo', res.userInfo);//存储userInfo  
                },
                fail: function (res) {
                  console.log(res);
                 },
                complete: function (res) { }
              })

            }
          })
        }
      
  },
  globalData:{
    userInfo:null,
    https: 'https://m.xxiangfang.com/'
  }
})