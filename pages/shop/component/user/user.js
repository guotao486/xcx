// page/component/new-pages/user/user.js
var Getlist = function (that,type,page) {//全部订单
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderList',
    data: {
      "type": type,
      "openid": wx.getStorageSync('openid'),
      page:page
    },
    header: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      if(res.data.code == 200){
        that.setData({
          orderListHas: true,
          orders:res.data.data,
          orderType:res.data.type
        })
      }else{
        that.setData({
          orders:'',
          orderListHas: true,
          orderMsg: res.data.msg,
          orderType:res.data.type
        })
      }
    }
  })
}

Page({
  data:{
    thumb:'',
    nickname:'',
    orders:[],
    hasAddress:false,
    address:{},
    selected1: true,
    selected2: false,
    selected3: false,
    selected4: false,
    selected5: false,
    orderListHas:true,
    page:1,
    orderType:1
  },
  selected: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    console.log(id);
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    switch(id){
      case '1':
        that.setData({
          selected1: true,
          selected2: false,
          selected3: false,
          selected4: false,
          selected5: false,
          page:1
        })
        break;
      case '2':
        that.setData({
          selected1: false,
          selected2: true,
          selected3: false,
          selected4: false,
          selected5: false,
          page: 1
        })
        break;
      case '3':
        that.setData({
          selected1: false,
          selected2: false,
          selected3: true,
          selected4: false,
          selected5: false,
          page: 1
        })
        break;
      case '4':
        that.setData({
          selected1: false,
          selected2: false,
          selected3: false,
          selected4: true,
          selected5: false,
          page: 1
        })
        break;
      case '5':
        that.setData({
          selected1: false,
          selected2: false,
          selected3: false,
          selected4: false,
          selected5: true,
          page: 1
        })
        break;
    }
    Getlist(that, id, this.data.page);
  },
  onLoad(){
    var self = this;
    /**
     * 获取用户信息
     */
    wx.getUserInfo({
      success: function(res){
        self.setData({
          thumb: res.userInfo.avatarUrl,
          nickname: res.userInfo.nickName
        })
      }
    })
  },
  onShow(){
    var self = this;
    /**
     * 获取 地址信息
     */
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/addressDefault',
      data: {
        openid: wx.getStorageSync('openid'),
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 200) {
          self.setData({
            address: res.data.data,
            hasAddress: true
          })
        }
      }
    })
    
    Getlist(self, self.data.orderType, this.data.page);
    
  },
  onReachBottom(){
    this.data.page = ++this.data.page;
    Getlist(this,this.data.orderType,this.data.page)
  },
  orderDel(e){
    console.log(e)
    var orderId = e.currentTarget.id;
    var orderType = e.currentTarget.dataset.type;
    var self = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      text: 'center',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderDel',
            data: {
              openid: wx.getStorageSync('openid'),
              orderId: orderId
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'post',
            success: function (res) {
              console.log(res.data);
              if (res.data.code == 200) {
                wx.showToast({
                  title: res.data.msg,
                  duration: 1000
                })
                Getlist(self, orderType,self.data.page);
              } else {
                wx.showModal({
                  title: '提示',
                  content: '删除订单失败',
                  text: 'center',
                  showCancel: false,
                  success: function (res) {

                  }
                })
              }
            }
          })
        }
      }
    })
  },
  orderComplete(e){
    console.log(e)
    var orderId = e.currentTarget.id;
    var orderType = e.currentTarget.dataset.type;
    var self = this
    wx.showModal({
      title: '提示',
      content: '确定已签收吗？',
      text: 'center',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderComplete',
            data: {
              openid: wx.getStorageSync('openid'),
              orderId: orderId
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'post',
            success: function (res) {
              console.log(res.data);
              if (res.data.code == 200) {
                wx.showToast({
                  title: res.data.msg,
                  duration: 1000
                })
                Getlist(self, orderType,self.data.page);
              } else {
                wx.showModal({
                  title: '提示',
                  content: '确认收货失败',
                  text: 'center',
                  showCancel: false,
                  success: function (res) {

                  }
                })
              }
            }
          })
        }
      }
    })
  },
  orderRefund(e){
    var orderId = e.currentTarget.id;
    wx.navigateTo({
      url: '../shop_return/shop_return?orderId=' + orderId + '&orderType=' + this.data.orderType
    })
  },
  /**
   * 发起支付请求
   */
  orderPay(e){
    console.log(e);
    var orderId = e.currentTarget.id;
    var orderType = e.currentTarget.dataset.type;
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定开始支付吗？',
      text: 'center',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderPay',
            data: {
              openid: wx.getStorageSync('openid'),
              orderId: orderId
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'post',
            success: function (res) {
              console.log(res.data);
              if (res.data.code == 200) {
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
                      Getlist(that, orderType, that.data.page)
                    },
                    'fail': function (res) {
                      console.log(res.errMsg);
                    },
                    'complete': function (res) {
                      console.log(res.errMsg);
                    }
                  })
                }
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  text: 'center',
                  showCancel:false,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }

            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  orderComment(e){
    var orderId = e.currentTarget.id;
    wx.navigateTo({
      url: '../shop_comment/shop_comment?orderId=' + orderId + '&orderType=' + this.data.orderType
    })
  }

})