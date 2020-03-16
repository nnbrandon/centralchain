import React, { Component } from 'react';
import Blocks from './Blocks';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			walletInfo: {
				address: 'fooxv6',
				balance: '9999'
			}
		};
	}

	componentDidMount() {
		fetch('http://localhost:8080/api/wallet')
			.then((res) => {
				return res.json();
			})
			.then((json) => {
				this.setState({ walletInfo: json });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	render() {
		const { address, balance } = this.state.walletInfo;
		return (
			<React.Fragment>
				<div>Welcome to the blockchain...</div>
				<div>Address: {address}</div>
				<div>Balance: {balance}</div>
				<br />
				<Blocks />
			</React.Fragment>
		);
	}
}

export default App;
