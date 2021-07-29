const serveStatic = require("serve-static")

const users = []

// addUser, removeUser, getUsers, getUserInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Valiadte username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store User
    const user = { id, username, room }
    users.push(user)

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    getUsersInRoom,
    getUser,
    removeUser
}

// addUser({
//     id:22,
//     username: 'Aayush',
//     room: 'college'
// })

// addUser({
//     id:23,
//     username: 'Aayushi',
//     room: 'college1'
// })

// addUser({
//     id:24,
//     username: 'Aayushi',
//     room: 'college'
// })

// const user = getUser(241)
// console.log(user)

// const usersList = getUsersInRoom(' college')
// console.log(usersList)

