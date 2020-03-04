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
}

module.exports = TransactionPool;
