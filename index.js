const io = require("socket.io")(8900, {
    cors: {
        origin: "*",
    }
})

let users = [];

const addUser = (locUserId, socketId) => {
    !users.some((user) => user.locUserId == locUserId) &&
        users.push({ locUserId, socketId })
    console.log(users);
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (receiverId) => {
    return users.find(user => user.locUserId == receiverId)
}

io.on("connection", (socket) => {
    // connection
    console.log(users);
    console.log("a user connected");
    io.emit('welcome', 'welcome from socket server')

    // take uderId and Socketid
    socket.on("addUser", locUserId => {
        addUser(locUserId, socket.id)
        io.emit("getUsers", users)
        console.log(users, 'adduser');
    })


    // send and get messages
    socket.on("sendMessage", ({ senderId, receiverId, message, msgId, timestamp }) => {
        // console.log(users, 'sndmsg');
        // console.log(senderId, receiverId, message);
        const user = getUser(receiverId)
        // console.log(user);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                message,
                msgId,
                timestamp
            })
        }
    })

    // delete msgs
    socket.on("deleteMessage", ({ messageId, senderId, receiverId }) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("deletedMessage", {
                messageId
            })
        }
    })

    // handle disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id)
        console.log(users, "a user disconnects");
        io.emit("getUsers", users)
    })
});