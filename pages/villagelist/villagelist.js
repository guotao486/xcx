//index.js
// 获取应用实例
var app = getApp();
var page = 1;
// 获取数据的方法，具体怎么获取列表数据
var GetList = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/village',
    data: {
      page: page
    },
    success: function (res) {
      console.info(res.data);
      that.setData({
        list: res.data   //一维数组，只取两条数据
      })
      page++;
    }
  });
}

Page({
	
  data: {
    motto: "西厢房乡居体验",
    userInfo: {},
    noticeIds: 0,
    imgUrls: [],
            indicatorDots: true,
            autoplay: true,
            interval: 5000,
            duration: 1000,
            windowWidth: 400,
            sortPanelTop: '0',
            //sortPanelDist: '290',
            sortPanelDist: '',
            sortPanelPos: 'relative',
            noticeIdx: 0,
            notices: [],
            activity: [],
            animationNotice: {}
  },
    
  
	    onLoad: function (res) {
        var that = this
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 1000
        })

        //获取系统的参数，scrollHeight数值,微信必须要设置style:height才能监听滚动事件
        wx.getSystemInfo({
          success: function (res) {
            console.info(res.windowHeight)
            that.setData({
              scrollHeight: res.windowHeight
            })
          }
        });
	             
          // 调用应用实例的方法获取全局数据
          app.getUserInfo(function (userInfo) {
            //console.log(userInfo)
            // 更新数据
            that.setData({
              userInfo: userInfo
            })
          })
	         

          //获取广告图文信息（轮播图）
           wx.request({
             url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/ad',//上线的话必须是https，没有appId的本地请求貌似不受影响  
             data: {},
             method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT   
             header: {
               'Content-Type': 'application/json'
             },
             success: function (res) {
              // console.log(res.data)
               that.setData({
                 ad_list: res.data
               })
             },
             fail: function () {
               // fail  
             },
             complete: function () {
               // complete  
             }
           }),

             //获取全部村落图文信息
             wx.request({
               url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/village', 
               data: {},
               method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
               // header: {}, // 设置请求的 header  
               header: {
                 'Content-Type': 'application/json'
               },
               success: function (res) {
                  console.log(res.data)
                 that.setData({
                   vil_list: res.data
                 })
               },
               fail: function () {
                 // fail  
               },
               complete: function () {
                 // complete  
               }
             })   
	      },
	      startNotice: function() {
          var me = this;
	  	    var notices = me.data.notices || [];
          //console.log(this.data.notices)    //就是这里有问题，数据还没从接口返回就跑到这里了
	  	    if( notices.length == 0 ) {
	  	      //return;     //是这里的问题，数据没加载过来，导致程序return;
	  	    }
	  	    var animation = me.animation;
	  	    var noticeIdx = me.data.noticeIdx + 1;
          //console.log(notices.length);
	  	    if( noticeIdx == notices.length ) {
	  	      noticeIdx = 0;
	  	    }
          
	  	    // 更换数据
	  	    setTimeout( function() {
	  	      me.setData( {
	  	        noticeIdx: noticeIdx
	  	      });
	  	    }, 400 );

	  	    // 启动下一次动画
	  	    setTimeout( function() {
	  	      me.startNotice();
	  	    }, 5000 );
	  	  },
      
	     onShow: function() {
         this.startNotice();
         //   在页面展示之后先获取一次数据
         var that = this;
         GetList(that);
	  	},
       onReady: function () {
         
       },
       bindDownLoad: function () {
         //   该方法绑定了页面滑动到底部的事件,下拉一次请求一次数据
         wx.showToast({
           title: '加载中',
           icon: 'loading',
           duration: 400
         })
         var that = this;
         GetList(that);
       },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 田园生活倡导者',
      desc: '一间西厢房，安心即吾乡',
      path: '/pages/villagelist/villagelist',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
  
})
