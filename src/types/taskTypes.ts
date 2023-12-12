import { Task } from "../entity/Task";
import { User } from "../entity/User";

export interface TaskPayload {
    content: string;
    user: User;
}

export interface TaskUpdatePayload {
    content: string;
    task: Task;
}

export interface GetTasksQuery {
    q: string;
    page: number;
    limit: number;
    direction: 'DESC' | 'ASC';
    user: User
}

export interface GetTasksResult {
    page: number;
    tasks: Task[]
}