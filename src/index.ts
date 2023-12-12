import dotenv from 'dotenv'
import app from "./app/app"
import { AppDataSource } from "./data-source"

dotenv.config()

AppDataSource.initialize().then(async () => {
    console.log("Data source initialized...")
}).catch(error => console.log(error))

const PORT  = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
