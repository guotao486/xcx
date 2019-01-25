
Page({
  data: {
    indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 800,
    scrollTop: 0
  },
  onLoad:function(){
    
  },
  onShow:function(){
    wx.showLoading({
      title: '',
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    var that = this;
    //轮播图
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/banner',
      data: {
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if(res.data.code==200){
          that.setData({
            imgUrls: res.data.data
          })
          wx.hideLoading()
        }
        
      }
    })
    //推荐
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/goodsList',
      data: {
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          that.setData({
            commendGoods: res.data.data
          })
        }
      }
    })
    //新品
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/newGoods',
      data: {
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          that.setData({
            newGoods: res.data.data
          })
        }
      }
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载

    //模拟加载
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 3000);
  },
  /**
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 文创',
      desc: '一间西厢房，心安即吾乡',
      path: '/pages/shop/component/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 回到顶部
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function (e, res) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    if (e.detail.scrollTop > 300) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
      }
  }

})