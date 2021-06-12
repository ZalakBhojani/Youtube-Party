import express from 'express';
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app : express.Application = express();
const port: string | number = process.env.PORT || 3000;
const httpServer = createServer();
const io = new Server(httpServer)

app.get('/', (req, res) => {
    res.send("Hello Typescript.")
});

app.listen(port, () => {
    console.log("Server is running...");
});