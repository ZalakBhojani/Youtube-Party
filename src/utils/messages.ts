export const generateMessage = (username: string, text: string) => {
    const message : object =  {
        username,
        text
    }
    return message;
}