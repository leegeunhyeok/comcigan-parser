/**
 * comcigan-parser Module
 *
 * index.js
 *
 * Github : https://github.com/leegeunhyeok/comcigan-parser
 * NPM : https://www.npmjs.com/package/comcigan-parser
 *
 * @description 컴시간 시간표 파싱 라이브러리
 * @author Leegeunhyeok
 * @license MIT
 * @version 0.2.0
 *
 */

const request = require('request')
const iconv = require('iconv-lite')

const { appendZero } = require('./util/util')

class Timetable {
  constructor () {
    this._baseUrl = 'http://comci.kr:4082'
    this._url = 'http://comci.kr:4082/st'
    this._weekdayString = ['일', '월', '화', '수', '목', '금', '토']
    this._classTime = []
  }

  /**
   * @description 시간표 파서를 초기화합니다.
   * @param {any} option 초기화 옵션 객체
   */
  async init (option) {
    if (option) {
      this._option = {
        firstNames: option.firstNames || ['김', '박', '이', '송'],
        maxGrade: option.maxGrade || 3,
        timetableThreshold: option.timetableThreshold || 30000
      }

      if (option['tempSave'] !== undefined) {
        console.log('[comcigan-parser] WARNING: tempSave option was deprecated at >= 0.1.0')
      }
    } else {
      this._option = {
        firstNames: ['김', '박', '이', '송'],
        maxGrade: 3,
        timetableThreshold: 30000
      }
    }

    await new Promise((resolve, reject) => {
      request(this._url, (err, _, body) => {
        if (err) {
          reject(err)
        }

        const idx = body.indexOf('school_ra(sc)')
        const idx2 = body.indexOf('sc_data(\'')

        if (idx === -1 || idx2 === -1) {
          reject(new Error('소스에서 식별 코드를 찾을 수 없습니다.'))
        }

        const extractSchoolRa = body.substr(idx, 50).replace(' ', '')
        const schoolRa = extractSchoolRa.match(/url:'.(.*?)'/)

        // sc_data 인자값 추출
        const extractScData = body.substr(idx2, 30).replace(' ', '')
        const scData = extractScData.match(/\(.*?\)/)

        if (scData) {
          this._scData = scData[0].replace(/[()]/g, '').replace(/'/g, '').split(',')
        } else {
          reject(new Error('sc_data 값을 찾을 수 없습니다.'))
        }

        if (schoolRa) {
          this._extractCode = schoolRa[1]
        } else {
          reject(new Error('school_ra 값을 찾을 수 없습니다.'))
        }

        resolve()
      })
    })
    this._initialized = true
  }

  /**
   * @description 시간표 데이터를 불러올 학교를 설정합니다.
   * @param {string} keyword 학교 검색 키워드
   * @return {Promise<any>}
   */
  async setSchool (keyword) {
    if (!this._initialized) {
      throw new Error('초기화가 진행되지 않았습니다.')
    }

    let hexString = ''
    for (let buf of iconv.encode(keyword, 'euc-kr')) {
      hexString += '%' + buf.toString(16)
    }

    await new Promise((resolve, reject) => {
      request(this._baseUrl + this._extractCode + hexString, (err, res, body) => {
        let jsonString = body.substr(0, body.lastIndexOf('}') + 1)
        let searchData = JSON.parse(jsonString)['학교검색']

        if (err) {
          reject(err)
        }

        if (searchData.length <= 0) {
          reject(new Error('검색된 학교가 없습니다.'))
        }

        if (searchData.length > 1) {
          reject(new Error(`검색된 학교가 많습니다. 더 자세한 학교명을 입력해주세요. 검색 결과 수: ${searchData.length}`))
        }

        this._searchData = searchData
        resolve()
      })
    })

    this._setSchool = true
  }

  /**
   * @description 설정한 학교의 시간표 데이터를 불러옵니다
   * @return {Promise<any>}
   */
  async getTimetable () {
    if (!this._initialized) {
      throw new Error('초기화가 진행되지 않았습니다.')
    }

    if (!this._setSchool) {
      throw new Error('학교 설정이 진행되지 않았습니다.')
    }

    const da1 = '0'
    const s7 = this._scData[0] + this._searchData[0][3]
    const sc3 = this._extractCode.split('?')[0] + '?' +
                Buffer.from(s7 + '_' + da1 + '_' + this._scData[2]).toString('base64')

    // JSON 데이터 로드
    const resultJson = await new Promise((resolve, reject) => {
      request(this._baseUrl + sc3, (err, res, body) => {
        if (err) {
          reject(err)
        }

        if (!body) {
          reject(new Error('시간표 데이터를 찾을 수 없습니다.'))
        }

        // String to JSON
        resolve(JSON.parse(body.substr(0, body.lastIndexOf('}') + 1)))
      })
    })

    // 교시별 시작/종료 시간 데이터
    this._classTime = resultJson['일과시간']

    let subjectProp = ''
    let teacherProp = ''
    let timedataProp = ''

    // JSON 데이터의 프로퍼티 조회
    for (let k of Object.keys(resultJson)) {
      if (typeof resultJson[k] === 'object' && k.indexOf('자료') !== -1) {
        if (k.indexOf('긴') !== -1) {
          subjectProp = k
        } else {
          let teacherCount = 0
          let teacherFinished = false
          let timetableDataFinished = false
          for (let d of resultJson[k]) {
            for (let firstName of this._option['firstNames']) {
              if (d.indexOf(firstName) !== -1) {
                teacherCount++
              }
            }

            if (teacherCount >= 10 && !teacherFinished) {
              teacherProp = k
              teacherFinished = true
            }

            for (let dd of d) {
              if (dd.length === 7 && typeof dd[0] === 'object') {
                let total = 0
                dd.forEach(data => {
                  total += data.reduce((v, acc) => acc + v, 0)
                })

                if (total > this._option['timetableThreshold']) {
                  timedataProp = k
                  break
                }
              }
            }

            if (teacherFinished && timetableDataFinished) {
              break
            }
          }
        }
      }
    }

    const classCount = resultJson['학급수']
    const teachers = resultJson[teacherProp]
    const subjects = resultJson[subjectProp]
    const data = resultJson[timedataProp]
    const time = resultJson['요일별시수']

    // 저장 데이터 리스트
    let timetableData = {}

    // 1학년 ~ maxGrade 학년 교실 반복
    for (let grade = 1; grade <= this._option['maxGrade']; grade++) {
      // 학년 별 반 수 만큼 반복
      for (let classNum = 1; classNum <= classCount[grade]; classNum++) {
        const tempData = data[grade][classNum]
        // 월(1) ~ 금(5)
        for (let weekday = 1; weekday <= 5; weekday++) {
          // 1교시 ~ 해당 날짜의 수업 교시
          for (let classTime = 1; classTime <= time[grade][weekday]; classTime++) {
            const code = tempData[weekday][classTime].toString()
            var teacherCode = 0
            var subjectCode = 0

            if (code.length === 3) {
              teacherCode = parseInt(appendZero(code.substr(0, 1), 2))
              subjectCode = parseInt(appendZero(code.substr(1, 2), 2))
            } else {
              teacherCode = parseInt(appendZero(code.substr(0, 2), 2))
              subjectCode = parseInt(appendZero(code.substr(2, 2), 2))
            }

            if (!(grade in timetableData)) {
              timetableData[grade] = {}
            }

            if (!(classNum in timetableData[grade])) {
              timetableData[grade][classNum] = Array.apply(null, new Array(5)).map(() => [])
            }

            // 시간표 데이터 추가
            timetableData[grade][classNum][weekday - 1].push({
              grade,
              class: classNum,
              weekday,
              weekdayString: this._weekdayString[weekday],
              class_time: classTime,
              code,
              teacher: teachers[teacherCode],
              subject: subjects[subjectCode].replace(/_/g, '')
            })
          }
        }
      }
    }

    return timetableData
  }

  /**
   * @description 각 수업 교시별 시작/종료시간 데이터
   */
  getClassTime () {
    return this._classTime
  }
}

module.exports = Timetable
