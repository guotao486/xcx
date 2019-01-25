var util = require('../../utils/util.js')  //引入公共js文件util.js
var getTypeHome = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service',
    data: {
      "date_in":'',
      "date_out":'',
      "type":"get_type_home"    //每种房间只获取一条记录，如乡巴客栈只获取一条
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      console.log(res)
      that.setData({
        homeList: res.data
      })
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

var getNumHome = function (that,date_in,date_out,id,num) {  //选择房间数量后的房间所有数据
 if(num != 'undefined'){
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoTeam/team_buy',
    data: {
      "openid":wx.getStorageSync("openid"),  //作为区别缓存的唯一标志
      "date_in": date_in||'',
      "date_out": date_out||'',
      "id":id||'0',
      "num":num||'0',
      "type": "get_num_home"    
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      console.log(res)
      that.setData({
        homeList: res.data
      });
      //  ----------   获取总金额和房间数   --------------
    getTotal(that);

    }
  })
 }
}
var getTotal = function(that){
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoTeam/team_total',
    data: {
      "openid": wx.getStorageSync("openid"),
      "type": "get_total_home"
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    success: function (r) {
      console.log(r)
      that.setData({
        num: r.data.total_num,
        money:r.data.total_money
      })
    }
  })
}

var getOne = function (that) {  //酒店home_orderuserinfo,用户名自动填充
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getOne',
    data: {
      "type": "home",
      "openid": wx.getStorageSync("openid")
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          U_msg: res.data
        })
      }
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

Page({
  data: {
    date1: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
    date2: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + (new Date().getDate() + 1),
    array: [0,1, 2, 3, 4, 5, 6],  //房间数量，动态读取
    room_num: 0,    //下标

    kind:1,
    is_home:1,
    money:'0.00',
    num:0,
    number:''
  },

  onLoad: function (options) {
    var that = this;
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime();
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();
    that.setData({
      date_in:date_in,  //当前时间13位毫秒
      date_out:date_out
    })
    wx.request({    //通过酒管api加载房间数量
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/get_avail',
      data: {
        //"a_id": that.data.a_id,
        "date_in": date_in,
        "date_out": date_out
      },
      header: {
        "Content-Type": "application/json"
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          r: res.data
        })
        var ss = res.data.split(",");
        that.setData({
          num0: ss[0],
          num1: ss[1],
          num2: ss[2],
          num3: ss[3],
          num4: ss[4],
          num5: ss[5],
          num6: ss[6],
        })
        console.log(that.data.num5);
        console.log(that.data.num6);
      }
    })

    console.log(that.data.date_in); //结果：1501862400000
    console.log(date1); //结果：Fri Aug 04 2017 00:00:00 GMT+0800 (中国标准时间)
    // ------------- 1、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
        if (res.errMsg == 'checkSession:ok') {

        }
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1500
    })
    getOne(that);
    getTypeHome(that);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    // ------------- 2、获取后台请求微信的access_token ------------------
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/get_accessToken',
      data: '',
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          access_token: res.data
        })
      }
    })
  },
num0:function(e){
  var that = this;
  if (parseInt(e.detail.value)>that.data.num0){
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num0)
  getNumHome(that, that.data.date_in, that.data.date_out, 35, that.data.num0);
  }else{
  that.setData({
    v: e.detail.value   //设置的房间数量
  })
  getNumHome(that,that.data.date_in,that.data.date_out,35,e.detail.value);
  console.log(that.data.v);
  }
},
num1: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num1) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num1)
 getNumHome(that, that.data.date_in, that.data.date_out, 34, that.data.num1);
  } else {
    that.setData({
      v1: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 34, e.detail.value);
  }
},
num2: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num2) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num2)
getNumHome(that, that.data.date_in, that.data.date_out, 28, that.data.num2);
  } else {
    that.setData({
      v2: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 28, e.detail.value);
  }
},
num3: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num3) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num3)
getNumHome(that, that.data.date_in, that.data.date_out, 27, that.data.num3);
  } else {
    that.setData({
      v3: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 27, e.detail.value);
  }
},
num4: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num4) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num4)
getNumHome(that, that.data.date_in, that.data.date_out, 26, that.data.num4);
  } else {
    that.setData({
      v4: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 26, e.detail.value);
  }
},
num5: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num5) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num5)
    getNumHome(that, that.data.date_in, that.data.date_out, 24, that.data.num5);
  } else {
    that.setData({
      v4: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 24, e.detail.value);
  }
},
num6: function (e) {
  var that = this;
  if (parseInt(e.detail.value) > that.data.num6) {
    
    util.confirm('您预订的房间数量已超过剩余数量' + that.data.num6)
    getNumHome(that, that.data.date_in, that.data.date_out, 23, that.data.num6);
  } else {
    that.setData({
      v4: e.detail.value   //设置的房间数量
    })
    getNumHome(that, that.data.date_in, that.data.date_out, 23, e.detail.value);
  }
},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
 /**
   * 自定义函数--选择房间数量
   */
  
  bindDateChange: function (e) {
    var that = this;
    if (new Date(Date.parse(e.detail.value.replace(/-/g, "/"))) < Date.parse(new Date()) - 86400000){
      
      util.confirm('住房时间不能小于当前时间!')
    }else{
    that.setData({
      date1: e.detail.value
    })
    //-----------  入住时间改变且入住时间小于离店时间，房间总金额同步改变  ----------
    if (new Date(Date.parse(e.detail.value.replace(/-/g, "/")))<that.data.date_out){
      getNumHome(that, new Date(Date.parse(e.detail.value.replace(/-/g, "/"))).getTime(), that.data.date_out,0,0);
    }
    // else{
    //   console.log(new Date(Date.parse(e.detail.value.replace(/-/g, "/"))).getTime());
    //   wx.showToast({
    //     title: '住房时间大于离店时间!',
    //     icon: 'loading',
    //     duration: 1500
    //   })
    // }
   }
  },
  bindDateChangeTwo: function (e) { //离店时间，绑定查房数量
    var that = this;
    that.setData({
      date2: e.detail.value
    })

    //字符串转换为时间戳，单位毫秒
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime(); //13位
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();
    that.setData({
      date_in:date_in,
      date_out:date_out
    })
    if (date1 >= date2) {

      util.confirm('退房时间必须大于住房时间!')
    } else if (date1 < Date.parse(new Date()) - 86400000) {
     
      util.confirm('住房时间不能小于当前时间!')
    } else {//异步提交start_time、end_time,获取所有类型房间avail数
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/get_avail',
        data: {
          //"a_id": that.data.a_id,
          "date_in": date_in,
          "date_out": date_out
        },
        header: {
          "Content-Type": "application/json"
        },
        method: 'GET',
        success: function (res) {
          console.log(res.data);
          that.setData({
            r:res.data
          })
          var ss = res.data.split(",");
          that.setData({
            num0 : ss[0],
            num1: ss[1],
            num2: ss[2],
            num3: ss[3],
            num4: ss[4],
            num5: ss[5],
            num6: ss[6],
          })
          console.log(that.data.num5);
        }
      })
//-----------  离店时间改变，房间总金额同步改变  ----------
      getNumHome(that,date_in,date_out,0,0);
    }

  },

  bindPickerChange: function (e) {
    var that = this;
    that.setData({
      room_num: e.detail.value //value表示选中了picker列表中的第几项，默认为0即第一项
    })
    console.log(parseInt(that.data.room_num) + 1);
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


    //字符串转换为时间戳，单位毫秒
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime();
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();

    if (e.detail.value.data_name.length <= 0 || e.detail.value.data_name.length > 20) {

      util.confirm('姓名在1~20字之间!')
    } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {

      util.confirm('请输入有效11位手机号码!')
    }else if (date1 >= date2) {

      util.confirm('退房时间必须大于住房时间!')
    } else if (date1 < Date.parse(new Date()) - 86400000) {
      
      util.confirm('住房时间不能小于当前时间!')
    } else if (that.data.num<6) {
      
      util.confirm('团体价总订房数量必须大于6（含)间~')
    } else if (that.data.is_home == 1 && that.data.num >=6 && that.data.money>0.00) { //酒店预订传参
      wx.showModal({
        title: '提示',
        content: '确认要预订吗？',
        success: function (sm) {
          if (sm.confirm) {
            // 用户点击了确定 可以调用方法了
            wx.request({
              url: 'https://m.xxiangfang.com/index.php/Home/XiaoVip/vip_order',//(分单还是合单，酒管怎么同步？)
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              data: { is_home: '1', openid: wx.getStorageSync('openid'), data_name: e.detail.value.data_name, data_phone: e.detail.value.data_phone, data_room: that.data.num, date_in: date_in, date_out: date_out, data_remark: e.detail.value.data_remark, data_total: that.data.money },

              success: function (res) {
                if (res.data.state == 1) {    //酒店预支付支付成功
                  // --------- 【微信预支付】统一下单订单生成成功，发起支付请求 -----------------
                  that.setData({
                    order_id: res.data.out_trade_no  //用户自定义订单号
                  })

                  wx.requestPayment({
                    timeStamp: res.data.timeStamp,
                    nonceStr: res.data.nonceStr,   //字符串随机数
                    package: res.data.package,
                    signType: res.data.signType,
                    paySign: res.data.paySign,
                    'success': function (res) {   //酒店支付成功，需要发送短信
                      console.log(res.errMsg);    //requestPayment:ok==>调用支付成功
                      wx.redirectTo({  //跳转到应用内页面（次页面）
                        url: '../success/success?kind=' + that.data.kind,
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { }
                      }),
                        // ----支付成功=》1、向用户发送推送 2、发送短信 -------

                        wx.request({
                          url: l,       //send_msg()
                          data: {
                            "type": "vip_pay_home",
                            access_token: that.data.access_token,
                            touser: wx.getStorageSync('openid'),
                            template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                            page: '/pages/index/index',
                            form_id: fId,
                            time1: date_in, // 单位：时间戳毫秒13位
                            time2: date_out,
                            //home_id: that.data.a_id,
                            keyword1: that.data.num, //房间数
                            keyword2: that.data.money,  //入住总金额
                            keyword3: that.data.order_id,
                            keyword4: e.detail.value.data_name,
                            color: '#ccc',
                            emphasis_keyword: 'keyword1.DATA'
                          },
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded"
                          },
                          method: 'POST',
                          success: function (res) {
                            console.log(res.data);
                          },
                          fail: function (err) {
                            console.log(err);
                          }
                        });
                      //请求服务器发送短信
                      wx.request({
                        url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
                        data: {
                          'order_id': that.data.order_id,//home_viporder表
                          'type': 'vip_pay_home',
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
                      });
                    },
                    'fail': function (res) {
                      console.log(res.errMsg);
                    },
                    'complete': function (res) {
                      console.log(res.errMsg);
                    }
                  })
                } else if (res.data.state == 0) {  //酒店预支付不成功
                  
                  util.confirm(res.data.Msg)
                } else {
                  console.log(res.data);
                 
                  util.confirm(res.data)
                }

              },
              fail: function (res) {  //make_order第三方自定义方法失败

              }
            })
          }
        }
      })

    }else {
      util.confirm('系统维修中，请谅解~')
    }
  },

  /**
 * 用户点击分享按钮或右上角分享
 */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 田园生活倡导者',
      desc: "我 - 今日特惠",
      path: '/pages/teambuy/teambuy',
      success: function (res) {
      }
    }
  }

})