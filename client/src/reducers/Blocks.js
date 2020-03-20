import { GET_BLOCKS } from '../consts';

const initialState = {
	blocks: []
};

// avoid mutations in redux
function blocksReducer(state = initialState, action) {
	if (action.type === GET_BLOCKS) {
		console.log(action.payload);
		return {
			blocks: action.payload
		};
	}
	return state;
}

export default blocksReducer;
