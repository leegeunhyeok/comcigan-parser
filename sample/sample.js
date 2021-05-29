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

  // 학교 검색 및 특정 학교 찾기
  const schoolList = await timetable.search('광명');
  console.log(schoolList);
  const targetSchool = schoolList.find((school) => {
    return school.region === '경기' && school.name === '광명경영회계고등학교';
  });

  // 학교 설정
  await timetable.setSchool(targetSchool.code);
  const result = await timetable.getTimetable();

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 2학년 4반 화요일 3교시 시간표
  console.log(result[2][4][1][2]);

  // 교시별 수업시간 정보
  console.log(await timetable.getClassTime());
};

test();
