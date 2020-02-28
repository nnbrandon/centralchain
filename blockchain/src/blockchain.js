const Block = require('../../block/src/block');
const cryptoHash = require('../../block/src/crypto-hash');

class Blockchain {
	constructor() {
		this.chain = [ Block.genesis() ];
	}

	addBlock(data) {
		const lastBlock = this.chain[this.chain.length - 1];
		const newBlock = Block.mineBlock(lastBlock, data);

		this.chain.push(newBlock);
	}

	static isValidChain(chain) {
		if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

		for (let i = 1; i < chain.length; i++) {
			const { timestamp, lastHash, hash, data } = chain[i];
			const actualLastHash = chain[i - 1].hash;

			// check if current block's lastHash matches the chain's block's last hash
			if (lastHash !== actualLastHash) {
				return false;
			}

			// check if the data matches the calculated hash of current block
			const validatedHash = cryptoHash(timestamp, lastHash, data);
			if (hash !== validatedHash) {
				return false;
			}
		}

		return true;
	}
}

module.exports = Blockchain;
