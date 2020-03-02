const MINE_RATE = 1000;
// const MINE_RATE = 600000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
	timestamp: 0,
	lastHash: '---',
	hash: 'first-hash',
	data: [],
	nonce: 0,
	difficulty: INITIAL_DIFFICULTY
};

module.exports = {
	GENESIS_DATA,
	MINE_RATE
};
