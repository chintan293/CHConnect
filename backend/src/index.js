// const express = require("express");
import express from "express"; // used when type = "module" in json file
import "dotenv/config";

import { clerkMiddleware } from '@clerk/express';

import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";

const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({origin: FRONTEND_URL, credentials: true}));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

await connectDB();

app.listen(PORT, () => {
    
    console.log("Server is up and running on PORT:", PORT);
});
