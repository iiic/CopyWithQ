import { test } from 'node:test';
import assert from 'node:assert/strict';
import { append } from '../modules/object/deepAssign.mjs';

new append( Object );

test( 'adds Object.deepAssign', () =>
{
	assert.equal( typeof Object.deepAssign, 'function' );
	assert.equal( Object.keys( {} ).includes( 'deepAssign' ), false, 'must not be enumerable' );
} );

test( 'second append does not throw (method already exists)', () =>
{
	assert.doesNotThrow( () => new append( Object ) );
} );

test( 'merges nested objects', () =>
{
	const defaults = { a: 1, nested: { x: 1, y: 2 }, list: [ 1, 2 ] };
	const result = Object.deepAssign( defaults, { nested: { y: 3, z: 4 }, b: 2 } );
	assert.deepEqual( result, { a: 1, b: 2, nested: { x: 1, y: 3, z: 4 }, list: [ 1, 2 ] } );
} );

test( 'does not mutate the source objects', () =>
{
	const defaults = { nested: { x: 1 } };
	const settings = { nested: { y: 2 } };
	Object.deepAssign( defaults, settings );
	assert.deepEqual( defaults, { nested: { x: 1 } } );
	assert.deepEqual( settings, { nested: { y: 2 } } );
} );

test( 'overwrites scalar values and replaces arrays', () =>
{
	const result = Object.deepAssign( { a: 1, list: [ 1, 2, 3 ] }, { a: null, list: [ 9 ] } );
	assert.deepEqual( result, { a: null, list: [ 9 ] } );
} );

test( 'merges keys that exist on Object constructor or prototype (name, constructor)', () =>
{
	const result = Object.deepAssign( { a: 1 }, { name: { x: 1 }, toString: { y: 2 } } );
	assert.deepEqual( result, { a: 1, name: { x: 1 }, toString: { y: 2 } } );
} );

test( 'returns an empty object without arguments', () =>
{
	assert.deepEqual( Object.deepAssign(), {} );
} );
