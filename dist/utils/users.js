"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomOwner = exports.checkIfUserExists = exports.getAllUsers = exports.getUser = exports.removeUser = exports.addUser = void 0;
const users = [];
// add a user to the users list
// throw an error if the username is already taken
const addUser = (userObj) => {
    // Clean the data, remove whitespaces
    userObj.username = userObj.username.trim();
    userObj.room = userObj.room.trim();
    // Check if user already exists
    const userFound = exports.checkIfUserExists(userObj.username, userObj.room);
    if (userFound) {
        return {
            error: "Username already taken. Please enter a different username."
        };
    }
    users.push(userObj);
};
exports.addUser = addUser;
// remove a user from the room
const removeUser = (id) => {
    const index = users.findIndex(user => user.id == id);
    if (index != -1) {
        return users.splice(index, 1)[0];
    }
};
exports.removeUser = removeUser;
// given an id, return the user with that id
const getUser = (id) => {
    return users.find((user) => user.id == id);
};
exports.getUser = getUser;
// get list of all users
const getAllUsers = () => {
    return users;
};
exports.getAllUsers = getAllUsers;
const checkIfUserExists = (username, roomid) => {
    return users.find(user => user.room === roomid
        && user.username === username);
};
exports.checkIfUserExists = checkIfUserExists;
// given the roomid, get the id of the owner of the room
const getRoomOwner = (roomid) => {
    for (var idx = 0; idx < users.length; idx++) {
        if (users[idx].room === roomid && users[idx].role == 'ADMIN') {
            return users[idx].id;
        }
    }
};
exports.getRoomOwner = getRoomOwner;
