import React from 'react';

const Block = (props) => {
	const { timestamp, hash, data } = props.block;
	const hashDisplay = `${hash.substring(0, 15)}...`;
	const stringData = JSON.stringify(data);
	const dataDisplay = stringData.length > 35 ? `${stringData.substring(0, 35)}` : stringData;
	return (
		<div className="Block">
			<div>Hash: {hashDisplay}</div>
			<div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
			<div>Data: {dataDisplay}</div>
		</div>
	);
};

export default Block;
