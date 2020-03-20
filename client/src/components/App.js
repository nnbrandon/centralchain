import React, { Component } from 'react';
import Wallet from './Wallet';
import Blocks from './Blocks';
import logo from '../assets/logo.png';

class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="App">
				<img className="logo" src={logo} />
				<br />
				<div>Welcome to blockchain-js</div>
				<br />
				<Wallet />
				<Blocks />
			</div>
		);
	}
}

export default App;
