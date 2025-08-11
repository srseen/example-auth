import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Task } from './src/tasks/entities/task.entity';
import { EmailVerification } from './src/auth/entities/email-verification.entity';

config({ path: '../.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Task, EmailVerification],
  migrations: ['migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
