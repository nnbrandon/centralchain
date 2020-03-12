const uuid = require('uuid/v1');
const { verifySignature } = require('../crypto/elliptic-curve');
const { REWARD_INPUT, MINING_REWARD } = require('./config');

/**
 * This version of Transaction contains a single input JSON object and
 * a map for the output. 
 * @param senderWallet sender's wallet which generates a signature
 * @param recipient recipient's address
 * @param amount cryptocurrency amount
 * @param outputMap map containing details of transactions with how much recipient received and past transactions
 */
class Transaction {
	constructor(senderWallet, recipient, amount, outputMap, input) {
		this.id = uuid();
		this.outputMap = outputMap || this.createOutputMap(senderWallet, recipient, amount);
		this.input = input || this.createInput(senderWallet, this.outputMap);
	}

	createOutputMap(senderWallet, recipient, amount) {
		const outputMap = {};

		outputMap[recipient] = amount; // how much recipient received
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount; // remaining balance of senderWallet after sending money

		return outputMap;
	}

	createInput(senderWallet, outputMap) {
		// senderWallet to generate a signature
		// outputMap is used as data to sign the signature
		return {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(outputMap)
		};
	}

	// Update a transaction's outputMap values so that we don't need to create
	// more transactions
	update(senderWallet, recipient, incomingAmount) {
		if (incomingAmount > this.outputMap[senderWallet.publicKey]) {
			throw new Error('Amount exceeds balance');
		}

		// what happens if we do multiple updates with the same recipient?
		if (!this.outputMap[recipient]) {
			this.outputMap[recipient] = incomingAmount;
		} else {
			this.outputMap[recipient] += incomingAmount;
		}

		this.outputMap[senderWallet.publicKey] -= incomingAmount;
		this.input = this.createInput(senderWallet, this.outputMap);
	}

	// check and make sure that the transaction is valid by verifying the
	// signature in the transaction
	static validTransaction(transaction) {
		const { input, outputMap } = transaction;
		const { address, amount, signature } = input;
		const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => {
			return total + outputAmount;
		});

		if (amount !== outputTotal) {
			console.error(`invalid transaction from ${address}`);
			return false;
		}

		if (!verifySignature(address, outputMap, signature)) {
			console.error(`invalid signature from ${address}`);
			return false;
		}

		return true;
	}

	// return a new transaction to reward miner
	static rewardTransaction(minerWallet) {
		const newOutputMap = { [minerWallet.publicKey]: MINING_REWARD };
		return new this(undefined, undefined, undefined, newOutputMap, REWARD_INPUT);
	}
}

module.exports = Transaction;
