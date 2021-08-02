import express from 'express';
import path from 'path';
import { createServer } from "http";
import socketIO from "socket.io";
import { generateMessage } from './utils/messages';
import { addUser, getUser, UserType, getAllUsers } from './utils/users';
import { generateRoomID } from './utils/generateRoomID';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new socketIO.Server(httpServer)
const publicDirectoryPath: string = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.post("/room.html", (req, res) => {
    console.log(req.body);
    res.end();
})

io.on("connection", (socket: any) => {

    var currUser: UserType;

    const updateUsersList = (roomID: string) => {
        const usersList: UserType[] = getAllUsers()
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

    socket.on("joinRoom", (userObj: any) => {

        const user: UserType = {
            id: socket.id,
            username: userObj.username,
            room: userObj.roomid,
            role: userObj.role
        }

        addUser(user)

        currUser = user

        socket.join(userObj.roomid)
        const message: string = "has joined the Room 🎉"
        socket.to(userObj.roomid).emit('message', generateMessage(userObj.username, message))

        updateUsersList(userObj.roomid)

        socket.to(userObj.roomid).emit("newUserJoined")

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

    socket.on("newVideoAdded", (newVideo: string) => {
        socket.to(currUser.room).emit("newVideoAdded", newVideo)
    })


});

httpServer.listen(port, () => {
    console.log("Server is running...");
});