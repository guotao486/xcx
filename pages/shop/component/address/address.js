// page/component/new-pages/user/address/address.js
Page({
  data:{
    address:{
      name:'',
      phone:'',
      detail:''
    }
  },
  onLoad(){
    var self = this;
    
    // wx.getStorage({
    //   key: 'address',
    //   success: function(res){
    //     self.setData({
    //       address : res.data
    //     })
    //   }
    // })

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
            address : res.data.data
          })
        }
      }
    })
  },
  formSubmit(e){
    const value = e.detail.value;
    if (value.name && value.phone && value.detail){
      // wx.setStorage({
      //   key: 'address',
      //   data: value,
      //   success(){
      //     wx.navigateBack();
      //   }
      // })
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoShop/addressSave',
        data: {
          openid: wx.getStorageSync('openid'),
          name: value.name,
          phone:value.phone,
          address: value.detail
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: 'post',
        success: function (res) {
          console.log(res.data);
          if (res.data.code == 200) {
            wx.navigateBack();
          }else{
            wx.showToast({
              title: res.data.msg,
              icon:'none'
            })
          }
        }
      })
    }else{
      wx.showModal({
        title:'提示',
        content:'请填写完整资料',
        showCancel:false
      })
    }
  }
})