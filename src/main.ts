import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function ensureDatabaseExists() {
  const logger = new Logger('DatabaseInit');
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || '3d_electronics_db';

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    await connection.end();
    logger.log(`Verified MySQL database '${dbName}' on ${host}:${port}`);
  } catch (err: any) {
    logger.error(
      `Failed to connect to MySQL at ${host}:${port}: ${err.message}`,
    );
    throw err;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  await ensureDatabaseExists();

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  logger.log(
    `🚀 3D Interactive Electronics E-Commerce Server running on http://localhost:${port}`,
  );
}

bootstrap();
