// pages/shop/component/shop_comment/shop_comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      orderType: this.options.orderType
    })
    console.log(this.options)
    var orderId = this.options.orderId;
    var that = this
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderEvaluate',
      data: {
        openid: wx.getStorageSync('openid'),
        orderId:orderId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if(res.data.code == 200){
          var x;
          for (x in res.data.data.goods) {
            that.data.comment[x] = { 
              'id': res.data.data.goods[x].id, 
              'order_id': res.data.data.goods[x].order_id, 
              'goods_id': res.data.data.goods[x].goods_id,
              'star': 5 ,
              'comment':''};
          }
          that.setData({
            order_time :res.data.data.create_time,
            goods: res.data.data.goods,
            order_no: res.data.data.order_no
          })
        }
      }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  starTap(e){
    console.log(e)
    var val = e.currentTarget.dataset.value;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.id;
    var sVal = this.data.goods[index].star[val-1].name
    if(sVal == 'star2.png'){
      for (var i = 4; i > val - 1; i--) {
        this.data.goods[index].star[i].name = 'star1.png';
      }
    }else{
      for (var i = 0; i <= val - 1; i++) {
        this.data.goods[index].star[i].name = 'star2.png';
      }
    }
    
    this.data.comment[index].star=val;
    
    this.setData({
      goods:this.data.goods
    })
    
  },
  commentSet(e){
    var index = e.currentTarget.id;
    var val = e.detail.value;
    this.data.comment[index].comment = val;
  },
  formSubmit:function(e){
    var that = this
    console.log(this.data.comment)
    var x;
    for (x in that.data.comment) {
      if (that.data.comment[x].comment==''){
        
        wx.showModal({
          title: '提示',
          content: '第'+(++x)+'个商品还没有填写评论',
          showCancel:false,
          success: function (res) {
            
          }
        })
        return;
      }
    }
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/commentSave',
      data: {
        openid: wx.getStorageSync('openid'),
        avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
        nickName: wx.getStorageSync('userInfo').nickName,
        data: that.data.comment
      },
      header: {
        "Content-Type": "application/json"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          wx.showToast({
            title: res.data.msg,
            duration: 1000
          })
          setTimeout(
            function(){
              wx.navigateBack({
                delta: 1
              })
            },1000
          )
          
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  }
})