const crypto = require('crypto');

// Generate EC key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    }
});

module.exports = {
  getPublicKey: (req, res) => {
    const key = JSON.stringify(publicKey);
    res.send(key);
  },
  privateKey: privateKey
};
