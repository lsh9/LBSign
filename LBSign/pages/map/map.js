const app = getApp(); // 获取应用实例
let that = null // 页面this指针变量

Page({
  data: {

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
      '地图中心定位点',
    ],
    validDistance: 200,

    courseIndex: 0,
    courses: null,
    coursePickerList: null,
    selectedCourseId: null,
  },

  handleRegionChange() {
    console.log("handleRegionChange")
    that = this
    let map = wx.createMapContext('map')

    map.getCenterLocation({
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
        case 3:
          console.log("课程定位点：", index)
          var courseIndex = that.data.courseIndex;
          that.setData({
            ['circle.longitude']: that.data.courses[courseIndex].courseLongitude / 1e6,
            ['circle.latitude']: that.data.courses[courseIndex].courseLatitude / 1e6,
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
      validDistance: e.detail.value,
      ["circle.radius"]: e.detail.value
    })
  },

  // 课程改变
  handleCourseChange(e) {
    that = this;
    var index = Number(e.detail.value);
    var course = that.data.courses[index];
    that.setData({
      courseIndex: index,
      selectedCourseId: course.courseId
    })
    if (course.courseLatitude && course.courseLongitude){
      console.log("课程具有定位")
      that.setData({
        options: [
          '不使用定位',
          '手机定位点',
          '地图中心定位点',
          '课程定位点'
        ],
      })
    }


  },
  onLoad() {
    that = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })



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

    // 获取课程数据
    if(!app.globalData.userid){
      wx.showToast({
        title: '请先登录',
        icon: "error"
      })
      return;
    }
    wx.request({
      url: app.domain + '/user/get_my_courses',
      method: 'POST',
      data: {
        userid: app.globalData.userid,
      },
      success: (res) => {
        var resp = res.data
        if (resp.success) {
          console.log("courses: ", resp.courses.map(course=>course.courseName))
          // 设置按钮
          that.setData({
            courses: resp.courses,
            coursePickerList: resp.courses.map(course=> course.courseName + ": " + course.courseDescription)
          })
        }
      },
      complete: ()=>{
        wx.hideLoading();
      }
    })
  },

  handleCreateSignTap() {

    var params = {
      lon: this.data.circle.longitude,
      lat: this.data.circle.latitude,
      dis: this.data.circle.radius,
      courseId: this.data.selectedCourseId,
    }
    if (!params.courseId){
      params.courseId = app.globalData.user.defaultCourseId
    }
    if (this.data.index == 0){
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