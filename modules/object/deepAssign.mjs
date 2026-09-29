export class append
{
	constructor ( o = Object )
	{
		const FUNCTION_NAME = 'deepAssign';

		if ( typeof o[ FUNCTION_NAME ] !== 'function' ) {
			o.defineProperty( o.prototype, FUNCTION_NAME, {
				/**
				 * @param {Array<Record<String, any>>} args
				 * @returns {any}
				 */
				value: function ( ...args )
				{
					/** @type {Record<String, any>} */
					let currentLevel = {};

					args.forEach( ( source ) =>
					{
						if ( source instanceof Array ) {
							currentLevel = source;
						} else {
							o.entries( source ).forEach( ( [ key, value ] ) =>
							{
								if ( value instanceof o && o.prototype.hasOwnProperty.call( currentLevel, key ) ) {
									value = o[ FUNCTION_NAME ]( currentLevel[ key ], value );
								}
								currentLevel = { ...currentLevel, [ key ]: value };
							} );
						}
					} );
					return currentLevel;
				},
				writable: false,
				configurable: false,
				enumerable: false,
			} );
		}
	}
}
