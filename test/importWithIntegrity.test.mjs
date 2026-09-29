import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { setupDom, MODULES_URL } from './helpers/dom.mjs';
import { importWithIntegrity } from '../modules/importWithIntegrity.mjs';

before( () => setupDom() );

test( 'imports the module and adds script element with integrity', async () =>
{
	const path = MODULES_URL + '/string/splitIntoWords.mjs';
	const module = await importWithIntegrity( path, 'sha384-abc' );
	assert.equal( typeof module.append, 'function' );

	const script = document.head.querySelector( `script[src="${ path }"]` );
	assert.ok( script );
	assert.equal( script.type, 'module' );
	assert.equal( script.integrity, 'sha384-abc' );
	assert.equal( script.getAttribute( 'crossorigin' ), 'anonymous' );
} );

test( 'adds sha256 prefix when the algorithm is missing', async () =>
{
	const path = MODULES_URL + '/object/deepAssign.mjs';
	await importWithIntegrity( path, 'abc' );
	assert.equal( document.head.querySelector( `script[src="${ path }"]` ).integrity, 'sha256-abc' );
} );
