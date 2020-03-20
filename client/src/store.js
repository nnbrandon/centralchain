import { createStore, applyMiddleware, combineReducers } from 'redux';
import blocksReducer from '../src/reducers/Blocks';
import walletReducer from '../src/reducers/Wallet';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
	blockchain: blocksReducer,
	wallet: walletReducer
});
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
