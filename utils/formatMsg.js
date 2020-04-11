const moment = require('moment');

const formatMsg = (username, text) => {
    return {
        username: username,
        text: text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMsg;