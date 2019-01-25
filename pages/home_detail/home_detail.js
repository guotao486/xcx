var app = getApp()
var util = require('../../utils/util.js')  //引入公共js文件util.js
// 引入wxParse.js解析文件
var WxParse = require('../../wxParse/wxParse.js');
var wxMarkerData = [];
// 引入地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// 实例化API核心类
var demo = new QQMapWX({
  key: 'WYQBZ-PFBAP-YQ2D5-LFADI-WQ6RO-ULFCG' // 必填
});
var page = 1;
var getList = function(that){
  /* 获取房间评论信息  -xzz 0714*/
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_comment?home_id=' + that.data.home_id,    //房间评论
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
      console.log(res.data);
      that.setData({
        home_comment: res.data    //一维数组，房间评论所有信息
      })
      console.log(that.data.home_comment);
      page++;
    }
  })
}
var getCollection = function (that, openid) {
  /*   读取房间收藏状态   */
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/v_collection',
    data: {
      "openid": openid,
      "type": "find_home",
      "id": that.data.home_id, //唯一id
    },
    success: function (result) {
      that.setData({
        c_url: result.data
      })
    }
  });
}

Page({
  data: {
    itmes: [],   //评论星级1-5星
    score:'5.0',    //默认评分5.0
    showViews: true,
    home_id: '',
    markers: [],
    latitude: '', //用户当前点经纬度
    longitude: '',
    latitude2: '',//终点经纬度
    longitude2: '',
    placeData: {},
    markers: [],  //标记起、终点
    polyline: [], //沿途破折点
    longitude: '', //经度
    latitude: '',   //纬度
    c_url:'',   //收藏默认图片
    showModal: false,
  
  },
  radioChange: function (e) {
    var that = this;
    that.setData({
      score: parseFloat(e.detail.value)   //0.x浮点小数
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
// //点击轮播图的事件--xzz1211
//   onSwiperTap: function (e) {
//     var that = this;
//     console.log(e);
//     var posturl = e.target.dataset.posturl;
//     that.setData({
//       posturl: e.target.dataset.posturl,
//     })
//     wx.navigateTo({
//       url: "../story_detail/story_detail?art_id=" + posturl,
//     })
//   },
  /**   
   * 预览图片 --  xzz1211
   */
  previewImage: function (e) {
    console.log(e);
    var that=this;
    var current = e.target.dataset.posturl;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: that.data.home_pics // 需要预览的图片http链接列表  
    })
  },
  onChangeShowStates: function (e) {
    var that = this;
    that.setData({
      showViews: (!that.data.showViews),
    })
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
  bookTap: function () {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
      wx.navigateTo({
        url: '../enlist/enlist?unitPrice=' + that.data.homes.price + '&is_home=1&a_id=' + that.data.home_id + '&kind=1',
      })
    }
  },
  onShow:function(){
    this.setData({
      showViews: true
    })
  },

  onLoad: function (options) {
    console.log(options);
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    /*------  增加默认选中 -----xzz1219  */
    // if (options.select =='selected3') {//地图
    //   this.selected3(options.home_id);
    // } else if (options.select == 'selected2'){//评论
    //   this.selected2(options.home_id);
    // }
  /*----- end -----*/
    
    /**  根据openid获取space表对应user_type 3=》homeVIP  */
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/XiaoVip/getUserType',
      data: {
        "type": "vip_user_type",
        "openid": wx.getStorageSync("openid")
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        that.setData({
          user_type: res.data
        })
      },
    })

    that.setData({
      flag: true,  //初始化显示【发送】回复按钮
      flag2: false,//初始化隐藏【发送】回复按钮
      home_id: options.home_id,
      // 评论数据
      reply: "true",    //  默认隐藏回复
      // 从homeShow传过来，默认选中的tab分类
      bindCol: 'collection', //收藏绑定的事件
      items: [
        { name: '../../resources/images/star2.png', value: '1.0' },
        { name: '../../resources/images/star2.png', value: '2.0' },
        { name: '../../resources/images/star2.png', value: '3.0' },
        { name: '../../resources/images/star2.png', value: '4.0' },
        { name: '../../resources/images/star2.png', value: '5.0', checked: 'true' },
      ],
    })

    /* 获取房间详情html富文本框内容 */
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service?home_id=' + options.home_id + '&is_detail=1',    //活动详情富文本框
      data: {
        "openid": wx.getStorageSync("openid"),
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        that.setData({
          homes: res.data,    //一维数组，全部数据
          homes_detail:res.data.s_detail    //富文本详情信息
        })
        console.log(res.data.code);
        console.log(that.data.homes_detail);

        /**
           * html解析
          */
        var Homes_detail = that.data.homes_detail;;
        WxParse.wxParse('Homes_detail', 'html', Homes_detail, that, 5);
      },
      fail: function (res) { },
      complete: function (res) { },
    }),
      /* 获取房间普通字段信息 */
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service?home_id=' + options.home_id,    //房间普通字段
        data: {

        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          console.log(res.data);
          that.setData({
            home_detail: res.data,    //一维数组，普通字段所有信息
            home_pics: res.data.pics,//房间轮播图
            home_articles: res.data.articles,//房间体验文章(二维数组)
            facility3: res.data.facility3
          })
          console.log(that.data.home_detail);
          console.log(that.data.facility3);
        }
      })


    // ------------ 腾讯LBS地图  --------------------
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        console.log(res);

        // 调用接口, 坐标转具体位置 -xxz0717
        demo.reverseGeocoder({
          location: {
            latitude: Number(res.latitude),
            longitude: Number(res.longitude)
          },
          success: function (res) {
            console.log(res);
            that.setData({
              city: res.result.address_component.city,  //起点城市
              district: res.result.address_component.district   //区
            })
          },
        });

        /*  如果没有取到村落的经纬度等信息，再次进行请求,配合homeShow页面 -xzz1219  */
        if (!that.data.home_detail) {
          /* 获取房间普通字段信息 */
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_service?home_id=' + options.home_id,    //房间普通字段
            data: {

            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
              'Content-Type': 'application/json'
            },
            success: function (ress) {
              console.log(ress.data);
              that.setData({
                home_detail: ress.data,    //四维数组，普通字段所有信息

                latitude2: ress.data.lat, //终点纬度
                longitude2: ress.data.lng,
                latitude: res.latitude,
                longitude: res.longitude,

                /*  调用手机其他导航app功能 -xzz1205  */
                markers2: [{
                  iconPath: "../../resources/images/marker_red.png",
                  id: ress.data.s_id,
                  latitude: ress.data.lat, //终点纬度
                  longitude: ress.data.lng,
                  callout: {
                    content: ress.data.s_title,
                    color: '#FF0000',
                    fontSize: 15,
                    borderRadius: 10,
                    display: 'ALWAYS',
                  },
                  width: 20,
                  height: 25
                }]
              })
            }
          })

        } else {
          that.setData({
            res: res,
            latitude2: that.data.home_detail.lat, //终点纬度
            longitude2: that.data.home_detail.lng,
            latitude: res.latitude,
            longitude: res.longitude,

            /*  调用手机其他导航app功能 -xzz1205  */
            markers2: [{
              iconPath: "../../resources/images/marker_red.png",
              id: that.data.home_detail.s_id,
              latitude: that.data.home_detail.lat, //终点纬度
              longitude: that.data.home_detail.lng,
              callout: {
                content: that.data.home_detail.s_title,
                color: '#FF0000',
                fontSize: 15,
                borderRadius: 10,
                display: 'ALWAYS',
              },
              width: 20,
              height: 25
            }]
          })
        }
      }
    })

    /* 初始化获取房间评论信息  -xzz 0714*/
    getList(that);
    getCollection(that, wx.getStorageSync("openid"));
  },
  /*  操作频繁--提醒专用  */
  notify: function () {
    
    util.confirm('慢点儿，小主~')
  },
  /*  收藏房间  */
  collection: function (e) {
    console.log(e);
    var that = this;
    that.setData({
      bindCol: 'notify',
    })
    setTimeout(function () {
      that.setData({
        bindCol: 'collection',
      })
    }, 5000);
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/v_collection',
      data: {
        "openid": wx.getStorageSync("openid"),
        "type": "home",
        "id": e.currentTarget.dataset.id, //唯一id
      },
      success: function (res) {
        console.log(res);
        that.setData({
          c_url: res.data.url
        })
        util.confirm(res.data.msg)
      }
    });
  },
  mapClick: function (e) {
    console.log(e);
    var that = this;
    wx.openLocation({
      // latitude: 23.362490,
      // longitude: 116.715790,
      latitude: Number(that.data.home_detail.lat), //终点纬度
      longitude: Number(that.data.home_detail.lng),
      scale: 18,
      name: that.data.home_detail.brand +'-'+that.data.homes.s_title,
      address: that.data.home_detail.v_address,
    })
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
      title: '「西厢房 ·' + that.data.home_detail.brand +'」 - '+that.data.home_detail.s_title,
      desc: that.data.home_detail.s_desc,
      path: '/pages/home_detail/home_detail?home_id=' + that.data.home_id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
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
    

    reply:function(e){
      var that = this;
      // 回复form隐藏、展示切换
      if(that.data.reply==true){
        that.setData({
          reply: false     //展示回复框
        })
      }else{
        that.setData({
          reply: true     //隐藏回复框
        })
      }
      that.setData({
        reply_id: e.currentTarget.dataset.cid   //用户点击回复的评论id
      })
    },
    del:function(e){
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: function (sm) {
          if (sm.confirm) {
            // 用户点击了确定 可以调用删除方法了
            wx.request({
              url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/home_comment_del?c_id=' + e.currentTarget.dataset.cid,    //删除房间评论
              data: '',
              header: {
                'Content-Type': 'application/json'
              },
              method: 'GET',
              success: function (res) {
                console.log(res);
                
                util.confirm(res.data)
                /* 获取房间评论信息  -xzz 0714*/
                getList(that);
              },
              fail: function (res) { },
              complete: function (res) { },
            })
          } else if (sm.cancel) {
            console.log('用户点击取消')
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
      console.log(userInfo);
      if (!userInfo) {
        that.onShowModal()
      } else {

        // ------------- 3、检查用户登录态 ------------------
        wx.checkSession({
          success: function (res) {     //登录态未过期
            console.log(res.errMsg);
          },
          fail: function (res) {    //登录态过期
            wx.login();
          },
          complete: function (res) { },
        })

        if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == '' || e.detail.value.evaContent.length > 50 || e.detail.value.evaContent == e.detail.value.comment_user) {

          util.confirm('评论字数在1~50字之间')
        } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {

          util.confirm('回复评论参数有误~')
        } else if (userInfo == null || userInfo == '') {

          util.confirm('您的账号未授权小程序，请您重新进入并授权')
        } else {                //回复评论
          if (that.data.flag == true) {
            that.setData({
              flag: false,
              flag2: true,
            })
            setTimeout(function () {
              that.setData({
                flag: true,
                flag2: false,
              })
            }, 3000);//3秒后才能点击
          } else if (that.data.flag == false) {
            that.setData({
              flag: true,
              flag2: false,
            })
            setTimeout(function () {
              that.setData({
                flag: false,
                flag2: true,
              })
            }, 3000);//3秒后才能点击
          }
          wx.request({
            url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
            data: {
              "comment_pid": e.detail.value.comment_pid,
              "content": e.detail.value.evaContent,
              "home_id": that.data.home_id,
              "openid": wx.getStorageSync("openid"),
              //"avatarurl": that.data.userInfo.avatarUrl
              "avatarurl": userInfo.avatarUrl
            },
            header: {
              'Content-Type': 'application/json'
            },
            method: 'GET',
            success: function (res) {
              console.log(res);
              if (res.data.state == 1) {    //回复成功，state==1

                util.confirm(res.data.Msg)
                /* 获取房间评论信息  -xzz 0714*/
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
      }
    },
    commentForm2: function (e) {
      var that = this;
      var userInfo = wx.getStorageSync("userInfo");
      console.log(userInfo);
      if (!userInfo) {
        that.onShowModal()
      } else {
      // ------------- 3、检查用户登录态 ------------------
      wx.checkSession({
        success: function (res) {     //登录态未过期
          console.log(res.errMsg);
        },
        fail: function (res) {    //登录态过期
          wx.login();
        },
        complete: function (res) { },
      })

      if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == '' || e.detail.value.evaContent.length > 50) {
        
        util.confirm('评论字数在1~50字之间')
      } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
        
        util.confirm('回复评论参数有误~')
      } else if (userInfo == null || userInfo == ''){
        console.log(that.data.userInfo);
        
        util.confirm('您的账号未授权小程序，请您重新进入并授权')
      } else {                //回复评论
        if (that.data.flag == true) {
          that.setData({
            flag: false,
            flag2: true,
          })
          setTimeout(function () {
            that.setData({
              flag: true,
              flag2: false,
            })
          }, 3000);//1秒后才能点击
        } else if (that.data.flag == false) {
          that.setData({
            flag: true,
            flag2: false,
          })
          setTimeout(function () {
            that.setData({
              flag: false,
              flag2: true,
            })
          }, 3000);//1秒后才能点击
        }
        wx.request({
          url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
          data: {
            "comment_pid": e.detail.value.comment_pid,
            "content": e.detail.value.evaContent,
            "star": that.data.score,    //评分
            "home_id": that.data.home_id,
            "openid": wx.getStorageSync("openid"),
            //"avatarurl": that.data.userInfo.avatarUrl
            "avatarurl": userInfo.avatarUrl
          },
          header: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          success: function (res) {
            console.log(res);
            if (res.data.state == 1) {    //回复成功，state==1
              
              util.confirm(res.data.Msg)
              /* 获取房间评论信息  -xzz 0714*/
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
      }
    },
    commentForm3: function (e) {
      var that = this;
      var userInfo = wx.getStorageSync("userInfo");
      console.log(userInfo);
      if (!userInfo) {
        that.onShowModal()
      } else {
      // ------------- 3、检查用户登录态 ------------------
      wx.checkSession({
        success: function (res) {     //登录态未过期
          console.log(res.errMsg);
        },
        fail: function (res) {    //登录态过期
          wx.login();
        },
        complete: function (res) { },
      })

      if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == ''  || e.detail.value.evaContent.length > 50) {
        
        util.confirm('评论字数在1~50字之间')
      } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
        
        util.confirm('回复评论参数有误~')
      } else if (userInfo == null || userInfo == '') {
        
        util.confirm('您的账号未授权小程序，请您重新进入并授权')
      } else {                //回复评论
        if (that.data.flag == true) {
          that.setData({
            flag: false,
            flag2: true,
          })
          setTimeout(function () {
            that.setData({
              flag: true,
              flag2: false,
            })
          }, 3000);//1秒后才能点击
        } else if (that.data.flag == false) {
          that.setData({
            flag: true,
            flag2: false,
          })
          setTimeout(function () {
            that.setData({
              flag: false,
              flag2: true,
            })
          }, 3000);//1秒后才能点击
        }
        wx.request({
          url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/reply_comment',//回复评论
          data: {
            "comment_pid": e.detail.value.comment_pid,
            "content": e.detail.value.evaContent,
            "home_id": that.data.home_id,
            "star": that.data.score,    //评分
            "openid": wx.getStorageSync("openid"),
            //"avatarurl": that.data.userInfo.avatarUrl
            "avatarurl": userInfo.avatarUrl
          },
          header: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          success: function (res) {
            console.log(res);
            if (res.data.state == 1) {    //回复成功，state==1
              
              util.confirm(res.data.Msg)
              /* 获取房间评论信息  -xzz 0714*/
              getList(that);
            } else {
              
              util.confirm(res.data)
            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
      }
    },

    //--------------  评分星数5个js方法 -------------
    score0: function () {
      var that = this;
      console.log('click index 0');
      that.setData({
        items: [
          { name: '../../resources/images/star2.png', value: '1.0' },
          { name: '../../resources/images/star1.png', value: '2.0' },
          { name: '../../resources/images/star1.png', value: '3.0' },
          { name: '../../resources/images/star1.png', value: '4.0' },
          { name: '../../resources/images/star1.png', value: '5.0' },
        ],
      })
    },
    score1: function () {
      var that = this;
      that.setData({
        items: [
          { name: '../../resources/images/star2.png', value: '1.0' },
          { name: '../../resources/images/star2.png', value: '2.0' },
          { name: '../../resources/images/star1.png', value: '3.0' },
          { name: '../../resources/images/star1.png', value: '4.0' },
          { name: '../../resources/images/star1.png', value: '5.0' },
        ],
      })
    },
    score2: function () {
      var that = this;
      that.setData({
        items: [
          { name: '../../resources/images/star2.png', value: '1.0' },
          { name: '../../resources/images/star2.png', value: '2.0' },
          { name: '../../resources/images/star2.png', value: '3.0' },
          { name: '../../resources/images/star1.png', value: '4.0' },
          { name: '../../resources/images/star1.png', value: '5.0' },
        ],
      })
    },
    score3: function () {
      var that = this;[]
      // })
      that.setData({
        items: [
          { name: '../../resources/images/star2.png', value: '1.0' },
          { name: '../../resources/images/star2.png', value: '2.0' },
          { name: '../../resources/images/star2.png', value: '3.0' },
          { name: '../../resources/images/star2.png', value: '4.0' },
          { name: '../../resources/images/star1.png', value: '5.0' },
        ],
      })
    },
    score4: function () {
      var that = this;
      that.setData({
        items: [
          { name: '../../resources/images/star2.png', value: '1.0' },
          { name: '../../resources/images/star2.png', value: '2.0' },
          { name: '../../resources/images/star2.png', value: '3.0' },
          { name: '../../resources/images/star2.png', value: '4.0' },
          { name: '../../resources/images/star2.png', value: '5.0' },
        ],
      })
    },
    swiperChange: function (e) {
      console.log(e)
    this.setData({
      swiperIndex: e.detail.current + 1
    })
  },
})
