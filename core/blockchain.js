const Block = require('./block');
const Wallet = require('../wallet/wallet');
const Transaction = require('../tx/tx');
const cryptoHash = require('../crypto/crypto-hash');
const { REWARD_INPUT, MINING_REWARD } = require('../tx/config');

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

	replaceChain(newChain, onSuccess) {
		if (newChain.length <= this.chain.length) {
			console.error('incoming chain must be longer');
			return;
		}

		if (!Blockchain.isValidChain(newChain)) {
			console.error('incoming chain must be valid');
			return;
		}

		if (!this.validTransactionData(newChain)) {
			console.error('incoming chain has invalid transaction data');
			return;
		}

		if (onSuccess) {
			onSuccess();
		}

		this.chain = newChain;
	}

	validTransactionData(chain, wallet) {
		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];
			const transactionSet = new Set();
			let rewardTransactionCount = 0;

			for (let transaction of block.data) {
				if (transaction.input.address === REWARD_INPUT.address) {
					rewardTransactionCount += 1;

					if (rewardTransactionCount > 1) {
						return false;
					}

					if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
						return false;
					}
				} else {
					if (!Transaction.validTransaction(transaction)) {
						return false;
					}

					const trueBalance = Wallet.calculateBalance(this.chain, transaction.input.address);
					if (transaction.input.amount !== trueBalance) {
						return false;
					}

					if (transactionSet.has(transaction)) {
						return false;
					} else {
						transactionSet.add(transaction);
					}
				}
			}
		}
		return true;
	}
}

module.exports = Blockchain;
