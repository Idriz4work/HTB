const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');

router.get('/', async (req, res) => {
    var mails = [];

    // Read the password from the file
    var pass = fs.readFileSync('/email/password.txt', 'utf8');

    try {
        // Fetch messages from the MailHog API
        const response = await axios({
            method: 'get',
            url: `http://test:${pass}@127.0.0.1:9000/api/v2/messages?limit=50`
        });

        // Filter messages where any recipient exactly matches 'test@email.htb'
        for (let item of response.data.items) {
            const recipients = item.Raw.To || [];
            if (recipients.some((recipient) => recipient === 'test@email.htb')) {
                mails.push(item);
            }
        }

        // Render the result on the page
        console.log(mails);
        return res.render('home.html', { result: mails });
    } catch (e) {
        console.error("Error fetching emails:", e);
        return res.status(500).send("Error processing request");
    }
});


router.get('/deleteall', async (req, res) => {
    var pass = fs.readFileSync('/email/password.txt', 'utf8');

    try {
        await axios({
            method: 'DELETE',
            url: `http://test:${pass}@127.0.0.1:9000/api/v1/messages`
        });

        return res.redirect('/');
    } catch (e) {
        console.error("Error deleting emails:", e);
        return res.status(500).send("Error deleting emails");
    }
});

module.exports = () => {
    return router;
};
