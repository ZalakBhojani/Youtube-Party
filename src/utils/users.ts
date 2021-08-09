import { type } from "os";

// Type alias for user
export type UserType = {
    id: string,
    username: string,
    room: string,
    role: string
}

const users: UserType[] = [];

// add a user to the users list
// throw an error if the username is already taken
export const addUser = (userObj: UserType) => {
    // Clean the data, remove whitespaces
    userObj.username = userObj.username.trim();
    userObj.room = userObj.room.trim();

    // Check if user already exists
    const userFound: UserType | undefined = checkIfUserExists(userObj.username, userObj.room)

    users.push(userObj);

}

// remove a user from the room
export const removeUser = (id: string) => {

    const index: number = users.findIndex(user => user.id == id)

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

// given an id, return the user with that id
export const getUser = (id: string) => {
    return users.find((user) => user.id == id);
}

// get list of all users
export const getAllUsers = () => {
    return users;
}

export const checkIfUserExists = (username: string, roomid: string) => {
    return users.find(user => user.room === roomid
        && user.username === username)
}

export const checkIfRoomExists = (roomid: string) => {
    return users.find(user => user.room === roomid)
}
// given the roomid, get the id of the owner of the room
export const getRoomOwner = (roomid: string) => {

    for (var idx = 0; idx < users.length; idx++) {
        if (users[idx].room === roomid && users[idx].role == 'ADMIN') {
            return users[idx].id
        }
    }
}
