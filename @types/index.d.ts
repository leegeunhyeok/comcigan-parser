declare module 'comcigan-parser' {
  interface Option {
    maxGrade?: number;
    cache?: number;
  }

  interface SchoolSearchResult {
    _: number;
    region: string;
    name: string;
    code: number;
  }

  interface TimetableData {
    [grade: number]: {
      [classNumber: number]: {
        [day: number]: ClassPeriod[];
      }
    }
  }
    
  interface ClassPeriod {
    grade: number;
    class: number;
    weekday: number;
    weekdayString: string;
    classTime: number;
    teacher: string;
    subject: string;
  }

  class Timetable {
    constructor();

    init(option?: Option): Promise<void>;
    search(keyword: string): Promise<Array<SchoolSearchResult>>;
    setSchool(schoolCode: number): void;
    getTimetable(): Promise<TimetableData>;
    getClassTime(): Promise<String[]>;
  }

  export = Timetable;
}