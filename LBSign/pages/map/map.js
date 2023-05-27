const app = getApp(); // 获取应用实例
let that = null // 页面this指针变量

Page({
  data: {
    //
    useClass: false,

    longitude: 116.38,
    latitude: 39.90,

    markers: [],
    circle: {
      longitude: 0,
      latitude: 0,
      radius: 200
    },

    marker: {
      id: 0,
      longitude: 116.38,
      latitude: 39.90,
      iconPath: '/assets/local.png',
      width: '22',
      height: '22'
    },

    coordinate: ['当前位置', '课堂定位'],


    index: 0,
    options: [
      '不使用定位',
      '手机定位点',
      '地图中心定位',
    ],
    validDistance: 200,
  },

  handleRegionChange() {
    that = this
    let map = wx.createMapContext('map')

    map.getCenterLocation({
      iconPath: "/assets/local.png",
      success: (res) => {
        let lon = res.longitude
        let lat = res.latitude
        that.setData({
          ['marker.longitude']: lon,
          ['marker.latitude']: lat,
        })
        if (that.data.index == 2) {
          that.setData({
            ['circle.longitude']: that.data.marker.longitude,
            ['circle.latitude']: that.data.marker.latitude,
          })
        }
      },

    })
  },

  handleUpdated() {
    console.log("地图更新完成")
    // that = this;
    // if (that.data.index == 2){
    //   that.setData({
    //     ['circle.longitude']: that.data.marker.longitude,
    //     ['circle.latitude']: that.data.marker.latitude,
    //   })
    // }
  },

  handlePickerChange(e) {
    that = this;
    var index = Number(e.detail.value);
    that.setData({
      index: index
    })
    switch (index) {
      case 0:
        console.log("不定位：", index)
        that.setData({
          ['circle.radius']: 1,
        })
        break;
      case 1:
        console.log("当前位置定位：", index)
        that.setData({
          ['circle.longitude']: that.data.longitude,
          ['circle.latitude']: that.data.latitude,
          ['circle.radius']: that.data.validDistance,
        })
        break;
      case 2:
        console.log("地图中心定位：", index)
        that.setData({
          ['circle.longitude']: that.data.marker.longitude,
          ['circle.latitude']: that.data.marker.latitude,
          ['circle.radius']: that.data.validDistance,
        })
        break;
      default:
        break;
    }

  },
  handleSliderChanging(e) {
    that = this;
    that.setData({
      ["circle.radius"]: e.detail.value
    })
  },

  onLoad() {
    that = this

    // 定位
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        console.log(res)
        let lon = res.longitude
        let lat = res.latitude

        that.setData({
          longitude: lon,
          latitude: lat,
          ['marker.longitude']: lon,
          ['marker.latitude']: lat,
        })
      }
    })
  },

  handleCreateSignTap() {
    var params = {
      lon: this.data.longitude,
      lat: this.data.latitude,
      dis: this.data.validDistance,
      courseId: app.globalData.user.defaultCourseId,
    }
    if (this.data.index == 2) {
      params.lon = that.data.marker.longitude;
      params.lat = that.data.marker.latitude;
    }else if (this.data.index == 0){
      params.lon = null;
      params.lat = null;
      params.dis = 0;
    }
    params = JSON.stringify(params)
    wx.navigateTo({
      url: "/pages/sign/create?params=" + params
    })
  }
})