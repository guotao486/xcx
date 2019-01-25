var util = require('../../utils/util.js')  //引入公共js文件util.js
var app = getApp()
var loginStatus = true;//默认授权成功

var getPromission = function(that){
  util.getPromission(that,app);
}
var sms = function (that, type, order_id) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms',
    data: {
      'order_id': order_id,
      'type': type,
      'openid': wx.getStorageSync('openid')
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      console.log(res);
    },
    complete: function (res) { },
  })
}
var getHomeName = function (that) {  //房间名称
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service',
    data: {
      "type": "home_name",
      "id": that.data.a_id
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          NAME: res.data
        })
      }
    }
  })
}
var getActivityName = function (that) {  //活动名称
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/activity',
    data: {
      "type": "activity_name",
      "id": that.data.a_id
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          NAME: res.data.act_name,
          ACT_TYPE: res.data.act_type,
          score: res.data.sa_price, //活动初始化套餐一价格（默认选中套餐一）
          items: res.data.prices,
        })
      }
    }
  })
}
var getAD = function (that) {  //获取报名页广告图
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getAD',
    data: {
      "type": "home and activity"
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          yuding: res.data
        })
      }
    }
  })
}
var getOne = function (that) {  //酒店home_orderuserinfo
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
var getTwo = function (that) {    //活动参加_activity_join
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getTwo',
    data: {
      "type": "activity",
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
var getTotalMoney = function (that, h_id, h_num, start_time, end_time) {    //ajax动态获取房费总金额-xzz0831
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getTotalMoney',
    data: {
      "type": "home_total_money",
      "openid": wx.getStorageSync("openid"),
      "h_id": h_id || 0,
      "h_num": h_num || 0,
      "start_time": start_time || '',//10位int类型
      "end_time": end_time || '',//10位int类型
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          total_money: res.data
        })
      }
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}
var getCard = function (that,h_id, start_time, end_time) {//获取卡券
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoCard/msg',
    data: {
      "type": "home_card",
      "openid": wx.getStorageSync("openid"),
      "h_id": h_id || 0,
      "start_time": start_time || '',//10位int类型
      "end_time": end_time || '',//10位int类型
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        that.setData({
          card_id:res.data.card_id,
          card: res.data.card,
          card_hide: false, //显示卡券
        })
      }else{
        that.setData({
          card_hide: true, //隐藏卡券
          checked:true,
          pay_type:1,
        })
      }
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unitPrice: '',    //商品单价
    // date1: '2017-01-01',  //入住时间
    // date2: '2017-12-31'   //离店时间
    date1: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
    date3: Date.parse(new Date(Date.parse((new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate())))) + 86400000,

    array: [1, 2, 3, 4, 5, 6, 7, 8, 9,],  //房间数量，动态读取
    room_num: 0,    //下标
    card_hide:true,//默认隐藏卡券
    checked:true,
    pay_type:1,//默认支付方式微信
    radioRemark:'单间'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1500
    })
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
    // ------------- 1.5、检查用户授权态 ------------------


    that.setData({
      date2: new Date(that.data.date3).getFullYear() + "-" + (new Date(that.data.date3).getMonth() + 1) + "-" + new Date(that.data.date3).getDate(),
      nullHouse: true,
      kind: options.kind,             //报名活动|预订酒店类型
      unitPrice: options.unitPrice,   //活动（或房间）单价
      a_id: options.a_id,             //活动(或房间)id
      is_home: options.is_home,        //判断是否是旅居1:home或0：activity
      act_name: options.act_name,      //活动名称
      Start_time: options.start_time,    //活动开始时间,酒店的时间在下面
      End_time: options.end_time         //活动结束时间
    })
    // -------------  获取报名广告图片  ------------------
    getAD(that);
    //------  根据openid获取space表对应user_type 3=》homeVIP  -------/
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoVip/getUserType',
      data: {
        "type": "vip_user_type",
        "openid": wx.getStorageSync("openid")
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          user_type: res.data
        })
      },
    })
    // 获取平台home_orderuserinfo信息(判断是否活动or酒店)
    if (options.is_home == 1) {  //酒店用户信息
      getHomeName(that);
      getOne(that);
      // -------------  获取初始化房间数量avail  -------------------------
      var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
      var date_in = date1.getTime();
      var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
      var date_out = date2.getTime();
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/get_avail',
        data: {
          "a_id": that.data.a_id,
          "date_in": date_in,
          "date_out": date_out
        },
        header: {
          "Content-Type": "application/json"
        },
        method: 'GET',
        success: function (res) {
          console.log(res);
          that.setData({
            array: []   //清空数组
          })
          var array = new Array();
          if (res.data == '抱歉，该房间已满，请预定其他房间或其他时间') {
            array.push(0);
            that.setData({
              array: array,
              total_money: '0.00',//avail==0，房费自然为0.00
            })
          } else {
            for (var i = 1; i <= res.data; i++) {
              array.push(i);
            }
            that.setData({
              array: array,
            })
            getTotalMoney(that, options.a_id, 1, date_in / 1000, date_out / 1000);//获取初始化状态单间房间WL价
          }
        }
      })
    } else {                    //活动用户信息+活动名称和类型+默认套餐一价格
      getActivityName(that);
      getTwo(that);
    }
    //------------ 处理授权  ---------- 
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
    //------------ 获取卡券  ---------- 
    getCard(that, options.a_id,date_in/1000,date_out/1000);

  },
  onshow: function () {

  },
  card_pay: function (e) {//卡券支付2或默认微信支付1 --02/25
    var that = this;
    that.setData({
      pay_type: e.target.dataset.id,
    })
  },

  radioChange: function (e) {
    var that = this;
    if (e.detail.value == '免费') {
      e.detail.value = '0.00';
    }
    that.setData({
      score: e.detail.value   //0.xx浮点小数
    })
    console.log('radio发生change事件，携带value值为：', that.data.score)
  },

  radioChangeRemark: function (e) {
    var that = this;
    that.setData({
      radioRemark: e.detail.value  
    })
    console.log('radio发生change事件，携带value值为：', that.data.score)
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
        //console.log(res.data);
        that.setData({
          access_token: res.data
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //入住时间，校验和ajax变更
  bindDateChange: function (e) {
    var that = this;
    that.setData({
      date1: e.detail.value
    })
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime();
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();

    if (date_in < Date.parse(new Date()) - 86400000) {
     
      util.confirm('住房时间不能小于当前时间')
    } else if (date_in >= date_out) {
      
      util.confirm('离店时间必须大于入住时间')
    } else if (date_in < date_out) {
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/get_avail',
        data: {
          "a_id": that.data.a_id,
          "date_in": date_in,
          "date_out": date_out
        },
        header: {
          "Content-Type": "application/json"
        },
        method: 'GET',
        success: function (res) {
          console.log(res);
          that.setData({
            array: []   //清空数组
          })
          var array = new Array();
          if (res.data == '抱歉，该房间已满，请预定其他房间或其他时间') {
            array.push(0);
            that.setData({
              array: array,
              total_money: '0.00',//avail==0，房费自然为0.00
            })
          } else {
            for (var i = 1; i <= res.data; i++) {
              array.push(i);
            }
            that.setData({
              array: array
            })
            //再次调用ajax去获取预订房间的总金额
            getTotalMoney(that, that.data.a_id, parseInt(that.data.room_num) + 1, date_in / 1000, date_out / 1000);

      //------------ 获取卡券  ---------- 
      getCard(that, that.data.a_id, date_in / 1000, date_out / 1000);
          }
        },
      })
    }
  },
  //离店时间，校验和ajax变更
  bindDateChangeTwo: function (e) { //离店时间，绑定查房数量
    var that = this;
    that.setData({
      date2: e.detail.value
    })
    console.log(that.data.date2);

    //字符串转换为时间戳，单位毫秒
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime();
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();
    if (that.data.is_home == 1 && date1 >= date2) {

      util.confirm('退房时间必须大于住房时间')
    } else if (that.data.is_home == 1 && date1 < Date.parse(new Date()) - 86400000) {

      util.confirm('住房时间不能小于当前时间')
    } else if (that.data.is_home == 1) {//异步提交a_id、start_time、end_time,获取avail房间数
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/get_avail',
        data: {
          "a_id": that.data.a_id,
          "date_in": date_in,
          "date_out": date_out
        },
        header: {
          "Content-Type": "application/json"
        },
        method: 'GET',
        success: function (res) {
          console.log(res);
          that.setData({
            array: []   //清空数组
          })
          var array = new Array();
          if (res.data == '抱歉，该房间已满，请预定其他房间或其他时间') {
            array.push(0);
            that.setData({
              array: array,
              total_money: '0.00',//avail==0，房费自然为0.00
            })
          } else {
            for (var i = 1; i <= res.data; i++) {
              array.push(i);
            }
            that.setData({
              array: array
            })
            //再次调用ajax去获取预订房间的总金额
            getTotalMoney(that, that.data.a_id, parseInt(that.data.room_num) + 1, date_in / 1000, date_out / 1000);

      //------------ 获取卡券  ---------- 
      getCard(that, that.data.a_id, date_in / 1000, date_out / 1000);

          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }

  },

  bindPickerChange: function (e) {
    var that = this;
    that.setData({
      room_num: e.detail.value //value表示选中了picker列表中的第几项，默认为0即第一项
    })
    console.log(parseInt(e.detail.value));
    console.log(parseInt(that.data.room_num) + 1);
    var date1 = new Date(Date.parse(that.data.date1.replace(/-/g, "/")));
    var date_in = date1.getTime();
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();
    getTotalMoney(that, that.data.a_id, parseInt(that.data.room_num) + 1, date_in / 1000, date_out / 1000);
    //------------ 获取卡券  ---------- 
    getCard(that, that.data.a_id, date_in / 1000, date_out / 1000);

  },
  /**
   * 自定义方法，校验form数据
   */
  submitForm: function (e) {
    var that = this;
    console.log(e);

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
    console.log(date_in);    
    var date2 = new Date(Date.parse(that.data.date2.replace(/-/g, "/")));
    var date_out = date2.getTime();

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
         
          util.confirm('姓名在1~20字之间!')
          
        } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {

          util.confirm('请输入有效11位手机号码')
        } else if (that.data.ACT_TYPE != 'pack' && that.data.is_home != 1 && (e.detail.value.data_num <= 0 || isNaN(e.detail.value.data_num))) {

          util.confirm('参与人数必须为数字且至少为1')
        } else if (that.data.is_home == 1 && date1 >= date2) {
          util.confirm('退房时间必须大于住房时间')
        } else if (that.data.is_home == 1 && date1 < Date.parse(new Date()) - 86400000) {
          util.confirm('住房时间不能小于当前时间')
        } else if (that.data.is_home == 1) { //酒店预订传参
          wx.showModal({
            title: '提示',
            content: '确认要预订吗？',
            success: function (sm) {
              if (sm.confirm) {
                //--------  下面是微信支付 不动  ----------
                wx.request({

                  // url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/make_order2',
                  url: 'http://www.xxf.cn/index.php/Home/Xiaoxxf/make_order2',
                  header: {

                    "Content-Type": "application/x-www-form-urlencoded"

                  },

                  method: "POST",

                  data: { is_home: that.data.is_home, pay_type: that.data.pay_type, card_id: that.data.card_id, openid: wx.getStorageSync('openid'), data_name: e.detail.value.data_name, data_phone: e.detail.value.data_phone, data_IDcard: e.detail.value.data_IDcard || '', data_room: parseInt(that.data.room_num) + 1, date_in: date_in, date_out: date_out, data_remark: e.detail.value.data_remark || '', data_total: that.data.unitPrice, a_id: that.data.a_id, total_money: e.detail.value.total_money || '0', },

                  success: function (res) {
                    if (res.data.state == 1) {    //酒店预支付支付成功
                      // --------- 【微信预支付】统一下单订单生成成功，发起支付请求 -----------------
                      that.setData({
                        order_id: res.data.out_trade_no  //用户自定义订单号
                      })
                      console.log(that.data.order_id);
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
                            // ----支付成功=》向用户发送推送 2、发送短信 --------------

                            wx.request({
                              url: l,       //XiaoApi/send_msg
                              data: {
                                "type": "home_pay",
                                access_token: that.data.access_token,
                                touser: wx.getStorageSync('openid'),
                                template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                                page: '/pages/index/index',
                                form_id: fId,
                                time1: date_in, // 单位：时间戳毫秒13位
                                time2: date_out,
                                home_id: that.data.a_id,
                                keyword1: e.detail.value.data_num,
                                keyword2: that.data.unitPrice,  //入住单价，房价与人数无关，仅与时间有关
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
                              'order_id': that.data.order_id,
                              'type': 'pay_home',
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
                          console.log(res);
                        },
                        'complete': function (res) {
                          console.log(res.errMsg);
                        }
                      })
                    } else if (res.data.state == 0) {  //酒店预支付不成功
                      
                      util.confirm(res.data.Msg)
                    } else if( res.data.state == 2){
                      that.setData({
                        order_id: res.data.out_trade_no  //用户自定义订单号
                      })
                      wx.redirectTo({  //跳转到应用内页面（次页面）
                        url: '../success/success?kind=' + that.data.kind,
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { }
                      }),
                        // ----支付成功=》向用户发送推送 2、发送短信 --------------

                        wx.request({
                          url: l,       //XiaoApi/send_msg
                          data: {
                            "type": "home_pay",
                            access_token: that.data.access_token,
                            touser: wx.getStorageSync('openid'),
                            template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                            page: '/pages/index/index',
                            form_id: fId,
                            time1: date_in, // 单位：时间戳毫秒13位
                            time2: date_out,
                            home_id: that.data.a_id,
                            keyword1: e.detail.value.data_num,
                            keyword2: that.data.unitPrice,  //入住单价，房价与人数无关，仅与时间有关
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
                          'order_id': that.data.order_id,
                          'type': 'pay_home',
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
                    }else {
                      
                      util.confirm(res.data)
                    }

                  },
                  fail: function (res) {  //make_order2第三方自定义方法失败

                  }
                })
              }
            }
          })

        } else if (that.data.is_home == 0) {   //报名参加活动--传参
          console.log('报名活动');
          wx.showModal({
            title: '提示',
            content: '确认要参与吗？',
            success: function (sm) {
              if (sm.confirm) {
                // 用户点击了确定 可以调用方法了,除开’套餐‘，’众筹‘
                if (that.data.ACT_TYPE != 'pack' && that.data.ACT_TYPE != 'zhongchou') {
                  wx.request({
                    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/make_order2',
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    data: { is_home: that.data.is_home, openid: wx.getStorageSync('openid'), data_name: e.detail.value.data_name, data_phone: e.detail.value.data_phone, data_num: e.detail.value.data_num, data_remark: e.detail.value.data_remark || '', data_total: e.detail.value.data_num * that.data.unitPrice, a_id: that.data.a_id },
                    success: function (res) {
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
                            if (that.data.a_id == 192) {
                              wx.showToast({
                                title: '报名成功！',
                              })
                              setTimeout(function(){
                                wx.redirectTo({  //跳转到应用内页面（次页面）
                                  url: '../activity_detail/activity_detail?id=192',
                                  success: function (res) { },
                                  fail: function (res) { },
                                  complete: function (res) { }
                                })
                              },1500);
                            }else{
                              wx.redirectTo({  //跳转到应用内页面（次页面）
                                url: '../success/success?kind=' + that.data.kind,
                                success: function (res) { },
                                fail: function (res) { },
                                complete: function (res) { }
                              })
                            }
                              // -----支付成功=》向用户发送微信推送 2、发送短信  -------------

                              wx.request({
                                url: l,   //XiaoApi/send_msg
                                data: {
                                  "type": "join_pay",
                                  access_token: that.data.access_token,
                                  touser: wx.getStorageSync('openid'),
                                  template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                                  page: '/pages/index/index',
                                  form_id: fId,
                                  keyword1: e.detail.value.data_num,
                                  keyword2: that.data.unitPrice * e.detail.value.data_num,
                                  keyword3: that.data.order_id,
                                  keyword4: e.detail.value.data_name + '您好,您参与的活动:' + that.data.act_name + ',已支付成功,活动时间:' + that.data.Start_time + ' - ' + that.data.End_time + ',请记得及时参加哦',
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
                                'type': 'pay_activity',
                                "jid": that.data.order_id,
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
                      } else if (res.data.state == 3) {   //报名免费活动成功
                        that.setData({
                          order_id: res.data.order_id  //订单号
                        })
                        console.log('../success/success?kind=' + that.data.kind);
                        wx.redirectTo({  //跳转到应用内页面（次页面）
                          url: '../success/success?kind=' + that.data.kind,
                          success: function (res) { },
                          fail: function (res) { },
                          complete: function (res) { }
                        }),
                          // ------------  用户发送微信推送 2、发送短信  ---------------

                          wx.request({
                            url: l,
                            data: {
                              "type": "join_free",
                              access_token: that.data.access_token,
                              touser: wx.getStorageSync('openid'),
                              template_id: 'DPlbhOgpJW66Fv3yC4qrOBfdvFnsXWw8Y7tCd1LTxYc',//报名成功模板
                              page: '/pages/index/index',
                              form_id: fId,
                              keyword1: that.data.act_name,
                              keyword2: that.data.Start_time + ' - ' + that.data.End_time,
                              keyword3: that.data.a_id,  //根据活动（房间）id，获取区域信息
                              //keyword4: '免费', 
                              keyword4: that.data.unitPrice * e.detail.value.data_num,
                              keyword5: e.detail.value.data_phone,
                              keyword6: e.detail.value.data_IDcard || '',
                              keyword7: e.detail.value.data_remark || '',
                              keyword8: that.data.order_id,
                              keyword9: e.detail.value.data_name,
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
                            'type': 'pay_activity',
                            "jid": that.data.order_id,
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

                        //  wx.switchTab({  //跳转到tarBar页面（主页面）
                        //   url: '../index/index',
                        //  })
                      } else if (res.data.state == 4) {   //免费仅限一次，不成功
                       
                        util.confirm(res.data.Msg)
                      } else if (res.data.state == 0) {
                       
                        util.confirm('抱歉，系统偷懒啦~')
                      } else {
                       
                        util.confirm('系统繁忙请重试')
                      }

                    },
                    fail: function (res) {  //make_order2第三方自定义方法失败

                    }
                  })
                } else {//act_type=='pack'||act_type=='zhongchou'  活动类型是套餐或众筹类型的活动
                  if (that.data.ACT_TYPE == 'zhongchou') {
                    if (util.trim(e.detail.value.data_remark) == '') {
                      
                      util.confirm('邮寄地址不可为空')
                      return;
                    }
                    that.setData({
                      data_num: e.detail.value.data_num,  //购买份额、数量
                    });
                  } else if (that.data.ACT_TYPE == 'pack') {
                    that.setData({
                      data_num: 1,
                    })
                  }

                  wx.request({
                    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/make_order2',
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    data: { is_home: that.data.is_home, openid: wx.getStorageSync('openid'), data_name: e.detail.value.data_name, data_phone: e.detail.value.data_phone, data_num: that.data.data_num, data_remark: e.detail.value.data_remark || '', data_total: that.data.data_num * that.data.score, a_id: that.data.a_id },
                    success: function (res) {
                      //console.log(res);
                      if (res.data.state == 1) {
                        console.log(res.data.out_trade_no);
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
                              url: '../success/success?kind=' + that.data.kind,
                              success: function (res) { },
                              fail: function (res) { },
                              complete: function (res) { }
                            }),
                            
                              // -----支付成功=》向用户发送微信推送 2、发送短信  -------------

                              wx.request({
                                url: l,   //XiaoApi/send_msg()
                                data: {
                                  "type": "join_pay",
                                  access_token: that.data.access_token,
                                  touser: wx.getStorageSync('openid'),
                                  template_id: 'z_cLfd-tvbGIkBlcYQ6LO3PVpzYQX6cx7RODZq0Jt7g',//订单支付成功模板
                                  page: '/pages/index/index',
                                  form_id: fId,
                                  keyword1: e.detail.value.data_num || 1,
                                  keyword2: that.data.data_num * that.data.score,//套餐总金额
                                  keyword3: that.data.order_id,
                                  keyword4: e.detail.value.data_name + '您好,您参与的活动' + that.data.act_name + ',已支付成功，活动时间:' + that.data.Start_time + ' - ' + that.data.End_time + ',请记得及时参加哦~',
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
                                'type': 'pay_activity',
                                "jid": that.data.order_id,
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
                      } else if (res.data.state == 4) {   //免费仅限一次，不成功
                       
                        util.confirm(res.data.Msg)
                      } else if (res.data.state == 3) {   //免费成功
                        that.setData({
                          order_id: res.data.order_id  //订单号
                        })
                        console.log(that.data.order_id);
                        console.log('../success/success?kind=' + that.data.kind);
                        wx.redirectTo({  //跳转到应用内页面（次页面）
                          url: '../success/success?kind=' + that.data.kind,
                          success: function (res) { },
                          fail: function (res) { },
                          complete: function (res) { }
                        }),
                          // ------------  用户发送微信推送 2、发送短信  ---------------

                          wx.request({
                            url: l,
                            data: {
                              "type": "join_free",
                              access_token: that.data.access_token,
                              touser: wx.getStorageSync('openid'),
                              template_id: 'DPlbhOgpJW66Fv3yC4qrOBfdvFnsXWw8Y7tCd1LTxYc',//报名成功模板
                              page: '/pages/index/index',
                              form_id: fId,
                              keyword1: that.data.act_name,
                              keyword2: that.data.Start_time + ' - ' + that.data.End_time,
                              keyword3: that.data.a_id,  //根据活动（房间）id，获取区域信息
                              //keyword4: '免费', 
                              keyword4: '免费',
                              keyword5: e.detail.value.data_phone,
                              keyword6: e.detail.value.data_IDcard || '',
                              keyword7: e.detail.value.data_remark || '',
                              keyword8: that.data.order_id,
                              keyword9: e.detail.value.data_name,
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
                            'type': 'pay_activity',
                            "jid": that.data.order_id,
                            'openid': wx.getStorageSync('openid')
                          },
                          header: {
                            'Content-Type': 'application/json'
                          },
                          method: 'GET',
                          success: function (res) {
                            if (res.data.code == 1) {
                              that.setData({
                                insertID: res.data.msg
                              })
                            } else if (res.data.code == 0) {
                              console.log(res.data.msg);;
                            }
                          },
                        });
                      } else if (res.data.state == 0) {
                        console.log(res);
                       
                        util.confirm(res.data.Msg)
                      } else {
                        
                        util.confirm('系统繁忙请再试')
                      }
                    },
                    fail: function (res) {  //make_order2第三方自定义方法失败
                      
                      util.confirm(res.data.Msg)
                    }
                  })
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



})