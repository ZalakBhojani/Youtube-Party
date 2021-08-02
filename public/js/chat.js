var socket = io();

// Copy room code
var btn = document.getElementById('btn');
var clipboard = new ClipboardJS(btn);


// Fetch user details
const params = new URLSearchParams(window.location.search);
var username = params.get('username');
var roomid;
var role;
var control;

if (params.has('roomid')) {
    role = 'GUEST';
    roomid = params.get('roomid');
    socket.emit("joinRoom", { username, roomid, role });
    document.getElementById("roomid").value = roomid;
    control = 0;
} else {
    role = 'ADMIN';
    socket.emit("createRoom", { username, role });
    socket.on("getRoomID", (id) => {
        roomid = id;
        document.getElementById("roomid").value = id;
    })
    control = 1;
}

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector("#submit-button");
const $messageFormInput = document.querySelector("#inputMessage");
const $urlForm = document.querySelector("#url-form");
const $messages = document.querySelector('#messages');
const $users = document.querySelector('#users');

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const userTemplate = document.querySelector("#user-template").innerHTML;

// gets the videoID from URL (string) 
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

// Socket communication
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

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

var currVideo = 'M7lc1UVf-VE';
var queue = [];
var url;

$urlForm.addEventListener('submit', (event) => {
    event.preventDefault()

    url = $urlForm.elements['url'].value
    currVideo = youtube_parser(url)
    $urlForm.elements['url'].value = ''

    player.loadVideoById(currVideo)
    socket.emit("newVideoAdded", currVideo)

})

socket.on("newVideoAdded", (newVideo) => {
    player.loadVideoById(newVideo)
})


socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomUsersList', (usersList) => {
    const list = usersList.usersList;
    for (var index = 0; index < list.length; index++) {
        var username = list[index].username
        if (list[index].role === 'ADMIN') {
            username += " (Owner)"
        }
        const html = Mustache.render(userTemplate, {
            username: username,
        })
        $users.insertAdjacentHTML('beforeend', html)
    }
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
        videoId: currVideo,
        playerVars: {
            'playsinline': 1,
            'controls': control
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.pauseVideo();
    socket.emit("newUserJoined")
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.PAUSED && role === 'ADMIN') {
        socket.emit("videoPaused");
    }

    if (event.data === YT.PlayerState.PLAYING && role === 'ADMIN') {
        const currentTime = player.getCurrentTime()
        socket.emit("videoPlaying", currentTime)
    }
}

socket.on("videoPaused", () => {
    player.pauseVideo();
})

socket.on("videoPlaying", (currentTime) => {
    player.seekTo(currentTime, true)
    player.playVideo();
})

socket.on("newUserJoined", () => {
    if (role === 'ADMIN') {
        const currentTime = player.getCurrentTime()
        if (currentTime > 0) {
            socket.emit("videoPlaying", currentTime)
        }
    }
})