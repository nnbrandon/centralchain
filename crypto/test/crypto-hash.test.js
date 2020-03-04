const cryptoHash = require('../src/crypto-hash');

describe('cryptoHash()', () => {
	it('generates a SHA-256 hashed output', () => {
		expect(cryptoHash('hi')).toEqual(
			'b49177e05868b7af8e82a644c1ce20e521af46497adeaffe861d294d9b4bb75e'.toLowerCase()
		);
	});

	it('produces the same hash with the same input arguments in any order', () => {
		expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
	});

	it('produces a unique hash when the properties have changed on an input', () => {
		const foo = {};
		const originalHash = cryptoHash(foo);
		foo['a'] = 'a';

		expect(cryptoHash(foo)).not.toEqual(originalHash);
	});
});
