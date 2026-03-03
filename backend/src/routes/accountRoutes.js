const express = require('express');
const router = express.Router();
const { getAccounts, addAccount, deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware'); // ← protect not verifyToken

router.get('/', protect, getAccounts);
router.post('/', protect, addAccount);
router.delete('/:accountId', protect, deleteAccount);

module.exports = router;