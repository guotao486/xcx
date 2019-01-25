// page/component/orders/orders.js
Page({
  data:{
    address:{},
    hasAddress: false,
    total:0,
    num:0,
    orderType:'car',
    list:[],
    content:[]
  },

  onReady() {
    
  },
  
  onShow:function(){
    const self = this;
    var data = [];
    data.openid = wx.getStorageSync('openid');

    console.log(self.options)
    if (self.options.gid && self.options.num){
      data.gid = self.options.gid;
      data.num = self.options.num;
      self.setData({
        orderType:'goods'
      })
    }
    
    if (self.options.products !== '0' && self.options.products){
      data.products = self.options.products;
      console.log(data)
    }
    
    console.log(data);
    //地址
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
    //购买商品
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderCar',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if(res.data.code==200){
          for (let i = 0; i < res.data.data.length;i++){
            self.data.content[res.data.data[i].id]='';
          }
          self.setData({
            list:res.data.data
          })
          console.log(self.data.content)
          self.getTotalPrice();
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateBack();
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  },

  /**
   * 计算总价
   */
  getTotalPrice() {
    let list = this.data.list;
    let total = 0;
    let num = 0;
    
    for(let i = 0; i < list.length; i++){
      if (list[i].goods) {
        for (let g = 0; g < list[i].goods.length; g++) {
          total += list[i].goods[g].num * list[i].goods[g].price;
          num += parseInt(list[i].goods[g].num);
        }
      }
      if (list[i].product) {
        for (let p = 0; p < list[i].product.length; p++) {
          total += list[i].product[p].num * list[p].product[p].price;
          num += parseInt(list[i].product[p].num)
        }
      }
      total += parseInt(list[i].delivery)
    }
    
    this.setData({
      total: total.toFixed(2),
      num:num
    })
  },

  toPay() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定开始支付吗？',
      text:'center',
      success: function (res) {
        var data = [];
        data.openid = wx.getStorageSync('openid'),
        data.orderType = that.data.orderType
        data.content = that.data.content
        if(that.data.orderType == 'goods'){
          if (that.data.list[0].goods) {
            data.gid = that.data.list[0].goods[0].id,
            data.num = that.data.list[0].goods[0].num
          } else {
            data.gid = that.data.list[0].products[0].id,
            data.num = that.data.list[0].products[0].num,
            data.products = that.data.list[0].products[0].goods_no
          }
        }

        if (res.confirm) {
          console.log('用户点击确定')
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/orderCreate',
            data: data,
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
                      wx.redirectTo({  //跳转到应用内页面（次页面）
                        url: '../user/user',
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { }
                      })
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
                  complete() {
                    wx.navigateBack();
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
  address(){
    wx.chooseAddress({
      success: function (res) {
        console.log(res.userName)
        console.log(res.postalCode)
        console.log(res.provinceName)
        console.log(res.cityName)
        console.log(res.countyName)
        console.log(res.detailInfo)
        console.log(res.nationalCode)
        console.log(res.telNumber)
      }
    })
  },
  orderContent(e){
    var str = e.detail.value;
    var sid = e.currentTarget.id;
    this.data.content[sid] = sid+'&'+str;
  }
  
})