const app = getApp();
var that = null;
const util = require("@utils/util")
Page({

  /**
   * 
   * 页面的初始数据
   */
  data: {
    course: null,
    signs: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    var course = JSON.parse(options.course);
    that.setData({
      course: course
    });

    wx.showLoading({
      title: '正在加载。。。',
    });

    wx.request({
      url: app.domain + "/course/get_course_signs",
      method: "POST",
      data: {
        courseId: course.courseId
      },
      success: (res) => {
        if (res.data.success) {
          var signs = res.data.signs;
          // 变换数据
          for (var sign of signs) {
            util.transformSign(sign);
          }
          that.setData({
            signs: signs
          })
        }
      },
      complete: () => {
        wx.hideLoading();
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
    console.log("课程签到分享：", e)
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

  handleDownload(e) {
    wx.request({
      url: app.domain + "/sign/download_sign_file",
      method: "POST",
      data: {
        userid: app.globalData.userid,
        signId: e.target.dataset.signid
      },
      success: (res) => {
        if (res.data.success) {
          var url = app.domain + res.data.url
          console.log("下载地址", url)

          wx.setClipboardData({
            data: url,
            success(res) {
              wx.showToast({
                title: '下载地址：' + url + '  已复制到剪切板',
                icon: 'none'
              })
            }
          })

        }
      }
    })
  },

  handleGoTo(e) {
    var signCode = e.target.dataset.signcode;
    var index = parseInt(e.target.id);
    var sign = this.data.signs[index];
    sign.course = this.data.course;
    sign = JSON.stringify(sign)
    wx.navigateTo({
      url: '/pages/sign/participate?sign=' + sign,
    })

  },

  handleDelete(e) {
    that = this;
    console.log(e)
    wx.request({
      url: app.domain + "/sign/delete",
      method: "POST",
      data: {
        signId: e.target.dataset.signid
      },
      success: (res) => {
        wx.showToast({
          title: '删除成功',
        })
        var signs = that.data.signs
        signs.splice(parseInt(e.target.id), 1)
        that.setData({
          signs: signs
        })
      }

    })
  }
})