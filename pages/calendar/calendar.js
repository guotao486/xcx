var app = getApp();
Page({
    data: {
        currentDate: "2017年05月03日",
        dayList: '',
        currentDayList: '',
        currentObj: '',
        currentDay: '',

        //日期初始化选中样式
        selectCSS: 'bk-color-day',
    },
    //下拉刷新
    onPullDownRefresh: function () {
      wx.showNavigationBarLoading() //在标题栏中显示加载

      //模拟加载
      setTimeout(function () {
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }, 1500);
    },
    onLoad: function (options) {
      var that = this;
      console.log(options);
        var currentObj = this.getCurrentDayString()
        this.setData({
            currentDate: currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate(),
            currentDay: currentObj.getDate(),
            currentObj: currentObj,
        /*  获取当前的年、月  */
            currentYear: currentObj.getFullYear(),
            currentMonth: (currentObj.getMonth() + 1),
        })
        this.setSchedule(currentObj);
    },
    doDay: function (e) {
      var that = this;
        console.log(e);

        var currentObj = that.data.currentObj
        var Y = currentObj.getFullYear();
        var m = currentObj.getMonth() + 1;
        var d = currentObj.getDate();
        var str = ''
        if (e.currentTarget.dataset.key == 'left') {
            m -= 1
            if (m <= 0) {
                str = (Y - 1) + '/' + 12 + '/' + d
            } else {
                str = Y + '/' + m + '/' + d
            }
        } else {
            m += 1
            if (m <= 12) {
                str = Y + '/' + m + '/' + d
            } else {
                str = (Y + 1) + '/' + 1 + '/' + d
            }
        }
        currentObj = new Date(str)
        this.setData({
            currentDate: currentObj.getFullYear() + '/' + (currentObj.getMonth() + 1) + '/' + currentObj.getDate(),
            currentObj: currentObj,
        /*  获取当前的年、月  */
            currentYear: currentObj.getFullYear(),
            currentMonth: (currentObj.getMonth() + 1),
        })
        console.log("选择当前年：" + that.data.currentYear);
        console.log("选择当前月：" + that.data.currentMonth);
        this.setSchedule(currentObj);
    },
    getCurrentDayString: function () {
        var objDate = this.data.currentObj
        if (objDate != '') {
            return objDate
        } else {
            var c_obj = new Date()
            var a = c_obj.getFullYear() + '/' + (c_obj.getMonth() + 1) + '/' + c_obj.getDate()
            return new Date(a)
        }
    },
    setSchedule: function (currentObj) {
      console.log(currentObj);
        var that = this
        var m = currentObj.getMonth() + 1
        var Y = currentObj.getFullYear()
        var d = currentObj.getDate();
        var dayString = Y + '/' + m + '/' + currentObj.getDate()
        var currentDayNum = new Date(Y, m, 0).getDate()
        var currentDayWeek = currentObj.getUTCDay() + 1
        var result = currentDayWeek - (d % 7 - 1);
        var firstKey = result <= 0 ? 7 + result : result;
        var currentDayList = [];
        var f = 0
        for (var i = 0; i < 42; i++) {
            let data =[]
            if (i < firstKey - 1) {
                currentDayList[i] = ''
            } else {
                if (f < currentDayNum) {
                  currentDayList[i] = f+1;
                  f = currentDayList[i]
                } else if (f >= currentDayNum) {
                    currentDayList[i] = ''
                }
            }
        }
        that.setData({
            currentDayList: currentDayList
        })
    },

//选择具体日期方法--xzz1211
    selectDay:function(e){
      var that = this;
      console.log(e);
      that.setData({
        currentDay: e.target.dataset.day,//选择的数据，非真实当前日期
        currentDa: e.target.dataset.day, //选择某月具体的一天
        currentDate: that.data.currentYear + '/' + that.data.currentMonth + '/' + e.target.dataset.day,//真实选择数据
      })
      console.log("当前选择日期：" + that.data.currentDate);
    }
})