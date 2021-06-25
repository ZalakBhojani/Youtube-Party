import express from 'express';
import path from 'path';
import { createServer } from "http";
import socketIO from "socket.io";
import { generateMessage } from './utils/messages';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new socketIO.Server(httpServer)
const publicDirectoryPath: string = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket: any) => {
    console.log(`${socket.id} is connected`);
});

httpServer.listen(port, () => {
    console.log("Server is running...");
});