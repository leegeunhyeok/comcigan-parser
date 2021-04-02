# comcigan-parser

📘🕘 컴시간 알리미 시간표 파싱 라이브러리 입니다.  
본 라이브러리는 [컴시간](http://컴시간학생.kr) 홈페이지에서 등록된 학교의 **시간표** 데이터를 파싱하여 제공합니다.

[![health](https://img.shields.io/github/workflow/status/leegeunhyeok/comcigan-parser/health/master?label=health&style=flat-square)](https://github.com/ParkSB/the-camp-lib/actions?query=workflow%3A"HealthCheck")
[![npm version](https://img.shields.io/npm/v/comcigan-parser?style=flat-square)](https://www.npmjs.com/package/comcigan-parser)
[![npm license](https://img.shields.io/npm/l/comcigan-parser?style=flat-square)](LICENSE)

매주 월요일 09시에 본 라이브러리 동작 여부를 확인합니다. 위 health의 상태가 `passing`이 아니라면 컴시간 사이트 변경, 소스코드 변경 등의 문제가 발생했다는 의미이니 이슈 전달 부탁드립니다.

## 기능

- 학교명 입력 후 바로 사용 가능
- 학급 시간표 데이터 제공

## 정보

> 아래 두 챗봇에서 사용하던 시간표 파싱 기능을 라이브러리로 개발하였습니다.

- [광명경영회계고등학교 카카오 자동응답 API 챗봇](https://github.com/leegeunhyeok/GMMAHS-KAKAO)
- [광명경영회계고등학교 카카오 오픈빌더 i 챗봇](https://github.com/leegeunhyeok/GMMAHS-KAKAO-i)

## 설치하기

컴시간 서비스를 사용하는 학교의 시간표 데이터를 쉽게 수집하여 사용할 수 있습니다.

컴시간측의 소스코드 변경으로 인해 시간표 데이터 파싱이 불가능 할 수 있습니다.
문제가 발생할 경우 [여기](#문제-신고)를 참고해주세요

> (주의!) 본 라이브러리는 비공식적으로 컴시간 서비스의 데이터를 파싱하며, 상업적인 용도로 사용하다 문제가 발생할 경우 본 라이브러리 개발자는 책임을 지지 않습니다.

```bash
npm i comcigan-parser
```

## 개발 문서

### Timetable

Timetable 클래스의 인스턴스를 생성하여 사용합니다.

모듈을 불러오면 Timetable 클래스의 인스턴스를 생성할 수 있습니다.

```javascript
const Timetable = require('comcigan-parser');
const timetable = new Timetable();
```

---

### Timetable.init()

인스턴스 정보를 초기화 합니다.  
옵션을 추가하여 사용자 설정을 진행할 수 있습니다.

```javascript
timetable.init(options);
```

| Parameter |  Type  | Required |
| :-------- | :----: | :------: |
| option    | object |    X     |

옵션 정보는 아래 표 참고

| Option   | Value  | default | Required |
| :------- | :----: | :-----: | :------: |
| maxGrade | number |    3    |    X     |

- `maxGrade`: 최대 학년을 지정합니다. (초등: 6, 중/고등: 3)

Return - `Promise<void>`

---

### Timetable.setSchool()

시간표를 불러올 학교를 지정합니다.

> 컴시간에 등록된 학교가 아닐 경우 검색되지 않습니다.

```javascript
timetable.search(keyword);
```

| Parameter |  Type  | Required |
| :-------- | :----: | :------: |
| keyword   | string |    O     |

Return - `Promise<void>`

---

### Timetable.getTimetable()

지정한 학교의 시간표 데이터를 불러옵니다.

```javascript
timetable.getTimetable();
```

Return - `Promise<시간표>`

---

### Timetable.getClassTime()

각 교시별 수업 시작/종료 시간정보를 반환합니다.

```javascript
timetable.getClassTime();
```

Return - `string[]`

---

## 사용 방법

### Timetable 인스턴스 생성

`comcigan-parser` 모듈을 불러온 후 인스턴스를 생성합니다.  
생성 후 반드시 `init(option)`를 호출하여 초기화 합니다.

- 옵션은 [여기](#timetableinit) 참조

```javascript
const Timetable = require('comcigan-parser');
const timetable = new Timetable();

timetable.init().then(() => {
  // 초기화 완료..
});
```

---

### 학교 설정

컴시간에 등록되어있는 학교를 검색하고 인스턴스에 등록합니다.

> 학교가 여러개 조회되거나 검색 결과가 없는 경우 예외가 발생합니다.

```javascript
timetable.setSchool('광명경영회계고등학교').then(() => {
  // 학교 설정 완료..
});
```

---

### 시간표 조회

등록한 학교의 시간표 데이터를 조회합니다.

```javascript
timetable.getTimetable().then((result) => {
  console.log(result);

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 3학년 8반 화요일 2교시 시간표
  console.log(result[3][8][1][1]);
});
```

---

### 수업시간 정보 조회

```javascript
timetable.getClassTime();
```

## 활용 예시

### 비동기 함수 방식

```javascript
const Timetable = require('comcigan-parser');
const timetable = new Timetable();

const test = async () => {
  await timetable.init();
  await timetable.setSchool('광명경영회계고등학교');
  const result = await timetable.getTimetable();
  console.log(result);
};
```

### 프라미스 방식

```javascript
const Timetable = require('comcigan-parser');
const timetable = new Timetable();

timetable
  .init()
  .then(() => {
    return timetable.setSchool('광명경영회계고등학교');
  })
  .then(() => {
    return timetable.getTimetable();
  })
  .then((result) => {
    console.log(result);
  });
```

```javascript
const time = timetable.getClassTime();
console.log(time);

/*
[ '1(09:10)',
  '2(10:10)',
  '3(11:10)',
  '4(12:10)',
  '5(13:50)',
  '6(14:50)',
  '7(15:50)',
  '8(16:50)' ]
*/
```

```javascript
const Timetable = require('comcigan-parser');
const timetable = new Timetable();

const test = async () => {
  await timetable.init();
  await timetable.setSchool('광명경영회계고등학교');

  // 전교 시간표 정보 조회
  const result = await timetable.getTimetable();
  console.log(result);

  // 각 교시별 수업 시작/종료 시간 정보 조회
  const time = timetable.getClassTime();
  console.log(time);
};
```

## 데이터 형식

### 시간표 데이터

```javascript
{
  "1": {
    // 1학년
    "1": [ // 1반
      [ // 월요일 시간표
        {
          grade: 1,                   // 학년
          class: 1,                   // 반
          weekday: 1,                 // 요일 (1: 월 ~ 5: 금)
          weekdayString: '월',         // 요일 문자열
          classTime: 1,              // 교시
          teacher: '이희*',            // 선생님 성함
          subject: '실용비즈니스영어'     // 과목명
        },
        {
          grade: 1,
          class: 1,
          weekday: 1,
          weekdayString: '월',
          classTime: 2,
          code: '1606',
          teacher: '강연*',
          subject: '진로활동'
        }
      ],
      [화요일시간표],
      [수요일시간표],
      [목요일시간표],
      [금요일시간표]
    ],
    "2": [ // 2반
      [월요일시간표],
      [화요일시간표],
      [수요일시간표],
      [목요일시간표],
      [금요일시간표]
    ],
    "3": [
      [], [], [], [], []
    ],
    ...
  },
  "2": {
    // 2학년
  },
  "3": {
    // 3학년
  }
}
```

각 시간표 데이터 형식

- 각 요일 `Array` 에는 아래와 같은 형식의 데이터가 포함되어있음

```javascript
[
  {
    grade: 3,                   // 학년
    class: 10,                  // 반
    weekday: 1,                 // 요일 (1: 월 ~ 5: 금)
    weekdayString: '월',        // 요일 문자열
    classTime: 1,               // 교시
    code: '5644',               // 수업 코드
    teacher: '이희*',            // 선생님 성함
    subject: '실용비즈니스영어'     // 과목명
  },
  {
    grade: 3,
    class: 10,
    weekday: 1,
    weekdayString: '월',
    classTime: 2,
    teacher: '강연*',
    subject: '진로활동'
  },
  ...
]
```

응용 방법

```javascript
timetable.getTimetable().then((result) => {
  // 3학년 8반 시간표 (월 ~ 금)
  console.log(result[3][8]);

  // 1학년 1반 월요일 시간표
  console.log(result[1][1][0]);

  // 2학년 5반 금요일 3교시 시간표
  console.log(result[2][5][4][2]);
});
```

- 학년, 반의 경우 인덱스 상관 없이 동일하게 접근
  - 예: 1학년 3반(result[1][3]), 3학년 9반(result[3][9])
- 요일, 교시의 경우 인덱스는 0부터 시작하므로 -1 값을 통해 접근
  - 예: 월요일 3교시(result[..][..][0][2])

## 문제 신고

시간표 파싱이 되지 않거나 문제가 발생한 경우 [이슈](https://github.com/leegeunhyeok/comcigan-parser/issues)를 남겨주세요.

### 수업시간 정보

```javascript
[
  '1(09:10)',
  '2(10:10)',
  '3(11:10)',
  '4(12:10)',
  '5(13:50)',
  '6(14:50)',
  '7(15:50)',
  '8(16:50)',
];
```

## 문제 신고

시간표 파싱이 되지 않거나 문제가 발생한 경우 [이슈](https://github.com/leegeunhyeok/comcigan-parser/issues)를 남겨주세요.

## 변경사항

- `0.3.0`
  - 컴시간 변경사항 대응 (도메인 변경)
  - 더 원활한 데이터 수집을 위해 코어 로직 수정
  - `firstNames` 옵션 제거
  - 시간표 데이터의 속성명 변경 (전: `class_time`, 후: `classTime`)
  - 시간표 데이터의 `code` 값 제거
- `0.2.0`
  - getClassTime 메소드 추가 (각 교시별 수업 시작/종료 시간 정보) - [참조](#timetablegetclasstime)
- `0.1.1`
  - tempSave 옵션 문제 수정
- `0.1.0`
  - tempSave 옵션 삭제
  - 시간표 추출 데이터 임계값 옵션 추가 (자세한 사항은 [여기](#timetableinit) 참조)
- `0.0.3`
  - 데이터 파싱 문제 수정
- `0.0.2`
  - 개발 문서 추가
  - `init`의 기본 옵션 문제 수정
- `0.0.1` - 첫 번째 릴리즈!
