const app = getApp();
var that = null;
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userName: "",
    userNumber: "",
    avatarUrl: defaultAvatarUrl,
    theme: wx.getSystemInfoSync().theme,

    url: null

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
    // 读取历史的信息并展示
    that = this;
    that.setData({
      userName: app.globalData.user.userName,
      userNumber: app.globalData.user.userNumber
    })
    if (app.globalData.user.avatarUrl) {
      that.setData({
        avatarUrl: app.domain + app.globalData.user.avatarUrl
      })
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    that = this;
    console.log(e)
    var avatarUrl = e.detail.avatarUrl
    this.setData({
      avatarUrl: avatarUrl,
    });
    wx.showLoading({
      title: '正在保存头像',
      mask: true
    })
    wx.uploadFile({
      url: app.domain + '/files/upload',
      filePath: avatarUrl,
      name: 'file',
      success: function (res) {
        var resp = JSON.parse(res.data)
        console.log("头像url：", resp)
        if (resp.success) {
          console.log("头像url：", resp)
          that.setData({
            url: resp.url,
            avatarUrl: app.domain + resp.url
          });
        }
      },
      complete: () => {
        wx.hideLoading();
      }
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

    wx.showLoading({
      title: '正在保存',
    })
    wx.request({
      url: app.domain + '/user/edit',
      method: "POST",
      data: {
        userid: app.globalData.userid,
        userName: this.data.userName,
        userNumber: this.data.userNumber,
        avatarUrl: this.data.url,
      },
      success: (res) => {
        if (res.data.success) {
          app.globalData.user.userName = this.data.userName;
          app.globalData.user.userNumber = this.data.userNumber;
          app.globalData.user.avatarUrl = this.data.url;
          wx.showToast({
            title: '编辑成功',
          })
        }
        wx.navigateBack()
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
  },

  // 取消，返回上一页
  handleCancel() {
    wx.navigateBack();
  },
})