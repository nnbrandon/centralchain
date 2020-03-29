import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchBlocks } from '../actions/Blocks';
import Block from './Block';

class Blocks extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(fetchBlocks());
	}

	_renderBlocks() {
		const { blocks } = this.props;
		if (blocks.length) {
			return blocks.map((block, idx) => {
				return <Block key={idx} block={block} />;
			});
		} else {
			return undefined;
		}
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
	return {
		blocks: state.blockchain.blocks
	};
};

export default connect(mapStateToProps)(Blocks);
