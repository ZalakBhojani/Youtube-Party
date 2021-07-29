"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getUser = exports.removeUser = exports.addUser = void 0;
const users = [];
const addUser = (userObj) => {
    // Clean the data, remove whitespaces
    userObj.username = userObj.username.trim();
    userObj.room = userObj.room.trim();
    // Check if user already exists
    const userFound = users.find(user => user.room === userObj.room && user.username === userObj.username);
    if (userFound) {
        return {
            error: "Username already taken. Please enter a different username"
        };
    }
    users.push(userObj);
    return { userObj };
};
exports.addUser = addUser;
const removeUser = (id) => {
    const index = users.findIndex(user => user.id == id);
    if (index != -1) {
        return users.splice(index, 1)[0];
    }
};
exports.removeUser = removeUser;
const getUser = (id) => {
    return users.find((user) => user.id == id);
};
exports.getUser = getUser;
const getAllUsers = () => {
    return users;
};
exports.getAllUsers = getAllUsers;
// export const updateRole = (id: string, newRole: number) => {
//     const index: number = users.findIndex(user => user.id == id)
//     if (newRole ==== 1 && users[index].role == 'GUEST') {
//         users[index].role = 'ADMIN'
//     }
// }
