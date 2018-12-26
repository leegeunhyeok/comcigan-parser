# comcigan-parser
📘🕘 컴시간 알리미 시간표 파싱 라이브러리 입니다.  
본 라이브러리는 [컴시간](http://comci.kr) 홈페이지에서 등록된 학교의 **시간표** 데이터를 파싱하여 제공합니다.

[![npm version](https://badge.fury.io/js/comcigan-parser.svg)](https://badge.fury.io/js/comcigan-parser)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# 기능
- 학교명 입력 후 바로 사용 가능
- 시간표 데이터 파싱

# 정보
아래 두 챗봇에서 사용하던 시간표 파싱 기능을 라이브러리로 개발하였습니다.
- [광명경영회계고등학교 카카오 자동응답 API 챗봇](https://github.com/leegeunhyeok/GMMAHS-KAKAO)
- [광명경영회계고등학교 카카오 오픈빌더 i 챗봇](https://github.com/leegeunhyeok/GMMAHS-KAKAO-i)

# 설치하기
```bash
npm i comcigan-parser
```

# 개발 문서

## Timetable
모듈을 불러오면 Timetable 클래스의 인스턴스를 생성할 수 있습니다.
```javascript
const Timetable = require('comcigan-parser')
new Timetable()
```
- - -

## (Method) Timetable.init
인스턴스 정보를 초기화 합니다.  
옵션을 추가하여 사용자 설정을 진행할 수 있습니다.

| Parameter | Type | Required |
|:--|:--:|:--:|
| option | any | X |


옵션 정보는 아래 표 참고 

| Option | Value | default |
|:--|:--:|:--:|
| tempSave | boolean | false |
| firstNames | array | ['김', '박', '이', '송'] |
| maxGrade | number | 3 |

- tempSave - 시간표 데이터 파싱 후 인스턴스에 시간표 데이터를 임시로 저장합니다.
- 선생님 이름 추출 시 참고할 성 목록입니다.
- 최대 학년을 지정합니다.

Return - `Promise<any>`

```javascript
const timetable = new Timetable()
timetable.init(option)
```
- - -

## (Method) Timetable.setSchool
시간표를 불러올 학교를 지정합니다.
> 컴시간에 등록된 학교가 아닐 경우 검색되지 않습니다.

| Parameter | Type | Required |
|:--|:--:|:--:|
| keyword | string | O |

Return - `Promise<any>`

```javascript
timetable.search(keyword)
```
- - -

## (Method) Timetable.getTimetable
지정한 학교의 시간표 데이터를 불러옵니다.

Return - `Promise<any>`

```javascript
timetable.getTimetable()
```
- - -

## (Method) Timetable.getTempData
임시 저장된 시간표 데이터를 불러옵니다.
> 임시 저장된 시간표가 없을 경우 빈 객체를 반환합니다.

Return - `any`
- - -

# 사용 방법
## Timetable 인스턴스 생성
`comcigan-parser` 모듈을 불러온 후 인스턴스를 생성합니다.  
생성 후 반드시 `init(option)`를 호출하여 초기화 합니다.

- 옵션은 [여기](#(Method)-Timetable.init) 참조

```javascript
const Timetable = require('comcigan-parser')
const timetable = new Timetable()

timetable.init({
  tempSave: true
}).then(() => {
  // 초기화 완료..
})
```

## 학교 설정
컴시간에 등록되어있는 학교를 검색하고 인스턴스에 등록합니다.
> 학교가 여러개 조회되거나 검색 결과가 없는 경우 예외가 발생합니다.

```javascript
timetable.setSchool('광명경영회계고등학교').then(() => {
  // 학교 설정 완료..
})
```

## 시간표 조회
등록한 학교의 시간표 데이터를 조회합니다.

```javascript
timetable.getTimetable().then(result => {
  console.log(result)

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 3학년 8반 화요일 2교시 시간표
  console.log(result[3][8][1][1])
})
```

## 실사용 예제

### 비동기 함수 방식
```javascript
const Timetable = require('comcigan-parser')
const timetable = new Timetable()

const test = async () => {
  await timetable.init()
  await timetable.setSchool('광명경영회계고등학교')
  const result = await timetable.getTimetable()
  console.log(result)
}
```

### 프라미스 방식
```javascript
const Timetable = require('comcigan-parser')
const timetable = new Timetable()

timetable.init()
.then(() => {
  return timetable.setSchool('광명경영회계고등학교')
})
.then(() => {
  return timetable.getTimetable()
})
.then(result => {
  console.log(result)
})
.catch(err => {
  console.error(err)
})
```

# 데이터 형식
```javascript
{
  "1": {
    // 1학년
    "1": [ // 1반 
      [월요일시간표],
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
    class_time: 1,              // 교시
    code: '5644',               // 수업 코드
    teacher: '이희*',           // 선생님 성함
    subject: '실용비즈니스영어'  // 과목명
  },
  {
    grade: 3,
    class: 10,
    weekday: 1,
    weekdayString: '월',
    class_time: 2,
    code: '1606',
    teacher: '강연*',
    subject: '진로활동'
  },
  ...
]
```
응용 방법
```javascript
getTimetable().then(result => {
  // 3학년 8반 시간표 (월 ~ 금)
  console.log(result[3][8])

  // 1학년 1반 월요일 시간표
  console.log(result[1][1][0])

  // 1학년 1반 금요일 3교시 시간표 
  console.log(result[2][5][4][2])
})
```

# 문제 신고
시간표 파싱이 되지 않거나 문제가 발생한 경우 [이슈](https://github.com/leegeunhyeok/comcigan-parser/issues)를 남겨주세요.

# 변경사항
- `0.0.2`
  - 개발 문서 추가
  - `init`의 기본 옵션 문제 수정
- `0.0.1` - 첫 번째 릴리즈!
