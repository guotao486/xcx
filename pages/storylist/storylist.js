var getHome1 = function (that) {  //乡野民宿1
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service',  
    data: {
      "home_type":that.data.typeId
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

var home_type = function(that){
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_type',
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      console.log(res)
      that.setData({
        homeType: res.data
      })
    },
    fail: function (res) { },
    complete: function (res) { },
  })
}

Page({
  data: {
    c_url:'',
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var that = this
    home_type(that);
    that.setData({
      c_url:'http://www.xxiangfang.com/data/uploads/2017/07/27/shoucanghui@3x.png'
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: parseInt(res.windowHeight) + 200
        })
      }
    });
    getHome1(that);
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
    //缓冲提醒
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 400
    })
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
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 旅居',
      desc: '一间西厢房，心安即吾乡',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //点击指示点切换  
 
  data: {
    selected: true,
    selected1: false,
    selected2: false,
    sortPanelTop: '0',
    sortPanelDist: '290',
    sortPanelPos: 'relative',
    scrollTop: 0,
    typeId:1
  },
  selected: function (e) {
    var that = this;
    console.log(e);
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    this.setData({
      typeId:e.currentTarget.dataset.id,
      selected1: false,
      selected2: false,
      selected: true
    })
    this.setData({
      scrollTop: 300
    })
    getHome1(that);
  },
  scroll: function (e, res) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    var that = this;
    if (e.detail.scrollTop > 500) {
      this.setData({
        floorstatus: true
      });
    }
    else {
      this.setData({
        floorstatus: false
      });
    }

    if (e.detail.scrollTop >= 240 && that.data.sort != 'sort-panels') {// 滚动非初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        sort: "sort-panels",
      })
    } else if (e.detail.scrollTop < 240 && that.data.sort == 'sort-panels') { //滚动初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        sort: "sort-panel",
      })
    }
  }

})