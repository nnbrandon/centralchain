const Wallet = require('./wallet');
const Transaction = require('../tx/tx');
const Blockchain = require('../core/blockchain');
const { STARTING_BALANCE } = require('./config');
const { verifySignature } = require('../crypto/elliptic-curve');

describe('Wallet', () => {
	beforeEach(() => {
		wallet = new Wallet();
	});

	it('has a balance', () => {
		expect(wallet).toHaveProperty('balance');
	});

	it('has a publicKey', () => {
		expect(wallet).toHaveProperty('publicKey');
	});

	describe('signing data', () => {
		const data = 'foobar';

		it('verifies a signature', () => {
			expect(verifySignature(wallet.publicKey, data, wallet.sign(data))).toBe(true);
		});

		it('does not verify an invalid signature', () => {
			expect(verifySignature(wallet.publicKey, data, new Wallet().sign(data))).toBe(false);
		});
	});

	describe('createTransaction()', () => {
		describe('and the amount exceeds the balance', () => {
			it('throws an error', () => {
				let amount = 99999999;
				let recipient = 'foo-recipient';
				expect(() => {
					wallet.createTransaction(amount, recipient);
				}).toThrow('Amount exceeds balance');
			});
		});

		describe('and the amount is valid', () => {
			let amount;
			let recipient;
			let transaction;

			beforeEach(() => {
				amount = 50;
				recipient = 'foo-recipient';
				transaction = wallet.createTransaction(amount, recipient);
			});

			it('creates an instance of the Transaction', () => {
				expect(transaction instanceof Transaction).toBe(true);
			});

			it('matches the transaction input with the wallet', () => {
				expect(transaction.input.address).toEqual(wallet.publicKey);
			});

			it('outputs the amount to the recipient', () => {
				expect(transaction.outputMap[recipient]).toEqual(amount);
			});
		});

		describe('and a chain is passed', () => {
			it('calls wallet.calculateBalance()', () => {
				const originalCalculateBalance = wallet.calculateBalance;
				const calculateBalanceMock = jest.fn();

				wallet.calculateBalance = calculateBalanceMock;

				wallet.createTransaction(10, 'foo', new Blockchain().chain);

				expect(calculateBalanceMock).toHaveBeenCalled();
				wallet.calculateBalance = originalCalculateBalance;
			});
		});
	});

	describe('calculateBalance()', () => {
		let blockchain;

		beforeEach(() => {
			blockchain = new Blockchain();
		});

		describe('and there are no outputs for the wallet', () => {
			it('returns the STARTING_BALANCE', () => {
				expect(wallet.calculateBalance(blockchain.chain)).toEqual(STARTING_BALANCE);
			});
		});

		describe('and there are outputs for the wallet', () => {
			let transactionOne;
			let transactionTwo;

			beforeEach(() => {
				// 2 different people sending money to wallet.publicKey
				transactionOne = new Wallet().createTransaction(50, wallet.publicKey);
				transactionTwo = new Wallet().createTransaction(60, wallet.publicKey);

				const data = [ transactionOne, transactionTwo ];
				blockchain.addBlock(data);
			});

			it('adds the sum of all outputs to the wallet balance', () => {
				expect(wallet.calculateBalance(blockchain.chain)).toEqual(
					STARTING_BALANCE +
						transactionOne.outputMap[wallet.publicKey] +
						transactionTwo.outputMap[wallet.publicKey]
				);
			});

			describe('and the wallet has made a transaction', () => {
				let recentTransaction;

				beforeEach(() => {
					recentTransaction = wallet.createTransaction(50, 'foo');

					blockchain.addBlock([ recentTransaction ]);
				});

				it('returns the output amount of the recent transaction', () => {
					expect(wallet.calculateBalance(blockchain.chain)).toEqual(
						recentTransaction.outputMap[wallet.publicKey]
					);
				});

				describe('and there are outputs next to and after the recent transaction', () => {
					let sameBlockTransaction;
					let nextBlockTransaction;

					beforeEach(() => {
						recentTransaction = wallet.createTransaction(60, 'foo-later');
						sameBlockTransaction = Transaction.rewardTransaction(wallet);
						blockchain.addBlock([ recentTransaction, sameBlockTransaction ]);

						nextBlockTransaction = new Wallet().createTransaction(100, wallet.publicKey);
						blockchain.addBlock([ nextBlockTransaction ]);
					});

					it('includes the output amount in the returned balance', () => {
						expect(wallet.calculateBalance(blockchain.chain)).toEqual(
							recentTransaction.outputMap[wallet.publicKey] +
								sameBlockTransaction.outputMap[wallet.publicKey] +
								nextBlockTransaction.outputMap[wallet.publicKey]
						);
					});
				});
			});
		});
	});
});
