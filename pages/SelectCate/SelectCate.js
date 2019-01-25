// pages/SelectCate/SelectCate.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: true,   //价格选中状态切换
    selected1: false,
    selected2: false,

    //阶梯价格从后台获取 -xzz1124
    price:'', //选择的价格，onload进行初始化
    price1:'',
    price2: '',
    price3: '',

  },

  selected: function (e) {
    var that = this
    that.setData({
      //样式变更
      selected1: false,
      selected2: false,
      selected: true,
      //选择价格变更
      price:that.data.price1,
    })
  },
  selected1: function (e) {
    var that = this
    that.setData({
      //样式变更
      selected: false,
      selected1: true,
      selected2: false,
      //选择价格变更
      price: that.data.price2,
    })
  },
  selected2: function (e) {
    var that = this
    that.setData({
      //样式变更
      selected: false,
      selected1: false,
      selected2: true,
      //选择价格变更
      price: that.data.price3,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xian/onload_price',
      data: {
        type:'onload_price',//后台初始化加获取价格
      },
      header: { 'Content-Type': 'application/json'},
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        console.log(res);
        that.setData({
          price: res.data.price,
          price1: res.data.price1,
          price2: res.data.price2,
          price3: res.data.price3,
        })
      },
      fail: function(res) {},
      complete: function(res) {},
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
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '第三届乡贤论坛暨第五届全国爱故乡大会-报名通道',
      desc: '第三届乡贤论坛暨第五届全国爱故乡大会-报名通道',
      path: '/pages/SelectCate/SelectCate',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})