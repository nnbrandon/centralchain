import { GET_BLOCKS } from '../consts';

function receivedBlocks(blocks) {
	return {
		type: GET_BLOCKS,
		payload: blocks
	};
}

export function fetchBlocks() {
	return function(dispatch) {
		return fetch('http://localhost:8080/api/blocks')
			.then((res) => {
				return res.json();
			})
			.then((blocks) => {
				dispatch(receivedBlocks(blocks));
			})
			.catch((err) => {
				console.log(err);
			});
	};
}
