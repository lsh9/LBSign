const app = getApp();
let that = null;

Page({
  data: {
    isLocated: false,

    courseName: null,
    courseDesc: null,
    location: {
      latitude: null,
      longitude: null
    },
    validDistance: 0,
  },

  // 获取输入数据
  handleCourseNameInput(e) {
    that = this;
    that.setData({
      courseName: e.detail.value
    })
  },

  handleCourseDescInput(e) {
    that = this;
    that.setData({
      courseDesc: e.detail.value || null
    })
  },

  // 选择位置
  tapChoose() {
    that = this;
    var loc = null;
    wx.getLocation({
      success(res) {
        loc = res
      },
      complete() {
        wx.chooseLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          success(res) {
            // 确定用户选择了地点，如果没选择点了确定会返回空名字
            if (res.name != "") {
              that.setData({
                location: res,
                isLocated: true,
              })
            }
          }
        })
      }

    })

  },

  // 创建课程
  tapCreate() {
    that = this;
    if (!that.data.courseName) {
      wx.showToast({
        title: '课程名称为空！',
        icon: 'error'
      })
      return
    }

    // todo: 向服务器发送请求创建课程
    wx.request({
      url: app.domain + "/course/create",
      method: "POST",
      data: {
        userid: app.globalData.userid,
        courseName: that.data.courseName,
        courseDescription: that.data.courseDesc,
        courseLongitude: that.data.location.longitude * 1e6 || null,
        courseLatitude: that.data.location.latitude * 1e6 || null
      },
      success: (res) => {
        var resp = res.data
        if (resp.success) {
          // 创建成功
          wx.showToast({
            title: "课程创建成功",
            duration: 1500	
          })
          wx.navigateBack()
        }
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