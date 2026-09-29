import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collectIntegrities } from '../scripts/check-sri.mjs';

const read = ( /** @type {String} */ path ) => readFileSync( new URL( '../' + path, import.meta.url ), 'utf8' );

test( 'all SRI hashes are found', () =>
{
	const integrities = collectIntegrities();
	assert.ok( integrities.some( ( item ) => item.target === 'modules/object/deepAssign.mjs' ) );
	assert.ok( integrities.some( ( item ) => item.target === 'modules/string/splitIntoWords.mjs' ) );
	assert.ok( integrities.some( ( item ) => item.file === 'readme.md' ) );
	assert.ok( integrities.some( ( item ) => item.file === 'example-usage.html' ) );
} );

for ( const item of collectIntegrities() ) {
	test( `${ item.file }: integrity of ${ item.target } is up to date`, () =>
	{
		assert.equal( item.expected, item.actual, 'run: npm run sri:fix' );
	} );
}

test( 'version is the same in package.json, copyWithQ.mjs and docs', () =>
{
	const [ major, minor ] = JSON.parse( read( 'package.json' ) ).version.split( '.' );
	const version = major + '.' + minor;
	for ( const match of read( 'copyWithQ.mjs' ).matchAll( /@version (\S+)/g ) ) {
		assert.equal( match[ 1 ], version, 'copyWithQ.mjs @version' );
	}
	for ( const file of [ 'readme.md', 'example-usage.html' ] ) {
		for ( const match of read( file ).matchAll( /copyWithQ\.mjs\?v([\d.]+)/g ) ) {
			assert.equal( match[ 1 ], version, file );
		}
	}
} );

test( 'example settings in the docs are valid JSON', () =>
{
	for ( const file of [ 'readme.md', 'example-usage.html' ] ) {
		const content = read( file ).replace( /<[^>]+>/g, '' ).replace( /&quot;/g, '"' );
		const blocks = content.match( /\{\s*"author"[\s\S]*?\}/g );
		assert.ok( blocks, file );
		blocks.forEach( ( block ) => assert.doesNotThrow( () => JSON.parse( block ), file ) );
	}
} );
