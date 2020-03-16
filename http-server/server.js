const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Blockchain = require('../core/blockchain');
const PubSub = require('./redis-pubsub/pubsub');
const TransactionPool = require('../tx/tx-pool');
const Wallet = require('../wallet/wallet');
const TransactionMiner = require('../miner/tx-miner');

const DEFAULT_PORT = 8080;
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub(blockchain, transactionPool);
const wallet = new Wallet();
const transactionMiner = new TransactionMiner(blockchain, transactionPool, wallet, pubsub);
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
const path = require('path');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/blocks', (req, res) => {
	res.json(blockchain.chain);
});

app.get('/api/transaction-pool', (req, res) => {
	res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
	transactionMiner.mineTransactions();

	res.redirect('/api/blocks');
});

app.get('/api/wallet', (req, res) => {
	const address = wallet.publicKey;
	res.json({
		address: wallet.publicKey,
		balance: Wallet.calculateBalance(blockchain.chain, address)
	});
});

app.post('/api/mine', (req, res) => {
	const { data } = req.body;

	blockchain.addBlock(data);

	pubsub.broadcastChain();
	res.redirect('/api/blocks');
});

app.post('/api/transaction', (req, res) => {
	const { amount, recipient } = req.body;
	let transaction = transactionPool.getTransaction(wallet.publicKey);

	try {
		if (transaction) {
			transaction.update(wallet, recipient, amount);
		} else {
			transaction = wallet.createTransaction(amount, recipient, blockchain.chain);
		}
	} catch (error) {
		return res.status(400).json({ type: 'error', message: error.message });
	}

	transactionPool.setTransaction(transaction);
	console.log(transactionPool);
	pubsub.broadcastTransaction(transaction);
	res.json({ transaction });
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const syncWithRootState = () => {
	fetch(`${ROOT_NODE_ADDRESS}/api/blocks`)
		.then((res) => res.json())
		.then((chain) => {
			console.log('replace blockchain on a sync with ', chain);
			blockchain.replaceChain(chain);
		})
		.catch((err) => {
			console.log(`Unable to connect to ${ROOT_NODE_ADDRESS}: ${err}`);
		});
	fetch(`${ROOT_NODE_ADDRESS}/api/transaction-pool`)
		.then((res) => res.json())
		.then((txpool) => {
			console.log('replace transaction pool on a sync with ', txpool);
			transactionPool.setMap(txpool);
		})
		.catch((err) => {
			console.log(`Unable to connect to ${ROOT_NODE_ADDRESS}: ${err}`);
		});
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
	console.log(`App is listening on localhost:${PORT}`);
	if (PORT !== DEFAULT_PORT) {
		syncWithRootState();
	}
});
