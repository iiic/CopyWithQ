export class append
{
	constructor ( s = String )
	{
		const FUNCTION_NAME = 'splitIntoWords';

		if ( typeof s()[ FUNCTION_NAME ] !== 'function' ) {
			Object.defineProperty( s.prototype, FUNCTION_NAME, {
				value: function ( /** @type {String} */ chars )
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
