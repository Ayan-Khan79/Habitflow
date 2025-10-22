const dayjs = require('dayjs');

function toDateOnly(date = new Date()) {
  return dayjs(date).startOf('day').toDate();
}

module.exports = { toDateOnly };
