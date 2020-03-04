const uuid = require('uuid/v1');
const { verifySignature } = require('../../crypto/src/elliptic-curve');

// Transaction contains proof of ownership for each
// amount of bitcoin (inputs) whose value is being spent,
// in the form of a digital signature from the owner,
// which can be independently validated by anyone.
class Transaction {
	constructor(senderWallet, recipient, amount) {
		this.id = uuid();
		this.outputMap = this.createOutputMap(senderWallet, recipient, amount);
		this.input = this.createInput(senderWallet, this.outputMap);
	}

	// details sent to the recipient
	// details of the current transaction go in here
	// details of past transactions are stored inside of outputMap
	// "To Bob" as an entry
	createOutputMap(senderWallet, recipient, amount) {
		const outputMap = {};

		outputMap[recipient] = amount; // how much recipient received
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount; // remaining balance of senderWallet after sending money

		return outputMap;
	}

	// inputs from latest transaction correspond to
	// outputs from previous transactions.
	// "From Alice, signed by Alice"
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
}

module.exports = Transaction;
