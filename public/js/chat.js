const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const roomName = document.querySelector("#roomName").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData',({room, users}) => {
    document.querySelector('#roomName').innerHTML = room
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})



socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

//YOUTUBE related stuff
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '500',
        width: '850',
        videoId: 'zWSvb5t_zH4',
        playerVars: { 'controls': 0 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

socket.on("videoPaused", () => {
    player.pauseVideo();
})

socket.on("videoPlaying", () => {
    player.playVideo();
})

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PAUSED) {
        socket.emit("videoPaused");
    }

    if (event.data === YT.PlayerState.PLAYING) {
        socket.emit("videoPlaying");
    }

    if(event.Data === YT.PlayerState.ENDED) {
        //Play next video in the playlist
    }
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    //deafult state of the video is paused
    event.target.stopVideo();
}

function stopVideo() {
    player.stopVideo();
}