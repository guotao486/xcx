var app = getApp()
var article = function(that,type){
  wx.showLoading({
    title: '加载中',
    mask: true,
    success: function (res) { },
    fail: function (res) { },
    complete: function (res) { },
  })
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/homeArticleList',    //房间评论
    data: {
      'type': type,
      page: that.data.page
    },
    method: 'GET',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    dataType: 'json',
    success: function (res) {
      wx.hideLoading();
      console.log(res.data);
      if(res.data.code == 1){
        that.setData({
          'list':res.data.list
        })
      }else{
      
        wx.showToast({
          title: '暂无数据',
          icon: '',
          image: '',
          duration: 0,
          mask: true,
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
      }
    }
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    num: 0,
    page:0,
  },

  onShow:function(){
    article(this,this.data.num);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.setData({
      num:option.type
    })
  }, 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 旅居',
      desc: '回得去的故乡，进得去的家门',
      path: '/pages/storylist/storylist',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onSwiperTap: function (e) {
    //console.log(e);
    var thst = this;
    var postid = e.target.dataset.postid;
    wx.navigateTo({
      url: "../story_detail/story_detail?art_id=" + postid,
    })
  },
 
  //点击切换
  swichNav: function (e) {
    var that = this;
      that.setData({
        num: e.target.dataset.num
      })
    article(that, e.target.dataset.num);
  } ,

  onReachBottom:function(){
    this.data.page+=1;
    article(this, this.data.num);
  }

})
