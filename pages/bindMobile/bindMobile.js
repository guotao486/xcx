var countdown = 60;
var app = getApp()
var settime = function (that) {
  if (countdown == 0) {
    that.setData({
      is_show: true
    })
    countdown = 60;
    return;
  } else {
    that.setData({
      is_show:false,
      last_time:countdown
    })

    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }
    , 1000)
}
var util = require('../../utils/util.js')  //引入公共js文件util.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile:'',
    insertID:'',
    last_time:'',
    is_show:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      console.log(userInfo);
      //更新数据
      that.setData({
        userInfo: userInfo,
        "openid": wx.getStorageSync('openid')
      })
      console.log(that.data.openid);
    })
    that.setData({
      "msg":options.msg,
      "code":options.code   //code=0，未绑定；code=1，已绑定
    })
  console.log('code = '+that.data.code+that.data.msg);
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
   * 自定义方法，获取验证码之前需要校验手机号
   * 思路：通过<input bindconfirm="realnameConfirm">可将input值实时放入that.data里面，
   *      然后，给button绑定that.data校验事件即可
   */
  blur_mobile: function (e) {
    var that=this;
    var mobile = e.detail.value;
    that.setData({
      mobile:e.detail.value
    })
    //console.log(mobile);
  },
  clickVerify:function(){
    var that = this;
    // ------------- 2、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })

    if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(that.data.mobile)) {
      util.confirm('请输入有效11位手机号码!')
    } else if((/^1[3,5,6,7,8,9]\d{9}$/).test(that.data.mobile)) {
      // 将获取验证码按钮隐藏60s，60s后再次显示
      that.setData({
        is_show: (!that.data.is_show)   //false
      })
      settime(that);
      //请求服务器发送短信
        wx.request({
          url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/sms', //发送短信接口
          data: {
            'mobile':that.data.mobile,
            'type':'bindMobile',
            'openid': wx.getStorageSync('openid') 
            },
          header: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          success: function(res) {
            if(res.data.code == 1){
                console.log(res.data.msg);
                //将返回的insertID写入data，供下面submit校验
                that.setData({
                  insertID:res.data.msg
                })
            } else if (res.data.code == 0){
              console.log(res.data.msg);;
            }else{
                console.log(res.data.msg);
            }
            
          },
          fail: function(res) {
            console.log('发送失败~');
          },
          complete: function(res) {},
        })
    }


  },

  /**
   * 自定义方法，校验form数据(bindMobile)绑定手机号
   */
  bindMobile: function (e) {
    var that = this;

    // ------------- 2、检查用户登录态 ------------------
    wx.checkSession({
      success: function (res) {     //登录态未过期
        console.log(res.errMsg);
      },
      fail: function (res) {    //登录态过期
        wx.login();
      },
      complete: function (res) { },
    })

    if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.data_phone)) {

      util.confirm('请输入有效11位手机号码!')
    } else if (!(/^[0-9]{4}$/).test(e.detail.value.data_verify)){
      
      util.confirm('手机验证码有误!')
    }else{    //提交表单，进行验证码、手机号（和插入id)比较
        wx.showModal({
          title: '提示',
          content: '确定要绑定吗？',
          success: function (sm) {
            if (sm.confirm) {
              // 用户点击了确定 可以调用删除方法了
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/bindMobile', //发送短信接口
        data: {
          'mobile': that.data.mobile,
          'verify': e.detail.value.data_verify,
          'type': 'bindMobile',
          'insertID': that.data.insertID,   //验证码插入记录的ID
          'openid': wx.getStorageSync('openid') 
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          if (res.data.code == 1) {
            console.log(res.data.msg);
            util.confirm(res.data.msg)
          } else if (res.data.code == 0) {
            console.log(res.data.msg);
            
            util.confirm(res.data.msg)
          } else {
            console.log(res.data.msg);
            
            util.confirm(res.data.msg)
          }

        },
        fail: function (res) {
          console.log('发送失败~');
        },
        complete: function (res) { },
      })
      }
    }
  })
 }

  }

})