const cryptoHash = require('./crypto-hash');
const { GENESIS_DATA, MINE_RATE } = require('./config');

class Block {
	constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
	}

	// factory method to create a new genesis Block()
	static genesis() {
		return new this(
			GENESIS_DATA.timestamp,
			GENESIS_DATA.lastHash,
			GENESIS_DATA.hash,
			GENESIS_DATA.data,
			GENESIS_DATA.nonce,
			GENESIS_DATA.difficulty
		);
	}

	static mineBlock(lastBlock, data) {
		let hash;
		let timestamp;
		const lastHash = lastBlock.hash;
		const { difficulty } = lastBlock;
		let nonce = 0;

		do {
			nonce++;
			timestamp = Date.now();
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		} while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

		return new this(timestamp, lastHash, hash, data, nonce, difficulty);
	}

	static adjustDifficulty(originalBlock, timestamp) {
		const { difficulty } = originalBlock;
		const difference = timestamp - originalBlock.timestamp;

		if (difference > MINE_RATE) {
			return difficulty - 1;
		}

		return difficulty + 1;
	}
}

module.exports = Block;
