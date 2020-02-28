const cryptoHash = require('./crypto-hash');
const { GENESIS_DATA } = require('../../config');

class Block {
	constructor(timestamp, lastHash, hash, data) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
	}

	// factory method to create a new genesis Block()
	static genesis() {
		return new this(GENESIS_DATA.timestamp, GENESIS_DATA.lastHash, GENESIS_DATA.hash, GENESIS_DATA.data);
	}

	static mineBlock(lastBlock, data) {
		const timestamp = Date.now();
		const lastHash = lastBlock.hash;
		const hash = cryptoHash(timestamp, lastHash, data);

		return new this(timestamp, lastHash, hash, data);
	}
}

module.exports = Block;
