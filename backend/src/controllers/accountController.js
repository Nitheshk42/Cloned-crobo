const { v4: uuidv4 } = require('uuid');
const { client } = require('../../config/cassandra');

// ─── GET ALL ACCOUNTS FOR USER ────────────────────────────────
const getAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = 'SELECT * FROM user_accounts WHERE user_id = ?';
    const result = await client.execute(query, [userId], { prepare: true });
    res.json({ accounts: result.rows });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
};

// ─── ADD NEW ACCOUNT ─────────────────────────────────────────
const addAccount = async (req, res) => {
     console.log('req.user:', req.user);
  try {
    const userId = req.user.userId;
    const {
      holder_name, bank_name, account_no, country,
      account_type, routing_no, ifsc_code, sort_code,
      iban, bic_swift, bsb_code, transit_no,
      institution_no, bank_code,
    } = req.body;

    // Validate required fields
    if (!holder_name || !bank_name || !country || !account_type) {
      return res.status(400).json({ message: 'holder_name, bank_name, country and account_type are required' });
    }

    const accountId = uuidv4();
    const createdAt = new Date();

    const query = `
      INSERT INTO user_accounts (
        user_id, account_id, holder_name, bank_name,
        account_no, country, account_type, routing_no,
        ifsc_code, sort_code, iban, bic_swift,
        bsb_code, transit_no, institution_no, bank_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId, accountId, holder_name, bank_name,
      account_no || null, country, account_type, routing_no || null,
      ifsc_code || null, sort_code || null, iban || null, bic_swift || null,
      bsb_code || null, transit_no || null, institution_no || null, bank_code || null, createdAt
    ];

    await client.execute(query, params, { prepare: true });

    res.status(201).json({
      message: 'Account added successfully!',
      account: {
        account_id: accountId,
        user_id: userId,
        holder_name, bank_name, account_no, country,
        account_type, routing_no, ifsc_code, sort_code,
        iban, bic_swift, bsb_code, transit_no,
        institution_no, bank_code,
        created_at: createdAt,
      }
    });
  } catch (error) {
    console.error('Add account error:', error);
    res.status(500).json({ message: 'Failed to add account' });
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.params;

    // Verify account belongs to user first
    const checkQuery = 'SELECT * FROM user_accounts WHERE user_id = ? AND account_id = ?';
    const result = await client.execute(checkQuery, [userId, accountId], { prepare: true });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const deleteQuery = 'DELETE FROM user_accounts WHERE user_id = ? AND account_id = ?';
    await client.execute(deleteQuery, [userId, accountId], { prepare: true });

    res.json({ message: 'Account deleted successfully!' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = { getAccounts, addAccount, deleteAccount };