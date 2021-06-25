"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = void 0;
const users = [];
const addUser = (userObj) => {
    // Clean the data, remove whitespaces
    userObj.username = userObj.username.trim();
    userObj.room = userObj.room.trim();
    // Check if user already exists
    users.push(userObj);
};
exports.addUser = addUser;
