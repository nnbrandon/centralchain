const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Blockchain = require('../core/src/blockchain');
const PubSub = require('./redis-pubsub/pubsub');

const DEFAULT_PORT = 8080;
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub(blockchain);
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
	res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
	const { data } = req.body;

	blockchain.addBlock(data);

	pubsub.broadcastChain();
	res.redirect('/api/blocks');
});

const syncChains = () => {
	fetch(`${ROOT_NODE_ADDRESS}/api/blocks`)
		.then((res) => res.json())
		.then((body) => {
			console.log('replace blockchain on a sync with ', body);
			blockchain.replaceChain(body);
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
		syncChains();
	}
});
