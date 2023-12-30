import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import express from "express";
import { app } from "./app.js";
dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`server running at port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log(`mongodb connection failed ${error}`)
})