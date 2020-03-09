const Transaction = require('./tx');

class TransactionPool {
	constructor() {
		this.transactionMap = {};
	}

	setTransaction(transaction) {
		this.transactionMap[transaction.id] = transaction;
	}

	getTransaction(publicKey) {
		const transactions = Object.values(this.transactionMap);

		return transactions.find((transaction) => {
			if (transaction.input.address === publicKey) {
				return transaction;
			}
		});
	}

	setMap(transactionMap) {
		this.transactionMap = transactionMap;
	}

	clear() {
		this.transactionMap = {};
	}

	clearCompletedTransactions(chain) {
		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];

			for (let transaction of block.data) {
				if (this.transactionMap[transaction.id]) {
					delete this.transactionMap[transaction.id];
				}
			}
		}
	}

	validTransactions() {
		return Object.values(this.transactionMap).filter((transaction) => Transaction.validTransaction(transaction));
	}
}

module.exports = TransactionPool;
