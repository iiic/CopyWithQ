/**
 * @param {String} path
 * @param {String} [integrity]
 * @returns {Promise<any>} imported module
 */
export function importWithIntegrity ( path, integrity )
{
	const POSSIBLE_HASHES = [ 'sha256', 'sha384', 'sha512' ]; // same length… 6 chars
	const INTEGRITY_DIVIDER = '-';

	if ( !integrity ) {
		integrity = 'is missing!';
	}
	if (
		!POSSIBLE_HASHES.includes( integrity.substring( 0, 6 ).toLowerCase() )
		|| integrity.substring( 6, 7 ) !== INTEGRITY_DIVIDER
	) {
		integrity = POSSIBLE_HASHES[ 0 ] + INTEGRITY_DIVIDER + integrity;
	}

	const element = /** @type {HTMLScriptElement} */ ( document.createElement( 'SCRIPT' ) ); // link rel="preload" also working, but NOT in Firefox :(

	element.type = 'module';
	element.src = path;
	element.integrity = integrity;
	element.setAttribute( 'crossorigin', 'anonymous' );
	document.head.appendChild( element );
	return import( path );
}
