// controllers/analyticsController.js
const prisma = require('../prismaClient');
const dayjs = require('dayjs');

// helper
const getDateArray = (start, end) => {
  const arr = [];
  let cur = dayjs(start);
  while (cur.isBefore(end) || cur.isSame(end, "day")) {
    arr.push(cur.startOf("day").toDate());
    cur = cur.add(1, "day");
  }
  return arr;
};

const overview = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalHabits = await prisma.habit.count({ where: { userId } });

    const activeChallenges = await prisma.userChallenge.count({
      where: { userId, status: "ONGOING" }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXP: true }
    });

    const logs = await prisma.trackingLog.findMany({
      where: { habit: { userId } },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 1000
    });

    const doneSet = new Set(
      logs.map(l => dayjs(l.date).startOf("day").format("YYYY-MM-DD"))
    );

    let streak = 0;
    let d = dayjs().startOf("day");
    while (doneSet.has(d.format("YYYY-MM-DD"))) {
      streak++;
      d = d.subtract(1, "day");
    }

    res.json({
      totalHabits,
      activeChallenges,
      totalXP: user?.totalXP ?? 0,
      currentStreak: streak
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed overview" });
  }
};

const habitsDaily = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = Number(req.query.days) || 30;
    const end = dayjs().startOf("day");
    const start = end.subtract(days - 1, "day");

    const logs = await prisma.trackingLog.findMany({
      where: {
        date: {
          gte: start.toDate(),
          lte: end.endOf("day").toDate(),
        },
        habit: { userId }
      },
      select: { date: true }
    });

    const counts = {};
    logs.forEach(l => {
      const k = dayjs(l.date).format("YYYY-MM-DD");
      counts[k] = (counts[k] || 0) + 1;
    });

    const arr = getDateArray(start, end).map(d => {
      const key = dayjs(d).format("YYYY-MM-DD");
      return { date: key, count: counts[key] || 0 };
    });

    res.json({ days: arr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed daily" });
  }
};

const xpWeekly = async (req, res) => {
  try {
    const userId = req.user.id;
    const weeks = Number(req.query.weeks) || 8;

    const end = dayjs().endOf("week");
    const start = end.subtract(weeks - 1, "week").startOf("week");

    // FIXED: include challenge rewardXP properly
    const completed = await prisma.userChallenge.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        challenge: { select: { rewardXP: true } }
      }
    });

    const weekMap = {};
    for (let i = 0; i < weeks; i++) {
      const wk = start.add(i, "week").startOf("week").format("YYYY-MM-DD");
      weekMap[wk] = 0;
    }

    completed.forEach(c => {
      const wk = dayjs(c.updatedAt).startOf("week").format("YYYY-MM-DD");
      if (weekMap[wk] !== undefined) {
        weekMap[wk] += c.challenge?.rewardXP || 0;
      }
    });

    const result = Object.keys(weekMap).map(k => ({
      weekStart: k,
      xp: weekMap[k]
    }));

    res.json({ weeks: result });
  } catch (err) {
    console.error("XP WEEKLY ERR:", err);
    res.status(500).json({ message: "Failed XP weekly" });
  }
};

const topHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 5;

    const logs = await prisma.trackingLog.findMany({
      where: { habit: { userId } },
      select: { habitId: true, habit: { select: { title: true } } }
    });

    const map = {};
    logs.forEach(l => {
      map[l.habitId] = (map[l.habitId] || 0) + 1;
    });

    const arr = Object.entries(map)
      .map(([id, count]) => ({
        id: Number(id),
        count,
        title: logs.find(l => l.habitId === Number(id)).habit.title
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.json({ top: arr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed top habits" });
  }
};

module.exports = {
  overview,
  habitsDaily,
  xpWeekly,
  topHabits,
};
