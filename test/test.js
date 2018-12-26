const Timetable = require('../index');
const timetable = new Timetable();

const test = async () => {
  await timetable.init()
  await timetable.setSchool('광명경영회계고등학교')
  const result = await timetable.getTimetable()
  
  console.log(JSON.stringify(result, null, 2))
}

test()
