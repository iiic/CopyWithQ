import { test } from 'node:test';
import assert from 'node:assert/strict';
import { append } from '../modules/string/splitIntoWords.mjs';

new append( String );

test( 'adds non-enumerable, non-writable String.prototype.splitIntoWords', () =>
{
	const descriptor = Object.getOwnPropertyDescriptor( String.prototype, 'splitIntoWords' );
	assert.equal( typeof descriptor.value, 'function' );
	assert.equal( descriptor.enumerable, false );
	assert.equal( descriptor.writable, false );
	assert.equal( descriptor.configurable, false );
} );

test( 'second append does not throw (method already exists)', () =>
{
	assert.doesNotThrow( () => new append( String ) );
} );

test( 'splits by default separators', () =>
{
	assert.deepEqual( 'Hello, world! How are you?'.splitIntoWords(), [ 'Hello', 'world', 'How', 'are', 'you' ] );
} );

test( 'handles czech typography (quotes, dashes, ellipsis, nbsp)', () =>
{
	assert.deepEqual( '„Ahoj“ – světe… konec'.splitIntoWords(), [ 'Ahoj', 'světe', 'konec' ] );
} );

test( 'removes empty words at the start and the end', () =>
{
	assert.deepEqual( '  ...word...  '.splitIntoWords(), [ 'word' ] );
	assert.deepEqual( ''.splitIntoWords(), [] );
} );

test( 'accepts custom separator characters', () =>
{
	assert.deepEqual( 'a_b_c d'.splitIntoWords( '_' ), [ 'a', 'b', 'c d' ] );
} );
