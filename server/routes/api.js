const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile.js'));

router.get('/draft', (req, res) => {
    knex('draft')
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.log('Error ', err);
    });
})

module.exports = router;