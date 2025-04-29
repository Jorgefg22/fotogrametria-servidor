const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { checkNotAuthenticated } = require('../middleware/auth');

router.post('/', checkNotAuthenticated, messageController.sendMessage);
router.get('/', checkNotAuthenticated, messageController.getMessages);
router.put('/:id/read', checkNotAuthenticated, messageController.markAsRead);

module.exports = router;