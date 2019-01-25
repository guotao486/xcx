// pages/auth/auth.js
var util = require('../../../utils/util.js')
var app = getApp()

var getTab = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getTab2',
    data: {
      "type": "onload",
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
    header: {
      'Content-Type': 'application/json'
    },
    success: function (res) {
      console.log(res);
      that.data.dataType = res.data.dataType,
        that.setData({
          tab: res.data.tab,
          type: res.data.type,
        })
    }
  });
}

var GetList_by = function (that, type) {   //通配版本--xzz1219
  
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getStory',
    data: {
      type: type,
      //"type": "FTWH" //风土物候
      page: that.data.page,
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
    header: {
      'Content-Type': 'application/json'
    },
    success: function (res) {
      wx.hideLoading();
      console.log(res)
      that.setData({
        list: res.data
      })
    }
  });
}
var commentList = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/xnCommentList',
    data: {
      'page': that.data.page
    },
    method: 'GET',
    success: function (res) {
      wx:wx.hideLoading();
      if (res.data.code == 400) {
        util.confirm(res.data.msg)
      } else {
        that.setData({
          list: res.data.list
        })
      }
    }
  })
}
var getHeadList = function (that) {   //通配版本--xzz1219
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/xnRecommend',
    data: {
     
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
    header: {
      'Content-Type': 'application/json'
    },
    success: function (res) {
      
      console.log(res)
      that.setData({
        headList: res.data
      })
    }
  });
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    num: 0,
    page:1,
    list:[],
    dataType:'znmq',
    showModal: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '请稍等',
    })
    getHeadList(that);
    getTab(that);
    GetList_by(that,that.data.dataType);
  },

  
  /** 弹窗*/
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
       * 隐藏模态对话框
       */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  /** 对话框取消按钮点击事件*/
  onCancel: function () {
    this.hideModal();
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
    // var that = this
    // var userInfo = wx.getStorageSync('userInfo')
    // if (!userInfo) {
    //   that.onShowModal()
    // }
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

  },

  //点击切换
  swichNav: function (e) {
    var that = this;
    wx.showLoading({
      title: '请稍等',
    })
    
    if (that.data.num != e.target.dataset.num){
      that.data.page=1;
      if(e.target.dataset.num!=2){
        GetList_by(that, e.target.dataset.type);
      }else{
        commentList(that);
      }
    }
    that.setData({
      num: e.target.dataset.num,
      dataType: e.target.dataset.type
    })
  },
  onReachBottom: function () {
    this.data.page += 1;
    if(this.data.num!=2){
      GetList_by(this, this.data.dataType);
    }else{
      commentList(this);
    }
    
   
  },
  formSubmit:function(e){
    var that=this;
    if (e.detail.value.name.length <= 0 || e.detail.value.name.length > 20) {

      util.confirm('姓名在1~20字之间!')
    } else if (!(/^1[3,5,6,7,8,9]\d{9}$/).test(e.detail.value.tel)) {

      util.confirm('请输入有效11位手机号码!')
    } else if (e.detail.value.company.length <= 0 || e.detail.value.company.length > 50) {

      util.confirm('单位在1~50字之间!')
    } else if (util.trim(e.detail.value.describe) == '') {
      util.confirm('请填写简介')
    }else{
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/xnComment',
        data: {
          "name": e.detail.value.name,
          "tel": e.detail.value.tel,
          "company": e.detail.value.company,
          "describe": e.detail.value.describe
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'POST',
        success: function (res) {
        
          if(res.data.code == 400){
            util.confirm(res.data.msg)
          }else{
            that.hideModal();
            wx.showToast({
              title: res.data.msg,
              success:function(){
                
              }
            })
            commentList(that);
            
          }
        }
      })
    }
    }
})