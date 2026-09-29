/**
 * Checks files against the basic rules from .editorconfig
 * (UTF-8, LF line endings, final newline, no trailing whitespace, tab indentation)
 * and validates syntax of JSON files.
 *
 * Usage: node scripts/check-files.mjs [files…]  (default: all files tracked by git)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const TEXT_EXTENSIONS = [ '.mjs', '.js', '.ts', '.json', '.jsonc', '.html', '.md', '.yml', '.yaml', '' ];
const TAB_INDENT_EXTENSIONS = [ '.mjs', '.js', '.ts', '.json', '.jsonc', '.html', '.yml', '.yaml' ];
const IGNORED_FILES = [ 'package-lock.json', 'LICENSE' ];

const files = process.argv.length > 2
	? process.argv.slice( 2 )
	: execFileSync( 'git', [ 'ls-files' ], { encoding: 'utf8' } ).split( '\n' ).filter( Boolean );

const errors = [];

for ( const file of files ) {
	const ext = extname( file );
	if ( IGNORED_FILES.some( ( ignored ) => file.endsWith( ignored ) ) || !TEXT_EXTENSIONS.includes( ext ) ) {
		continue;
	}
	const buffer = readFileSync( file );
	const content = buffer.toString( 'utf8' );
	if ( Buffer.compare( Buffer.from( content, 'utf8' ), buffer ) !== 0 ) {
		errors.push( `${ file }: is not valid UTF-8` );
		continue;
	}
	if ( content.length === 0 ) {
		continue;
	}
	if ( content.includes( '\r' ) ) {
		errors.push( `${ file }: contains CR characters (end_of_line = lf)` );
	}
	if ( !content.endsWith( '\n' ) ) {
		errors.push( `${ file }: missing final newline` );
	}
	if ( ext === '.json' ) {
		try {
			JSON.parse( content );
		} catch ( error ) {
			errors.push( `${ file }: invalid JSON (${ error.message })` );
		}
	}
	const yaml = ext === '.yml' || ext === '.yaml'; // YAML forbids tabs, so it is indented by spaces
	content.split( '\n' ).forEach( ( line, index ) =>
	{
		if ( /[ \t]+$/.test( line ) ) {
			errors.push( `${ file }:${ index + 1 }: trailing whitespace` );
		}
		if ( !yaml && TAB_INDENT_EXTENSIONS.includes( ext ) && /^\t* +(?! ?\*)\S/.test( line ) ) {
			errors.push( `${ file }:${ index + 1 }: indented by spaces (indent_style = tab)` );
		}
	} );
}

if ( errors.length ) {
	console.error( errors.join( '\n' ) );
	console.error( `\n✖ ${ errors.length } problem(s)` );
	process.exit( 1 );
}
console.log( `✔ files: ${ files.length } file(s) checked` );
