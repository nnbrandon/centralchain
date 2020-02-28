const Blockchain = require('../src/Blockchain');
const Block = require('../../block/src/block');

describe('Blockchain', () => {
	let blockchain;

	beforeEach(() => {
		blockchain = new Blockchain();
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

			describe('and the chain does not contain any invalid blocks', () => {
				it('returns true', () => {
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
				});
			});
		});
	});
});
