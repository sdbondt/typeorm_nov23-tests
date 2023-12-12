import { Repository } from "typeorm"
import { User } from "../../entity/User"
import { AuthService } from "../../services/AuthService"
import {
  AUTH_CREDENTIALS_INVALID,
  AUTH_EMAIL_FORMAT,
  AUTH_PASSWORD_FORMAT,
  AUTH_USERNAME_LENGTH,
} from "../../constants/errorMessages"
import { createTestTask, createTestUser, signupData } from "../testData"
import { TestDataSource } from "../../data-source"
import { Task } from "../../entity/Task"

describe("Auth unit testing", () => {
  let userRepository: Repository<User>
  let taskRepository: Repository<Task>
  let authService: AuthService
  let userOne: User

  beforeAll(async () => {
    await TestDataSource.initialize()
    userRepository = TestDataSource.getRepository(User)
    taskRepository = TestDataSource.getRepository(Task)
    authService = new AuthService(userRepository)
  })

  afterEach(async () => {
    await taskRepository.delete({})
    await userRepository.delete({})
  })

  afterAll(async () => {
    await TestDataSource.destroy()
  })

  describe("signup unit tests", () => {
    it("should create a new user", async () => {
      const token = await authService.signup(signupData)
      const user = await userRepository.findOne({
        where: { email: signupData.email },
      })
      expect(token).toEqual(expect.any(String))
      expect(user).toBeDefined()
      expect(user.email).toBe(signupData.email)
    })

    it("should hash the registered password", async () => {
      const token = await authService.signup(signupData)
      const user = await userRepository.findOne({
        where: { email: signupData.email },
      })
      expect(user.password).not.toEqual(signupData.password)
    })

    it("should throw an error with invalid signup data", async () => {
      await expect(
        authService.signup({
          ...signupData,
          email: "test",
        })
      ).rejects.toThrow(AUTH_EMAIL_FORMAT)

      await expect(
        authService.signup({
          ...signupData,
          username: "t",
        })
      ).rejects.toThrow(AUTH_USERNAME_LENGTH)

      await expect(
        authService.signup({
          ...signupData,
          username: "t".repeat(21),
        })
      ).rejects.toThrow(AUTH_USERNAME_LENGTH)

      await expect(
        authService.signup({
          ...signupData,
          password: "1234567",
        })
      ).rejects.toThrow(AUTH_PASSWORD_FORMAT)

      await expect(
        authService.signup({
          ...signupData,
          password: "abcdefg",
        })
      ).rejects.toThrow(AUTH_PASSWORD_FORMAT)

      await expect(
        authService.signup({
          ...signupData,
          password: "ab12A",
        })
      ).rejects.toThrow(AUTH_PASSWORD_FORMAT)

      await expect(
        authService.signup({
          ...signupData,
          password: "ABCDEF12",
        })
      ).rejects.toThrow(AUTH_PASSWORD_FORMAT)

      await expect(
        authService.signup({
          ...signupData,
          password: "abcdef12",
        })
      ).rejects.toThrow(AUTH_PASSWORD_FORMAT)
    })
  })

  describe("login unit tests", () => {
    it("should be possible to login an existing user", async () => {
      userOne = await createTestUser(userRepository)
      const token = await authService.login({
        email: userOne.email,
        password: "userOne123",
      })
      expect(token).toEqual(expect.any(String))
    })

    it("should not be able to login with invalid data", async () => {
      userOne = await createTestUser(userRepository)
      await expect(
        authService.login({
          email: "jos@hotmail.com",
          password: "userOne123",
        })
      ).rejects.toThrow(AUTH_CREDENTIALS_INVALID)

      await expect(
        authService.login({
          email: userOne.email,
          password: "userOne12",
        })
      ).rejects.toThrow(AUTH_CREDENTIALS_INVALID)
    })
  })

  describe('user task relations', () => {
    it.only('should be possible to have tasks', async () => {
      userOne = await createTestUser(userRepository)
      await createTestTask(taskRepository, userOne)
      const user = await userRepository.findOne({
        where: {
          username: 'userOne'
        },
        relations: ['tasks']
      })
      console.log(user)
      expect(user.tasks[0] instanceof Task).toBe(true)
    })
  })
})
