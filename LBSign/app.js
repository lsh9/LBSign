App({
  onLaunch() {


    console.log("app.onLaunch")
    var _this = this
    const waitOnLoad = function () {
      const o = setInterval(function () {
        if (_this.callBack) {
          _this.callBack()
          clearInterval(o)
        }
      }, 10) //这里设置每10毫秒检查一次callBack函数是否从onLoad()注入
    }

    // 登录
    console.log("连接到服务器...")
    wx.showLoading({
      title: '正在连接到服务器...',
    })
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: this.domain + "/user/login",
          method: "POST",
          data: {
            code: res.code
          },
          success: (res) => {
            var resp = res.data
            console.log("login: ", resp)
            if (resp.success) {
              this.globalData.userid = resp.user.userid
              this.globalData.user = resp.user
              this.globalData.login = true
              console.log("连接成功！")
              waitOnLoad()
            }
          }
        })
        wx.showToast({
          title: '连接成功',
        })
      },
      fail: (res) => {
        console.log("登陆失败：", res)
        wx.showToast({
          title: '服务器连接失败，请等待后台维护',
        })
      }
    })

    // const userInfo = wx.getStorageSync('userInfo') || null
    // if (userInfo == null) {
    //   wx.showModal({
    //     title: '请求获取头像',
    //     content: '是否授权头像与昵称信息？',
    //     complete: (res) => {
    //       if (res.confirm) {
    //         // 获取用户信息
    //         wx.getUserProfile({
    //           desc: '展示用户信息',
    //           success: (res) => {
    //             wx.setStorageSync('userInfo', res.userInfo)
    //             wx.reLaunch({
    //               url: '/pages/home/home',
    //             })
    //           }
    //         })
    //       }
    //     }
    //   })
    // }
  },

  globalData: {
    login: false,
    userid: null,
    user: null,
  },
  // domain: "https://lbsign.yydk77.cn"
  // domain: "https://lbsign.yydk77.cn:5000"
  // domain: "https://fg.yydk77.cn"
  domain: "https://api.yydk77.cn:5000"
  // domain: "https://lbsign.freehk.svipss.top"
  // domain: "http://localhost:5001"
})