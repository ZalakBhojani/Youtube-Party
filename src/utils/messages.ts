export const generateMessage = (username: string, text: string) => {
    const message : object =  {
        username,
        text,
        created: new Date().getTime()
    }
    return message;
}