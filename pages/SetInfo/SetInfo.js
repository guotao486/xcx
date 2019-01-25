var util = require('../../utils/util.js')  //引入公共js文件util.js
var app = getApp()
var loginStatus = true;//默认授权成功
var getPromission = function (that) {
  if (!loginStatus) {
    // 显示提示弹窗
    wx.showModal({
      title: '是否进入设置页面重新授权',
      content: '需要获取您的公开信息（昵称、头像等），请确认授权，否则报名功能将无法使用',
      success: function (res) {
        if (res.cancel) {
          console.info("1授权失败返回数据");
          wx.showModal({
            title: '提示',
            content: '您将无法报名',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  url: '/pages/SelectCate/SelectCate'//实际路径要写全
                })
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          // wx.showToast({
          //   title: '您将无法报名',
          //   //image:'/resources/images/marker_yellow.png',
          //   icon: 'success',
          //   duration: 5000
          // })
          // wx.navigateBack({
          //   url: '/pages/SelectCate/SelectCate'//实际路径要写全
          // })
        } else if (res.confirm) {
          wx.openSetting({
            success: function (data) {
              if (data) {
                if (data.authSetting["scope.userInfo"] == true) {
                  loginStatus = true;
                  wx.getUserInfo({
                    withCredentials: false,
                    success: function (data) {
                      wx.showModal({
                        title: '提示',
                        content: '恭喜您授权成功',
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                          }
                        }
                      })
                      // wx.showToast({
                      //   title: '恭喜您授权成功',
                      //   icon: 'success',
                      //   duration: 5000
                      // })
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
                      wx.showModal({
                        title: '提示',
                        content: '您将无法报名',
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            wx.navigateBack({
                              url: '/pages/SelectCate/SelectCate'//实际路径要写全
                            })
                            console.log('用户点击确定')
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                          }
                        }
                      })
                      // wx.showToast({
                      //   title: '您将无法报名',
                      //   icon: 'success',
                      //   duration: 5000
                      // })
                      // wx.navigateBack({
                      //   url: '/pages/SelectCate/SelectCate'//实际路径要写全
                      // })
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
        if (res.code) {
          wx.getUserInfo({
            withCredentials: false,
            success: function (data) {
              // wx.showToast({
              //   title: '恭喜您授权成功',
              //   icon: 'success',
              //   duration: 5000
              // })
              wx.showModal({
                title: '提示',
                content: '恭喜您授权成功',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
              console.info("2成功获取用户返回数据");
              that.setData({
                userInfo: data.userInfo,
              })
            },
            fail: function () {
              console.info("3授权失败返回数据");
              loginStatus = false;
              // 显示提示弹窗
              wx.showModal({
                title: '是否进入设置页面重新授权',
                content: '需要获取您的公开信息（昵称、头像等），请确认授权，否则报名功能将无法使用',
                success: function (res) {
                  if (res.cancel) {
                    console.info("4授权失败返回数据");
                    wx.showModal({
                      title: '提示',
                      content: '您将无法报名',
                      showCancel: false,
                      success: function (res) {
                        if (res.confirm) {
                          wx.navigateBack({
                            url: '/pages/SelectCate/SelectCate'//实际路径要写全
                          })
                          console.log('用户点击确定')
                        } else if (res.cancel) {
                          console.log('用户点击取消')
                        }
                      }
                    })
                  } else if (res.confirm) {
                    wx.openSetting({
                      success: function (data) {
                        if (data) {
                          if (data.authSetting["scope.userInfo"] == true) {
                            loginStatus = true;
                            wx.getUserInfo({
                              withCredentials: false,
                              success: function (data) {
                                wx.showModal({
                                  title: '提示',
                                  content: '恭喜您授权成功',
                                  showCancel: false,
                                  success: function (res) {
                                    if (res.confirm) {
                                      console.log('用户点击确定')
                                    } else if (res.cancel) {
                                      console.log('用户点击取消')
                                    }
                                  }
                                })
                                // wx.showToast({
                                //   title: '恭喜您授权成功',
                                //   icon: 'success',
                                //   duration: 5000
                                // })
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
                                wx.showModal({
                                  title: '提示',
                                  content: '您将无法报名',
                                  showCancel: false,
                                  success: function (res) {
                                    if (res.confirm) {
                                      wx.navigateBack({
                                        url: '/pages/SelectCate/SelectCate'//实际路径要写全
                                      })
                                      console.log('用户点击确定')
                                    } else if (res.cancel) {
                                      console.log('用户点击取消')
                                    }
                                  }
                                })
                                // wx.showToast({
                                //   //title: '授权失败，您可能有部分功能无法使用',
                                //   title: '您将无法报名',
                                //   icon: 'success',
                                //   duration: 5000
                                // })
                                // wx.navigateBack({
                                //   url: '/pages/SelectCate/SelectCate'//实际路径要写全
                                // })
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


Page({

  /**
   * 页面的初始数据
   */
  data: {
    price:'',
    array: [
      { name: '1', value: '男', checked: 'true' },
      { name: '2', value: '女' }
    ],
    data_sex:1,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      price:options.price,
      data_sex: 1,
      j_sex: 1,
    })

    //------------ 处理授权  ---------- 
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      console.log(userInfo);
      if (userInfo == null) {//拒绝授权
        console.log('ccc');
        getPromission(that);
      } else {                 //授权
        that.setData({
          userInfo: userInfo,
        })
      }

    })
  },
  //监听单选框性别信息，获得name属性
  listenerRadioGroup: function (e) {
    var that = this;
    console.log(e);
    that.setData({
      j_sex: e.detail.value,
      data_sex: e.detail.value,
    })
    console.log(that.data.data_sex);
  },
  /**
 * 自定义方法，校验form数据
 */
  submitForm: function (e) {
    var that = this;

    // ------------- 3、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })

    var fId = e.detail.formId;
    var fObj = e.detail.value;
    var l = 'https://m.xxiangfang.com/index.php/Home/XiaoApi/send_msg';
    //var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + that.data.access_token;  //微信规定：api.weixin.qq.com域名不能直接调，只能后台发起调用

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      console.log(userInfo);
      if (userInfo == null) {//拒绝授权
        console.log('ccc');
        getPromission(that);
      } else {                 //授权
        that.setData({
          userInfo: userInfo,
        })
        if (e.detail.value.data_name.length <= 0 || e.detail.value.data_name.length > 20) {
          
          util.confirm('姓名1~20字之间!')
        } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {
          
          util.confirm('请输入11位手机号码!')
        } else if (e.detail.value.data_company.length <= 0 || e.detail.value.data_company.length > 50) {
          
          util.confirm('单位1~50字之间!')
        } else if (that.data.price > 0) {   //报名参加youxue活动--传参
          wx.showModal({
            title: '提示',
            content: '确认要参与吗？',
            success: function (sm) {
              if (sm.confirm) {
                // 用户点击了确定 可以调用方法了,除开’套餐‘，’众筹‘
                if (that.data.price > 0) {
                  wx.request({
                    url: 'https://m.xxiangfang.com/index.php/Home/Xian/xian_order',
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    data: { is_home: 0, openid: wx.getStorageSync('openid'), data_name: e.detail.value.data_name, data_sex: that.data.data_sex, data_phone: e.detail.value.data_phone, data_company: e.detail.value.data_company, duty_paragraph: e.detail.value.duty_paragraph || '', data_address: e.detail.value.data_address || '', data_remark: e.detail.value.data_remark || '', data_total: that.data.price, a_id: that.data.a_id || '' },
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
                              url: '../success/success?kind=2',
                              success: function (res) { },
                              fail: function (res) { },
                              complete: function (res) { }
                            }),
                              // -----支付成功=》发送短信  -------------

                              //请求服务器发送短信
                              wx.request({
                                url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                                data: {
                                  'type': 'pay_activity_xian',
                                  "j_id": that.data.order_id,
                                  'name': e.detail.value.data_name,
                                  'phone': e.detail.value.data_phone,
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
                              });
                          },
                          'fail': function (res) {
                            console.log(res.errMsg);
                          },
                          'complete': function (res) {
                            console.log(res.errMsg);
                          }
                        })
                      } else if (res.data.state == 4) {   //免费仅限一次，不成功
                        util.confirm(res.data.Msg)
                      } else if (res.data.state == 0) {
                        util.confirm('抱歉，系统偷懒啦~')
                      } else {
                        util.confirm(res.data)
                      }

                    },
                    fail: function (res) {  //make_order2第三方自定义方法失败

                    }
                  })
                } else {
                  
                  util.confirm('金额有误，请重试')
                }
              }
            }
          })

        } else {
          util.confirm('系统维修中，请谅解~')
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

})