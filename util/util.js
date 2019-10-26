/**
 * util.js
 *
 * @description 자주 사용하는 필요 모듈
 * @author Leegeunhyeok
 * @version 0.2.0
 *
 */

/**
 * @description 숫자 데이터를 2자리 수로 변경 (00)
 * @param {number} targetNumber 0을 추가할 숫자
 * @return {string}
 */
const appendZero = (targetNumber) => {
  const targetString = targetNumber.toString()
  if (targetString.length >= 2) {
    return targetString
  } else if (targetString.length === 1) {
    return '0' + targetString
  } else {
    return '00'
  }
}

module.exports = {
  appendZero
}
