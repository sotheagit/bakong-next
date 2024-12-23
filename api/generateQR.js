const { BakongKHQR, khqrData, MerchantInfo } = require('bakong-khqr');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    const amount = parseFloat(req.query.amount || req.body.amount);
    const bakongAccountID = req.query.bakongAccountID || req.body.bakongAccountID;
    const merchantName = req.query.merchantName || req.body.merchantName;

    if (isNaN(amount) || !bakongAccountID || !merchantName) {
        return res.status(400).json({ error: 'Invalid amount, Bakong account ID, or merchant name' });
    }

    const allowedIDs = ['sotheasok@aclb', 'nimol_nhen@trmc', 'sao_meas@aclb', 'rithsender@aclb', 'rithsender@trmc', 'chhunlichhean_kun@wing', 'ouch_nhel@trmc', 'meng_vathana1@aclb', 'rith@upay'];
    if (!allowedIDs.includes(bakongAccountID)) {
        return res.status(403).json({ error: 'Unauthorized Bakong account ID. Contact admin: t.me/sothea54' });
    }

    const billNumber = generateBillNumber();

    const optionalData = {
        currency: khqrData.currency.usd,
        amount,
        billNumber,
        storeLabel: "cambotopup",
    };

    function generateBillNumber() {
        return "NV" + Math.floor(100000000000 + Math.random() * 900000000000);
    }

    const merchantInfo = new MerchantInfo(
        bakongAccountID,
        merchantName,
        "Phnom Penh",
        "tg:@cambo_teamkh",
        "Bakong Bank",
        optionalData
    );

    const khqr = new BakongKHQR();
    const response = khqr.generateMerchant(merchantInfo);

    const responseData = {
        qr: response.data.qr,
        md5: response.data.md5,
        tran: billNumber,
        merchantName: merchantName,
        amount: amount
    };

    if (!logTransaction(responseData.tran)) {
        return res.status(400).json({ error: 'Transaction already exists.' });
    }

    try {
        const qrImagePath = path.join(__dirname, '../image', `${billNumber}.png`);
        const canvas = createCanvas(400, 400);
        const ctx = canvas.getContext('2d');

        await QRCode.toCanvas(canvas, responseData.qr, { width: 400, margin: 1 });

        const icon = await loadImage('https://checkout.payway.com.kh/images/usd-khqr-logo.svg');
        const iconSize = 80;
        const x = (canvas.width - iconSize) / 2;
        const y = (canvas.height - iconSize) / 2;
        ctx.drawImage(icon, x, y, iconSize, iconSize);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(qrImagePath, buffer);

        responseData.qr = `https://api.cambotopup.com/qr/${billNumber}`;
        res.json(responseData);
    } catch (error) {
        console.error('Error generating QR code:', error.message);
        res.status(500).json({ error: 'Failed to generate QR code image' });
    }
};

function logTransaction(tran) {
    const logFilePath = path.join(__dirname, '../tran.log');
    
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, ''); // Create an empty log file
    }

    const logData = fs.readFileSync(logFilePath, 'utf-8');
    const logs = logData.split('\n').filter(Boolean);
    if (logs.includes(tran)) {
        return false; // Transaction already exists
    }
    fs.appendFileSync(logFilePath, tran + '\n');
    return true;
}

