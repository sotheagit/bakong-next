const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    const billNumber = req.query.billNumber || req.body.billNumber;
    const qrImagePath = path.join(__dirname, '../image', `${billNumber}.png`);

    if (fs.existsSync(qrImagePath)) {
        res.sendFile(qrImagePath);
    } else {
        res.status(404).json({ error: 'QR code image not found' });
    }
};
