const Blockchain = require('../src/blockchain');

const blockchain = new Blockchain();

blockchain.addBlock('initial block');
console.log('first block', blockchain.chain[blockchain.chain.length - 1]);

let prevTimestamp;
let nextTimestamp;
let nextBlock;
let timeDiff;
let average;
let lastBlockIndex;
const times = [];

for (let i = 0; i < 10000; i++) {
	lastBlockIndex = blockchain.chain.length - 1;
	prevTimestamp = blockchain.chain[lastBlockIndex].timestamp;

	blockchain.addBlock(`block ${i}`);

	lastBlockIndex = blockchain.chain.length - 1;
	nextBlock = blockchain.chain[lastBlockIndex];
	nextTimestamp = nextBlock.timestamp;

	timeDiff = nextTimestamp - prevTimestamp;
	times.push(timeDiff);

	average = times.reduce((total, num) => total + num) / times.length;

	console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average Time: ${average}ms`);
}
