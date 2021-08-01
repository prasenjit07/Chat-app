const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    // New message element
    // const $newMessage = $messages.lastElementChild

    // Height of the new message
    // const newMessageStyles = getComputedStyle($newMessage)
    // const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    // const visibleHeight = $messages.offsetHeight
    
    // Height of message container
    // const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    // const scrollOffset = $messages.scrollTop + visibleHeight
    // if(containerHeight - newMessageHeight <= scrollOffset){
    //     $messages.scrollTop = $messages.scrollHeight
    // }

    $messages.scrollTop = $messages.scrollHeight
}    

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

var canvas = document.getElementById('whiteboard');
canvas.width = "750"
canvas.height = window.innerHeight

var ctx = canvas.getContext("2d")

let x;
let y;
let mouseDown = false
ctx.strokeStyle = 'white';
window.onmousedown = (e) => {
    ctx.moveTo(x, y)
    socket.emit('moveCursor',{x,y})
    mouseDown = true
}

window.onmouseup = (e) => {
    mouseDown = false
}

socket.on('ondraw', ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
})

socket.on('cursor', ({ x, y }) => {
    ctx.moveTo(x, y)
})

window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;
    console.log({ x, y })
    if (mouseDown) {
        socket.emit('draw', { x, y });
        ctx.lineTo(x, y);
        ctx.stroke();
    }

}

$messageForm.addEventListener('submit',e=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    // disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable
        if(error) console.log(error)

        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('send-location',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})


// socket.on('countUpdated', (count) =>{
//     console.log('The count has been updated!',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

socket.emit('join', { username, room } ,(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})