import { db } from './src/db/index.ts';
import { users } from './src/db/schema/auth.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  const devEmail = 'nicolachoquet06250@gmail.com';
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, devEmail)
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    // @ts-ignore
    await db.insert(users).values({
      name: 'nicovers06.fr',
      email: devEmail,
      emailVerified: new Date(),
      password: hashedPassword,
    });
    console.log('✅ User nicovers06.fr created with password.');
  } else {
    const hashedPassword = await bcrypt.hash('password123', 10);
    // @ts-ignore
    await db.update(users).set({
      password: hashedPassword,
    }).where(eq(users.email, devEmail));
    console.log('✅ User password updated.');
  }

  console.log('🌱 Seeding finished.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:');
  console.error(err);
  process.exit(1);
});
