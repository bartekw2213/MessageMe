const express = require('express');
const router = express.Router();

// Bringing in ChatUser model
const ChatUser = require('../../models/User');

// Serving chat window 
router.get('/:selectedRoom/:username', (req, res) => {
    const selectedRoom = req.params.selectedRoom.replace(/_/g, ' ');

    res.render('chat', { selectedRoom: selectedRoom })
});

// Handling fetch request about current user and current active users list
router.get('/:selectedRoom/:username/getData', (req, res) => {
    const { username, selectedRoom } = req.params;
    ChatUser.find({username: username, selectedRoom: selectedRoom}, function(err, user) {
        if(err) res.send(err)
        ChatUser.find({selectedRoom: selectedRoom}, function(err, usersList) {
            const data = {
                user: user,
                usersList: usersList
            }
            res.json(data);
        })
    })
});

// Creating user in database and redirecting to chat windows
router.post('/', async (req, res) => {
    const { username, selectedRoom } = req.body;

    if(selectedRoom === "0") {
        req.flash('error', 'Choose the room you want to join!');
        return res.redirect('/chat-start');
    };

    const user = new ChatUser({
        username,
        selectedRoom
    });

    await user.save();

    res.redirect(`/chat/${selectedRoom}/${username}`)
});

module.exports = router