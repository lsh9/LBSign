const formatTime = date => {
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();

  return Y + M + D + h + m + s
}

const timestampsToHMS = (timestamps) => {
  return formatTime(new Date(timestamps))
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


/**
 * @desc 由经纬度计算两点之间的距离，lat为latitude缩写，lng为longitude
 * @param lat1 第一个坐标点的纬度
 * @param lng1 第一个坐标点的经度
 * @param lat2 第二个坐标点的纬度
 * @param lng2 第二个坐标点的经度
 * @return (int)s   返回距离(单位千米或公里)
 */
const getDistance = (lat1, lng1, lat2, lng2) => {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137 // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10
  return s
}

const transformSign = (sign) => {
  sign.signLatitude = sign.signLatitude / 1e6;
  sign.signLongitude = sign.signLongitude / 1e6;
  sign.startTime = timestampsToHMS(sign.startTimeStamps * 1000)
  sign.endTime = timestampsToHMS(sign.endTimeStamps * 1000)
}

module.exports = {
  formatTime,
  timestampsToHMS,
  getDistance,
  transformSign
}