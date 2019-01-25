// page/component/details/details.js
// 引入wxParse.js解析文件
var app = getApp()
var WxParse = require('../../../../wxParse/wxParse.js');
var util = require('../../../../utils/util.js')
var loginStatus = true;//默认授权成功
var getPromission = function (that) {
  util.getPromission(that, app);
}
var commentList = function(that,gid,commentType,page){
  //评论列表
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/goodsComment',
    data: {
      id: gid,
      page:page,
      type:commentType
      },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: 'get',
    success: function (res) {
      console.log(res.data);
      if(res.data.code == 200){
        that.setData({
          comment:res.data.data.data,
          c_num:res.data.data.count,
          c_good: res.data.data.good,
          c_medium: res.data.data.medium,
          c_bad: res.data.data.bad,
        })
      }
    }
  })

}

Page({
  data:{
    num: 1,
    totalNum: 0,
    hasCarts: true,
    curIndex: 0,
    show: false,
    scaleCart: false,

    aniStyle: true, 
    showView: true, //加入购物车显示隐藏

    showViews: true, //分享显示隐藏

    page:1,
    commentType:0,

    scrollTop: 0,

    _num: 0 ,//规格切换
    products:0,
    p_store:100,
    p_price:0.00,

    showModal:false,
  },
  onGotUserInfo: function (e) {
    var that = this;
    util.onGotUserInfo(that, app,e);
  },
  onCancel:function () {
    this.setData({
      showModal: false
    });
  },
  onShowModal:function(){
    this.setData({
      showModal: true
    })
  },
  onShow:function(){

    var that = this
    that.setData({
      showView:true,
      showViews:true
    })

    //调用应用实例的方法获取全局数据
    var userInfo = wx.getStorageSync('userInfo')
    if (!wx.getStorageSync('userInfo')) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }

    // app.getUserInfo(function (userInfo) {
    //   console.log(userInfo);
    //   if (userInfo == null) {//拒绝授权
    //     console.log('ddd');
    //     that.onShowModal()
    //     // wx.navigateTo({
    //     //   url: '/pages/loading/loading?type=shop_details&id=' + that.options.gid
    //     // })
    //     // getPromission(that,app,modal);
    //   } else {                 //授权
    //     that.setData({
    //       userInfo: userInfo,
    //     })
    //   }
    // })

    //详情
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/goodsInfo',
      data: {
        id:that.options.gid
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          var products=0;
          var p_store = 0;
          var p_price = 0.00;
          if (res.data.data.spec_array !== ''){
            products = res.data.data.products[0].products_no,
            p_store  = res.data.data.products[0].store_nums,
            p_price  = res.data.data.products[0].sell_price
          }else{
            p_price = res.data.data.sell_price,
            p_store = res.data.data.store_nums
          }
          that.setData({
            goods: res.data.data,
            products: products,
            p_store: p_store,
            p_price: p_price
          })
          var content = res.data.data.content
          WxParse.wxParse('content', 'html', content, that, 5);
        }
      }
    })

    //购物车数量
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/carNum',
      data: {
        openid: wx.getStorageSync('openid')
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if(res.data.data){
          that.setData({
            totalNum: res.data.data,
          })
        }
        
      }
    })

    commentList(that,that.options.gid, that.data.commentType,that.data.page)
  },

  //加入购物车显示隐藏
   onLoad: function (options) {
    showView: (options.showView == "true" ? true : false);
    showViews: (options.showViews == "true" ? true : false)
  }, 
  onChangeShowState: function (e) {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo')
    if (!wx.getStorageSync('userInfo')) {
      that.onShowModal()
    } else {
      
      var index = e.currentTarget.id

      that.setData({
        userInfo: userInfo,
        showView: (!that.data.showView),
        aniStyle: true,
        showType: index
      })
    }

    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo) {
    //   console.log(userInfo);
    //   if (userInfo == null) {//拒绝授权
    //     console.log('ddd');
    //     // wx.navigateTo({
    //     //   url: '/pages/loading/loading'
    //     // })
    //     // getPromission(that);
    //     // return;
    //     that.onShowModal()
    //   } else {                 //授权

    //     var index = e.currentTarget.id

    //     that.setData({
    //       userInfo: userInfo,
    //       showView: (!that.data.showView),
    //       aniStyle: true,
    //       showType: index
    //     })
    //   }
    // })
    
  },

  //分享显示隐藏
  onChangeShowStates: function (e) {
    var that = this;
    that.setData({
      showViews: (!that.data.showViews),
    })
  },

  //点击分享 商品
  onShareApp: function () {
    this.setData({
      showViews: true
    })
    this.onShareAppMessage()
  },

  addToCart() {
    const self = this;
    const num = this.data.num;//待添加数量
    let total = this.data.totalNum;//购物车数量

    self.setData({
      show: true
    })
    setTimeout( function() {
      self.setData({
        show: false,
        scaleCart : true
      })
      setTimeout( function() {
        self.setData({
          scaleCart: false,
          hasCarts : true,
          totalNum: num + total
        })
      }, 200)
    }, 300)
    

    //数据库更新购物车
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/addCar',
      data: {
        openid: wx.getStorageSync('openid'),
        gid: self.data.goods.id,
        num: num,
        products: self.data.products
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if(res.data.code == 200){
          wx.showToast({
            title: '加入购物车成功',
            icon: 'succes',
            duration: 1000,
            mask: true,
          })
          self.setData({
            showView:true
          })
        }
      }
    })
  },

  /**
   * 绑定购物车加数量事件
   */
  addCount() {
    var num = this.data.num;
    num++;
    if (num > this.data.goods.store_nums ){
      num = this.data.goods.store_nums;
    }
    this.setData({
      num: num,
    });
  },
  
  /**
   * 绑定购物车减数量事件
   */
  minusCount() {
    var num = this.data.num;
    if (num > 1) {
      num--;
    }

    this.setData({
      num: num,
    });
  },

  bindTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      curIndex: index
    })
  },
  bindCtype(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      commentType: index
    })
    commentList(this, this.options.gid, index, 1)
  },

  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - ' + that.data.goods.name,
      desc: that.data.goods.name,
      path: '/pages/shop/component/details/details?gid='+that.data.goods.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onReachBottom() {
    console.log(this.data.curIndex)
    this.data.page = ++this.data.page;
    if (this.data.curIndex == 2){
      commentList(this,this.options.gid, this.data.commentType, this.data.page)
    }
  },

   //规格切换
  click: function (e) {
    console.log(e.target.dataset)
    this.setData({
      _num: e.target.dataset.num,
      products:e.target.dataset.products,
      p_store: this.data.goods.products[e.target.dataset.num].store_nums,
      p_price: this.data.goods.products[e.target.dataset.num].sell_price
    })
  },

  // 返回顶部
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function (e, res) {
    if (e.detail.scrollTop > 500) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },


})