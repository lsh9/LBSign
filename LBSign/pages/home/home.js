const app = getApp();
let that = null
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName: "",
    userNumber: "",
    avatarUrl: defaultAvatarUrl,

    inputShowed: false,
    inputVal: '',

    login: false,

    show: true,
    buttons: [{
      text: '取消'
    }, {
      text: '确认'
    }]
  },

  // 跳转到个人信息设置
  bindAvatarTap() {

    wx.navigateTo({
      url: '/pages/home/edit',
    })
  },

  //搜索框函数
  showInput() {
    this.setData({
      inputShowed: true,
    });
  },
  hideInput() {
    this.setData({
      inputVal: '',
      inputShowed: false,
    });
  },
  clearInput() {
    this.setData({
      inputVal: '',
    });
  },
  inputTyping(e) {
    this.setData({
      inputVal: e.detail.value,
    });
  },

  //==================================================
  confirmInputCode() {
    wx.showLoading({
      title: '正在查询签到码，请稍后',
    })
    wx.request({
      url: app.domain + "/sign/get_sign_by_signCode",
      method: "POST",
      data: {
        "signCode": this.data.inputVal
      },
      success: (res) => {
        var resp = res.data;
        console.log("通过签到码获取签到：", resp.success)
        if (resp.success) {
          if (resp.sign) {
            var sign = JSON.stringify(resp.sign)
            wx.navigateTo({
              url: '/pages/sign/participate?sign=' + sign
            })
            wx.hideLoading();
          } else {
            // 签到码无效
            wx.showToast({
              title: '无效签到或超时',
              icon: "error"
            })
          }
        }
      }
    })

  },

  handleSearch(e) {
    console.log(e)
  },

  handleLogin() {
    that = this

    wx.showLoading({
      title: '正在连接到服务器...',
    })

    wx.login({
      success: (res) => {
        console.log("res: ", res)
        wx.request({
          url: app.domain + "/user/login",
          method: "POST",
          data: {
            code: res.code
          },
          success: (res) => {
            var resp = res.data
            console.log("login: ", resp)
            if (resp.success) {
              that.setData({
                login: true
              })
              app.globalData.userid = resp.user.userid
              app.globalData.user = resp.user
              wx.showToast({
                title: '连接成功',
              })
            } else {
              wx.showToast({
                title: '服务器连接失败，请等待后台维护',
                icon: 'none'
              })
            }

          }
        })

      },
      fail: (res) => {
        console.log("登陆失败：", res)
        wx.showToast({
          title: '服务器连接失败，请等待后台维护',
          icon: 'none'
        })
      }
    })
  },

  // =================================================================
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("home.onLoad")
    app.callBack = (res) => {
      this.onLoadAL(options)
    }
  },

  onLoadAL(options) {
    console.log("home.onLoadAL")
    that = this;
    that.setData({
      login: app.globalData.login,
      userName: app.globalData.user.userName,
      userNumber: app.globalData.user.userNumber,
    });
    if (app.globalData.user.avatarUrl) {
      that.setData({
        avatarUrl: app.domain + app.globalData.user.avatarUrl,
      })
    }

    // 链接进入，参数有签到码
    console.log("检查邀请码")
    if (options.signCode) {
      wx.request({
        url: app.domain + "/sign/get_sign_by_signCode",
        method: "POST",
        data: {
          "signCode": options.signCode
        },
        success: (res) => {
          var resp = res.data;
          if (resp.success) {
            if (resp.sign) {
              var sign = JSON.stringify(resp.sign)
              wx.navigateTo({
                url: '/pages/sign/participate?sign=' + sign
              })
            } else {
              // 签到码无效
              wx.showToast({
                title: '无效签到或超时',
                icon: "error"
              })
            }
          }
        }
      })
      return;
    }

    // 初次显示使用
    var user = app.globalData.user
    if (user) {
      this.setData({
        userName: user.userName,
        userNumber: user.userNumber,
      })
      if (user.avatarUrl) {
        that.setData({
          avatarUrl: app.domain + app.globalData.user.avatarUrl,
        })
      }
    }

    // 读取剪切板内容
    console.log("检查剪切板")
    wx.getClipboardData({
      success(res) {
        if (res.data.length === 4) {
          wx.request({
            url: app.domain + "/sign/get_sign_by_signCode",
            method: "POST",
            data: {
              "signCode": res.data
            },
            success: (res) => {
              var resp = res.data;
              console.log("success:", resp.success)
              if (resp.success) {
                if (resp.sign) {
                  var sign = JSON.stringify(resp.sign)
                  wx.navigateTo({
                    url: '/pages/sign/participate?sign=' + sign
                  })
                } else {
                  // 签到码无效
                  console.log(resp.sign)
                }
              }
            }
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
    console.log("home.onShow")
    var user = app.globalData.user
    if (user && (user.userName || user.userNumber)) {
      this.setData({
        userName: user.userName,
        userNumber: user.userNumber,
      })
      if (user.avatarUrl) {
        that.setData({
          avatarUrl: app.domain + app.globalData.user.avatarUrl,
        })
      }
    }
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