const Wallet = require('../src/wallet');
const Transaction = require('../../tx/src/tx');
const { verifySignature } = require('../../crypto/src/elliptic-curve');

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
	});
});
