const cryptoHash = require('../src/crypto-hash');

describe('cryptoHash()', () => {
	it('generates a SHA-256 hashed output', () => {
		expect(cryptoHash('hi')).toEqual(
			'8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'.toLowerCase()
		);
	});

	it('produces the same hash with the same input arguments in any order', () => {
		expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
	});
});
