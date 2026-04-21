const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({});

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create an Elder
  const elder = await prisma.user.upsert({
    where: { username: 'elder1' },
    update: {},
    create: {
      username: 'elder1',
      fullName: 'John Elder',
      passwordHash,
      role: 'elder',
    },
  });

  // Create a Staff
  const staff = await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      fullName: 'Jane Staff',
      passwordHash,
      role: 'staff',
    },
  });

  // Create some people assigned to staff
  await prisma.person.create({
    data: {
      fullName: 'Alice Member',
      personType: 'member',
      assignedStaffId: staff.id,
    }
  });

  await prisma.person.create({
    data: {
      fullName: 'Bob Visitor',
      personType: 'visit',
      assignedStaffId: staff.id,
    }
  });

  console.log('Database seeded with test data:');
  console.log('Elder:', elder.username, '/ password123');
  console.log('Staff:', staff.username, '/ password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
