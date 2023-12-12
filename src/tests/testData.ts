import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Task } from "../entity/Task";

export const signupData = {
    email: "test@gmail.com",
    username: "testy",
    password: "123TESTtest",
  }

export async function createTestUser(userRepository: Repository<User>): Promise<User> {
    const user = userRepository.create({
        email: 'userOne@example.com',
        username: 'userOne',
        password: 'userOne123'
    });
    await userRepository.save(user);
    return user;
}

export async function createSecondUser(userRepository: Repository<User>): Promise<User> {
    const user = userRepository.create({
        email: 'userTwo@example.com',
        username: 'userTwo',
        password: 'userOne123'
    });
    await userRepository.save(user);
    return user;
}

export async function createTestTask(taskRepository: Repository<Task>, user: User): Promise<Task> {
    const task = taskRepository.create({
        user,
        content: 'test'
    })
    await taskRepository.save(task)
    return task
}