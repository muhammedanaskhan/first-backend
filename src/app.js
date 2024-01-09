import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))
app.use(cookieParser())



// import routes
import userRouter from './routes/user.routes.js'


//routes declaration
 app.use("/api/v1/users", userRouter)

// after 'http://localhost:5000/api/v1/users/...' controle goes to userRouter
// from where it goes to multiple routes of /users/... like -
// .../users/signup, .../users/login etc

export {app} 