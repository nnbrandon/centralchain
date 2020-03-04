const Blockchain = require('../src/blockchain');
const Block = require('../src/block');
const cryptoHash = require('../../crypto/src/crypto-hash');

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
				newChain.chain[0] = { data: 'new block' };
				blockchain.replaceChain(newChain.chain);
				expect(blockchain.chain).toEqual(originalChain);
			});
		});

		describe('when the new chain is longer', () => {
			beforeEach(() => {
				newChain.addBlock('data1');
				newChain.addBlock('data2');
				newChain.addBlock('data3');
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
});
