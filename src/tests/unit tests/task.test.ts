import { Repository } from "typeorm"
import { TestDataSource } from "../../data-source"
import { Task } from "../../entity/Task"
import { TaskService } from "../../services/TaskService"
import { User } from "../../entity/User"
import { createTestTask, createTestUser } from "../testData"
import { TASK_CONTENT_LENGTH, TASK_MISSING_TASK, TASK_MISSING_USER } from "../../constants/errorMessages"

const defaultContent = 'Some content'

describe('Task unit testing', () => {
    let taskRepository: Repository<Task>
    let userRepository: Repository<User>
    let taskService: TaskService
    let taskUser: User

    beforeAll(async () => {
        await TestDataSource.initialize()
        taskRepository = TestDataSource.getRepository(Task)
        userRepository = TestDataSource.getRepository(User)
        taskService = new TaskService(taskRepository)
        taskUser = await userRepository.findOne({ where: { username: 'userOne' } });
        if (!taskUser) {
            taskUser = await createTestUser(userRepository);
        }
    })

    afterEach(async () => {
        await taskRepository.delete({})
    })

    afterAll(async () => {
        await TestDataSource.destroy()
    })

    describe('create tasks testing', () => {
        it('should be possible to create a task', async () => {
            const task = await taskService.createTask({
                user: taskUser,
                content: defaultContent
            })
            expect(task).toBeDefined()
            expect(task.content).toEqual(defaultContent)
        })

        it('should belong to a user', async () => {
            await createTestTask(taskRepository, taskUser)
            const task = await taskRepository.findOne({
                where: {
                    content: 'test'
                },
                relations: {
                    user: true
                }
            })
            expect(task.user instanceof User).toBe(true)
        })

        it('should not be possible to create a task with invalid content', async () => {
            await expect(
                taskService.createTask({
                    content: '',
                    user: taskUser
                })
            ).rejects
                .toThrow(TASK_CONTENT_LENGTH)
            
                await expect(
                    taskService.createTask({
                        content: 't'.repeat(200),
                        user: taskUser
                    })
                ).rejects
                    .toThrow(TASK_CONTENT_LENGTH)
        })

        it('should not be possible to create a task without a user', async () => {
            await expect(
                taskService.createTask({
                    content: defaultContent,
                    user: null
                })
            ).rejects
                .toThrow(TASK_MISSING_USER)
        })
    })

    describe('fetch task testing', () => {
        it('should be possible to fech tasks', async () => {
            await createTestTask(taskRepository, taskUser)
            const res = await taskService.getTasks({
                q: '',
                page: 1,
                limit: 5,
                direction: 'ASC',
                user: taskUser
            })
            expect(res.tasks.length).toEqual(1)
        })

        it('should be possible to search for specific tasks', async () => {
            await createTestTask(taskRepository, taskUser)
            const res = await taskService.getTasks({
                q: 'test',
                page: 1,
                limit: 5,
                direction: 'ASC',
                user: taskUser
            })
            expect(res.tasks.length).toEqual(1)
        })
    })

    describe('update task testing', () => {
        it('should be possible to update a task', async () => {
            const testTask = await createTestTask(taskRepository, taskUser)
            const task = await taskService.updateTask({
                content: 'update',
                task: testTask
            })
            expect(task.content).toEqual('update')
        })

        it('should not be possible to update with invalid content', async () => {
            const testTask = await createTestTask(taskRepository, taskUser)
            await expect(
                taskService.updateTask({
                    content: '',
                    task: testTask
                })
            ).rejects
                .toThrow(TASK_CONTENT_LENGTH)
            
                await expect(
                    taskService.updateTask({
                        content: 't'.repeat(200),
                        task: testTask
                    })
                ).rejects
                    .toThrow(TASK_CONTENT_LENGTH)
        })

        it('should throw an error when no task is defined', async () => {
            await expect(
                taskService.updateTask({
                    content: defaultContent,
                    task: null
                })
            ).rejects
                .toThrow(TASK_MISSING_TASK)
        })

    })

    describe('delete task testing', () => {
        it('should be possible to delete a task', async () => {
            const testTask = await createTestTask(taskRepository, taskUser)
            await taskService.deleteTask(testTask)
            const deletedTask = await taskRepository.findOne({
                where: {
                    id: testTask.id
                }
            })
            expect(deletedTask).toBeNull()
        })

        it('should throw an error when no task is defined', async () => {
            await expect(
                taskService.deleteTask(null)
            )
            .rejects
            .toThrow(TASK_MISSING_TASK)
        })
    })
})