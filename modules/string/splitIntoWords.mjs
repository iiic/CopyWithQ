export class append
{
	constructor ( s = String )
	{
		const FUNCTION_NAME = 'splitIntoWords';

		if ( typeof s.prototype[ FUNCTION_NAME ] !== 'function' ) {
			Object.defineProperty( s.prototype, FUNCTION_NAME, {
				/**
				 * @this {String}
				 * @param {String} [chars]
				 * @returns {Array<String>}
				 */
				value: function ( chars )
				{
					const TEMP_SEPARATOR = '{this is separator string used as temporarily replacement}';

					const regexpChars = chars ? chars : '  	.,;?!…:„“–+-';

					const regexp = new RegExp( '([' + regexpChars + ']+)', 'g' );

					const words = this.replace( regexp, TEMP_SEPARATOR ).split( TEMP_SEPARATOR );

					return words.filter( Boolean );
				},
				writable: false,
				configurable: false,
				enumerable: false,
			} );
		}
	}
}
