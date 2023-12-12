import { Response } from "express";
import asyncHandler from "../handlers/asyncHandler";
import { AuthRequest, ExtendedTaskRequest } from "../types/requestType";
import { TaskService } from "../services/TaskService";
import { TaskRepository } from "../data-source";
import { CREATED, OK } from "../constants/statusCodes";

const taskService = new TaskService(TaskRepository)

// Create task route handler.
export const createTask = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response) => {
    const task = await taskService.createTask({
        content: req.body.content,
        user: req.user
    })
    res.status(CREATED).json({ task })
})

// Update task route handler.
export const updateTask = asyncHandler<ExtendedTaskRequest>(async (req: ExtendedTaskRequest, res: Response) => {
    const task = await taskService.updateTask({
        content: req.body.content,
        task: req.task
    })
    res.status(OK).json({ task })
})

// Delete task route handler
export const deleteTask = asyncHandler<ExtendedTaskRequest>(async (req: ExtendedTaskRequest, res: Response) => {
    await taskService.deleteTask(req.task)
    res.status(OK).send()
})

// Get task route handler.
export const getTask = asyncHandler<ExtendedTaskRequest>(async (req: ExtendedTaskRequest, res: Response) => {
    res.status(OK).json({ task: req.task })
})

// Get tasks route handler.
export const getTasks = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response) => {
    // Extract query parameters from the request, assigning default values if not provided.
    const { page = '1', limit = '5', direction = 'asc', q = '' } = req.query

    // Convert the query parameters to the appropriate format.
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 5;
    const directionValue = direction === 'desc' ? 'DESC' : 'ASC';
    const searchTerm = Array.isArray(q) ? q.join(' ') : q as string
    
    // Retrieve tasks based on these params. Receive tasks and current page.
    const { tasks, page: currentPage} = await taskService.getTasks({
        page: pageNumber,
        limit: limitNumber,
        direction: directionValue,
        q: searchTerm,
        user: req.user
    })
    res.status(OK).json({
        tasks,
        page: currentPage
    })
})