import express from 'express';
import path from 'path';
import { createServer } from "http";
import socketIO from "socket.io";
import { generateMessage } from './utils/messages';
import { addUser, getUser, UserType, getAllUsers, getRoomOwner } from './utils/users';
import { generateRoomID } from './utils/generateRoomID';
import { callbackify } from 'util';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new socketIO.Server(httpServer)
// const publicDirectoryPath: string = path.join(__dirname, '../public')

app.use(express.static('public'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// app.get("/", (req, res) => {
//     console.log("came");
// })

// app.get("/room/:username", (req, res) => {
//     console.log("came");
//     console.log(req.params.username);
// })

// req.flash('success_msg', 'You are registered and can now login')
// res.redirect('/users/login')


io.on("connection", (socket: any) => {

    var currUser: UserType;

    const updateUsersList = (roomID: string) => {
        const usersList: UserType[] = getAllUsers()
        socket.emit('roomUsersList', { usersList })
        socket.to(roomID).emit('roomUsersList', { usersList });
    }

    socket.on("createRoom", (userObj: any) => {
        const roomID: string = generateRoomID();
        const user: UserType = {
            id: socket.id,
            username: userObj.username,
            room: roomID,
            role: userObj.role
        }

        addUser(user)

        currUser = user
        socket.join(roomID)
        socket.emit("getRoomID", (roomID))

        updateUsersList(roomID)

    })

    socket.on("joinRoom", (userObj: any, callback: any) => {

        const user: UserType = {
            id: socket.id,
            username: userObj.username,
            room: userObj.roomid,
            role: userObj.role
        }

        const error: { error: string; } | undefined = addUser(user)
        console.log(error);


        if (error) {
            return callback(error)
        } else {
            callback()
        }

        currUser = user

        socket.join(user.room)
        const message: string = "has joined the Room 🎉"
        socket.to(user.room).emit('message', generateMessage(user.username, message))

        updateUsersList(user.room)

        const socket_id: string = getRoomOwner(currUser.room)!
        socket.to(socket_id).emit("getUpdatedPlaylist")

    })

    socket.on("videoPaused", () => {
        socket.to(currUser.room).emit("videoPaused");
    })

    socket.on("videoPlaying", (currentTime: any) => {
        socket.to(currUser.room).emit("videoPlaying", currentTime);
    })

    socket.on('sendMessage', (message: any, callback: any) => {
        const user: UserType = getUser(socket.id)!;
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on("playlistUpdated", (updatedPlaylist: string) => {
        socket.to(currUser.room).emit("playlistUpdated", updatedPlaylist)
    })

    socket.on("playNextVideo", () => {
        socket.to(currUser.room).emit("playNextVideo")
    })

    socket.on("getLatestTime", () => {
        const socket_id: string = getRoomOwner(currUser.room)!
        socket.to(socket_id).emit("getLatestTime")
    })


});

httpServer.listen(port, () => {
    console.log("Server is running...");
});