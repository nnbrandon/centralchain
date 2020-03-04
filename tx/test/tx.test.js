const Transaction = require('../src/tx');
const Wallet = require('../../wallet/src/wallet');
const { verifySignature } = require('../../crypto/src/elliptic-curve');

describe('Transaction', () => {
	let transaction;
	let senderWallet; // creates transaction
	let recipient; // receiver
	let amount;

	beforeEach(() => {
		senderWallet = new Wallet();
		recipient = 'recipient-public-key';
		amount = 50;

		transaction = new Transaction(senderWallet, recipient, amount);
	});

	it('has an id', () => {
		expect(transaction).toHaveProperty('id');
	});

	describe('outputMap', () => {
		it('has an outputMap', () => {
			expect(transaction).toHaveProperty('outputMap');
		});

		it('outputs the amount to the recipient', () => {
			expect(transaction.outputMap[recipient]).toEqual(amount);
		});

		it('outputs the remaining balance for the senderWallet', () => {
			expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
		});
	});

	describe('input', () => {
		it('has an input', () => {
			expect(transaction).toHaveProperty('input');
		});

		it('has a timestamp in the input', () => {
			expect(transaction.input).toHaveProperty('timestamp');
		});

		it('sets the amount to the senderWallet balance', () => {
			expect(transaction.input.amount).toEqual(senderWallet.balance);
		});

		it('sets the address to the senderwallet publicKey', () => {
			expect(transaction.input.address).toEqual(senderWallet.publicKey);
		});

		it('signs the input', () => {
			expect(verifySignature(senderWallet.publicKey, transaction.outputMap, transaction.input.signature)).toBe(
				true
			);
		});
	});

	describe('validTransaction()', () => {
		let errorMock;

		beforeEach(() => {
			errorMock = jest.fn();

			global.console.error = errorMock;
		});
		describe('when the transaction is valid', () => {
			it('returns true', () => {
				expect(Transaction.validTransaction(transaction)).toBe(true);
			});
		});

		describe('when the transaction is invalid', () => {
			describe('and a transaction outputMap value is invalid', () => {
				it('returns false', () => {
					transaction.outputMap[senderWallet.publicKey] = 999999;
					expect(Transaction.validTransaction(transaction)).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe('and the transaction input signature is invalid', () => {
				it('returns false', () => {
					transaction.input.signature = new Wallet().sign('data');
					expect(Transaction.validTransaction(transaction)).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});
		});
	});

	describe('update()', () => {
		let originalSignature;
		let originalSenderOutput;
		let nextRecipient;
		let nextAmount;

		describe('and the amount is valid', () => {
			beforeEach(() => {
				originalSignature = transaction.input.signature;
				originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
				nextRecipient = 'next-recipient';
				nextAmount = 50;

				transaction.update(senderWallet, nextRecipient, nextAmount);
			});

			it('outputs the amount to the next recipient', () => {
				expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
			});

			it('subtracts the amount from the original sender ouput amount', () => {
				expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
			});

			it('maintains a total output that matches the input amount', () => {
				expect(
					Object.values(transaction.outputMap).reduce((total, outputAmount) => {
						return total + outputAmount;
					})
				).toEqual(transaction.input.amount);
			});

			it('resigns the transaction', () => {
				expect(transaction.input.signature).not.toEqual(originalSignature);
			});

			describe('and another update for the same recipient', () => {
				let addedAmount;

				beforeEach(() => {
					addedAmount = 80;
					transaction.update(senderWallet, recipient, addedAmount);
				});

				it('adds to recipients amount', () => {
					expect(transaction.outputMap[recipient]).toEqual(nextAmount + addedAmount);
				});

				it('subtracts the amount from the original sender output amount', () => {
					expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
						originalSenderOutput - nextAmount - addedAmount
					);
				});
			});
		});

		describe('and the amount is invalid', () => {
			it('throws an error', () => {
				expect(() => {
					transaction.update(senderWallet, 'foo', 99999999);
				}).toThrow('Amount exceeds balance');
			});
		});
	});
});
