import React from 'react';

function _renderRecipients(recipients, outputMap) {
	return recipients.map((recipient) => {
		return (
			<div key={recipient}>
				To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
			</div>
		);
	});
}

const Transaction = (props) => {
	const { input, outputMap } = props.transaction;
	const recipients = Object.keys(outputMap);

	return (
		<div>
			<div>
				From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}
			</div>
			{_renderRecipients(recipients, outputMap)}
		</div>
	);
};

export default Transaction;
