const express = require('express');
const router = express.Router();

// Serving starting site
router.get('/', (req, res) => res.render('landing-page'));

// Serving chat 'login' page
router.get('/chat-start', (req, res) => res.render('chat-start', {message: req.flash('error')}));

// Routing to chat service
router.use('/chat', require('./chatRouting/chatRouting'));

module.exports = router;