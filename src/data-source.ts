import dotenv from 'dotenv'
import "reflect-metadata"
import { DataSource  } from "typeorm"
import { User } from "./entity/User"
import handleGetRepository from './utils/getRepository'
import { Task } from './entity/Task'

dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: 5432,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    synchronize: true,
    logging: false,
    entities: [User, Task],
    migrations: [],
    subscribers: [],
})

export const TestDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: 5432,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_TEST_DATABASE,
    entities: [User, Task],
    synchronize: true,
    logging: false,
})

export const UserRepository = handleGetRepository(User)
export const TaskRepository = handleGetRepository(Task)
