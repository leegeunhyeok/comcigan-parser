/**
 * test.js
 *
 * @description 테스트 코드
 * @author Leegeunhyeok
 * @version 0.2.0
 *
 */

const Timetable = require('../index')
const timetable = new Timetable()

const test = async () => {
  await timetable.init({
    tempSave: true
  })
  await timetable.setSchool('광명경영회계고등학교')
  const result = await timetable.getTimetable()

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 3학년 8반 화요일 1교시 시간표
  console.log(result[3][8][1][0])
  console.log('====================')

  // 각 교시별 수업 시작/종료 시간
  console.log(timetable.getClassTime())
}

test()
