import express from 'express'
import { createTask, deleteTask, getTask, getTasks, updateTask } from '../controllers/taskController'
import authorizeTask from '../middleware/authorizeTask'
const router = express.Router()

// Route for task creation.
router.post('/', createTask)

// Route for task update.
router.patch('/:taskId', authorizeTask, updateTask)

// Route for task deletion.
router.delete('/:taskId', authorizeTask, deleteTask)

// Route for fetching a single task.
router.get('/:taskId', authorizeTask, getTask)

// Route for fetching several tasks.
router.get('/', getTasks)

export default router