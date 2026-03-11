import express from 'express';
// const express = require('express'); package.json dosyasına "type": "module" ekleyerek import/export kullanabiliriz.
//  o yüzden bu şekilde import değil yukardaki şekilde import ediyoruz.
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv"; 
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from "./lib/socket.js";

import path from "path";

import { connectDB } from "./lib/db.js";

dotenv.config();

const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json()); // gelen requestin body kısmını json formatında okumamızı sağlar.
app.use(cookieParser()); // gelen requestin cookie kısmını okumamızı sağlar.
app.use(cors({
    origin: "http://localhost:5173", // frontendin çalıştığı adres
    credentials: true, // cookie gönderimini sağlar
}))

app.use("/api/auth" , authRoutes);
app.use("/api/messages" , messageRoutes);

if (process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname , "../frontend/dist")));

    app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT , () => {
    console.log("Server is running on PORT: " + PORT);
    connectDB();
})