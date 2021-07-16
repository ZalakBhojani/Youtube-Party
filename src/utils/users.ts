import { type } from "os";

// Type alias for user
export type UserType = {
    id: string,
    username: string,
    room: string,
    role: string
}
const users: UserType[] = [];

export const addUser = (userObj: UserType) => {
    // Clean the data, remove whitespaces
    userObj.username = userObj.username.trim();
    userObj.room = userObj.room.trim();

    // Check if user already exists
    const userFound: UserType | undefined = users.find(
        user => user.room === userObj.room && user.username === userObj.username)
    
    if (userFound) {
        return {
            error: "Username already taken. Please enter a different username"
        }
    }

    users.push(userObj);
    console.log(users);
    return {userObj}

}

export const removeUser = (id: string) => {

    const index: number = users.findIndex(user => user.id == id)

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

export const getUser = (id: string) => {
    return users.find((user) => user.id == id);
}

// export const updateRole = (id: string, newRole: number) => {

//     const index: number = users.findIndex(user => user.id == id)

//     if (newRole ==== 1 && users[index].role == 'GUEST') {
//         users[index].role = 'ADMIN'
//     }
// }