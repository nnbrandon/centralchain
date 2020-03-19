import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchBlocks } from '../actions/Blocks';

class Blocks extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(fetchBlocks());
	}

	_renderBlocks() {
		const { blocks } = this.props;
		return blocks.map((block, idx) => {
			return <div key={idx}>{block.hash}</div>;
		});
	}

	render() {
		return (
			<div>
				<h3>Blocks</h3>
				{this._renderBlocks()}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	console.log(state);
	return { blocks: state.blocks };
};

export default connect(mapStateToProps)(Blocks);
