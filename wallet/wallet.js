const Transaction = require('../tx/tx');
const { STARTING_BALANCE } = require('./config');
const { ec } = require('../crypto/elliptic-curve');
const cryptoHash = require('../crypto/crypto-hash');

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

	createTransaction(amount, recipient, chain) {
		if (chain) {
			this.balance = Wallet.calculateBalance(chain, this.publicKey);
		}

		if (amount > this.balance) {
			throw new Error('Amount exceeds balance');
		}
		return new Transaction(this, recipient, amount);
	}

	static calculateBalance(chain, address) {
		let outputsTotal = 0;

		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];

			for (let transaction of block.data) {
				const outputValue = transaction.outputMap[address];

				if (outputValue) {
					outputsTotal += outputValue;
				}
			}
		}
		return STARTING_BALANCE + outputsTotal;
	}
}

module.exports = Wallet;
