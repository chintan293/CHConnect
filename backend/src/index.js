// const express = require("express");
import express from "express"; // used when type = "module" in json file
import "dotenv/config";

const app = express();
const PORT = process.env.PORT

app.listen(PORT, () => console.log("Server is up and running on PORT:", PORT));
