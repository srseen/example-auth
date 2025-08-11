import AppDataSource from '../data-source';
import { User } from '../src/users/entities/user.entity';
import { Task, TaskStatus } from '../src/tasks/entities/task.entity';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const taskRepo = AppDataSource.getRepository(Task);

  const user = userRepo.create({
    email: 'demo@example.com',
    password: 'password',
    firstName: 'Demo',
    lastName: 'User',
    isEmailVerified: true,
  });
  await userRepo.save(user);

  const task = taskRepo.create({
    title: 'Seed Task',
    dueDate: new Date(),
    status: TaskStatus.TODO,
    user,
  });
  await taskRepo.save(task);

  await AppDataSource.destroy();
}

void seed();
