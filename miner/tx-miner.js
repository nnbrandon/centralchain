const Transaction = require('../../tx/tx');

class TransactionMiner {
	constructor(blockchain, transactionPool, wallet, pubsub) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubsub = pubsub;
	}

	mineTransactions() {
		// get the transaction pool's valid transactions
		const validTransactions = this.transactionPool.validTransactions(); // array of valid transactions

		// generate miners reward
		const rewardedTransaction = Transaction.rewardTransaction(this.wallet); // new Transaction object with reward to validator
		validTransactions.push(rewardedTransaction);

		// add a block consisting of these transactions to the blockchain
		this.blockchain.addBlock(validTransactions);

		// broadcast updated blockchain
		this.pubsub.broadcastChain();

		// clear transaction pool
		this.transactionPool.clear();
	}
}

module.exports = TransactionMiner;
