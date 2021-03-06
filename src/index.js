const path = require('path')

const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUsersInRoom, getUser, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 8000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }, callback) => {

        const {error, user} = addUser({id:socket.id, username, room})

        if(error) return callback(error)
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} joined!!`))

        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('draw',({x,y}) =>{
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('ondraw',{x,y})
    })

    socket.on('moveCursor',({x,y}) =>{
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('cursor',{x,y})
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        console.log(user)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('send-location', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
        
    })

    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
    //     count++;
    //     socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count) // to every client other than who send it
    // })

})

server.listen(port, () => {
    console.log(`App running on port ${port}!!`)
})