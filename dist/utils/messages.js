"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = void 0;
const generateMessage = (username, text) => {
    const message = {
        username,
        text,
        created: new Date().getTime()
    };
    return message;
};
exports.generateMessage = generateMessage;
