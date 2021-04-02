/**
 * sample.js
 *
 * @description 샘플 코드
 * @author leegeunhyeok
 */

const Timetable = require('../index');
const timetable = new Timetable();

const test = async () => {
  await timetable.init();
  await timetable.setSchool('광명경영회계고등학교');
  const result = await timetable.getTimetable();

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 2학년 4반 화요일 3교시 시간표
  console.log(result[2][4][1][2]);
};

test();
