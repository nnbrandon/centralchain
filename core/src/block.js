const hexToBinary = require('hex-to-binary');
const cryptoHash = require('../../crypto/src/crypto-hash');
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

	// Proof of work
	static mineBlock(lastBlock, data) {
		let hash;
		let timestamp;
		let nonce = 0;
		let difficulty = { lastBlock };
		const lastHash = lastBlock.hash;

		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty(lastBlock, timestamp);
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		} while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

		return new this(timestamp, lastHash, hash, data, nonce, difficulty);
	}

	// Proof of work
	static adjustDifficulty(originalBlock, timestamp) {
		const { difficulty } = originalBlock;
		const difference = timestamp - originalBlock.timestamp;

		if (difficulty < 1) {
			return 1;
		}

		if (difference > MINE_RATE) {
			return difficulty - 1;
		}

		return difficulty + 1;
	}
}

module.exports = Block;
