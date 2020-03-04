const Transaction = require('../../tx/src/tx');
const { STARTING_BALANCE } = require('../src/config');
const { ec } = require('../../crypto/src/elliptic-curve');
const cryptoHash = require('../../crypto/src/crypto-hash');

class Wallet {
	constructor() {
		this.balance = STARTING_BALANCE;

		// private key used to generate signatures for private key owner of data
		// public key allows others to sends crypto
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	sign(data) {
		return this.keyPair.sign(cryptoHash(data));
	}

	createTransaction(amount, recipient) {
		if (amount > this.balance) {
			throw new Error('Amount exceeds balance');
		}
		return new Transaction(this, recipient, amount);
	}
}

module.exports = Wallet;
