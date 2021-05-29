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
 */

const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

// URL is not defined in old node.js
if (typeof URL === 'undefined') {
  URL = require('url').URL;
}

const HOST = 'http://컴시간학생.kr';

class Timetable {
  constructor() {
    this._baseUrl = null;
    this._url = null;
    this._initialized = false;
    this._pageSource = null;
    this._cache = null;
    this._cacheAt = null;
    this._schoolCode = -1;
    this._weekdayString = ['일', '월', '화', '수', '목', '금', '토'];
    this._option = {
      maxGrade: 3,
      cache: 0,
    };
  }

  /**
   * 시간표 파서를 초기화합니다.
   *
   * @param option 초기화 옵션 객체
   */
  async init(option) {
    if (option) {
      this._option = Object.assign(this._option, option);
    }

    await new Promise((resolve, reject) => {
      request(HOST, (err, _res, body) => {
        if (err) {
          reject(err);
        }

        const frame = body
          .toLowerCase()
          .replace(/\'/g, '"')
          .match(/<frame [^>]*src="[^"]*"[^>]*>/gm);
        if (!frame) {
          reject(new Error('frame을 찾을 수 없습니다'));
          return;
        }

        const uri = frame[0].match(/\".*\"/gi);
        if (!uri) {
          reject(new Error('접근 주소를 찾을 수 없습니다'));
          return;
        }

        const frameHref = uri[0].replace(/\"/g, '');
        const url = new URL(frameHref);
        this._url = frameHref;
        this._baseUrl = url.origin;
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      request(
        {
          url: this._url,
          encoding: null,
        },
        (err, _res, body) => {
          if (err) {
            reject(err);
          }

          const source = iconv.decode(body, 'EUC-KR');
          const idx = source.indexOf('school_ra(sc)');
          const idx2 = source.indexOf("sc_data('");

          if (idx === -1 || idx2 === -1) {
            reject(new Error('소스에서 식별 코드를 찾을 수 없습니다.'));
            return;
          }

          const extractSchoolRa = source.substr(idx, 50).replace(' ', '');
          const schoolRa = extractSchoolRa.match(/url:'.(.*?)'/);

          // sc_data 인자값 추출
          const extractScData = source.substr(idx2, 30).replace(' ', '');
          const scData = extractScData.match(/\(.*?\)/);

          if (scData) {
            this._scData = scData[0].replace(/[()]/g, '').replace(/'/g, '').split(',');
          } else {
            reject(new Error('sc_data 값을 찾을 수 없습니다.'));
            return;
          }

          if (schoolRa) {
            this._extractCode = schoolRa[1];
          } else {
            reject(new Error('school_ra 값을 찾을 수 없습니다.'));
            return;
          }

          this._pageSource = source;
          resolve();
        },
      );
    });
    this._initialized = true;
  }

  /**
   * 시간표 데이터를 불러올 학교를 설정합니다.
   *
   * @param {string} keyword 학교 검색 키워드
   * @returns 검색된 학교 목록 `Array<[코드, 지역, 학교이름, 학교코드]>`
   */
  search(keyword) {
    if (!this._initialized) {
      throw new Error('초기화가 진행되지 않았습니다.');
    }

    let hexString = '';
    for (let buf of iconv.encode(keyword, 'euc-kr')) {
      hexString += '%' + buf.toString(16);
    }

    return new Promise((resolve, reject) => {
      request(this._baseUrl + this._extractCode + hexString, (err, _res, body) => {
        let jsonString = body.substr(0, body.lastIndexOf('}') + 1);
        let searchData = JSON.parse(jsonString)['학교검색'];

        if (err) {
          reject(err);
        }

        if (searchData.length <= 0) {
          reject(new Error('검색된 학교가 없습니다.'));
        }

        resolve(
          searchData.map((data) => {
            return {
              _: data[0],
              region: data[1],
              name: data[2],
              code: data[3],
            };
          }),
        );
      });
    });
  }

  /**
   * 시간표를 조회할 학교 코드를 등록합니다
   *
   * @param school
   */
  setSchool(schoolCode) {
    this._schoolCode = schoolCode;
    this._cache = null;
  }

  /**
   * 설정한 학교의 전교 시간표 데이터를 불러옵니다
   *
   * @return 시간표 데이터
   */
  async getTimetable() {
    this._isReady();

    // 캐시 지속시간이 존재하고, 아직 만료되지 않았다면 기존 값 전달
    // 만료되었거나, 캐시가 비활성화(기본값)되어있는 경우엔 항상 새로운 값 파싱하여 전달
    if (this._option.cache && !this._isCacheExpired()) {
      return this._cache;
    }

    const jsonString = await this._getData();
    const resultJson = JSON.parse(jsonString);
    const startTag = this._pageSource.match(/<script language(.*?)>/gm)[0];
    const regex = new RegExp(startTag + '(.*?)</script>', 'gi');

    let match;
    let script = '';
    // 컴시간 웹 페이지 JS 코드 추출
    while ((match = regex.exec(this._pageSource))) {
      script += match[1];
    }

    // 데이터 처리 함수명 추출
    const functioName = script
      .match(/function 자료[^\(]*/gm)[0]
      .replace(/\+s/, '')
      .replace('function', '');

    // 학년 별 전체 학급 수
    const classCount = resultJson['학급수'];

    // 시간표 데이터 객체
    const timetableData = {};

    // 1학년 ~ maxGrade 학년 교실 반복
    for (let grade = 1; grade <= this._option['maxGrade']; grade++) {
      if (!timetableData[grade]) {
        timetableData[grade] = {};
      }

      // 학년 별 반 수 만큼 반복
      for (let classNum = 1; classNum <= classCount[grade]; classNum++) {
        if (!timetableData[grade][classNum]) {
          timetableData[grade][classNum] = {};
        }

        timetableData[grade][classNum] = this._getClassTimetable(
          { data: jsonString, script, functioName },
          grade,
          classNum,
        );
      }
    }

    this._cache = timetableData;
    this._cacheAt = +new Date();
    return timetableData;
  }

  /**
   * 교시별 수업시간 정보를 조회합니다.
   * @returns
   */
  async getClassTime() {
    this._isReady();
    // 교시별 시작/종료 시간 데이터
    return JSON.parse(await this._getData())['일과시간'];
  }

  /**
   * 컴시간의 API를 통해 전체 시간표 데이터를 수집/파싱하여 반환합니다.
   */
  async _getData() {
    const da1 = '0';
    const s7 = this._scData[0] + this._schoolCode;
    const sc3 =
      this._extractCode.split('?')[0] +
      '?' +
      Buffer.from(s7 + '_' + da1 + '_' + this._scData[2]).toString('base64');

    // JSON 데이터 로드
    const jsonString = await new Promise((resolve, reject) => {
      request(this._baseUrl + sc3, (err, _ㄴres, body) => {
        if (err) {
          reject(err);
        }

        if (!body) {
          reject(new Error('시간표 데이터를 찾을 수 없습니다.'));
        }

        // String to JSON
        resolve(body.substr(0, body.lastIndexOf('}') + 1));
      });
    });

    return jsonString;
  }

  /**
   * 지정된 학년/반의 1주일 시간표를 파싱합니다
   *
   * @param codeConfig 데이터, 함수명, 소스코드 객체
   * @param grade 학년
   * @param classNumber 반
   * @returns
   */
  _getClassTimetable(codeConfig, grade, classNumber) {
    const args = [codeConfig.data, grade, classNumber];
    const call = codeConfig.functioName + '(' + args.join(',') + ')';
    const script = codeConfig.script + '\n\n' + call;

    /** DEAD: Sorry about using eval() **/
    const res = eval(script);

    // Table HTML script
    const $ = cheerio.load(res);
    const $this = this;
    const timetable = [];
    $('tr').each(function (timeIdx) {
      const currentTime = timeIdx - 2;
      // 1, 2번째 tr은 제목 영역이므로 스킵
      if (timeIdx <= 1) return;

      $(this)
        .find('td')
        .each(function (weekDayIdx) {
          const currentWeekDay = weekDayIdx - 1;
          // 처음(제목)과 끝(토요일) 영역은 스킵
          if (weekDayIdx === 0 || weekDayIdx === 6) return;

          if (!timetable[currentWeekDay]) {
            timetable[currentWeekDay] = [];
          }

          const subject = $(this).contents().first().text();
          const teacher = $(this).contents().last().text();
          timetable[currentWeekDay][currentTime] = {
            grade,
            class: classNumber,
            weekday: weekDayIdx - 1,
            weekdayString: $this._weekdayString[weekDayIdx],
            classTime: currentTime + 1,
            teacher,
            subject,
          };
        });
    });

    return timetable;
  }

  /**
   * 초기화 및 학교 설정이 모두 준비되었는지 확인합니다.
   */
  _isReady() {
    if (!this._initialized) {
      throw new Error('초기화가 진행되지 않았습니다.');
    }

    if (this._schoolCode === -1) {
      throw new Error('학교 설정이 진행되지 않았습니다.');
    }
  }

  /**
   * 사용자가 세팅한 캐시 지속 시간을 확인하여 만료 여부를 반환합니다.
   *
   * @returns 캐시 만료 여부
   */
  _isCacheExpired() {
    return +new Date() - this._cacheAt >= this._option.cache;
  }
}

module.exports = Timetable;
