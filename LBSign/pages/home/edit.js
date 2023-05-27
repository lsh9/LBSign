const app = getApp();
var that = null;

Page({
  data: {
    options: null,
    userName: "",
    userNumber: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 读取历史的信息并展示
    that = this;
    that.setData({
      userName: app.globalData.user.userName,
      userNumber: app.globalData.user.userNumber
    })
  },

  handleNameInput(e) {
    that = this;
    that.setData({
      userName: e.detail.value
    })
  },

  handleStuIdInput(e) {
    that = this;
    that.setData({
      userNumber: e.detail.value
    })
  },

  // 保存编辑结果
  handleEdit() {

    wx.request({
      url: app.domain + '/user/edit',
      method: "POST",
      data: {
        userid: app.globalData.userid,
        userName: this.data.userName,
        userNumber: this.data.userNumber
      },
      success: (res) => {
        if (res.data.success) {
          app.globalData.user.userName = this.data.userName;
          app.globalData.user.userNumber = this.data.userNumber;
          wx.showToast({
            title: '编辑成功',
          })
        }
        wx.navigateBack()
      }
    })
  },

  // 取消，返回上一页
  handleCancel() {
    wx.navigateBack({})
  },
})