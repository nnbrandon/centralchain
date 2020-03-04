const TransactionPool = require('../src/tx-pool');
const Transaction = require('../src/tx');
const Wallet = require('../../wallet/src/wallet');

describe('TransactionPool', () => {
	let transactionPool;
	let transaction;
	let senderWallet;

	beforeEach(() => {
		transactionPool = new TransactionPool();
		senderWallet = new Wallet();
		transaction = new Transaction(senderWallet, 'recipient', 50);
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
});
