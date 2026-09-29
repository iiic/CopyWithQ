/**
 * Verifies Subresource Integrity (SRI) hashes:
 * - hashes of modules/*.mjs written in copyWithQ.mjs
 * - hash of copyWithQ.mjs written in readme.md and example-usage.html
 *
 * Usage: node scripts/check-sri.mjs [--fix]
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL( '../', import.meta.url );
const MAIN_FILE = 'copyWithQ.mjs';
const DOCUMENTS = [ 'readme.md', 'example-usage.html' ];

const MODULE_IMPORT_REGEXP = /(modulesImportPath \+ '(\/[\w/]+\.mjs)',\s*')(sha\d{3}-[A-Za-z0-9+/=]+)(')/g;
const MAIN_SCRIPT_REGEXP = /(src="\/copyWithQ\.mjs[^"]*"[^>]*integrity=")(sha\d{3}-[A-Za-z0-9+/=]+)(")/g;

const read = ( /** @type {String} */ path ) => readFileSync( new URL( path, ROOT ), 'utf8' );

export function sriHash ( /** @type {String} */ path, /** @type {String} */ algorithm = 'sha256' )
{
	return algorithm + '-' + createHash( algorithm ).update( readFileSync( new URL( path, ROOT ) ) ).digest( 'base64' );
}

/**
 * @returns {Array<{ file: String, target: String, expected: String, actual: String }>}
 */
export function collectIntegrities ()
{
	const result = [];
	for ( const match of read( MAIN_FILE ).matchAll( MODULE_IMPORT_REGEXP ) ) {
		const target = 'modules' + match[ 2 ];
		const algorithm = match[ 3 ].split( '-' )[ 0 ];
		result.push( { file: MAIN_FILE, target, expected: match[ 3 ], actual: sriHash( target, algorithm ) } );
	}
	for ( const document of DOCUMENTS ) {
		for ( const match of read( document ).matchAll( MAIN_SCRIPT_REGEXP ) ) {
			const algorithm = match[ 2 ].split( '-' )[ 0 ];
			result.push( { file: document, target: MAIN_FILE, expected: match[ 2 ], actual: sriHash( MAIN_FILE, algorithm ) } );
		}
	}
	return result;
}

function fix ()
{
	const main = read( MAIN_FILE ).replace( MODULE_IMPORT_REGEXP, ( _all, before, path, hash, after ) =>
		before + sriHash( 'modules' + path, hash.split( '-' )[ 0 ] ) + after
	);
	writeFileSync( new URL( MAIN_FILE, ROOT ), main );
	for ( const document of DOCUMENTS ) {
		const content = read( document ).replace( MAIN_SCRIPT_REGEXP, ( _all, before, hash, after ) =>
			before + sriHash( MAIN_FILE, hash.split( '-' )[ 0 ] ) + after
		);
		writeFileSync( new URL( document, ROOT ), content );
	}
}

if ( process.argv[ 1 ] === fileURLToPath( import.meta.url ) ) {
	if ( process.argv.includes( '--fix' ) ) {
		fix();
	}
	const integrities = collectIntegrities();
	const wrong = integrities.filter( ( item ) => item.expected !== item.actual );
	wrong.forEach( ( item ) =>
		console.error( `${ item.file }: integrity of ${ item.target } is ${ item.expected }, but should be ${ item.actual }` )
	);
	if ( wrong.length ) {
		console.error( '\n✖ SRI hashes are outdated, run: npm run sri:fix' );
		process.exit( 1 );
	}
	console.log( `✔ SRI: ${ integrities.length } integrity hash(es) OK` );
}
