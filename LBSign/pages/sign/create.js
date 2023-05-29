const app = getApp();
let that = null;

Page({
  data: {
    isLocated: false,

    courseId: null,
    location: {},
    course: null,

    signName: null,
    validTime: null,

    showDialog: false,
    dialogMessage: null,
  },

  // 获取输入数据
  handleSignNameInput(e) {
    that = this;
    that.setData({
      signName: e.detail.value
    })
  },

  handleValidTimeInput(e) {
    that = this;
    that.setData({
      validTime: e.detail.value
    })
  },

  // 创建签到
  tapCreate() {
    that = this;
    if (!that.data.signName) {
      that.setData({
        showDialog: true,
        dialogMessage: "签到名称不允许为空！"
      })
      return
    } else if (that.data.validTime > 1440 || that.data.validTime < 1) {
      that.setData({
        showDialog: true,
        dialogMessage: "有效时间只允许在1-1440分钟"
      })
      return
    }

    var date = new Date();
    var startTimeStamps = date.getTime() / 1000;
    var endTimeStamps = startTimeStamps + 60 * that.data.validTime;

    console.log(date, startTimeStamps, endTimeStamps)
    console.log(that.data)

    wx.showLoading({
      title: '创建中，请稍等',
    })
    wx.request({
      url: app.domain + "/sign/create",
      method: "POST",
      data: {
        courseId: that.data.courseId,
        signName: that.data.signName,
        startTimeStamps: startTimeStamps,
        endTimeStamps: endTimeStamps,
        signLongitude: that.data.location.longitude * 1e6 || null,
        signLatitude: that.data.location.latitude * 1e6 || null,
        validDistance: that.data.location.distance
      },
      success: (res) => {
        var resp = res.data
        if (resp.success) {
          // 创建成功
          wx.showModal({
            title: '签到码：' + resp.sign.signCode,
            content: "是否复制到剪切板？",
            complete: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: resp.sign.signCode,
                  success(res) {
                    wx.showToast({
                      title: '复制成功！',
                    })
                  }
                })
              }
              // resp.sign.signCount = 0;
              // var sign = JSON.stringify(resp.sign)
              // wx.redirectTo({
              //   url: '/pages/sign/participate?sign=' + sign,
              // })
              if (this.data.course) {
                var course = JSON.stringify(this.data.course)
                wx.redirectTo({
                  url: '/pages/course/detail?course=' + course,
                })
                return;
              } else {
                wx.showLoading({
                  title: '正在加载，请稍等',
                })
                wx.request({
                  url: app.domain + "/course/get_course_by_courseId",
                  method: "POST",
                  data: {
                    courseId: that.data.courseId
                  },
                  success: (res) => {
                    console.log(res.data)
                    var course = JSON.stringify(res.data.course)
                    wx.redirectTo({
                      url: '/pages/course/detail?course=' + course,
                    })
                  },
                  complete: () => {
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        }
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },




  // 关闭弹窗
  closeDialog() {
    this.setData({
      showDialog: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var params = JSON.parse(options.params)
    console.log("创建签到页面params：", params)
    that = this;
    that.setData({
      location: {
        latitude: params.lat || null,
        longitude: params.lon || null,
        distance: params.dis || null
      },
      courseId: params.courseId || app.globalData.user.defaultCourseId,
      course: params.course || null
    })
    console.log(that.data)
    console.log(app)
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

})