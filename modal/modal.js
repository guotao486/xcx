// pages/modal/modal.js

  /**
   * 页面的初始数据
   */
  /** 弹窗*/
function showDialogBtn(that) {
    that.setData({
      showModal: true
    })
  }
  /**
       * 隐藏模态对话框
       */
function hideModal (that) {
    that.setData({
      showModal: false
    });
  }
