var util = require('../../utils/util.js')  //引入公共js文件util.js
var app = getApp()

var getActivityName = function (that) {  //活动名称
  wx.showLoading({
    title: '请稍等...',
  })
  wx.request({
    url: app.globalData.https +'index.php/Home/XiaoActivity/enlist',
    data: {
      "id": that.data.a_id
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'POST',
    success: function (res) {
      console.log(res);
      if (res.data != 'isnull') {
        wx.hideLoading();
        that.setData({
          NAME: res.data.act_name,
          ACT_TYPE: res.data.act_type,
          score: res.data.sa_price, //活动初始化套餐一价格（默认选中套餐一）
          items: res.data.prices,
          type_price: res.data.type_price,
          additionals: res.data.additional,
          form: res.data.form
        })
      }
    }
  })
}
var getAD = function (that) {  //获取报名页广告图
  wx.request({
    url: app.globalData.https +'index.php/Home/Xiaoxxf/getAD',
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
var getTwo = function (that) {    //活动参加_activity_join
  wx.request({
    url: app.globalData.https+'index.php/Home/Xiaoxxf/getTwo',
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

var totalMoney = function (that,type){
  //num 人数
  //pIndex 价格套餐
  wx.showLoading({
    title: '',
  })
  var num = that.data.data_num;
  var pIndex = that.data.enlist_type;
  var id = that.data.a_id;
  var additional = that.data.additional;
  if (pIndex == 0 || num == 0 || num == undefined || num == ''){
    return;
  }else{
    wx.request({
      url: app.globalData.https + 'index.php/Home/XiaoActivity/getTotalMoney',
      data: {
        "num": num,
        "typePrice": pIndex,
        'additional': additional,
        'id':id,
      },
      header: {
        "Content-Type": "application/json"
      },
      method: 'GET',
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        if(res.data.code == 200 ){
          that.setData({
            total_money:res.data.totalMoney
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            success(res) {
              lastTypePriceChecked(that);
              lastAdditional(that);
            }
          })
        }
      }
    })
  }
}
//价格单选和选中值还原为上一次选择
var lastTypePriceChecked = function(that){
  var type_price = that.data.type_price
  for (var index in type_price) {
    console.log(type_price[index]);
    console.log(index);
    if (index == that.data.last_enlist_type - 1) {
      if (type_price[index].disabled == false){
        type_price[index].checked = false;
      } else if (index == 0){
        type_price[index].checked = false;
      }else{
        type_price[index].checked = true;
      }
    } else {
      type_price[index].checked = false;
    }
  }
  that.setData({
    type_price: type_price,
    enlist_type: that.data.last_enlist_type
  })
}

var lastAdditional = function(that){
  var additional = that.data.additionals;
  for (var index in additional) {
    console.log(additional[index]);
    console.log(index);
    if (index == that.data.last_additional - 1) {
      additional[index].checked = true;
    } else {
      additional[index].checked = false;
    }
  }
  that.setData({
    additionals: additional,
    additional: that.data.last_additional
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    a_id: '',
    act_name: '',
    unitPrice: '',
    is_home: '',
    selected: true,
    areaIndex: 0,   //默认未选择游学目的
    needyx: true,
    IDcard_unneed: true,
    flag_bill: '2',  //默认需要不发票状态
    flag_safe: '0',  //默认【请选择】选项，picker组件获取下标
    enlist: [
      {},
      {},
      {},
    ],
    last_additional:1,//上一次住宿选择
    additional: '1', //住宿默认
    last_enlist_type:1,//上一次报名选择
    enlist_type: '1',//报名默认
    sex: '1',
    data_num:'1',
    showView: false,
    showView1: false,
    showView2: false,
    showView3: false,
    showModal: false,
    array: [
      { name: '2', value: '否', checked: 'true' },
      { name: '1', value: '是' },
    ],
    enlist1: [
      'true', ''
    ],
    enlist2: [
      '', ''
    ],
    enlist3: [
      '', 'false'
    ],
    total_money:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log()
    that.setData({
      a_id: options.a_id,
      is_home: options.is_home,

    })

    // -------------  获取报名广告图片  ------------------
    getAD(that);
    //活动用户信息+活动名称和类型+默认套餐一价格
    getActivityName(that);
    getTwo(that);

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
    var formInput ='text';
    var formName = 'name1';
    var formValue = 'name1';
    var formTitle = ''; 
    totalMoney(this,'onShow');
  },
  //监听报名方式
  radioEnlist: function (e) {
    var that = this;
    console.log(e);
    that.setData({
      last_enlist_type:that.data.enlist_type,
      enlist_type: e.detail.value,
    })
    totalMoney(this,'typeprice');
  },
  //性别
  radioSex:function(e){
    that.setData({
      sex: e.detail.value,
    })
  },
  //监听住宿要求
  radioAdditional: function (e) {
    var that = this;
    console.log(e);
    that.setData({
      last_additional:that.data.additional,
      additional: e.detail.value,
    })
    totalMoney(this, 'additional');
  },
  //监听单选框发票信息，获得name属性
  listenerRadioGroup: function (e) {
    var that = this;
    console.log(e);
    that.setData({
      flag_bill: e.detail.value,
    })
    console.log(that.data.flag_bill);
  },

  //监听下拉框picker游学目的，获得下标
  bindPickerChange: function (e) {
    var that = this;
    console.log(e);
    this.setData({
      areaIndex: e.detail.value
    })
    if (that.data.form.purpose.list[that.data.areaIndex] == '其它') {
      that.setData({
        flag_safe: 1,//需要保险
        needyx: false,  //展示游学目的
      })
    } else {
      that.setData({
        flag_safe: 0,//请选择
        needyx: true,//隐藏游学目的
      })
    }
  },
  setNum:function(e){
    //将人数存起来方便计算实时价格
    this.setData(
      {
        data_num:e.detail.value
      }
    )
    totalMoney(this,'num');
  },
  //发票信息
  checked: function () {
    var that = this;
    if (that.data.flag_bill == 1) {
      that.setData({
        checked: true
      })
    } else {
      that.setData({
        checked: false
      })
    }
  },

  //以下四个方法对应发票的四个选项
  onChangeShowState: function () {
    var that = this;
    if (that.data.showView) {
      that.setData({
        showView: (!that.data.showView)
      })
    } else {
      that.setData({
        showView: (!that.data.showView)
      })
    }
  },
  onChangeShowState1: function () {
    var that = this;
    that.setData({
      showView1: (!that.data.showView1)
    })
  },
  onChangeShowState2: function () {
    var that = this;
    that.setData({
      showView2: (!that.data.showView2)
    })
  },
  onChangeShowState3: function () {
    var that = this;
    that.setData({
      showView3: (!that.data.showView3)
    })
  },
  //选择的金额类型和数额
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
  /**
   * 自定义方法，校验form数据
   */
  onGotUserInfo: function (e) {
    var that = this;
    util.onGotUserInfo(that, app, e);
  },
  onCancel: function () {
    this.setData({
      showModal: false
    });
  },
  onShowModal: function () {
    this.setData({
      showModal: true
    })
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }
  },
  showModal: function (content, title = '提示'){
    wx.showModal({
      title:title,
      content: content,
      showCancel: false,
      success(res) {
      }
    })
  },
  submitForm: function (e) {
    console.log(e)
    var that = this;
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
    
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

      var data = [];
      var form = that.data.form;

      if(form.name == true){
        if (e.detail.value.data_name.length <= 0 || e.detail.value.data_name.length > 20) {
          console.log(222);
          that.showModal('姓名在1~20字之间!');
          return;
        }
      }
      
      if(form.mobile == true){
        if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {
          that.showModal('请输入有效11位手机号码!');
          return;
        } 
      }

      if(form.sex == true){
        
      }

      if(form.company == true){
        if (e.detail.value.data_company.length <= 0 || e.detail.value.data_company.length > 50) {
          that.showModal('公司在1~50字之间!');
          return;
        } 
      }

      if (form.purpose.display == true) {
        var purpose = form.purpose.list[that.data.areaIndex]
        var data_purpose ='';
        if (purpose == form.purpose.list[0]) {
          that.showModal('请选择游学目的')
          return;
        } else if (purpose == '其它') {
          if (util.trim(e.detail.value.data_purpose) == '') {
            that.showModal('请填写游学目的')
            return;
          } else {
            data_purpose = e.detail.value.data_purpose
          }
        } else {
          data_purpose = purpose;
        }
      }

      if (form.invoice == true){
        if (that.data.flag_bill == 1 && util.trim(e.detail.value.duty_paragraph) == '') { //需要发票,条件校验
          that.showModal('发票税号有误')
          return;
        } else if (that.data.flag_bill == 1 && util.trim(e.detail.value.address) == '') {
          that.showModal('发票地址有误')
          return;
        } else if (that.data.flag_bill == 1 && util.trim(e.detail.value.account) == '') {
          that.showModal('发票账号有误')
          return;
        } else if (that.data.flag_bill == 1 && util.trim(e.detail.value.bank) == '') {
          that.showModal('发票开户行有误');
          return;
        }
      }


      var fId = e.detail.formId;
      var fObj = e.detail.value;
      var l = app.globalData.https +'index.php/Home/XiaoApi/send_msg';
      //var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + that.data.access_token;  //微信规定：api.weixin.qq.com域名不能直接调，只能后台发起调用

      if (that.data.is_home == 0) {   //报名参加youxue活动--传参
        wx.showModal({
          title: '提示',
          content: '确认要参与吗？',
          success: function (sm) {
            //http://www.xxf.cn/index.php/QiyiXCC/YouXue/new_make_order
            if (sm.confirm) {
              // 用户点击了确定 可以调用方法了,除开’套餐‘，’众筹‘
              if (that.data.ACT_TYPE != 'pack' && that.data.ACT_TYPE != 'zhongchou') {
                wx.request({
                  url: app.globalData.https +'index.php/Home/xiaoActivity/make_order',
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  method: "POST",
                  data: { 
                    is_home: that.data.is_home, 
                    openid: wx.getStorageSync('openid'), 
                    data_name: e.detail.value.data_name, 
                    data_phone: e.detail.value.data_phone, 
                    data_company: e.detail.value.data_company, 
                    data_IDcard: e.detail.value.data_IDcard || '', 
                    flag_safe: that.data.flag_safe, 
                    flag_bill: that.data.flag_bill, 
                    duty_paragraph: e.detail.value.duty_paragraph || '', 
                    address: e.detail.value.address || '', 
                    account: e.detail.value.account || '', 
                    bank: e.detail.value.bank || '', 
                    data_remark: e.detail.value.data_remark, 
                    data_total: that.data.total_money, 
                    data_num: that.data.data_num,
                    a_id: that.data.a_id, 
                    additional: that.data.additional, 
                    enlist_type: that.data.enlist_type, 
                    data_position: e.detail.value.data_position, 
                    data_purpose: data_purpose, 
                    sex: that.data.sex },
                  success: function (res) {
                    console.log();
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
                            url: '../activity_detail/activity_detail?id=' + that.data.a_id,
                            success: function (res) { },
                            fail: function (res) { },
                            complete: function (res) { }
                          }),
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
                            url: app.globalData.https+'index.php/Home/XiaoApi/sms', //发送短信接口
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
                        url: app.globalData.https +'index.php/Home/XiaoApi/sms', //发送短信接口
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

                      util.confirm('系统繁忙，请稍后重试~')
                    }

                  },
                  fail: function (res) {  //make_order2第三方自定义方法失败

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
  },


})