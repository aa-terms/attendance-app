const moment = require("moment");

const SCHOOL_START_MONTH = 4; // April
const SCHOOL_END_MONTH = 3; // March

function getSchoolYearRange() {
  const today = moment();
  const start = moment([today.year(), SCHOOL_START_MONTH - 1]);
  const end = moment([today.year() + 1, SCHOOL_END_MONTH - 1]).endOf("month");

  return { start, end };
}

module.exports = { getSchoolYearRange };
