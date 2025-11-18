const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedChallenges() {
  const challenges = await prisma.Challenge.createMany({
    data: [
      { title: '30-Day Fitness', description: 'Do some exercise every day', durationDays: 30, rewardXP: 100 },
      { title: 'Read Books', description: 'Read at least 20 pages daily', durationDays: 15, rewardXP: 50 },
      { title: 'Meditation', description: 'Meditate for 10 mins daily', durationDays: 7, rewardXP: 20 },
    ],
    skipDuplicates: true, // avoids duplicate entries if re-run
  });

  console.log('Seeded challenges:', challenges);
}

seedChallenges()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
