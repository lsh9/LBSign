const app = getApp(); // 获取应用实例
let that = null // 页面this指针变量
const util = require("@utils/util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: null,
    sign: null,
    remainTime: 0,

    lon: 116,
    lat: 39,
    marker: {
      id: 0,
      longitude: 116.38,
      latitude: 39.90,
      iconPath: '/assets/local.png',
      width: '22',
      height: '22'
    },
    circle: {
      longitude: 0,
      latitude: 0,
      radius: 200
    },
  },

  // 按下签到按钮进行签到
  handleParticipate() {
    that = this;
    var userName = app.globalData.user.userName;
    var userNumber = app.globalData.user.userNumber;
    var sign = that.data.sign;
    var timestamps = parseInt(new Date().getTime() / 1000);

    if (timestamps > sign.endTimeStamps) {
      wx.showToast({
        title: '签到已超时',
        icon: "error",
        duration: 1000,
      })
      return;
    }

    if (!userName || !userNumber) {
      wx.showModal({
        title: '个人信息设置',
        content: '个人签到信息未填，是否前往设置',
        complete: (res) => {
          if (res.cancel) {
            return;
          }

          if (res.confirm) {
            // var sign = JSON.stringify(that.data.sign)
            wx.navigateTo({
              url: '/pages/home/edit'
            })
          }
        }
      })
    }


    // 位置签到
    if (sign.validDistance == 0) {
      that.participate({
        signId: sign.signId,
      }, timestamps)
    } else {
      // 定位
      wx.getLocation({
        type: "gcj02",
        success: (res) => {
          console.log(res)

          var lon = res.longitude
          var lat = res.latitude
          var distance = util.getDistance(lat, lon, sign.latitude, sign.longitude)
          console.log("实际距离：", distance)
          if (distance > sign.validDistance) {
            wx.showToast({
              title: '签到失败！\n实际距离:' + parseInt(distance) + "米",
              icon: 'none'
            })
            return;
          }
          that.participate({
            signId: sign.signId,
            lon: lon,
            lat: lat,
            distance: distance
          }, timestamps)
        }
      })
    }



  },

  participate(params, timestamps) {
    wx.showLoading({
      title: '正在签到',
    })
    wx.request({
      url: app.domain + "/sign/participate",
      method: "POST",
      data: {
        userid: app.globalData.userid,
        signId: params.signId,
        signTimeStamps: timestamps,
        signUserName: app.globalData.user.userName,
        signUserNumber: app.globalData.user.userNumber,
        signLongitude: params.lon * 1e6 || null,
        signLatitude: params.lat * 1e6 || null,
        actualDistance: params.distance || 0
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '签到成功',
            duration: 3000
          })
          that.setData({
            ["sign.signCount"]: res.data.sign.signCount
          })
          console.log(res.data.sign)
        } else {
          wx.showToast({
            title: '服务器内部错误',
            icon: "error"
          })
        }
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },

  // 倒计时功能
  countDown: function () {
    that = this;
    var time = new Date().getTime() / 1000;
    var remainSeconds = that.data.sign.endTimeStamps - time
    //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
    that.setData({
      timer: setInterval(function () { //这里把setInterval赋值给变量名为timer的变量
        remainSeconds--;
        // 补零
        const addZero = (num) => {
          return num < 10 ? ("0" + num) : num;
        }
        var hours = addZero(parseInt(remainSeconds / 3600));
        var minutes = addZero(parseInt(remainSeconds / 60 % 60));
        var seconds = addZero(parseInt(remainSeconds % 60));
        that.setData({
          remainTime: hours + ":" + minutes + ":" + seconds
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (remainSeconds <= 0) {
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.data.timer);
          //关闭定时器之后，可作其他处理codes go here
          that.setData({
            remainTime: "签到超时",
          })
        }
      }, 1000)
    })
  },

  setLocation() {
    that = this;
    let map = wx.createMapContext('map', this);
    console.log(map)
    if (that.data.sign.validDistance > 0) {
      wx.getLocation({
        type: "gcj2",
        success: (res) => {
          console.log("定位点：", res)
          map.getCenterLocation({
            success: (res) => {
              console.log("中心点：", res)
            },
          });
          that.setData({
            lon: res.longitude,
            lat: res.latitude,
            ['circle.longitude']: that.data.sign.longitude,
            ['circle.latitude']: that.data.sign.latitude,
            ['circle.radius']: that.data.sign.validDistance,
            ['marker.longitude']: that.data.sign.longitude,
            ['marker.latitude']: that.data.sign.latitude,
          });
          map.moveToLocation({
            longitude: that.data.lon,
            latitude: that.data.lat,
            success: () => {
              console.log("移动后：", that.data.lon, that.data.lat)
            }
          });
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    var signCode = options.signCode;
    if (signCode) {
      wx.showLoading({
        title: '正在查询',
        mask: true
      })
      wx.request({
        url: app.domain + "/sign/get_sign_by_signCode",
        method: "POST",
        data: {
          "signCode": signCode
        },
        success: (res) => {
          var resp = res.data;
          if (resp.success) {
            var sign = resp.sign
            if (sign) {
              util.transformSign(sign);
              that.setData({
                timer: null,
                sign: sign,
              })
              this.setLocation();
              this.countDown();
            } else {
              // 签到码无效
              wx.showToast({
                title: '签到已超时',
                complete: () => {
                  wx.redirectTo({
                    url: '/pages/home/home',
                  })
                }
              })
            }
          }
        },
        complete: () => {
          wx.hideLoading();
        }
      })
    } else {
      var sign = JSON.parse(options.sign);
      util.transformSign(sign);
      that.setData({
        timer: null,
        sign: sign,
      })
      this.setLocation();
      this.countDown();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(that.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(that.data.timer);
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
  onShareAppMessage() {
    var signCode = this.data.sign.signCode
    return {
      title: '签到码：' + signCode,
      desc: 'LBSign课堂签到',
      path: '/pages/sign/participate?signCode=' + signCode // 路径，传递参数到指定页面。
    }
  }
})