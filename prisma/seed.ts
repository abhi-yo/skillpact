import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const categories = [
    { name: 'Technology & IT', description: 'Programming, support, web development, etc.' },
    { name: 'Creative & Design', description: 'Graphic design, writing, photography, music, etc.' },
    { name: 'Home Services', description: 'Cleaning, repairs, gardening, organization, etc.' },
    { name: 'Tutoring & Education', description: 'Academic subjects, languages, test prep, etc.' },
    { name: 'Health & Wellness', description: 'Fitness training, yoga, coaching, nutrition, etc.' },
    { name: 'Crafts & Hobbies', description: 'Knitting, pottery, painting, model building, etc.' },
    { name: 'Events & Planning', description: 'Party planning, coordination, catering help, etc.' },
    { name: 'Consulting & Business', description: 'Marketing advice, financial planning, administrative support, etc.' },
    { name: 'Other', description: 'Miscellaneous services not covered elsewhere.' },
  ];

  for (const category of categories) {
    const createdCategory = await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`Created or found category with id: ${createdCategory.id} (${createdCategory.name})`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 