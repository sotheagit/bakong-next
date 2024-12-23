const axios = require('axios');

module.exports = async (req, res) => {
    const md5 = req.query.md5 || req.body.md5;
    const baseUrl = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';

    const accessTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNTM0MWQwMmFlZmViNDU3In0sImlhdCI6MTcyNzkzODU5MywiZXhwIjoxNzM1NzE0NTkzfQ.v6rD-_BKMOrEZGSfiZNeBX-0urqApvBf4FZR1n4F41Y'
    ];

    if (!md5) {
        return res.status(400).json({ error: 'MD5 parameter is required' });
    }

    const token = accessTokens[Math.floor(Math.random() * accessTokens.length)];

    try {
        const response = await axios.post(baseUrl, { md5 }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error checking transaction status:', error.message);
        res.status(500).json({ error: 'Failed to check transaction status' });
    }
};
