//------------   使用方法如下：   -------------- 
// var util = require('../../utils/util.js');
// Page({
//   onLoad: function () {
//     console.log("判断是否为中文:" + util.IsChinese('测试'));
//     console.log("去除左右空格：" + util.trim(s));
//   }
// })

const config = require("config.js");

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//网络请求
function request(parameters = "",success, method = "GET", header = {}) {
  wx.request({
    url: config.BaseURL +(method == "GET" ? "?" : "")+ parameters,
    data: {},
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: header ? header : "application/json", // 设置请求的 header
    success: function(res){
      console.log(res);
      success(res);
    },
    fail: function() {
      // fail
    },
    complete: function() {
      // complete
    }
  })
}

//HUD 
//成功提示
function showSuccess(title = "成功啦", duration = 2500){
  wx.showToast({
      title: title ,
      icon: 'success',
      duration:(duration <= 0) ? 2500 : duration
  });
}
//loading提示
function showLoading(title = "请稍后", duration = 5000) {
  wx.showToast({
      title: title ,
      icon: 'loading',
      duration:(duration <= 0) ? 5000 : duration
  });
}
//隐藏提示框
function hideToast(){
  wx.hideToast();
}

//显示带取消按钮的消息提示框
function alertViewWithCancel(title="提示",content="消息提示",confirm,showCancel="true"){
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function(res) {
      if (res.confirm) {
        confirm();
      }
    }
  });
}
//显示不取消按钮的消息提示框
function alertView(title="提示",content="消息提示",confirm){
  alertViewWithCancel(title,content,confirm,false);
}

//-----------   自定义公共方法    -----------
//是否为中文
function IsChinese(str) {
  var reg = /^[\u0391-\uFFE5]+$/;
  return Regular(str, reg);
}
//正则判断
function Regular(str, reg) {
  if (reg.test(str))
    return true;
  return false;
}
//去左右空格;
function trim(s) {
  return s.replace(/(^\s*)|(\s*$)/g, "");
}

function confirmModel(content , title = '提示'){
  wx.showModal({
    title: title,
    content: content,
    showCancel:false,
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

function getPromission(that , app) {
  var loginStatus = true;
  
  if (!loginStatus) {
    // 显示提示弹窗
    wx.showModal({
      title: '是否进入设置页面重新授权',
      content: '需要获取您的公开信息（昵称、头像等），请确认授权，否则部分功能将无法使用',
      success: function (res) {
        if (res.cancel) {
          console.info("1授权失败返回数据");
          // wx.showToast({
          //   title: '授权失败，您可能有部分功能无法使用',
          //   icon: 'success',
          //   duration: 15000
          // })
          confirmModel('授权失败，您可能有部分功能无法使用')
        } else if (res.confirm) {
          wx.openSetting({
            success: function (data) {
              if (data) {
                if (data.authSetting["scope.userInfo"] == true) {
                  loginStatus = true;
                  wx.getUserInfo({
                    withCredentials: false,
                    success: function (data) {
                      // wx.showToast({
                      //   title: '恭喜您，授权成功',
                      //   icon: 'success',
                      //   duration: 15000
                      // })
                      confirmModel('恭喜您，授权成功')
                      console.info("1成功获取用户返回数据");
                      that.setData({
                        userInfo: data.userInfo,
                      })
                      console.info(data.userInfo);
                      // --------- 4、发起后台注册请求（私人定制） ------------------
                      wx.request({
                        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/register',
                        data: {
                          'nickName': data.userInfo.nickName,
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
                      app.globalData.userInfo = that.data.userInfo;  //用户所有信息放在globalData
                      wx.setStorageSync('userInfo', that.data.userInfo);//存储userInfo 
                    },
                    fail: function () {
                      console.info("2授权失败返回数据");
                      // wx.showToast({
                      //   title: '授权失败，您可能有部分功能无法使用',
                      //   icon: 'success',
                      //   duration: 15000
                      // })
                      confirm('授权失败，您可能有部分功能无法使用')
                    }
                  });
                }
              }
            },
            fail: function () {
              console.info("设置失败返回数据");
            }
          })
        }
      }
    })
  } else {
    wx.login({
      success: function (res) {
        console.log(res);
        if (res.code) {
          wx.getUserInfo({
            withCredentials: false,
            success: function (data) {
              // wx.showToast({
              //   title: '恭喜您，授权成功',
              //   icon: 'success',
              //   duration: 15000
              // })
              confirmModel('欢迎回来')
              console.info("2成功获取用户返回数据");
              that.setData({
                userInfo: data.userInfo,
              })
            },
            fail: function () {
              console.log(res);
              console.info("3授权失败返回数据"+res);
              loginStatus = false;
              // 显示提示弹窗
              wx.showModal({
                title: '是否进入设置页面重新授权',
                content: '需要获取您的公开信息（昵称、头像等），请确认授权，否则部分功能将无法使用',
                success: function (res) {
                  if (res.cancel) {
                    console.info("4授权失败返回数据");
                    // wx.showToast({
                    //   title: '授权失败，您可能有部分功能无法使用',
                    //   icon: 'success',
                    //   duration: 15000
                    // })
                    confirmModel('授权失败，您可能有部分功能无法使用')
                  } else if (res.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        if (data) {
                          if (data.authSetting["scope.userInfo"] == true) {
                            loginStatus = true;
                            wx.getUserInfo({
                              withCredentials: false,
                              success: function (data) {
                                // wx.showToast({
                                //   title: '恭喜您，授权成功',
                                //   icon: 'success',
                                //   duration: 15000
                                // })
                                confirm('恭喜您，授权成功')
                                console.info("3成功获取用户返回数据");
                                console.info(data.userInfo);
                                //更新数据
                                that.setData({
                                  userInfo: data.userInfo,
                                })
                                // --------- 4、发起后台注册请求（私人定制） ------------------
                                wx.request({
                                  url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/register',
                                  data: {
                                    'nickName': data.userInfo.nickName,
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
                                app.globalData.userInfo = that.data.userInfo;  //用户所有信息放在globalData
                                wx.setStorageSync('userInfo', that.data.userInfo);//存储userInfo 
                              },
                              fail: function () {
                                console.info("5授权失败返回数据");
                                // wx.showToast({
                                //   title: '授权失败，您可能有部分功能无法使用',
                                //   icon: 'success',
                                //   duration: 15000
                                // })
                                confirmModel('授权失败，您可能有部分功能无法使用')
                              }
                            });
                          }
                        }
                      },
                      fail: function () {
                        console.info("设置失败返回数据");
                      }
                    });
                  }
                }
              });
            }
          });
        }
      },
      fail: function () {
        console.info("登录失败返回数据");
      }
    });
  }
}

function onGotUserInfo(that, app,e) {
  wx.login({
    success: function (res) {

      console.log(e)
      console.log(e.detail.errMsg)
      console.log(e.detail.userInfo)
      console.log(e.detail.rawData)

      if (e.detail.errMsg == 'getUserInfo:ok') {
        console.log('微信账号登录成功');

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
            wx.setStorageSync('3rdSessionId', res.data.sessionID);
            wx.setStorageSync('openid', res.data.openid)  //同步
          }
        })

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
        wx.setStorageSync('userInfo', e.detail.userInfo);//存储userInfo
        that.onCancel();
        that.onShow();
      }else{
        that.onCancel();
      }
    },
    complete: function (res) {
      console.log('complete:' + res)
    }
  })

}

//-----------   暴露模块接口    -----------
module.exports = {
  formatTime: formatTime,
  request: request,
  showSuccess: showSuccess,
  showLoading: showLoading,
  hideToast: hideToast,
  alertViewWithCancel: alertViewWithCancel,
  alertView: alertView,
  IsChinese: IsChinese,
  trim: trim,
  confirm: confirmModel,
  getPromission: getPromission,
  onGotUserInfo: onGotUserInfo,
}
