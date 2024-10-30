let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendButton = document.getElementById('send');

sendButton.onclick = () => {
    const message = input.value;
    sendChannel.send(message);
    appendMessage('You: ' + message);
    input.value = '';
};

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
}

function createConnection() {
    localConnection = new RTCPeerConnection();
    sendChannel = localConnection.createDataChannel('sendChannel');
    
    sendChannel.onopen = () => {
        console.log('Send channel opened');
    };
    
    sendChannel.onclose = () => {
        console.log('Send channel closed');
    };
    
    localConnection.onicecandidate = (event) => {
        if (event.candidate) {
            remoteConnection.addIceCandidate(event.candidate);
        }
    };
    
    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = (event) => {
        receiveChannel = event.channel;
        receiveChannel.onmessage = (event) => {
            appendMessage('Friend: ' + event.data);
        };
    };

    remoteConnection.onicecandidate = (event) => {
        if (event.candidate) {
            localConnection.addIceCandidate(event.candidate);
        }
    };

    localConnection.createOffer().then(offer => {
        return localConnection.setLocalDescription(offer);
    }).then(() => {
        return remoteConnection.setRemoteDescription(localConnection.localDescription);
    }).then(() => {
        return remoteConnection.createAnswer();
    }).then(answer => {
        return remoteConnection.setLocalDescription(answer);
    }).then(() => {
        return localConnection.setRemoteDescription(remoteConnection.localDescription);
    });
}

createConnection();
