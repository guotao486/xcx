// page/component/new-pages/cart/cart.js
Page({
  data: {
    carts_goods:[],               // 购物车列表
    carts_product:[],
    list:[],
    hasList:false,          // 列表是否有数据
    totalPrice:0,           // 总价，初始为0
    selectAllStatus:true,    // 全选状态，默认全选
    obj:{
        name:"hello"
    },
    locationSet:true,
    showView: true,  //编辑 删除
  },
  onShow() {
    var that = this
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/carInfo',
      data: {
        openid: wx.getStorageSync('openid')
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        if(res.data.code == 200){
          that.setData({
            hasList: true,
            list:res.data.data,
            totalPrice: res.data.totalPrice.toFixed(2),
            sumNum:res.data.sumNum,
            selectAllStatus: res.data.selectAllStatus
          })
          that.getTotalPrice();
        }else{
          that.setData({
            hasList: false,
          })
        }
      }
    })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
       
        that.setData({
          locationSet: true,
        })
        wx.request({
          url: 'https://api.map.baidu.com/geocoder/v2/?ak=N0y51VkBsgnOdVXmVLFgS4tBDqnos6l2&location=' + latitude + ',' + longitude + '&output=json',
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            // success
            console.log(res);
            var city = res.data.result.addressComponent.city;
            var province = res.data.result.addressComponent.province;
            var district = res.data.result.addressComponent.district;
            that.setData({ city: province+city+district});
          }
        })
      }
    })
    //判断是否获得了用户地理位置授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']){
          that.setData({
            locationSet: false,
          })
        }
      }
    })
  },

  /**
   * 删除购物车当前商品
   */
  deleteList(e) {
    console.log(e)
    const sid = e.currentTarget.dataset.sid;
    const index = e.currentTarget.dataset.index;
    var cType = e.currentTarget.dataset.type;

    let carts = this.data.list[sid][cType];
    
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/carGoodsDel',
      data: {
        openid: wx.getStorageSync('openid'),
        gid: carts[index].goods_no,
        type:cType
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
      }
    })

    carts.splice(index,1);
    this.data.list[sid][cType] = carts;
    

    if (this.data.list[sid].goods && this.data.list[sid].product){
      if (!this.data.list[sid].goods.length && !this.data.list[sid].product.length){
        this.data.list.splice(sid, 1);
      }
    } else if (!this.data.list[sid].goods && this.data.list[sid].product){
      if (!this.data.list[sid].product.length) {
        this.data.list.splice(sid, 1);
      }
    } else if (this.data.list[sid].goods && !this.data.list[sid].product){
      if (!this.data.list[sid].goods.length) {
        this.data.list.splice(sid, 1);
      }
    }

    this.setData({
      list: this.data.list
    })
    if (!this.data.list.length){
      this.setData({
        hasList: false
      });
    }else{
      this.getTotalPrice();
    }
  },
  /**
     * 当前商品选中事件
     */
  selectList(e) {
    console.log(e)
    var cType = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    const sid = e.currentTarget.dataset.sid;
    var carts = this.data.list[sid][cType];

    const selected = carts[index].selected;
    carts[index].selected = !selected;
    this.data.list[sid][cType] = carts;

    var goodsSelect = true;
    var productSelect = true;
    if (this.data.list[sid].goods) {
      for (let g = 0; g < this.data.list[sid].goods.length; g++) {
        if (this.data.list[sid].goods[g].selected == true){
          goodsSelect = true;
          break;
        }else{
          goodsSelect = false;
        }
      }
    }
    if (this.data.list[sid].product) {
      for (let p = 0; p < this.data.list[sid].product.length; p++) {
        if (this.data.list[sid].product[p].selected == true) {
          productSelect = true;
          break;
        } else {
          productSelect = false;
        }
      }
    }
    if (productSelect == false && goodsSelect == false){
      this.data.list[sid].sellerStatus == false
    }
    if (productSelect == true && goodsSelect == true){
      this.data.list[sid].sellerStatus == true
    }
    this.setData({
      list: this.data.list
    })
    this.getTotalPrice();
    this.carGoodsSelect();
  },
  /**
   * 店铺全选
   */
  selectSeller(e){
    const sid = e.currentTarget.dataset.sid;
    var list = this.data.list;

    const selected = !list[sid].sellerStatus;
    list[sid].sellerStatus = selected;
    
    // 循环列表得到每个数据
    if (list[sid].goods) {
      for (let g = 0; g < list[sid].goods.length; g++) {
        list[sid].goods[g].selected = selected
      }
    }
    if (list[sid].product) {
      for (let p = 0; p < list[sid].product.length; p++) {
        list[sid].product[p].selected = selected
      }
    }

    this.setData({
      list: list
    })
    this.getTotalPrice();
    this.carGoodsSelect();
  },
  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    var list = this.data.list;
    for (let i = 0; i < list.length; i++){
      list[i].sellerStatus = selectAllStatus;
      if (list[i].goods) {
        for (let g = 0; g < list[i].goods.length; g++) {
          list[i].goods[g].selected = selectAllStatus
        }
      }
      if (list[i].product) {
        for (let p = 0; p < list[i].product.length; p++) {
          list[i].product[p].selected = selectAllStatus
        }
      }
    }
   
    this.setData({
      selectAllStatus: selectAllStatus,
      list:list
    });
    this.getTotalPrice();
    this.carGoodsSelect();
  },
  carGoodsSelect(){
    var ungid = new Array();
    var list = this.data.list;
    for (let i = 0; i < list.length; i++) {         // 循环列表得到每个数据
      if (list[i].goods) {
        for (let g = 0; g < list[i].goods.length; g++) {
          if (list[i].goods[g].selected == false) {
            ungid.push(list[i].goods[g].goods_no)
          }
        }
      }
      if (list[i].product) {
        for (let p = 0; p < list[i].product.length; p++) {
          if (list[i].product[p].selected == false) {
            ungid.push(list[i].product[p].goods_no)
          }
        }
      }
    }
    
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/carGoodsSelect',
      data: {
        openid: wx.getStorageSync('openid'),
        ungid: ungid,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
      }
    })
  },
  /**
   * 绑定加数量事件
   */
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    const sid = e.currentTarget.dataset.sid;
    var cType = e.currentTarget.dataset.type;
    let carts = this.data.list[sid][cType];
    
    let num = carts[index].num;
    num = parseInt(num) + 1;
    if(num > carts[index].store_nums){
      num = carts[index].store_nums
    }
    carts[index].num = num;

    this.data.list[sid][cType] = carts;
  
    this.setData({
      list: this.data.list
    });
    
    this.getTotalPrice();
    this.carGoodsNum(carts, index, cType);
  },

  /**
   * 绑定减数量事件
   */
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    const sid = e.currentTarget.dataset.sid;
    var cType = e.currentTarget.dataset.type;
    let carts = this.data.list[sid][cType];
    
    let num = parseInt(carts[index].num);
    if(num <= 1){
      return false;
    }
    num = num - 1;
    carts[index].num = num;

    this.data.list[sid][cType] = carts;

    this.setData({
      list: this.data.list
    });

    this.getTotalPrice();
    this.carGoodsNum(carts, index, cType);
    
  },
  carGoodsNum(carts, index, cType){
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/carGoodsNum',
      data: {
        openid: wx.getStorageSync('openid'),
        gid: carts[index].goods_no,
        num: carts[index].num,
        type: cType
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
      }
    })
  },
  /**
   * 计算总价
   */
  getTotalPrice() {
    let list = this.data.list;                  // 获取购物车列表
    let total = 0;
    let num = 0;
    for (let i = 0; i < list.length; i++) {         // 循环列表得到每个数据
      if (list[i].goods){
        for (let g = 0; g < list[i].goods.length; g++) {
          if (list[i].goods[g].selected) {                     // 判断选中才会计算价格
            total += list[i].goods[g].num * list[i].goods[g].price;   // 所有价格加起来
            num += parseInt(list[i].goods[g].num);
          }
        }
      }
      if (list[i].product) {
        for (let p = 0; p < list[i].product.length; p++) {
          if (list[i].product[p].selected) {                     // 判断选中才会计算价格
            total += list[i].product[p].num * list[i].product[p].price;   // 所有价格加起来
            num += parseInt(list[i].product[p].num);
          }
        }
      }
    }
    this.setData({                                // 最后赋值到data中渲染到页面
      totalPrice: total.toFixed(2),
      sumNum:num
    });
  },
  //编辑 删除购物车
  onLoad: function (options) {
    
  },
  onChangeShow: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.sid;
    console.log(e)
    let list = this.data.list;
    list[index].showView = !list[index].showView
    that.setData({
      list: list,
    })
  },


})