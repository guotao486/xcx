// 获取应用实例
var app = getApp();
var util = require('../../utils/util.js')  //引入公共js文件util.js
// 引入wxParse.js解析文件
var WxParse = require('../../wxParse/wxParse.js');
// 引入地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// 实例化API核心类
var demo = new QQMapWX({
  key: 'WYQBZ-PFBAP-YQ2D5-LFADI-WQ6RO-ULFCG' // 必填
});

function countdown(that) {
  var EndTime = that.data.end_time || [];
  var NowTime = new Date().getTime();
  var total_micro_second = EndTime - NowTime || [];   //单位毫秒
  if (total_micro_second < 0) {
    console.log('时间初始化小于0，活动已结束状态');
    total_micro_second = 1;     //单位毫秒
  }
  //console.log('剩余时间：' + total_micro_second);
  // 渲染倒计时时钟
  that.setData({
    clock: dateformat(total_micro_second)   //若已结束，此处输出'0天0小时0分钟0秒'
  });
  if (total_micro_second <= 0) {
    that.setData({
      clock: "已经截止"
    });
    return;
  }
  setTimeout(function () {
    total_micro_second -= 1000;
    countdown(that);
  }
    , 1000)
}

// 时间格式化输出，如11:03 25:19  每1s都会调用一次
function dateformat(micro_second) {
  // 总秒数
  var second = Math.floor(micro_second / 1000);
  // 天数
  var day = Math.floor(second / 3600 / 24);
  // 小时
  var hr = Math.floor(second / 3600 % 24);
  // 分钟
  var min = Math.floor(second / 60 % 60);
  // 秒
  var sec = Math.floor(second % 60);
  return day + "天" + hr + "小时" + min + "分钟" + sec + "秒";
}
var page = 1;
var getList = function (that) {
  /* 获取活动评论信息  -xzz 0714*/
  wx.request({
    url: app.globalData.https+'index.php/Home/XiaoActivity/comment?a_id=' + that.data.id,    //评论
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
        activity_comment: res.data    //一维数组，活动评论所有信息
      })
      console.log(that.data.activity_comment);
      page++;
    }
  })
}
/**
 * 自定义函数--点击地图，加载地图导航信息
 */
var map = function(that) {
  that.setData({
    flag: false,
    flag2: true
  })
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
            city: res.result.address_component.city,  //起点城市
            district: res.result.address_component.district   //区
          })
        }
      });
      that.setData({
        res: res,
        latitude: res.latitude,
        longitude: res.longitude,
        markers: [{
          iconPath: "../../resources/images/marker_red.png",
          id: 0,
          latitude: res.latitude, //起点纬度
          longitude: res.longitude,
          width: 20,
          height: 25
        }, {
          iconPath: "../../resources/images/marker_red.png",
          id: 1,
          latitude: that.data.common.lat, //终点纬度
          longitude: that.data.common.lng,
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
          "end_lng": that.data.common.lng,  //终点经度
          "end_lat": that.data.common.lat
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log(res.data.result.elements[0].distance.text);
          that.setData({
            distance: res.data.result.elements[0].distance.text
          })
        }
      }),
        wx.request({  //调用PHP的百度地图api，获取沿线所有折线点(驾车)
          url: 'https://m.xxiangfang.com/index.php/Home/XiaoApi/baidu_line1',
          data: {
            //"start_city":that.data.city,            //起点城市调用后台api获取
            "end_city": that.data.common.cityname,  //终点城市cityname=孝感市
            "start_lng": that.data.res.longitude,     //起点经度
            "start_lat": that.data.res.latitude,
            "end_lng": that.data.common.lng,    //终点经度
            "end_lat": that.data.common.lat
          },
          header: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
          success: function (res) {
            //console.log(res.data.steps);
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
                "dottedLine": false  //采用实线
              }]
            });
          }
        })
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    itmes: [],   //评论星级1-5星
    score: '5.0',    //默认评分5.0
    id: '',
    showViews:true,
    result: [],
    end_time: '',
    clock: '',
    latitude: '',
    longitude: '',
    placeData: {},
    markers: [],  //标记起、终点
    polyline: [], //沿途破折点
    longitude: '', //经度
    latitude: '',   //纬度

    flag: true,
    flag2:false,
     //初始化
    scrollTop: 0,
    showModal: false,
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

  onChangeShowStates: function (e) {
    var that = this;
    that.setData({
      showViews: (!that.data.showViews),
    })
  },
  radioChange: function (e) {
    var that = this;
    that.setData({
      score: parseFloat(e.detail.value)   //0.x浮点小数
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  mapClick: function (e) {
    console.log(e);
    var that = this;
    wx.openLocation({
      // latitude: 23.362490,
      // longitude: 116.715790,
      latitude: Number(that.data.common.lat), //终点纬度
      longitude: Number(that.data.common.lng),
      scale: 18,
      name: that.data.common.cityname,
      address: that.data.common.cityname+' - '+that.data.common.vil_name,
    })
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
    // //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo) {
    //   console.log(userInfo);
    //   if(userInfo!=null && userInfo!='' ){//初始化有授权
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo
    //   })
    //   } else {//初始化无授权，但后期授权了(有值) || 后期无授权（空值）
    //     that.setData({
    //       userInfo:wx.getStorageSync("userInfo"),
    //     })
    //     console.log(that.data.userInfo);
    //   }
    // })
    //获取系统的参数，scrollHeight数值,微信必须要设置style:height才能监听滚动事件
    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight)
        that.setData({
          scrollHeight: res.windowHeight
        })
      }
    });


    that.setData({
      fla: true,  //初始化显示【发送】回复按钮
      fla2: false,//初始化隐藏【发送】回复按钮
      id: options.id,
      // 评论数据
      reply: "true",    //  默认隐藏回复
      //初始化选中瞄点1
      //toView: 'inToView1',
      click_id: '1',  
      //瞄点分类
      orientationList: [
        { id: "1", region: "安排" },
        { id: "2", region: "介绍" },
        { id: "3", region: "评论" },
      ],
      //瞄点默认样式
      vux:"vux-sticky",
      //评论星级1-5星
      items: [
        { name: '../../resources/images/star2.png', value: '1.0' },
        { name: '../../resources/images/star2.png', value: '2.0' },
        { name: '../../resources/images/star2.png', value: '3.0' },
        { name: '../../resources/images/star2.png', value: '4.0' },
        { name: '../../resources/images/star2.png', value: '5.0', checked: 'true' },
      ],

    }),
      console.log(that.data.id);

    
    wx.request({
      url: app.globalData.https+'index.php/Home/XiaoActivity/detail?a_id=' + options.id,//不含富文本html
      data: {
        type:'info'
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        that.setData({
          common: res.data,   //一维数组，全部数据
          end_time: res.data.start_run_time //报名截止时间应该是活动开始或者结束时间
        })
        console.log(that.data.common);
        console.log('结束时间：' + that.data.end_time);
      },
      fail: function (res) { },
      complete: function (res) { },
    }),

      wx.request({
      url: app.globalData.https +'index.php/Home/XiaoActivity/detail?a_id=' + options.id,//含富文本html
        data: {
          type:'arrange'     //祈福活动流程
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          that.setData({
            Arrange: res.data    //一维数组，全部数据
          })
          //console.log(res.data);
        },
        fail: function (res) { },
        complete: function (res) { },
      }),

      wx.request({
      url: app.globalData.https +'index.php/Home/XiaoActivity/detail?a_id=' + options.id,//含富文本html
        data: {
          type: 'content'     //活动详情富文本框
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          that.setData({
            Article: res.data    //一维数组，全部数据
          })

          /**
           * html解析
          */
          var article = that.data.Article;
          //console.log("article = " + article);
          WxParse.wxParse('article', 'html', article, that, 5);
          // console.log(res.data);
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    /* 初始化获取活动评论信息  -xzz 0714*/
    //getList(that);

    countdown(that);
  },
  //查看更多按钮
  bindDownLoad: function () {
    //   该方法绑定了页面滑动到底部的事件,下拉一次请求一次数据
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 400
    })
    var that = this;
    getList(that);
  },
//点击瞄点，获取瞄点id
  scrollToViewFn: function (e) {
    var that = this;
    var _id = e.target.dataset.id;
    if(_id==4){ //导航
      that.setData({
        flag:false, //导航展示
        flag2:true, //其他全隐藏
      })
    }else{
      that.setData({
        flag: true, //导航隐藏
        flag2: false, //其他全显示
        toView: 'inToView' + _id,
        click_id : e.target.dataset.id, //选中的瞄点id
      })
      console.log(that.data.toView)
    }
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
    var that = this
    this.setData({
      showViews: true
    })
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }
  },

  /**
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    this.setData({
      showViews:true
    })
    return {
      title: that.data.common.act_name,
      desc: that.data.common.introduction,
      path: '/pages/activity_detail/activity_detail?id=' + that.data.id,
      success: function (res) {
        // 转发成功
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
            url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/activity_comment_del?c_id=' + e.currentTarget.dataset.cid,    //删除房间评论
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

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == ''  || e.detail.value.evaContent.length > 50 || e.detail.value.evaContent == e.detail.value.comment_user) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo=='') {
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
          "type":"activity",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "a_id": that.data.id,
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
          "avatarurl": userInfo.avatarUrl
        },
        header: {
          'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (res) {
          console.log(res);
          if (res.data.state == 1) {    //发表成功，state==1
            
            util.confirm(res.data.Msg)
            /* 获取活动评论信息  -xzz 0714*/
            getList(that);
            that.setData({
              reply: true     //隐藏回复框
            })
          } else {
            // 
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
    console.log(userInfo);
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
          "type": "activity",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "a_id": that.data.id,
          "star": that.data.score,    //评分
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
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
    console.log(userInfo);
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
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误')
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
          "type":"activity",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "a_id": that.data.id,
          "star": that.data.score,    //评分
          "openid": wx.getStorageSync("openid"),
          //"avatarurl": app.globalData.userInfo.avatarUrl
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

  //--------------  评分星数5个js方法 -------------
  score0:function(){
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
  //用户点击导航tab
  map_click:function(e){
    var that = this;
    var _id = e.target.dataset.id;
    if(_id==4){ //用户点击导航tab，样式切换
    map(that);
        that.setData({
          click_id:_id,
          vux: "vux-sticky1",//强行展示tab栏
        })
    }
    console.log(that.data.click_id);
  },

  scroll: function (e) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    var that = this;
    if (e.detail.scrollTop >= 50 && that.data.vux != 'vux-sticky1') {// 滚动非初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        vux:"vux-sticky1",
      })
      /* 初始化获取活动评论信息  -xzz 0714*/
      getList(that);
      //获取地图
      //map(that);
    } else if (e.detail.scrollTop < 50 && that.data.vux == 'vux-sticky1') { //滚动初始化
      that.setData({
        scrollTop: e.detail.scrollTop,
        vux:"vux-sticky",
      })
    }
  }
})
