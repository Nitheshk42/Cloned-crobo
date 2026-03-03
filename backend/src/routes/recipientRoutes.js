const express = require('express');
const router = express.Router();
const { addRecipient, getRecipients, updateRecipient, deleteRecipient } = require('../controllers/recipientController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addRecipient);
router.get('/', protect, getRecipients);
router.put('/:id', protect, updateRecipient);
router.delete('/:id', protect, deleteRecipient);

module.exports = router;