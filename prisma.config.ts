import { defineConfig } from '@prisma/config'

/**
 * Prisma 7.0 Configuration
 * This file replaces the 'url' property in schema.prisma.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Note: Environment variables must be loaded manually if not using a tool that does it automatically.
    url: process.env.DATABASE_URL,
  },
})
