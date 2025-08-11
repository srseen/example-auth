import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "email" varchar(255) NOT NULL UNIQUE,
      "password" varchar(255),
      "firstName" varchar(100) NOT NULL,
      "lastName" varchar(100) NOT NULL,
      "profilePictureUrl" varchar(512),
      "googleId" varchar(255) UNIQUE,
      "facebookId" varchar(255) UNIQUE,
      "role" varchar(20) NOT NULL DEFAULT 'user',
      "currentHashedRefreshToken" text,
      "isEmailVerified" boolean NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "email_verification" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "token" varchar NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "used" boolean NOT NULL DEFAULT false,
      "userId" uuid,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "FK_email_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await queryRunner.query(`CREATE TABLE "task" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "title" varchar NOT NULL,
      "description" varchar,
      "dueDate" TIMESTAMP NOT NULL,
      "tags" text,
      "status" varchar NOT NULL DEFAULT 'TODO',
      "userId" uuid,
      CONSTRAINT "FK_task_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "task"');
    await queryRunner.query('DROP TABLE "email_verification"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
