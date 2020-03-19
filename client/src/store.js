import { createStore, applyMiddleware } from 'redux';
import blocksReducer from '../src/reducers/Blocks';
import thunk from 'redux-thunk';

const store = createStore(blocksReducer, applyMiddleware(thunk));

export default store;
