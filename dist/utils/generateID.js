"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateID = void 0;
const generateID = () => {
    var result = '';
    const idLength = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < idLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.generateID = generateID;
