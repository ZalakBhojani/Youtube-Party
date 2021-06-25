"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const app = express_1.default();
const port = process.env.PORT || 3000;
const httpServer = http_1.createServer(app);
const io = new socket_io_1.default.Server(httpServer);
const publicDirectoryPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicDirectoryPath));
io.on("connection", (socket) => {
    console.log(`${socket.id} is connected`);
    socket.on("message", (message) => {
        console.log(message);
    });
});
httpServer.listen(port, () => {
    console.log("Server is running...");
});
