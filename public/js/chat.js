const usersListDOM = document.getElementById('usersList');
const messageWindow = document.getElementById('messageWindow');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

const socket = io();

// Declaring variable that will hold current active users to display them in the DOM
let usersList = null;

// Getting data about user and list of active users
function getData() {
    fetch(`${window.location.href}/getData`)
        .then(res => res.json())
        .then(data => {
            usersList = data.usersList;
            updateUsersList(usersList);
            socket.emit('joinedRoom', data.user[0]);
        }); 
}

getData();

// Updating active users list after joining new user
socket.on('joinedUser', connectedUser => {
    usersList.push(connectedUser);
    updateUsersList(usersList);
})

// Displaying message sent by another user than current one
socket.on('other-message', msg => {
    appendMsg(msg);
});

// Displaying message sent by current user
socket.on('my-message', msg => {
    appendMsg(msg, 'sender');
});

// Removing user from active users list
socket.on('leftUser', leftUser => {
    const removeIndex = usersList.findIndex(user => user.username = leftUser.username);
    usersList.splice(removeIndex, 1);
    updateUsersList(usersList);
});

// Message input event listener
messageForm.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('chat-message', messageInput.value);
    messageInput.value = '';
    messageInput.focus();

    return false;
})

// Appending message to the DOM
function appendMsg(msg, additionalClass = '') {
    const div = document.createElement('div');
    div.classList.value = `message-container ${additionalClass}`
    div.innerHTML = `
        <div class="message">
            <div class="message-top">
                <span><strong>${msg.username}</strong></span>
                <span>${msg.time}</span>
            </div>
            <div class="message-bottom">
                <p>${msg.text}</p>
            </div>
        </div>
    `;
    messageWindow.appendChild(div);
};

// Updating users list in the DOM
function updateUsersList(list) {
    const newList = list.map(user => `
        <div class="user"><i class="fas fa-circle"></i> ${user.username}</div>
    `).join(' ');

    usersListDOM.innerHTML = newList;
}