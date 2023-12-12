import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Length } from "class-validator"
import { User } from "./User"
import { TASK_CONTENT_LENGTH } from "../constants/errorMessages"

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Length(1, 100, { message: TASK_CONTENT_LENGTH})
    content: string

    @ManyToOne(
        () => User,
        user => user.tasks
    )
    user: User

    @CreateDateColumn({
        type: 'timestamp'
    })
    createdAt: Date

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updatedAt: Date
}
