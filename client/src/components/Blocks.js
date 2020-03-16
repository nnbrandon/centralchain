import React, { Component } from 'react';

class Blocks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			blocks: []
		};
	}

	componentDidMount() {
		fetch('http://localhost:8080/api/blocks')
			.then((res) => {
				return res.json();
			})
			.then((json) => {
				this.setState({ blocks: json });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	_renderBlocks() {
		const { blocks } = this.state;
		return blocks.map((block, idx) => {
			return <div key={idx}>{block.hash}</div>;
		});
	}

	render() {
		return (
			<div>
				<h3>Blocks</h3>
				{/* {this.state.blocks.map((block) => {
					return <div key={block.hash}>{block.hash}</div>;
				})} */}
				{this._renderBlocks()}
			</div>
		);
	}
}

export default Blocks;
