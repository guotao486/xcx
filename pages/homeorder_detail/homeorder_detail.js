var util = require('../../utils/util.js')  //引入公共js文件util.js
var change_qrcode = function(that,order_id,qrcode_id){
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/use_qrcode',
    data: {
      "order_id":order_id||0,
      "id": qrcode_id || 0,//电子券订单表id
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      if(res.data.state==0){
        
        util.confirm(res.data.Msg)
      }else{//使用成功
        that.setData({
          qrcode_msg:res.data,
        })
        
        util.confirm('恭喜您，使用成功~')
      }
      console.log(res.data);
    },
  })
}

Page({
  data: {
   order_id:''
  },

  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1200
    })
    that.setData({
      order_id: options.order_id,
      hasGift:options.hasGift,
    })
    console.log(options.hasGift);
  //------------   hasGift==1，有赠品，调用赠品信息二维数组    -------------
    if(that.data.hasGift==1){
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/get_qrcode?order_id=' + options.order_id,
        data: '',
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          that.setData({
            qrcode_msg: res.data    //订单赠品详情
          })
          console.log(res.data);
        },
      })
    }
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoUser/home_order_detail?order_id=' + options.order_id,
      data: '',
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          order_msg: res.data    //房间订单详情
        })
        console.log(res.data);
      },
    })
  },

use_qrcode:function(e){
  // 用户点击了确定 可以调用方法了
  var that = this;
  that.setData({
    order_id: e.currentTarget.dataset.id,
    id: e.currentTarget.dataset.qrcodeid,
  })
  wx.showModal({
    title: '提示',
    content: '确认要使用吗？该操作不可撤销',
    success: function (sm) {
     if (sm.confirm) {
      //去后台更改电子券二维码状态为已使用,无效
        change_qrcode(that,that.data.order_id,that.data.id);
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }

})