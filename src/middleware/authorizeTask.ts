import { NextFunction, Response } from "express"
import asyncHandler from "../handlers/asyncHandler"
import { ExtendedTaskRequest } from "../types/requestType"
import { TaskRepository } from "../data-source"
import CustomError from "../handlers/customError"
import {
  TASK_ACTION_UNAUTHORIZED,
  TASK_NOT_FOUND,
} from "../constants/errorMessages"
import { BAD_REQUEST, UNAUTHORIZED } from "../constants/statusCodes"

const authorizeTask = asyncHandler<ExtendedTaskRequest>(
  async (req: ExtendedTaskRequest, res: Response, next: NextFunction) => {
    // Validate the taskId from the request parameters. Ensures it's a valid integer.
    let { taskId } = req.params
    const id = parseInt(taskId)
    if (!taskId || isNaN(id)) throw new CustomError(TASK_NOT_FOUND, BAD_REQUEST)

    // Retrieve the task from the database and throw an error if no task is found.
    const task = await TaskRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true
      }
    })
    if (!task) throw new CustomError(TASK_NOT_FOUND, BAD_REQUEST)

    // Check if the task creator is the logged in user.
    // Only the task creator can manage it's tasks.
    if (task.user.id !== req.user.id)
      throw new CustomError(TASK_ACTION_UNAUTHORIZED, UNAUTHORIZED)

    // Append the task to the request object for use later on.
    req.task = task
    next()
  }
)

export default authorizeTask
