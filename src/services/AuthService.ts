import {
  AUTH_USERNAME_LENGTH,
  AUTH_EMAIL_FORMAT,
  AUTH_PASSWORD_FORMAT,
  AUTH_CREDENTIALS_INVALID,
} from "../constants/errorMessages"
import { LoginPayload, SignupPayload } from "../types/authTypes"
import { User } from "../entity/User"
import CustomError from "../handlers/customError"
import { Repository } from "typeorm"
import { BAD_REQUEST } from "../constants/statusCodes"
import { emailRegex, passwordRegex } from "../constants/regex"

export class AuthService {
  private userRepository: Repository<User>

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository
  }

  // Method for validating the email format.
  async isValidEmail(email: string): Promise<boolean> {
    return emailRegex.test(email)
  }

  // Method for validating the password format.
  async isValidPassword(password: string): Promise<boolean> {
    return passwordRegex.test(password)
  }

  // Signup function for user registration.
  async signup({ email, username, password }: SignupPayload): Promise<string> {
    // Validate username.
    if (!username || username.length < 2 || username.length > 20)
      throw new CustomError(AUTH_USERNAME_LENGTH, BAD_REQUEST)

    // Validate email.
    const isValidEmail = await this.isValidEmail(email)
    if (!isValidEmail) throw new CustomError(AUTH_EMAIL_FORMAT, BAD_REQUEST)

    // Validate password.
    const isValidPassword = await this.isValidPassword(password)
    if (!isValidPassword)
      throw new CustomError(AUTH_PASSWORD_FORMAT, BAD_REQUEST)

    // Check if email is already in use.
    const emailExists = await this.userRepository.findOne({ where: { email } })
    if (emailExists) throw new CustomError(AUTH_EMAIL_FORMAT, BAD_REQUEST)

    // Create a new user and save to the database.
    const user = this.userRepository.create({
      email,
      username,
      password,
    })
    await this.userRepository.save(user)

    // Return access token for the new user.
    return user.getJWTToken()
  }

  // Login function for user authentication.
  async login({ email, password }: LoginPayload): Promise<string> {
    // Validate email.
    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) throw new CustomError(AUTH_CREDENTIALS_INVALID, BAD_REQUEST)

    // Validate password.
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword)
      throw new CustomError(AUTH_CREDENTIALS_INVALID, BAD_REQUEST)

    // Return access token for the user.
    return user.getJWTToken()
  }
}
