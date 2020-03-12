const Blockchain = require('./blockchain');
const Block = require('./block');
const Transaction = require('../tx/tx');
const Wallet = require('../wallet/wallet');
const cryptoHash = require('../crypto/crypto-hash');

describe('Blockchain', () => {
	let blockchain;
	let newChain;
	let originalChain;

	beforeEach(() => {
		blockchain = new Blockchain();
		newChain = new Blockchain();
		originalChain = blockchain.chain;
	});

	it('contains a `chain` Array instance', () => {
		expect(blockchain.chain instanceof Array).toBe(true);
	});

	it('starts with the genesis block', () => {
		expect(blockchain.chain[0]).toEqual(Block.genesis());
	});

	it('appends a new block to the chain', () => {
		const newData = 'foo bar';
		blockchain.addBlock(newData);
		const latestBlock = blockchain.chain[blockchain.chain.length - 1];
		const latestData = latestBlock.data;

		expect(latestData).toEqual(newData);
	});

	describe('isValidChain()', () => {
		describe('when the chain does not start with genesis block', () => {
			it('returns false', () => {
				blockchain.chain[0] = { data: 'tampered-genesis-block' };
				expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
			});
		});

		describe('when the chain starts with a genesis block', () => {
			beforeEach(() => {
				blockchain.addBlock('data1');
				blockchain.addBlock('data2');
				blockchain.addBlock('data3');
			});

			describe(' and a lastHash reference has changed', () => {
				it('returns false', () => {
					blockchain.chain[2].lastHash = 'broken-lastHash';
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe('and the chain contains a block with an invalid field', () => {
				it('returns false', () => {
					blockchain.chain[2].data = 'bad & evil data!!!';
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe('and the chain contains a block with a jumped difficulty', () => {
				it('returns false', () => {
					const lastBlock = blockchain.chain[blockchain.chain.length - 1];
					const lastHash = lastBlock.hash;
					const timestamp = Date.now();
					const nonce = 0;
					const data = [];
					const difficulty = lastBlock.difficulty - 3;

					const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
					const badBlock = new Block(timestamp, lastHash, hash, data, nonce, difficulty);
					blockchain.chain.push(badBlock);

					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe('and the chain does not contain any invalid blocks', () => {
				it('returns true', () => {
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
				});
			});
		});
	});

	describe('replaceChain()', () => {
		describe('when the new chain is not longer', () => {
			it('does not replace the chain', () => {
				const transaction = new Wallet().createTransaction(50, 'foo');
				newChain.chain[0] = [ transaction ];
				blockchain.replaceChain(newChain.chain);
				expect(blockchain.chain).toEqual(originalChain);
			});
		});

		describe('when the new chain is longer', () => {
			beforeEach(() => {
				const transactionOne = new Wallet().createTransaction(50, 'foo');
				const transactionTwo = new Wallet().createTransaction(50, 'foo');
				const transactionThree = new Wallet().createTransaction(50, 'foo');
				const transactionFour = new Wallet().createTransaction(50, 'foo');
				newChain.addBlock([ transactionOne, transactionTwo ]);
				newChain.addBlock([ transactionThree ]);
				newChain.addBlock([ transactionFour ]);
			});

			describe('and the chain is invalid', () => {
				it('does not replace the blockchain', () => {
					newChain.chain[2].hash = 'fake-hash';
					blockchain.replaceChain(newChain.chain);
					expect(blockchain.chain).toEqual(originalChain);
				});
			});

			describe('and the chain is valid', () => {
				it('replaces the blockchain', () => {
					blockchain.replaceChain(newChain.chain);
					expect(blockchain.chain).toEqual(newChain.chain);
				});
			});
		});
	});

	describe('validTransactionData()', () => {
		let transaction;
		let rewardTransaction;
		let wallet;

		beforeEach(() => {
			wallet = new Wallet();
			transaction = wallet.createTransaction(50, 'foo-recipient');
			rewardTransaction = Transaction.rewardTransaction(wallet);
		});

		describe('and the transaction data is valid', () => {
			it('returns true', () => {
				newChain.addBlock([ transaction, rewardTransaction ]);
				expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(true);
			});
		});

		describe('and the transaction data has multiple rewards', () => {
			it('should return false', () => {
				newChain.addBlock([ transaction, rewardTransaction, rewardTransaction ]);
				expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(false);
			});
		});

		describe('and the transaction data has at least one malformed outputMap', () => {
			describe('and the transaction is not a reward transaction', () => {
				it('should return false', () => {
					transaction.outputMap[wallet.publicKey] = 9999999;
					newChain.addBlock([ transaction, rewardTransaction ]);
					expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(false);
				});
			});

			describe('and the transaction is a reward transaction', () => {
				it('should return false', () => {
					rewardTransaction.outputMap[wallet.publicKey] = 999999;
					newChain.addBlock([ transaction, rewardTransaction ]);
					expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(false);
				});
			});
		});

		describe('and the transaction data has at least one malformed input', () => {
			it('returns false', () => {
				wallet.balance = 9000;

				const evilOutputMap = {
					[wallet.publicKey]: 8900,
					fooRecipient: 100
				};

				const evilTransaction = {
					input: {
						timestamp: Date.now(),
						amount: wallet.balance,
						address: wallet.publicKey,
						signature: wallet.sign(evilOutputMap)
					},
					outputMap: evilOutputMap
				};

				newChain.addBlock([ evilTransaction, rewardTransaction ]);
				expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(false);
			});
		});

		describe('and a block contains multiple identical transactions', () => {
			it('returns false', () => {
				newChain.addBlock([ transaction, transaction, transaction, rewardTransaction ]);
				expect(blockchain.validTransactionData(newChain.chain, wallet)).toBe(false);
			});
		});
	});
});
