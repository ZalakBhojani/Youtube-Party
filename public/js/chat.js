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
const $videoTitle = document.querySelector("#video-title");
const $channelName = document.querySelector("#channel-name");
const $videos = document.querySelector('#videos');


// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const userTemplate = document.querySelector("#user-template").innerHTML;
const videoTemplate = document.querySelector("#video-template").innerHTML;



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

// gets the videoID from URL (string) 
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

var currVideo = 'M7lc1UVf-VE';
var queue = [];
var url;

function addVideo() {
    url = $urlForm.elements['url'].value

    const Http = new XMLHttpRequest();
    const requestUrl = 'https://www.youtube.com/oembed?url=' + url + '&format=json';
    Http.open("GET", requestUrl);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
            const res = JSON.parse(Http.responseText)

            const video = {
                title: res.title,
                channel: res.author_name,
                thumbnail_url: res.thumbnail_url
            }
            $videoTitle.innerHTML = video.title
            $channelName.innerHTML = video.channel

            const html = Mustache.render(videoTemplate, {
                thumbnail_url: video.thumbnail_url,
                title: video.title
            })
            $videos.insertAdjacentHTML('beforeend', html)

            queue.push(video);
            console.log(video);
        }
    }



    currVideo = youtube_parser(url)
    $urlForm.elements['url'].value = ''

    player.loadVideoById(currVideo)
    socket.emit("newVideoAdded", currVideo)
}


$urlForm.addEventListener('submit', (event) => {
    event.preventDefault()
    addVideo()
})

socket.on("newVideoAdded", (newVideo) => {
    if (role === 'GUEST') {
        player.loadVideoById(newVideo)
    }
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

// this code loads the IFrame Player API code asynchronously
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// this function creates an <iframe> (and YouTube player)
// after the API code downloads.
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

// the API will call this function when the video player is ready
function onPlayerReady(event) {
    event.target.pauseVideo();
    socket.emit("getLatestTime")
}

var pausedByUser = false;
function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.PAUSED) {
        if (role === 'ADMIN') {
            socket.emit("videoPaused");
        }
        else {
            pausedByUser = true;
        }
    }

    if (event.data === YT.PlayerState.PLAYING) {
        if (role === 'ADMIN') {
            const currentTime = player.getCurrentTime()
            socket.emit("videoPlaying", currentTime)
        }
        else {
            if (pausedByUser == false) {
                socket.emit("getLatestTime")
            }
            pausedByUser = false;
        }
    }

}

socket.on("videoPaused", () => {
    player.pauseVideo();
})

socket.on("videoPlaying", (currentTime) => {
    if (pausedByUser === false) {
        player.seekTo(currentTime, true)
        player.playVideo();
    }
})

socket.on("getLatestTime", () => {
    const currentTime = player.getCurrentTime()
    if (currentTime > 0) {
        socket.emit("videoPlaying", currentTime)
    }
})