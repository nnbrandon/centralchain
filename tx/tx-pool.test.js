const TransactionPool = require('./tx-pool');
const Transaction = require('./tx');
const Wallet = require('../wallet/wallet');
const Blockchain = require('../core/blockchain');

describe('TransactionPool', () => {
	let transactionPool;
	let transaction;
	let senderWallet;

	beforeEach(() => {
		transactionPool = new TransactionPool();
		senderWallet = new Wallet();
		transaction = new Transaction(senderWallet, 'recipient', 50, undefined, undefined);
		transactionPool.setTransaction(transaction);
	});

	describe('setTransaction()', () => {
		it('adds a transaction', () => {
			expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
		});
	});

	describe('getTransaction', () => {
		it('returns an existing transaction given an input address', () => {
			expect(transactionPool.getTransaction(senderWallet.publicKey)).toBe(transaction);
		});
	});

	describe('clear()', () => {
		it('clears the transaction', () => {
			transactionPool.clear();

			expect(transactionPool.transactionMap).toEqual({});
		});
	});

	describe('clearChainTransactions()', () => {
		it('clears the pool of any existing blockchain transactions', () => {
			const blockchain = new Blockchain();
			const expectedTransactionMap = {};
			expectedTransactionMap[transaction.id] = transaction;

			for (let i = 0; i < 6; i++) {
				const transaction = new Wallet().createTransaction('foo', 20);
				transactionPool.setTransaction(transaction);

				if (i % 2 == 0) {
					blockchain.addBlock([ transaction ]);
				} else {
					expectedTransactionMap[transaction.id] = transaction;
				}
			}

			transactionPool.clearChainTransactions(blockchain.chain);
			expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
		});
	});
});
