/**
 * @type {CalendarConfig}
 */
export const SPACE1889CalendarConfig = {
  name: "Gregorian",
  description: "The Gregorian calendar with some simplifications regarding seasonal timing.",
  years: {
    yearZero: 1970,
    firstWeekday: 3,
    leapYear: {
      leapStart: 8,
      leapInterval: 4
    }
  },
  months: {
    values: [
      {name: "CALENDAR.GREGORIAN.January", abbreviation: "CALENDAR.GREGORIAN.JanuaryAbbr", ordinal: 1, days: 31},
      {name: "CALENDAR.GREGORIAN.February", abbreviation: "CALENDAR.GREGORIAN.FebruaryAbbr", ordinal: 2, days: 28, leapDays: 29},
      {name: "CALENDAR.GREGORIAN.March", abbreviation: "CALENDAR.GREGORIAN.MarchAbbr", ordinal: 3, days: 31},
      {name: "CALENDAR.GREGORIAN.April", abbreviation: "CALENDAR.GREGORIAN.AprilAbbr", ordinal: 4, days: 30},
      {name: "CALENDAR.GREGORIAN.May", abbreviation: "CALENDAR.GREGORIAN.MayAbbr", ordinal: 5, days: 31},
      {name: "CALENDAR.GREGORIAN.June", abbreviation: "CALENDAR.GREGORIAN.JuneAbbr", ordinal: 6, days: 30},
      {name: "CALENDAR.GREGORIAN.July", abbreviation: "CALENDAR.GREGORIAN.JulyAbbr", ordinal: 7, days: 31},
      {name: "CALENDAR.GREGORIAN.August", abbreviation: "CALENDAR.GREGORIAN.AugustAbbr", ordinal: 8, days: 31},
      {name: "CALENDAR.GREGORIAN.September", abbreviation: "CALENDAR.GREGORIAN.SeptemberAbbr", ordinal: 9, days: 30},
      {name: "CALENDAR.GREGORIAN.October", abbreviation: "CALENDAR.GREGORIAN.OctoberAbbr", ordinal: 10, days: 31},
      {name: "CALENDAR.GREGORIAN.November", abbreviation: "CALENDAR.GREGORIAN.NovemberAbbr", ordinal: 11, days: 30},
      {name: "CALENDAR.GREGORIAN.December", abbreviation: "CALENDAR.GREGORIAN.DecemberAbbr", ordinal: 12, days: 31}
    ]
  },
  days: {
    values: [
      {name: "CALENDAR.GREGORIAN.Monday", abbreviation: "CALENDAR.GREGORIAN.MondayAbbr", ordinal: 1},
      {name: "CALENDAR.GREGORIAN.Tuesday", abbreviation: "CALENDAR.GREGORIAN.TuesdayAbbr", ordinal: 2},
      {name: "CALENDAR.GREGORIAN.Wednesday", abbreviation: "CALENDAR.GREGORIAN.WednesdayAbbr", ordinal: 3},
      {name: "CALENDAR.GREGORIAN.Thursday", abbreviation: "CALENDAR.GREGORIAN.ThursdayAbbr", ordinal: 4},
      {name: "CALENDAR.GREGORIAN.Friday", abbreviation: "CALENDAR.GREGORIAN.FridayAbbr", ordinal: 5},
      {name: "CALENDAR.GREGORIAN.Saturday", abbreviation: "CALENDAR.GREGORIAN.SaturdayAbbr", ordinal: 6, isRestDay: true},
      {name: "CALENDAR.GREGORIAN.Sunday", abbreviation: "CALENDAR.GREGORIAN.SundayAbbr", ordinal: 7, isRestDay: true}
    ],
    daysPerYear: 365,
    hoursPerDay: 24,
    minutesPerHour: 60,
    secondsPerMinute: 60
  },
  seasons: {
    values: [
      {name: "CALENDAR.GREGORIAN.Spring", monthStart: 2, dayStart:19},
      {name: "CALENDAR.GREGORIAN.Summer", monthStart: 5, dayStart: 20},
      {name: "CALENDAR.GREGORIAN.Fall", monthStart: 8, dayStart: 22},
      {name: "CALENDAR.GREGORIAN.Winter", monthStart: 11, dayStart: 20}
    ]
  }
};