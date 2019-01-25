//index.js
// 获取应用实例
var app = getApp();

// 获取数据的方法，具体怎么获取列表数据大家自行发挥
var GetList = function (that) {
  wx.request({
    url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/activity',
    data: {
      page: that.data.page,
      type:that.data.aType
    },
    success: function (res) {
      console.info(res.data);
      that.setData({
        list: res.data,   //一维数组，只取两条数据
      })
      that.data.page = ++that.data.page
    }
  });
}

Page({
  data: {
    aType:'xm',
    page:1,
    motto: "西厢房乡居体验",
    userInfo: {},
    noticeIds: 0,
    curIndex: 1, //活动分类
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    windowWidth: 500,
    sortPanelTop: '0',
    //sortPanelDist: '290',
    sortPanelDist: '',
    sortPanelPos: 'relative',
    noticeIdx: 0,
    notices: [],
    activity: [],
    animationNotice: {},
    search:''
  },
    
  
	    onLoad: function (res) {
        var that = this;

        wx.checkSession({
          success: function () {    //登录态未过期

          },
          fail: function () {    //登录态过期
            wx.login()
          }
        })

        console.log(app.globalData.userInfo);

        //获取系统的参数，scrollHeight数值,微信必须要设置style:height才能监听滚动事件
        wx.getSystemInfo({
          success: function (res) {
            console.info(res.windowHeight)
            that.setData({
              scrollHeight: res.windowHeight+200
            })
          }
        });

	    	var me = this;
	        var animation = wx.createAnimation( {
	          duration: 400,
	          timingFunction: 'ease-out',
	        });
	        me.animation = animation;
	             
          // 调用应用实例的方法获取全局数据
          app.getUserInfo(function (userInfo) {
            //console.log(userInfo)
            // 更新数据
            that.setData({
              userInfo: userInfo
            })
          })
	         
          //获取热点新闻
           wx.request({
             url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/activity?is_hot=1',//热点新闻
             data: {},
             method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT   
             header: {
               'Content-Type': 'application/json'
             },
             success: function (res) {
               console.log(res.data)
               that.setData({
                 notices: res.data   //一维数组，只取两条数据
               })
             },
             fail: function () {
               // fail  
             },
             complete: function () {
               // complete  
             }
           }) 

          //获取广告图文信息（轮播图）
           wx.request({
             url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/ad',//上线的话必须是https，没有appId的本地请求貌似不受影响  
             data: {},
             method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
             // header: {}, // 设置请求的 header  
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
           })   
	      },
	      startNotice: function() {
          var me = this;
	  	    var notices = me.data.notices || [];
          //console.log(this.data.notices)    //就是这里有问题，数据还没从接口返回就跑到这里了 xzz-6.2
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

         wx.getLocation({
           type: 'wgs84',
           success: function (res) {
             console.log(res)
             var latitude = res.latitude
             var longitude = res.longitude

             that.setData({
               locationSet: true,
               search:''
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
                
                 that.setData({ city: city });
               }
             })
           }
         })

         //判断是否获得了用户地理位置授权
         wx.getSetting({
           success: (res) => {
             if (!res.authSetting['scope.userLocation']) {
               that.setData({
                 locationSet: false,
               })
             }
           }
         })

	  	},
       onReady: function () {
         
       },
       bindDownLoad: function () {
         if(this.data.list.flag == 1){
           return;
         }
         //   该方法绑定了页面滑动到底部的事件,下拉一次请求一次数据
         wx.showToast({
           title: '加载中',
           icon: 'loading',
           duration: 400
         })
         var that = this;
         GetList(that);
       },
      //  scroll: function (event) {
      //    //   该方法绑定了页面滑动事件，只有滑动就执行
      //    if (event.detail.scrollTop >= sortPanelTop ) {
	  	// 	      this.setData( { sortPanelPos: 'fixed' });
	  	// 	 } else {
	  	// 	      this.setData( { sortPanelPos: 'relative' });
	  	// 	 }
      //    this.setData({
      //      scrollTop: event.detail.scrollTop
      //    });
      //    console.log(event.detail.scrollTop)
	  	// },
      //  refresh: function (event) {
      //    //   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
      //    page = 0;
      //    this.setData({
      //      list: [],
      //      scrollTop: 0
      //    });
      //    GetList(this)
      //  },

  /**
   * 用户点击分享按钮或右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '西厢房 - 旅居',
      desc: '回得去的故乡，进得去的家门',
      path: '/pages/storylist/storylist',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  setKey:function(e){
    this.data.search = e.detail.value
  },
  searchList:function(){
    if(this.data.search == ''){
      wx.showToast({
        title: '请输入关键词',
        icon:'none'
      })
      return;
    }else{
      var that = this
      wx.request({
        url: 'https://m.xxiangfang.com/index.php/Home/Xiaoxxf/activitySearch',
        data: {
          type: that.data.aType,
          key: that.data.search
        },
        success: function (res) {
          console.info(res.data);
          that.setData({
            list: res.data,   //一维数组，只取两条数据
          })
        }
      });
    }
  },
  onSwiperTap: function (e) {
    //console.log(e);
    var thst = this;
    var postid = e.target.dataset.postid;
    wx.navigateTo({
      url: "../story_detail/story_detail?art_id=" + postid,
    })
  },

  // 活动分类
  bindTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.data.page = 1;
    var aType = 'xn';
    switch(index){
      case 0:
        aType = 'xn';
        break;
      case 1:
        aType = 'xm';
        break;
      case 2:
        aType = 'xl';
        break;
    }
    this.setData({
      curIndex: index,
      aType:aType,
      search: ''
    })
    var that = this;
    GetList(that);
  },
 
})
