import { GET_WALLET } from '../consts';

function receivedWallet(wallet) {
	return {
		type: GET_WALLET,
		payload: wallet
	};
}

export function fetchWallet() {
	return function(dispatch) {
		return fetch('http://localhost:8080/api/wallet')
			.then((res) => {
				return res.json();
			})
			.then((wallet) => {
				dispatch(receivedWallet(wallet));
			})
			.catch((err) => {
				console.log(err);
			});
	};
}
