const prisma = require('../prismaClient');
const dayjs = require('dayjs');
const { toDateOnly } = require('../utils/date');

/**
 * Helper: calculate current streak for a habit
 * This will look at tracking logs and compute consecutive days up to today.
 */
async function calculateCurrentStreak(habitId) {
  // fetch last logs for this habit ordered desc
  const logs = await prisma.trackingLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 365 // limit
  });

  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  let expectedDate = dayjs().startOf('day');

  for (let i = 0; i < logs.length; i++) {
    const logDate = dayjs(logs[i].date).startOf('day');
    if (logDate.isSame(expectedDate)) {
      streak++;
      expectedDate = expectedDate.subtract(1, 'day');
    } else if (logDate.isBefore(expectedDate)) {
      // maybe missed a day => break
      break;
    } else {
      // logDate is after expected — odd (future) skip
      continue;
    }
  }

  return streak;
}

const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, tags } = req.body;

    if (!title || !frequency) 
      return res.status(400).json({ message: 'Missing fields' });

    // Ensure frequency matches enum
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        title,
        description: description || '',
        frequency, // now enum-safe
        tags: tags || []
      }
    });

    res.status(201).json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHabits = async (req, res) => {
  try {
    const { tag, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (tag) where.tags = { has: tag };

    const habits = await prisma.habit.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { trackingLogs: { orderBy: { date: 'desc' } } }
    });
    if (!habit || habit.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const currentStreak = await calculateCurrentStreak(id);
    res.json({ ...habit, currentStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) 
      return res.status(404).json({ message: 'Not found' });

    const { title, description, frequency, tags } = req.body;

    // Validate frequency
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        title,
        description,
        frequency,
        tags
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.habit.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    // delete tracking logs first (cascade not enabled)
    await prisma.trackingLog.deleteMany({ where: { habitId: id } });
    await prisma.habit.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Track habit for today
 */
const trackHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const today = dayjs().startOf('day').toDate();

    // create log if not exists for today
    try {
      const log = await prisma.trackingLog.create({
        data: {
          habitId: id,
          date: today
        }
      });

      // update completedCount
      await prisma.habit.update({
        where: { id },
        data: { completedCount: { increment: 1 } }
      });

      // optionally recalc longestStreak
      const currentStreak = await calculateCurrentStreak(id);
      const update = {};
      if (currentStreak > habit.longestStreak) update.longestStreak = currentStreak;
      if (Object.keys(update).length) {
        await prisma.habit.update({ where: { id }, data: update });
      }

      res.status(201).json({ message: 'Tracked', log });
    } catch (e) {
      // unique constraint violation -> duplicate for today
      console.error(e);
      return res.status(400).json({ message: 'Already tracked for today' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHistory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    // last 7 days
    const fromDate = dayjs().startOf('day').subtract(6, 'day').toDate();
    const logs = await prisma.trackingLog.findMany({
      where: {
        habitId: id,
        date: {
          gte: fromDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // map to last 7 days array
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().startOf('day').subtract(i, 'day');
      const found = logs.find(l => dayjs(l.date).startOf('day').isSame(d));
      result.push({ date: d.toDate(), completed: !!found });
    }

    res.json({ history: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  trackHabit,
  getHistory,
};
