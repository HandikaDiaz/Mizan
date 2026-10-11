import { config } from 'dotenv';
import { definePrismaConfig } from '@prisma/cli-engine';
import pgvector from '@prisma/orm-extension-pgvector/control';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

config({ path: '.env' });
config({ path: '.env.local', override: true });

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    extensions: [pgvector],
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});