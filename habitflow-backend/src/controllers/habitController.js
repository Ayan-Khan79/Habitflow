const prisma = require('../prismaClient');
const dayjs = require('dayjs');

/**
 * Helper: calculate current streak for a habit
 */
async function calculateCurrentStreak(habitId) {
  const logs = await prisma.trackingLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 365,
  });

  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  let expectedDate = dayjs().startOf('day');

  for (let log of logs) {
    const logDate = dayjs(log.date).startOf('day');
    if (logDate.isSame(expectedDate)) {
      streak++;
      expectedDate = expectedDate.subtract(1, 'day');
    } else if (logDate.isBefore(expectedDate)) {
      break; // missed a day
    } else {
      continue; // future date
    }
  }

  return streak;
}

/**
 * Create a new habit
 */
const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    if (!title || !frequency) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        title,
        description: description || '',
        frequency: String(frequency),
        tags: tags || [],
        reminderTime: reminderTime ? new Date(reminderTime) : null,
      },
    });

    res.status(201).json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get habits with pagination and optional tag filter
 */
const getHabits = async (req, res) => {
  try {
    const { tag, page = 1, limit = 6 } = req.query;
    const where = { userId: req.user.id };
    if (tag) where.tags = { has: tag };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [habits, totalCount] = await Promise.all([
      prisma.habit.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.habit.count({ where }),
    ]);
    
    res.json({ habits, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single habit with tracking logs and current streak
 */
const getHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { trackingLogs: { orderBy: { date: 'desc' } } },
    });

    if (!habit || habit.userId !== req.user.id)
      return res.status(404).json({ message: 'Not found' });

    const currentStreak = await calculateCurrentStreak(id);
    res.json({ ...habit, currentStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a habit
 */
const updateHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.habit.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user.id)
      return res.status(404).json({ message: 'Not found' });

    const { title, description, frequency, tags, reminderTime } = req.body;

    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        title,
        description,
        frequency,
        tags,
        reminderTime: reminderTime ? new Date(reminderTime) : null,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a habit and its tracking logs
 */
const deleteHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.habit.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user.id)
      return res.status(404).json({ message: 'Not found' });

    await prisma.trackingLog.deleteMany({ where: { habitId: id } });
    await prisma.habit.delete({ where: { id } });

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Track a habit for today
 */
const trackHabit = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== req.user.id)
      return res.status(404).json({ message: 'Not found' });

    const today = dayjs().startOf('day').toDate();

    try {
      const log = await prisma.trackingLog.create({
        data: { habitId: id, date: today },
      });

      await prisma.habit.update({
        where: { id },
        data: { completedCount: { increment: 1 } },
      });

      const currentStreak = await calculateCurrentStreak(id);
      if (currentStreak > habit.longestStreak) {
        await prisma.habit.update({
          where: { id },
          data: { longestStreak: currentStreak },
        });
      }

      res.status(201).json({ message: 'Tracked', log });
    } catch (e) {
      return res.status(400).json({ message: 'Already tracked for today' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get last 7 days history
 */
const getHistory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== req.user.id)
      return res.status(404).json({ message: 'Not found' });

    const fromDate = dayjs().startOf('day').subtract(6, 'day').toDate();
    const logs = await prisma.trackingLog.findMany({
      where: { habitId: id, date: { gte: fromDate } },
      orderBy: { date: 'asc' },
    });

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().startOf('day').subtract(i, 'day');
      const found = logs.find((l) => dayjs(l.date).startOf('day').isSame(d));
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
