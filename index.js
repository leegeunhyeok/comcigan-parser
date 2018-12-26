const request = require('request')
const iconv = require('iconv-lite')

const { appendZero } = require('./util/util')

class Timetable {
  constructor () {
    this._baseUrl = 'http://comci.kr:4081'
    this._url = 'http://comci.kr:4081/st'
    this._weekdayString = ['일', '월', '화', '수', '목', '금', '토']
  }

  search (keyword) {
    // 학교 명 검색
  }
}

module.exports = Timetable
