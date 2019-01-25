var app = getApp()
var util = require('../../utils/util.js')  //引入公共js文件util.js
// 引入wxParse.js解析文件
var WxParse = require('../../wxParse/wxParse.js');
var page = 1;
var getList = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/story_comment?art_id=' + that.data.art_id + '&uniacid=' + that.data.uniacid,    //房间评论
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
        story_comment: res.data    //一维数组，房间评论所有信息
      })
      console.log(that.data.story_comment);
      page++;
    }
  })
}
var getAD = function (that) {  //获取广告信息
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getAD',
    data: {
      "type": "story-ad"
    },
    header: {},
    method: 'GET',
    success: function (res) {
      console.log(res);
        that.setData({
          ad: res.data
        })
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    art_id:'',
    uniacid:'',
    hidden:false,//loading图片显示
    text:true,   //文本信息隐藏
    showModal:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
    console.log(userInfo);
    if (!userInfo) {
      that.onShowModal()
    } else {
      that.setData({
        userInfo: userInfo,
      })
    }
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo) {
    //   console.log(userInfo);
    //   if (userInfo != null && userInfo != '') {//初始化有授权
    //     //更新数据
    //     that.setData({
    //       userInfo: userInfo
    //     })
    //   } else {//初始化无授权，但后期授权了(有值) || 后期无授权（空值）
    //     that.setData({
    //       userInfo: wx.getStorageSync("userInfo"),
    //     })
    //     console.log(that.data.userInfo);
    //   }
    // })

    that.setData({
      fla: true,  //初始化显示【发送】回复按钮
      fla2: false,//初始化隐藏【发送】回复按钮
      art_id:options.art_id,
      uniacid: options.uniacid,
      // 评论数据
      reply: "true"    //  默认隐藏回复
    })
    wx.request({
      url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/getStory?art_id=' + options.art_id + '&uniacid=' + that.data.uniacid,//获取普通字段+故事副文本框：标题、时间、查看数+html
      data: {
        "type":'all',
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        that.setData({
          Story: res.data.content,    //一维数组，全部数据
          Story2: res.data.content2,  //图片替换过后
          story_msg: res.data.story_common  //普通字段
        })

        /**
         * html解析
        */
        var story = that.data.Story;
        //console.log("story = " + story);
        WxParse.wxParse('story', 'html', story, that, 5);

        // 解析完成之后，进行loading图片隐藏和数据渲染 -xzz1130
        that.setData({
          hidden:true,
          text:false,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    }),

    //初始化评论数据
    getList(that);
    getAD(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onGotUserInfo: function (e) {
    var that = this;
    util.onGotUserInfo(that, app, e);
  },
  onShowModal: function () {
    this.setData({
      showModal: true
    })
  },
  onCancel: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: that.data.story_msg.art_title,
      //desc: that.data.story_msg.art_title,
      desc: '',
      path: '/pages/story_detail/story_detail?art_id=' + that.data.art_id,
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
            url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/story_comment_del?c_id=' + e.currentTarget.dataset.cid,    //删除评论
            data: '',
            header: {
              'Content-Type': 'application/json'
            },
            method: 'GET',
            success: function (res) {
              console.log(res);
              
              util.confirm(res.data)
              /* 获取评论信息  -xzz 0714*/
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

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == '' || e.detail.value.evaContent.length > 50 || e.detail.value.evaContent == e.detail.value.comment_user) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
     
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo == '') {
      
      that.onShowModal()
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
          "type": "story",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "art_id": that.data.art_id,
          "uniacid": that.data.uniacid,
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
  commentForm2: function (e) {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
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
      
      that.onShowModal()
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
          "type": "story",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "art_id": that.data.art_id,
          "uniacid": that.data.uniacid,
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

    if (e.detail.value.evaContent.length <= 0 || util.trim(e.detail.value.evaContent) == '' || e.detail.value.evaContent.length > 50) {
      
      util.confirm('评论字数在1~50字之间')
    } else if (e.detail.value.comment_pid < 0 || isNaN(e.detail.value.comment_pid)) {
      
      util.confirm('回复评论参数有误~')
    } else if (userInfo == null || userInfo == '') {
      
      that.onShowModal()
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
          "type": "story",
          "comment_pid": e.detail.value.comment_pid,
          "content": e.detail.value.evaContent,
          "art_id": that.data.art_id,
          "openid": wx.getStorageSync("openid"),
          "uniacid": that.data.uniacid,
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
  }
})