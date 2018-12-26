/**
 * @description 숫자 데이를 2자리 수 만큼 0 추가
 * @param {number} targetNumber 0 추가할 숫자
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
