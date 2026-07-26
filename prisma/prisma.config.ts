import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: {
    kind: 'file',
    filePath: 'prisma/schema.prisma',
  },
  migrate: {
    // 💡 আপনার .env ফাইলের DATABASE_URL-টি এখানে পাস করে দিন
    url: process.env.DATABASE_URL,
  },
});