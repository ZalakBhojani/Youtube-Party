var socket = io();

var btn = document.getElementById('btn');
var clipboard = new ClipboardJS(btn);
      
const params = new URLSearchParams(window.location.search);
var username = params.get('username');
var roomid;
var role;

if (params.has('roomid')) {
    role = 'GUEST';
    roomid = params.get('roomid');
    socket.emit("joinRoom", { username, roomid, role });
    document.getElementById("roomid").value = roomid;
} else {
    role = 'ADMIN';
    socket.emit("createRoom", { username, role });
    socket.on("getRoomID", (id) => {
        roomid = id;
        document.getElementById("roomid").value = id;
    })
}

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector("#submit-button");
const $messageFormInput = document.querySelector("#inputMessage");
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e);
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.inputMessage.value;
    
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            console.log(error);
        }
    })
})


socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text
    })
    console.log(message.text)
    $messages.insertAdjacentHTML('beforeend', html)
})




//YOUTUBE
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '450',
        width: '800',
        videoId: 'M7lc1UVf-VE',
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.PAUSED) {
        socket.emit("videoPaused", (roomid));
    }

    if (event.data === YT.PlayerState.PLAYING) {
        socket.emit("videoPlaying", (roomid));
    }

}

function stopVideo() {
    player.stopVideo();
}


socket.on("videoPaused", () => {
    player.pauseVideo();
})

socket.on("videoPlaying", () => {
    player.playVideo();
})