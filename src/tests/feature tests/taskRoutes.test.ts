import request from 'supertest'
import { Repository } from "typeorm"
import { TestDataSource } from "../../data-source"
import { Task } from "../../entity/Task"
import app from '../../app/app'
import { TASK_ROUTE } from '../../constants/routes'
import { User } from '../../entity/User'
import { createSecondUser, createTestTask, createTestUser } from '../testData'
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from '../../constants/statusCodes'

const content = 'some content'

describe('task feature testing', () => {
    let taskRepository: Repository<Task>
    let userRepository: Repository<User>
    let userOne: User
    let userTwo: User
    let userOneToken: string
    let userTwoToken: string

    beforeAll(async () => {
        await TestDataSource.initialize()
        taskRepository = TestDataSource.getRepository(Task)
        userRepository = TestDataSource.getRepository(User)
        userOne = await userRepository.findOne({ where: { username: 'userOne' } })
        if (!userOne) {
            userOne = await createTestUser(userRepository);
        }
        userTwo = await userRepository.findOne({ where: { username: 'userTwo' } })
        if (!userTwo) {
            userTwo = await createSecondUser(userRepository)
        }
        userOneToken = userOne.getJWTToken()
        userTwoToken = userTwo.getJWTToken()
    })

    afterEach(async () => {
        await taskRepository.delete({})
    })

    afterAll(async () => {
        await TestDataSource.destroy()
    })

    describe('POST /tasks tests', () => {
        it('should be possible to create tasks', async () => {
            const res = await request(app)
                .post(TASK_ROUTE)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content
                })
                .expect(CREATED)
            
            expect(res.body.task).not.toBeNull()
            const task = await taskRepository.findOne({
                where: {
                    content
                }
            })
            expect(task).not.toBeNull()
        })

        it('should not be possible to create tasks with invalid content', async () => {
            await request(app)
                .post(TASK_ROUTE)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content: ''
                })
                .expect(BAD_REQUEST)
            
            await request(app)
                .post(TASK_ROUTE)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content: 't'.repeat(200)
                })
                .expect(BAD_REQUEST)
        })

        it('should not be possible to create tasks without an authenticated user.', async () => {
            await request(app)
                .post(TASK_ROUTE)
                .send({
                    content
                })
                .expect(UNAUTHORIZED)
        })
    })

    describe('UPDATE /tasks/:taskId tests', () => {
        it('should be possible to update a tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            const res = await request(app)
                .patch(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content: 'update'
                })
                .expect(OK)
            
            expect(res.body.task.content).toEqual('update')
            const updateTask = await taskRepository.findOne({
                where: {
                    content: 'update'
                }
            })
            expect(updateTask).not.toBeNull()
        })

        it('should not be possible to update a task with invalid content', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .patch(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content: ''
                })
                .expect(BAD_REQUEST)
            
            await request(app)
                .patch(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content: 't'.repeat(200)
                })
                .expect(BAD_REQUEST)
        })

        it('should not be possible to update a task without a user', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .patch(TASK_ROUTE + `/${task.id}`)
                .send({
                    content: 'update'
                })
                .expect(UNAUTHORIZED)
        })

        it('should not be possible to update another users tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .patch(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    content: 'update'
                })
                .expect(UNAUTHORIZED)
        })

        it('should throw an error if an invalid task id is provided', async () => {
            await request(app)
                .patch(TASK_ROUTE + '/abdedf')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    content
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('DELETE /tasks/:taskId tests', () => {
        it('should be possible to delete tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .delete(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
        })

        it('should not be possible to delete other users tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .delete(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should throw an error if an incorrect task id is provided', async () => {
            await request(app)
                .delete(TASK_ROUTE + '/abcdef')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('GET /tasks/:taskId tests', () => {
        it('should be possible to fetch a task based on its id', async () => {
            const task = await createTestTask(taskRepository, userOne)
            const res = await request(app)
                .get(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(res.body.task.content).toBe(task.content)
        })

        it('should not be possible to fetch another users tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            await request(app)
                .get(TASK_ROUTE + `/${task.id}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should throw an error when an invalid task id is provided', async () => {
            await request(app)
                .get(TASK_ROUTE + '/abcdef')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('GET /tasks tests', () => {
        it('should be possible to fetch tasks', async () => {
            await createTestTask(taskRepository, userOne)
            const res = await request(app)
                .get(TASK_ROUTE)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.tasks.length).toBe(1)
        })

        it('should return no tasks when no tasks exists', async () => {
            const res = await request(app)
                .get(TASK_ROUTE)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.tasks.length).toBe(0)
        })

        it('should be possible to search for tasks', async () => {
            const task = await createTestTask(taskRepository, userOne)
            const res = await request(app)
                .get(TASK_ROUTE + `?q=${task.content}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(res.body.tasks.length).toBe(1)
        })
    })
})