// controllers/challengeController.js
const prisma = require('../prismaClient');
const dayjs = require('dayjs');

const getAllChallenges = async (req, res) => {
    try {
      const challenges = await prisma.Challenge.findMany({
        include: { milestones: true },
      });
  
      res.json(challenges);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      res.status(500).json({ message: "Server error" });
    }
};

const getChallengeById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const challenge = await prisma.Challenge.findUnique({
      where: { id },
      include: { milestones: true },
    });
    if (!challenge) return res.status(404).json({ message: 'Not found' });
    return res.json({ challenge });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch challenge' });
  }
};

// Start / join a challenge
const startChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeId = Number(req.params.id);

    const challenge = await prisma.Challenge.findUnique({ where: { id: challengeId }});
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // prevent multiple active joins for same challenge
    const existing = await prisma.userChallenge.findFirst({
      where: { userId, challengeId, status: 'ONGOING' }
    });
    if (existing) return res.status(400).json({ message: 'Already joined' });

    const startDate = dayjs().startOf('day').toDate();
    const endDate = dayjs(startDate).add(challenge.durationDays - 1, 'day').endOf('day').toDate();

    const userChallenge = await prisma.UserChallenge.create({
      data: {
        userId,
        challengeId,
        startDate,
        endDate,
      },
      include: { challenge: true }
    });

    return res.status(201).json({ message: 'Challenge started', userChallenge });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to start challenge' });
  }
};

// Get user's challenges (ongoing + past)
const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const userChallenges = await prisma.UserChallenge.findMany({
      where: { userId },
      include: {
        challenge: { include: { milestones: true } },
        progressLogs: true
      },
      orderBy: { startDate: 'desc' }
    });
    return res.json({ userChallenges });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch user challenges' });
  }
};

// Mark today's progress for a userChallenge
const completeToday = async (req, res) => {
  try {
    const userChallengeId = Number(req.params.id);
    const uc = await prisma.UserChallenge.findUnique({
      where: { id: userChallengeId },
      include: { challenge: { include: { milestones: true } } }
    });
    if (!uc || uc.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const today = dayjs().startOf('day').toDate();

    // prevent duplicate
    const exists = await prisma.ChallengeProgress.findUnique({
      where: { userChallengeId_date: { userChallengeId, date: today } }
    });
    if (exists) return res.status(400).json({ message: 'Already completed for today' });

    await prisma.ChallengeProgress.create({
      data: { userChallengeId, date: today, isCompleted: true }
    });

    const updated = await prisma.UserChallenge.update({
      where: { id: userChallengeId },
      data: { completedDays: { increment: 1 } },
      include: { challenge: { include: { milestones: true } } }
    });

    // Check milestone unlocks
    const unlocked = updated.challenge.milestones.filter(m => m.dayCount === updated.completedDays);

    // If completedDays reaches duration -> mark as completed
    let statusUpdate = null;
    if (updated.completedDays >= updated.challenge.durationDays) {
      await prisma.UserChallenge.update({
        where: { id: userChallengeId },
        data: { status: 'COMPLETED' }
      });
      statusUpdate = 'COMPLETED';
    }

    return res.json({ message: 'Progress marked', completedDays: updated.completedDays, unlockedMilestones: unlocked, status: statusUpdate });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to mark progress' });
  }
};
const createChallenge = async (req, res) => {
    try {
      const { title, description, icon, durationDays, rewardXP } = req.body;
  
      if (!title || !durationDays || !rewardXP) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const challenge = await prisma.Challenge.create({
        data: { title, description, icon, durationDays, rewardXP },
      });
  
      res.status(201).json(challenge);
    } catch (err) {
      console.error("Error creating challenge:", err);
      res.status(500).json({ message: "Server error" });
    }
};

const deletechallenge = async (req,res) => {
  try{
    const id = Number(req.params.id);

    if(!id) return res.status(404).json({message:"Challenge not found"});

    const deleted = await prisma.Challenge.delete({
      where: { id: id }
    });
    res.status(200).json({
      message: "Challenge deleted successfully",
      deleted,
    });  
  }
  catch(err){
    console.log("Error deleting the challenge",err);
    res.status(500).json({message:"Server error"});
  }
};

// ✅ End challenge (remove entry from userChallenge table)
const endChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeId = Number(req.params.id);

    // Find active challenge entry
    const userChallenge = await prisma.UserChallenge.findFirst({
      where: {
        userId,
        challengeId,
        status: "ONGOING",
      },
    });

    if (!userChallenge) {
      return res.status(404).json({ message: "Challenge not active" });
    }

    // Delete only userChallenge entry (NOT the entire challenge)
    await prisma.UserChallenge.delete({
      where: { id: userChallenge.id },
    });

    res.json({ message: "Challenge ended successfully" });
  } catch (err) {
    console.error("Error ending challenge:", err);
    res.status(500).json({ message: "Server error while ending challenge" });
  }
};

module.exports = { 
    getAllChallenges,
    getChallengeById,
    startChallenge,
    getUserChallenges,
    completeToday,
    createChallenge, 
    deletechallenge,
    endChallenge
};
  
