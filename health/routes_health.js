/**
 * Provides health check for orchestration. Simply returns 'ok' and a 200
 */

const express = require('express')

const router = express.Router()

/**
 * Return 'ok' in the body with a status code of 200 to tell the requester we are alive
 */
router.get('/', (req, res) => {
    res.send('ok')
})

module.exports = router