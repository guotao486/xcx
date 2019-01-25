var app = getApp()
var util = require('../../utils/util.js')  //引入公共js文件util.js
// 引入地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// 实例化API核心类
var demo = new QQMapWX({
  key: 'WYQBZ-PFBAP-YQ2D5-LFADI-WQ6RO-ULFCG' // 必填
});
var page = 1;
var getList = function (that) {
  /* 获取村落评论信息  -xzz 0714*/
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/village_comment?vil_id=' + that.data.vil_id,    //房间评论
    data: {
      'openid': wx.getStorageSync('openid'),
      page: page
    },
    method: 'GET',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    dataType: 'json',
    success: function (res) {
      
      that.setData({
        village_comment: res.data    //一维数组，房间评论所有信息
      })
      
      page++;
    }
  })
}
//地图功能单独拿出来 -xzz1023
var village_LBS = function (that) {
  //var that = this;
  // ------------ 腾讯LBS地图  --------------------
  wx.getLocation({
    type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    success: function (res) {
      // 调用接口, 坐标转具体位置 -xxz0717
      demo.reverseGeocoder({
        location: {
          latitude: Number(res.latitude),
          longitude: Number(res.longitude)
        },
        success: function (res) {
         
          that.setData({
            start_address: res.result.address,   //起点地址
            city: res.result.address_component.city,  //起点城市
            district: res.result.address_component.district   //区
          })
        }
      });
      //circles圆的圆点、半径
      // that.setData({
      //   circles: [{
      //     latitude: res.latitude,
      //     longitude: res.longitude,
      //     color: '#FF0000DD',
      //     fillColor: '#7cb5ec88',
      //     radius: 100000,
      //     strokeWidth: 1
      //   }],
      // })
      //markers标点数据
      that.setData({
        res: res,
        latitude: res.latitude,
        longitude: res.longitude,
        markers: [{
          iconPath: "../../resources/images/marker_red.png",
          id: 0,
          latitude: res.latitude, //起点纬度
          longitude: res.longitude,
          //title: that.data.start_address, //起点地址名称
          //title:"当前位置",
          //自定义气泡
          callout: {
            content: "我的位置",
            display: 'ALWAYS',
          },
          width: 20,
          height: 25
        },
        {
          iconPath: "../../resources/images/marker_red.png",
          //id: 1,
          id: that.data.vil_id,  //markID以村落id
          latitude: that.data.villages.lat, //终点纬度
          longitude: that.data.villages.lng,
          //title: that.data.villages.nickname,
          callout: {
            content: that.data.nickname_msg,
            display: 'ALWAYS',
          },
          width: 20,
          height: 25
        }]
      })

      // 使用后台PHP请求百度Api，输入起、终点坐标获取距离 -xzz0717
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/getDistance',
        data: {
          "start_lat": Number(that.data.res.latitude),
          "start_lng": Number(that.data.res.longitude),
          "end_lng": that.data.villages.lng,  //终点经度
          "end_lat": that.data.villages.lat
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          
          that.setData({
            distance: res.data.result.elements[0].distance.text
          })
        }
      }),
        wx.request({  //调用PHP的百度地图api，获取沿线所有折线点(驾车)
          url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/baidu_line1',
          data: {
            //"start_city":that.data.city,            //起点城市调用后台api获取
            "end_city": that.data.villages.cityname,  //终点城市cityname=孝感市
            "start_lng": that.data.res.longitude,     //起点经度
            "start_lat": that.data.res.latitude,
            "end_lng": that.data.villages.lng,    //终点经度
            "end_lat": that.data.villages.lat
          },
          header: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          success: function (res) {
            
            var steps = res.data.steps;
            var polylines = [];
            steps.map(function (item, index) { //item为steps一大步
              // console.log(item);
              var path = item.path; //取出该阶段path，关键经纬度集合
              // console.log(path);
              if (path) {
                //console.log(path);
                var arr = path.split(";");
                arr.map(function (point, index) {
                  var pointarr = point.split(",");
                  if (pointarr.length == 2) {
                    polylines.push({
                      longitude: pointarr[0],
                      latitude: pointarr[1]
                    })
                  }
                });
              }

            });
            that.setData({
              polyline: [{
                "points": polylines,
                "color": "#ff000088",
                "width": 3,
                "dottedLine": false  //false=采用实线
              }]
            });
          }
        })
    },
    fail: function (e) { },
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    vil_name:'',
    vil_id:'',
    latitude: '',
    longitude: '',
    placeData: {},
    markers: [],  //标记起、终点
    polyline: [], //沿途破折点
    longitude: '', //经度
    latitude: '',   //纬度
    show:false,//初始化展示地图提示
    hide:true,
    swiperIndex:1,
    showViews: true,//分享
    
    // 锚点跳转
    click_id: '1', 
    //置顶默认样式
    vux: "vux-sticky",
    orientationList: [
     
    ],
    showModal:false
  },
  onGotUserInfo: function (e) {
    var that = this;
    util.onGotUserInfo(that, app, e);
  },
  onCancel: function () {
    this.setData({
      showModal: false
    });
  },
  onShowModal: function () {
    this.setData({
      showModal: true
    })
  },
  //点击瞄点，获取瞄点id
  scrollToViewFn: function (e) {
    var _id = e.target.dataset.id;
    this.setData({
      toView: 'inToView' + _id,
      click_id: e.target.dataset.id, 
    })
   
  },

  scrollTop: function (e) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    var that = this;
    if (e.detail.scrollTop >= 50 && that.data.vux != 'vux-sticky1') {// 滚动非初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        vux: "vux-sticky1",
      })
    } else if (e.detail.scrollTop < 50 && that.data.vux == 'vux-sticky1') { //滚动初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        vux: "vux-sticky",
      })
    }
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })

    that.setData({
      fla: true,  //初始化显示【发送】回复按钮
      fla2: false,//初始化隐藏【发送】回复按钮
      vil_id: options.vil_id,
      // 评论数据
      reply: "true"    //  默认隐藏回复
    })
   
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/village?vil_id=' + options.vil_id,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
       
        
        var orientationList =[];
        orientationList[0] = { id: "1", region: "介绍" };
        orientationList[1] = { id: "2", region: "文创" };
        orientationList[2] = { id: "3", region: "活动" };
        orientationList[3] = { id: "4", region: "村宿" };
        orientationList[4] = { id: "5", region: "导航" };
        orientationList[5] = { id: "6", region: "评论" };
        orientationList[6] = { id: "7", region: "周边" };
         
        if (res.data.vil_act == '' || res.data.vil_act == undefined){//体验
          delete orientationList[2];
        }
        if (res.data.vil_scenery == '' || res.data.vil_scenery == undefined) {//周边
          delete orientationList[6];
        }
        if (res.data.vil_room == '' || res.data.vil_room == undefined ) {//村宿
          delete orientationList[3];
        }
        if (res.data.vil_goods == '' || res.data.vil_goods == undefined) {//文创
          delete orientationList[1];
        }
        that.setData({
          nickname_msg: res.data.nickname_msg,
          villages:res.data,
          pics:res.data.pics_url,
          vil_act: res.data.vil_act,
          vil_scenery: res.data.vil_scenery,
          vil_room: res.data.vil_room,
          vil_goods:res.data.vil_goods,
          orientationList: orientationList
        })
        village_LBS(that);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
    // 初始化加载村落评论
      getList(that);
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.getSetting({
      success: (res) => {
       
        /*
         * res.authSetting = {
         *   "scope.userInfo": true,
         *   "scope.userLocation": true
         * }
         */
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
            success: function (res) {
              if (res.cancel) {
                
                // wx.showToast({
                //   title: '授权失败，地图功能无法使用',
                //   icon: 'success',
                //   duration: 5000
                // })
              } else if (res.confirm) {
                
                wx.openSetting({
                  success: function (data) {
                    
                    if (data.authSetting["scope.userLocation"] == true) {
                      
                      util.confirm('授权成功')
                      //再次授权，调用getLocalhost的API
                      village_LBS(that);
                    } else {
                      
                      util.confirm('授权失败')
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          village_LBS(that);
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    this.setData({
      showViews: true
    })
    
  },
  //点击markers标点时触发，返回markID
  marker_tap: function (e) {
    var that = this;
    
    if (e.markerId > 0) {
      that.setData({
        show: true,//地图提示隐藏
        hide: false,//地图活动和房间数量显示
      })
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 2000
      })
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/XiaoVil/village?vil_id='+e.markerId,
        data: {
          type: "v_act_home",
        },
        header: {},
        method: 'GET',
        success: function (res) {
          
          that.setData({
            nickname_msg: "房间数量："+res.data.home_count+"(间),\n当前活动："+res.data.actName,
            v_act_list: res.data.act_list,//村落活动数据
            village_home_count: res.data.home_count,//村落房间数量
          })
         
          village_LBS(that);
        },
      })
    }
  },
  //跳转到tarbar主页面
  switch_tab: function() {
    wx.switchTab({
      url: '../homelist/homelist',
      success: function (e) {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    })
  },

  //查看更多评论
  bindDownLoad: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 400
    })
    var that = this;
    getList(that);
  },


  /**
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    this.setData({
      showViews: true
    })
    return {
      title: '西厢房 - ' + that.data.villages.vil_name,
      desc: that.data.villages.description,
  path: '/pages/village_detail/village_detail?vil_id=' + that.data.vil_id,
      success: function (res) {
        // 转发成功
        
        util.confirm('分享成功')
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  reply: function (e) {
    var that = this;
    // 回复form隐藏、展示切换
    if (that.data.reply == true) {
      that.setData({
        reply: false     //展示回复框
      })
    } else {
      that.setData({
        reply: true     //隐藏回复框
      })
    }
    that.setData({
      reply_id: e.currentTarget.dataset.cid   //用户点击回复的评论id
    })
  },
  del: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/village_comment_del?c_id=' + e.currentTarget.dataset.cid,    //删除房间评论
            data: '',
            header: {
              'Content-Type': 'application/json'
            },
            method: 'GET',
            success: function (res) {
              
              
              util.confirm(res.data)
              /* 获取房间评论信息  -xzz 0714*/
              getList(that);
            },
            fail: function (res) { },
            complete: function (res) { },
          })
        } else if (sm.cancel) {
          
        }
      }
    })
  },

  /**
    * 自定义方法，commentForm表单校验，然后提交后台，最后刷新数据
    */
  commentForm: function (e) {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
    
    if (!wx.getStorageSync('userInfo')) {
      that.onShowModal();
      return;
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == ''  || e.detail.value.evaContent.length > 50 || e.detail.value.evaContent == e.detail.value.comment_user) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo == '') {
      
      util.confirm('您的账号未授权小程序，请您重新进入并授权')
    } else {                //回复评论
      if (that.data.fla == true) { //发表、回复评论功能间隔5秒才能发送功能
        that.setData({
          fla: false,
          fla2: true,
        })
        setTimeout(function () {
          that.setData({
            fla: true,
            fla2: false,
          })
        }, 3000);//1秒后才能点击
      } else if (that.data.fla == false) {
        that.setData({
          fla: true,
          fla2: false,
        })
        setTimeout(function () {
          that.setData({
            fla: false,
            fla2: true,
          })
        }, 3000);//1秒后才能点击
      }
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
        data: {
          "type": "village",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "vil_id": that.data.vil_id,
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
          "avatarurl": userInfo.avatarUrl
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
         
          if (res.data.state == 1) {    //回复成功，state==1
            
            util.confirm(res.data.Msg)
            /* 获取活动评论信息  -xzz 0714*/
            getList(that);
            that.setData({
              reply: true     //隐藏回复框
            })
          } else {
            
            util.confirm(res.data)
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
  commentForm2: function (e) {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
    
    if (!wx.getStorageSync('userInfo')) {
      that.onShowModal();
      return;
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == ''  || e.detail.value.evaContent.length > 50) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo == '') {
      
      util.confirm('您的账号未授权小程序，请您重新进入并授权')
    } else {                //回复评论
      if (that.data.fla == true) { //发表、回复评论功能间隔5秒才能发送功能
        that.setData({
          fla: false,
          fla2: true,
        })
        setTimeout(function () {
          that.setData({
            fla: true,
            fla2: false,
          })
        }, 3000);//1秒后才能点击
      } else if (that.data.fla == false) {
        that.setData({
          fla: true,
          fla2: false,
        })
        setTimeout(function () {
          that.setData({
            fla: false,
            fla2: true,
          })
        }, 3000);//1秒后才能点击
      }
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
        data: {
          "type": "village",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "vil_id": that.data.vil_id,
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
          "avatarurl": userInfo.avatarUrl
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          
          if (res.data.state == 1) {    //回复成功，state==1
           
            util.confirm(res.data.Msg)
            /* 获取活动评论信息  -xzz 0714*/
            getList(that);
            that.setData({
              reply: true     //隐藏回复框
            })
          } else {
            
            util.confirm(res.data)
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
  commentForm3: function (e) {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
    
    if (!wx.getStorageSync('userInfo')) {
      that.onShowModal();
      return;
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == '' || e.detail.value.evaContent.length > 50) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo == '') {
      
      util.confirm('您的账号未授权小程序，请您重新进入并授权')
    } else {                //回复评论
      if (that.data.fla == true) { //发表、回复评论功能间隔5秒才能发送功能
        that.setData({
          fla: false,
          fla2: true,
        })
        setTimeout(function () {
          that.setData({
            fla: true,
            fla2: false,
          })
        }, 3000);//1秒后才能点击
      } else if (that.data.fla == false) {
        that.setData({
          fla: true,
          fla2: false,
        })
        setTimeout(function () {
          that.setData({
            fla: false,
            fla2: true,
          })
        }, 3000);//1秒后才能点击
      }
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
        data: {
          "type": "village",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "vil_id": that.data.vil_id,
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
          "avatarurl": userInfo.avatarUrl
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
        
          if (res.data.state == 1) {    //回复成功，state==1
            
            util.confirm(res.data.Msg)
            that.setData({
              reply: true     //隐藏回复框
            })
            /* 获取活动评论信息  -xzz 0714*/
            getList(that);
          } else {
            
            util.confirm(res.data)
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },

  onChangeShowStates: function (e) {
    var that = this;
    that.setData({
      showViews: (!that.data.showViews),
    })
  },
  swiperChange:function(e){
    this.setData({
      swiperIndex:e.detail.current+1
    })
  },

})