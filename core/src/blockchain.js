const Block = require('./block');
const cryptoHash = require('./crypto-hash');

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
			const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
			const actualLastHash = chain[i - 1].hash;
			const lastDifficulty = chain[i - 1].difficulty;

			// check if current block's lastHash matches the chain's block's last hash
			if (lastHash !== actualLastHash) {
				return false;
			}

			// check to make sure that the previous block's difficulty was not tampered with.
			// someone can slow down the blockchain or make it very easy to mine
			if (Math.abs(lastDifficulty - difficulty > 1)) {
				return false;
			}

			// check if the data matches the calculated hash of current block
			const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
			if (hash !== validatedHash) {
				return false;
			}
		}
		return true;
	}

	replaceChain(newChain) {
		if (newChain.length <= this.chain.length) {
			console.error('incoming chain must be longer');
			return;
		}

		if (!Blockchain.isValidChain(newChain)) {
			console.error('incoming chain must be valid');
			return;
		}

		this.chain = newChain;
	}
}

module.exports = Blockchain;
