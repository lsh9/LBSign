const app = getApp();
var that = null;

Page({
  data: {
    courses: null,
    buttons: null
  },

  // 进入课程详细信息
  handleSlideTap(e) {
    console.log(e)
    var index = parseInt(e.currentTarget.id)
    var course = JSON.stringify(this.data.courses[index])
    wx.navigateTo({
      url: '/pages/course/detail?course=' + course,
    })
  },

  // 按钮响应事件
  slideButtonTap(e) {
    that = this;
    var btnIndex = e.detail.index;
    var courseIndex = e.detail.data.index;
    var course = that.data.courses[courseIndex];
    console.log("滑块按钮：", btnIndex, course)
    switch (btnIndex) {
      case 0:
        // 签到
        var params = {
          course: course
        };
        if (course.validDistance != 0) {
          params.lon = course.courseLongitude;
          params.lat = course.courseLatitude;
          params.dis = course.validDistance;
        }
        wx.navigateTo({
          url: '/pages/sign/create?params=' + JSON.stringify(params),
        })

        break;
      case 1:
        // 编辑
        wx.navigateTo({
          url: '/pages/course/create?course=' + JSON.stringify(course),
        })

        break;
      case 2:
        // 删除
        wx.request({
          url: app.domain + "/course/delete",
          method: "POST",
          data: {
            courseId: course.courseId
          },
          success: res => {
            if (res.data.success) {
              wx.showToast({
                title: '删除成功',
              })

              var courses = that.data.courses
              courses.splice(courseIndex, 1)
              that.setData({
                courses: courses
              })
            } else {
              wx.showToast({
                title: '删除失败',
              })
            }

          }
        })
        wx.showLoading({
          title: '正在删除课程',
        })
        break;
      default:
        break;
    }

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this
    wx.request({
      url: app.domain + '/user/get_my_courses',
      method: 'POST',
      data: {
        userid: app.globalData.userid,
      },
      success: (res) => {
        var resp = res.data
        if (resp.success) {
          console.log("courses: ", resp.courses)
          // 设置按钮
          var n = resp.courses.length
          var buttons = []
          for (var i = 0; i < n; i++) {
            buttons[i] = [{
                text: "签到",
                data: {
                  index: i
                }
              },
              {
                text: "编辑",
                data: {
                  index: i
                }
              },
              {
                text: "删除",
                type: "warn",
                data: {
                  index: i
                }
              }
            ]
          }
          that.setData({
            courses: resp.courses,
            buttons: buttons
          })
        }
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

})