const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const formatMsg = require('./utils/formatMsg');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Database connection
mongoose.connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch((err) => console.log(err));

// Bringing in ChatUser model
const ChatUser = require('./models/User');

// Socket.io configuration
io.on('connection', socket => {
    let connectedUser = null;

    // Receiving data about connected user, sending message to append user on active users list,
    // emiting info about new user to others, emiting welcoming message
    socket.on('joinedRoom', user => {
        connectedUser = user;
        socket.join(connectedUser.selectedRoom);
        socket.broadcast.to(connectedUser.selectedRoom).emit('joinedUser', connectedUser);

        socket.broadcast.to(connectedUser.selectedRoom).emit('other-message', formatMsg('ChatBot', `${connectedUser.username} joined chat room`));
        socket.emit('my-message', formatMsg('ChatBot', `Hello, welcome to MessageMe`));
    })

    // Deleting user from ChatUsers database, sending message to delete user on active users list,
    // emiting info about leaving to ohers
    socket.on('disconnect', () => {
        ChatUser.deleteOne({username: connectedUser.username, selectedRoom: connectedUser.selectedRoom}, function(err) {
            if(err) console.log(err);
        });

        socket.leave(connectedUser.selectedRoom);
        socket.broadcast.to(connectedUser.selectedRoom).emit('leftUser', connectedUser);
        socket.broadcast.to(connectedUser.selectedRoom).emit('other-message', formatMsg('ChatBot', `${connectedUser.username} left chat room`));
    });

    // Receiving chat message and passing it forward to Frontend
    socket.on('chat-message', msg => {
        socket.broadcast.to(connectedUser.selectedRoom).emit('other-message', formatMsg(connectedUser.username, msg));
        socket.emit('my-message', formatMsg(connectedUser.username, msg));
    })
})

// App configuration
app.set('views', './views');
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Routing
app.use('/', require('./routes/mainRouter'));

const PORT = process.env.PORT || 3000;

http.listen(PORT);