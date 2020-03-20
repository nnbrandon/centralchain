import { GET_WALLET } from '../consts';

const initialState = {
	address: '',
	balance: ''
};

// avoid mutations in redux
function walletReducer(state = initialState, action) {
	if (action.type === GET_WALLET) {
		return {
			address: action.payload.address,
			balance: action.payload.balance
		};
	}
	return state;
}

export default walletReducer;
