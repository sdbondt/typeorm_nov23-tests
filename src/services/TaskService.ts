import { Repository } from "typeorm"
import { Task } from "../entity/Task"
import {
  GetTasksQuery,
  GetTasksResult,
  TaskPayload,
  TaskUpdatePayload,
} from "../types/taskTypes"
import CustomError from "../handlers/customError"
import {
  TASK_CONTENT_LENGTH,
  TASK_MISSING_TASK,
  TASK_MISSING_USER,
} from "../constants/errorMessages"
import { BAD_REQUEST } from "../constants/statusCodes"

export class TaskService {
  private taskRepository: Repository<Task>

  constructor(taskRepository: Repository<Task>) {
    this.taskRepository = taskRepository
  }

  // Replaced by authorizeTasks middleware.
  // Validates if a user is allowed to perfom an action on a task.
  // authorizeUser(user: User, task: Task): void {
  //   if (user.id !== task.user.id)
  //     throw new CustomError(TASK_ACTION_UNAUTHORIZED, UNAUTHORIZED)
  // }

  // Validates the task content.
  validateContent(content: string): void {
    if (!content || content.length < 1 || content.length > 100)
      throw new CustomError(TASK_CONTENT_LENGTH, BAD_REQUEST)
  }

  // Validates the page and limit: must be positive integer, returns the default if another value is provided.
  validateNumber(inputNumber: number, defaultValue: number): number {
    return !Number.isInteger(inputNumber) || inputNumber < 1
      ? defaultValue
      : inputNumber
  }

  // Replaced by authorizeTasks middleware
  // Validate the task id.
  // validateId(taskId: number) {
  //   if (!taskId || isNaN(taskId))
  //     throw new CustomError(TASK_NOT_FOUND, BAD_REQUEST)
  // }

  // Creates and returns a new task with content and user.
  async createTask({ content, user }: TaskPayload): Promise<Task> {
    this.validateContent(content)
    if (!user) throw new CustomError(TASK_MISSING_USER, BAD_REQUEST)
    const task = this.taskRepository.create({
      user,
      content,
    })
    return this.taskRepository.save(task)
  }

  // Replace by authorizeTask middleware: creates req.task.
  // Retrieve a task by id.
  // Only return the task if user is the task creator.
  // async getTask({ taskId, user }: GetTaskQuery): Promise<Task> {
  //   this.validateId(taskId)
  //   const task = await this.taskRepository.findOne({
  //     where: {
  //       id: taskId,
  //     },
  //   })
  //   if (!task) throw new CustomError(TASK_NOT_FOUND, BAD_REQUEST)
  //   this.authorizeUser(user, task)
  //   return task
  // }

  // Update a task if the user is the task creator.
  async updateTask({ content, task }: TaskUpdatePayload): Promise<Task> {
    this.validateContent(content)
    if (!task) throw new CustomError(TASK_MISSING_TASK, BAD_REQUEST)
    task.content = content
    return this.taskRepository.save(task)
  }

  // Find and delete task if the user is the task creator.
  async deleteTask(task: Task): Promise<void> {
    if (!task) throw new CustomError(TASK_MISSING_TASK, BAD_REQUEST)
    await this.taskRepository.remove(task)
  }

  // Get all users's.
  // Optional req.query = tasks?q=''&direction=asc/desc&limit=5&page=1
  async getTasks({
    q,
    page,
    limit,
    direction,
    user,
  }: GetTasksQuery): Promise<GetTasksResult> {
    // Ensure page values are correct, if not use defaults.
    let validatedPage = this.validateNumber(page, 1)
    const validatedLimit = this.validateNumber(limit, 5)

    // Create the inital search query: return user's tasks.
    const query = this.taskRepository
      .createQueryBuilder("task")
      .where("task.user = :user", { user: user.id })

    // Extend the initial search query if a searchTerm is provided.
    if (q) {
      query.andWhere("task.content LIKE :q", { q: `%${q}%` })
    }

    // Ensure page is not greater than max page.
    const totalCount = await query.getCount()
    const maxPage = totalCount > 0 ? Math.ceil(totalCount / validatedLimit) : 1
    if (validatedPage > maxPage) validatedPage = maxPage

    const skip = (validatedPage - 1) * validatedLimit
    const tasks = await query
      .orderBy("task.createdAt", direction)
      .skip(skip)
      .take(validatedLimit)
      .getMany()

    return {
      tasks,
      page: validatedPage,
    }
  }
}
