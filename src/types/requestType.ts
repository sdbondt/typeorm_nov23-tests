import { Request } from "express";
import { User } from "../entity/User";
import { Task } from "../entity/Task";

export interface AuthRequest extends Request {
    user: User;
}

export interface ExtendedTaskRequest extends Request {
    user: User;
    task: Task;
}