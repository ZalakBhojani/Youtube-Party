"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const messages_1 = require("./utils/messages");
const users_1 = require("./utils/users");
const generateRoomID_1 = require("./utils/generateRoomID");
const app = express_1.default();
const port = process.env.PORT || 3000;
const httpServer = http_1.createServer(app);
const io = new socket_io_1.default.Server(httpServer);
// const publicDirectoryPath: string = path.join(__dirname, '../public')
app.use(express_1.default.static('public'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express_1.default.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express_1.default.json());
// app.get("/", (req, res) => {
//     console.log("came");
// })
app.post("/room", (req, res) => {
    const data = req.body;
    console.log(data);
    const username = data.username;
    const roomid = data.roomid;
    console.log(username, roomid);
    // console.log(checkIfUserExists(username, roomid));
    if (users_1.checkIfUserExists(username, roomid) == undefined) {
        console.log("user does not exist");
        const url = `/room.html?username=${username}&name=${roomid}`;
        res.redirect(url);
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "This is error" }));
    }
});
// req.flash('success_msg', 'You are registered and can now login')
// res.redirect('/users/login')
io.on("connection", (socket) => {
    var currUser;
    const updateUsersList = (roomID) => {
        const usersList = users_1.getAllUsers();
        socket.emit('roomUsersList', { usersList });
        socket.to(roomID).emit('roomUsersList', { usersList });
    };
    socket.on("createRoom", (userObj) => {
        const roomID = generateRoomID_1.generateRoomID();
        const user = {
            id: socket.id,
            username: userObj.username,
            room: roomID,
            role: userObj.role
        };
        users_1.addUser(user);
        currUser = user;
        socket.join(roomID);
        socket.emit("getRoomID", (roomID));
        updateUsersList(roomID);
    });
    socket.on("joinRoom", (userObj, callback) => {
        const user = {
            id: socket.id,
            username: userObj.username,
            room: userObj.roomid,
            role: userObj.role
        };
        const error = users_1.addUser(user);
        console.log(error);
        if (error) {
            return callback(error);
        }
        else {
            callback();
        }
        currUser = user;
        socket.join(user.room);
        const message = "has joined the Room 🎉";
        socket.to(user.room).emit('message', messages_1.generateMessage(user.username, message));
        updateUsersList(user.room);
        const socket_id = users_1.getRoomOwner(currUser.room);
        socket.to(socket_id).emit("getUpdatedPlaylist");
    });
    socket.on("videoPaused", () => {
        socket.to(currUser.room).emit("videoPaused");
    });
    socket.on("videoPlaying", (currentTime) => {
        socket.to(currUser.room).emit("videoPlaying", currentTime);
    });
    socket.on('sendMessage', (message, callback) => {
        const user = users_1.getUser(socket.id);
        io.to(user.room).emit('message', messages_1.generateMessage(user.username, message));
        callback();
    });
    socket.on("playlistUpdated", (updatedPlaylist) => {
        socket.to(currUser.room).emit("playlistUpdated", updatedPlaylist);
    });
    socket.on("playNextVideo", () => {
        socket.to(currUser.room).emit("playNextVideo");
    });
    socket.on("getLatestTime", () => {
        const socket_id = users_1.getRoomOwner(currUser.room);
        socket.to(socket_id).emit("getLatestTime");
    });
});
httpServer.listen(port, () => {
    console.log("Server is running...");
});
