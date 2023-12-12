import request from 'supertest'

import { Repository } from "typeorm"
import { User } from "../../entity/User"
import { createTestUser, signupData } from '../testData'
import { BAD_REQUEST, CREATED, OK } from '../../constants/statusCodes'
import { TestDataSource } from '../../data-source'
import { AUTH_ROUTE, LOGIN_ROUTE, SIGNUP_ROUTE } from '../../constants/routes'
import app from '../../app/app'

describe('auth feature testing', () => {
  let userRepository: Repository<User>;
  
  beforeAll(async () => {
        await TestDataSource.initialize()
        userRepository = TestDataSource.getRepository(User)
      })
    
  afterEach(async () => {
      await userRepository.delete({})
    })
    
      afterAll(async () => {
        await TestDataSource.destroy()
      })
    
  describe('signup feature testing', () => {
    it('should be able to signup a user', async () => {
      const res = await request(app).post(AUTH_ROUTE + SIGNUP_ROUTE)
        .send(signupData)
        .expect(CREATED)
      
        expect(res.body.token).toEqual(expect.any(String))
    })
    
    it('should throw an error with invalid signup data', async () => {
      await request(app).post(AUTH_ROUTE + SIGNUP_ROUTE)
        .send({
          ...signupData,
          email: 'test'
        })
        .expect(BAD_REQUEST)
      
        await request(app).post(AUTH_ROUTE + SIGNUP_ROUTE)
        .send({
          ...signupData,
          username: 't'
        })
        .expect(BAD_REQUEST)
      
        await request(app).post(AUTH_ROUTE + SIGNUP_ROUTE)
        .send({
          ...signupData,
          username: 't'.repeat(21)
        })
        .expect(BAD_REQUEST)
      
        await request(app).post(AUTH_ROUTE + SIGNUP_ROUTE)
        .send({
          ...signupData,
          password: 'test'
        })
        .expect(BAD_REQUEST)
    })
    })

  describe('login feature testing', () => {
    it('should be possible to login', async () => {
      const userOne = await createTestUser(userRepository)
      const res = await request(app).post(AUTH_ROUTE + LOGIN_ROUTE)
        .send({
          email: userOne.email,
          password: 'userOne123'
        })
        .expect(OK)
      
      expect(res.body.token).toEqual(expect.any(String))
    })

    it('should not login with invalid credentials', async () => {
      const userOne = await createTestUser(userRepository)
      await request(app).post(AUTH_ROUTE + LOGIN_ROUTE)
        .send({
          email: userOne.email,
          password: 'userOne1234'
        })
        .expect(BAD_REQUEST)
    })
  })
})