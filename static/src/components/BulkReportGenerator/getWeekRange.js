// start: "YYYY-MM-DD"
// weekCount: int

// e.g.
// start: "2018-09-24, weekCount: 3
// returns [ [2018-09-24, 2018-09-30], [2018-10-01, 2018-10-07], [2018-10-08, 2018-10-14] ]
export default function getWeekRange(start, weekCount) {
  const weekRange = getDateRange(start, weekCount);
  return weekRangeToStrings(weekRange);
}

function getDateRange(start, weekCount) {
  const weeks = [];
  let startDate = new Date(start);

  for (let i = 0; i < weekCount; i++) {
    let week = [];

    let weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + 7 * i);
    week.push(weekStart);

    let day = new Date(weekStart);
    day.setDate(weekStart.getDate() + 6);
    week.push(day);

    weeks.push(week);
  }

  return weeks;
}

function dateToString(date) {
  return date.toISOString().split("T")[0];
}

function weekRangeToStrings(weekRange) {
  return weekRange.map(week => week.map(day => dateToString(day)));
}
