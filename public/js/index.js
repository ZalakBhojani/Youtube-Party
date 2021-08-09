const form = document.querySelector("#join-room")
const $username = document.querySelector("#username")
const $room = document.querySelector("#roomid")

form.addEventListener('submit', (event) => {

    // disable default action
    event.preventDefault();
    const username = $username.value
    const roomid = $room.value

    const Http = new XMLHttpRequest();
    const requestUrl = window.location.href + 'room?username=' + username + '&roomid=' + roomid;
    console.log(requestUrl);
    Http.open("GET", requestUrl);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {

            const res = JSON.parse(Http.responseText)
            console.log(res);
            if (res.error == false) {
                const url = window.location.href + `room.html?username=${username}&roomid=${roomid}`
                window.location = url;
            }
            else {
                swal({
                    title: "Oops",
                    text: res.message,
                    icon: "error"
                })
            }
        }
    }

})
