const Transaction = require('../tx/tx');
const { STARTING_BALANCE } = require('./config');
const { ec } = require('../crypto/elliptic-curve');
const cryptoHash = require('../crypto/crypto-hash');

class Wallet {
	constructor() {
		this.balance = STARTING_BALANCE;

		// private key used to generate signatures for private key owner of data
		this.keyPair = ec.genKeyPair();

		// public key allows others to sends crypto
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
		let hasConductedTransaction = false;
		let outputsTotal = 0;

		for (let i = chain.length - 1; i > 0; i--) {
			const block = chain[i];

			for (let transaction of block.data) {
				if (transaction.input.address === address) {
					hasConductedTransaction = true;
				}
				const outputValue = transaction.outputMap[address];

				if (outputValue) {
					outputsTotal += outputValue;
				}
			}

			if (hasConductedTransaction) break;
		}
		return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
	}
}

module.exports = Wallet;
