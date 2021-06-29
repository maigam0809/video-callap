const webSocket = new WebSocket('ws://192.168.1.7:3001');
webSocket.onmessage = (e) => {
    handleSignallingData(JSON.parse(e.data))
}
function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break;
        case "candicate":
            peerConn.addIceCandicate(data.candicate)
            break;
    }
}
let username
function sendUsername() {
    username = document.getElementById('username-input');
    sendData({
        type: "store_user",

    })
}
function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}

let localStream
let peerConn
function startCall() {
    document.getElementById("video-div").style.display = "inline"
    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.3333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream
        let configuration = {
            iceServers: [
                {
                    "url": ['stun:stun.l.google.com:19302']
                }
            ]
        }
        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream);
        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream
        }
        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null) {
                return

            }
            sendData({
                type: "store_candicate",
                candicate: e.candidate
            })
        })
        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)

    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio

    localStreamg.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}