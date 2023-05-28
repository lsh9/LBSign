const app = getApp();
var that = null;
const util = require("@utils/util")

Page({
  data: {
    userName: null,
    userNumber: null,
    userSigns: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '正在加载。。。',
    });
    that = this;
    that.setData({
      userName: app.globalData.user.userName,
      userNumber: app.globalData.user.userNumber,
    })
    wx.request({
      url: app.domain + "/user/get_my_signs",
      method: "POST",
      data: {
        userid: app.globalData.user.userid
      },
      success: (res) => {
        var resp = res.data
        if (resp.success) {
          var userSigns = resp.userSigns;
          // 变换数据
          for (var userSign of userSigns) {
            util.transformSign(userSign.sign);
            userSign.signTime = util.timestampsToHMS(userSign.signTimeStamps * 1000)
          }
          that.setData({
            userSigns: resp.userSigns
          })
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    console.log("历史签到分享：", e)
    if (e.target){
      var signCode = e.target.dataset.signcode;
      return {
        title: '签到码：' + signCode,
        desc: 'LBSign课堂签到',
        path: '/pages/sign/participate?signCode=' + signCode // 路径，传递参数到指定页面。
      }
    }
    else{
      return {
        title: 'LBSign课堂签到',
        path: '/pages/home/home'
      }
    }

  },

  handleGoTo(e) {
    var index = parseInt(e.target.id);
    var sign = this.data.userSigns[index].sign;
    console.log(sign)
    wx.navigateTo({
      url: '/pages/sign/participate?sign=' + JSON.stringify(sign),
    })
  },
  
})