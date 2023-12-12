import { Length, IsEmail, Matches } from "class-validator"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from "typeorm"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { passwordRegex } from "../constants/regex"
import {
  AUTH_PASSWORD_FORMAT,
  AUTH_USERNAME_LENGTH,
} from "../constants/errorMessages"
import { Task } from "./Task"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Length(2, 20, { message: AUTH_USERNAME_LENGTH })
  username: string

  @Column()
  @IsEmail()
  email: string

  @Column()
  @Matches(passwordRegex, { message: AUTH_PASSWORD_FORMAT })
  password: string

  @OneToMany(() => Task, (task) => task.user, { onDelete: "CASCADE" })
  tasks: Task[]

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      // Hash the password before inserting or updating the user.
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    }
  }

  // Generate a JWT access token.
  getJWTToken(): string {
    return jwt.sign({ userId: this.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })
  }

  // Compare the provided password with the user's hashed password.
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}
