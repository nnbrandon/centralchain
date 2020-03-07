const crypto = require('crypto');

const cryptoHash = (...inputs) => {
	// ...inputs puts it into an []
	const hash = crypto.createHash('sha256');
	hash.update(inputs.map((input) => JSON.stringify(input)).sort().join(' '));
	return hash.digest('hex');
};

module.exports = cryptoHash;
