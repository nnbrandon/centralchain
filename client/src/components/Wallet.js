import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchWallet } from '../actions/Wallet';

class Wallet extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(fetchWallet());
	}

	render() {
		const { address, balance } = this.props;

		return (
			<div className="WalletInfo">
				<div>Address: {address}</div>
				<div>Balance: {balance}</div>
				<br />
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		address: state.wallet.address,
		balance: state.wallet.balance
	};
};

export default connect(mapStateToProps)(Wallet);
