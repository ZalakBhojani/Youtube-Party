"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const messages_1 = require("./utils/messages");
const users_1 = require("./utils/users");
const generateRoomID_1 = require("./utils/generateRoomID");
const app = express_1.default();
const port = process.env.PORT || 3000;
const httpServer = http_1.createServer(app);
const io = new socket_io_1.default.Server(httpServer);
const publicDirectoryPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicDirectoryPath));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express_1.default.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express_1.default.json());
app.post("/room.html", (req, res) => {
    console.log(req.body);
    res.end();
});
io.on("connection", (socket) => {
    console.log(`${socket.id} is connected`);
    socket.on("createRoom", (userObj) => {
        const roomID = generateRoomID_1.generateRoomID();
        users_1.addUser({
            id: socket.id,
            username: userObj.username,
            room: roomID,
            role: userObj.role
        });
        socket.join(roomID);
        socket.emit("getRoomID", (roomID));
    });
    socket.on("joinRoom", (userObj) => {
        users_1.addUser({
            id: socket.id,
            username: userObj.username,
            room: userObj.roomid,
            role: userObj.role
        });
        socket.join(userObj.roomid);
        const message = "has joined the Room 🎉";
        socket.to(userObj.roomid).emit('message', messages_1.generateMessage(userObj.username, message));
    });
    socket.on("videoPaused", (id) => {
        socket.to(id).emit("videoPaused");
        console.log("Video is paused");
    });
    socket.on("videoPlaying", (id) => {
        socket.to(id).emit("videoPlaying");
        console.log("Video is playing");
    });
    socket.on('sendMessage', (message, callback) => {
        const user = users_1.getUser(socket.id);
        io.to(user.room).emit('message', messages_1.generateMessage(user.username, message));
        callback();
    });
});
httpServer.listen(port, () => {
    console.log("Server is running...");
});
