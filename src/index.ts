import express from 'express';
import path from 'path';
import { createServer } from "http";
import socketIO from "socket.io";
import { generateMessage } from './utils/messages';
import { addUser, getUser, UserType } from './utils/users';
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
    
    console.log(`${socket.id} is connected`);

    socket.on("createRoom", (userObj: any) => {
        const roomID: string = generateRoomID();
        addUser({
            id: socket.id,
            username: userObj.username,
            room: roomID,
            role: userObj.role
        })

        socket.join(roomID)
        socket.emit("getRoomID", (roomID))
    })

    socket.on("joinRoom", (userObj: any) => {
        addUser({
            id: socket.id,
            username: userObj.username,
            room: userObj.roomid,
            role: userObj.role
        })

        socket.join(userObj.roomid)
        const message: string = "has joined the Room 🎉"
        socket.to(userObj.roomid).emit('message', generateMessage(userObj.username, message))
    })

    socket.on("videoPaused", (id: string) => {
        socket.to(id).emit("videoPaused");
        console.log("Video is paused");
    })

    socket.on("videoPlaying", (id: string) => {
        socket.to(id).emit("videoPlaying");
        console.log("Video is playing");
    })

    socket.on('sendMessage',(message:any, callback:any) => {
        const user: UserType = getUser(socket.id)!;
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })


});

httpServer.listen(port, () => {
    console.log("Server is running...");
});