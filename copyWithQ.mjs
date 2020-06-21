/**
* @private
* @module CopyWithQPrivate
* @classdesc CopyWithQ Automatic Quotes - private part
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/copywithq-automatic-quotes
* @link https://github.com/iiic/copywithq
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2011
* @version 2.0
* @readonly
*/
const CopyWithQPrivate = class
{

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		wordSeparators: [ ' ', ' ', '	', '.', ',', ';', '?', '!', '…', ':', '„', '“', "\n", '+', '–', '-' ],
		maxWordsAsIdentifier: 5,
		maxWordSearchLength: 20,
		linkListenerOnKeyCode: 76, // L key
		autoQuotesMinLength: 90,
		dataTypes: [ CopyWithQ.URL_LIST, CopyWithQ.PLAIN_TEXT, CopyWithQ.HTML ],
		scrollToTextFragment: {
			autoAdd: true,
			hashPrefix: ':~:text=',
		},
		resultSnippet: {
			citePrefix: ' —',
			citeSeparator: ', ',
		},
		modulesImportPath: 'https://iiic.dev/js/modules',
		autoRun: true,
	};

	/**
	 * @public
	 * @type {String | HTMLLinkElement | null}
	 */
	author = null;

	/**
	 * @public
	 * @type {Function}
	 */
	importWithIntegrity;

	async initImportWithIntegrity ( /** @type {Object} */ settings )
	{
		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			// @ts-ignore
			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{
				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;
				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
							// @ts-ignore
							import( path ).then( ( /** @type {Module} */ module ) =>
							{
								resolve( module );
							} );
						} );
					};
					resolve( true );
				} else {
					throw 'Security Error : Import with integrity module is missing! You can try to skip this error by adding ' + SKIP_SECURITY_URL + ' hash into website URL';
				}
			} );
		} );
	}

	getResultSnippetElementBy ( /** @type {String} */ canonicalLink, /** @type {DocumentFragment} */ fragment )
	{

		/** @type {HTMLQuoteElement} */
		const blockquote = ( document.createElement( 'BLOCKQUOTE' ) );

		blockquote.cite = canonicalLink;
		blockquote.appendChild( fragment );

		/** @type {HTMLElement} */
		const footer = document.createElement( 'FOOTER' );

		footer.appendChild( document.createTextNode( this.settings.resultSnippet.citePrefix ) );

		/** @type {HTMLLinkElement} */
		const author = ( document.createElement( 'A' ) );

		if ( this.author ) {
			if ( typeof this.author === 'string' ) {
				footer.appendChild( document.createTextNode( this.author ) );
			} else { // HTMLLinkElement
				footer.appendChild( this.author );
			}
			footer.appendChild( document.createTextNode( this.settings.resultSnippet.citeSeparator ) );
		}

		/** @type {HTMLElement} */
		const cite = document.createElement( 'CITE' );

		/** @type {HTMLLinkElement} */
		const citeLink = ( document.createElement( 'A' ) );

		citeLink.appendChild( document.createTextNode( document.title ? document.title : canonicalLink ) );
		citeLink.href = canonicalLink;
		cite.appendChild( citeLink );
		footer.appendChild( cite );

		blockquote.appendChild( footer );
		return blockquote;
	}

	getSelectedPlainText ( /** @type {String} */ canonicalLink, /** @type {String} */ selectedText )
	{
		let result = selectedText + "\n" + this.settings.resultSnippet.citePrefix;
		if ( this.author ) {
			result += this.author + this.settings.resultSnippet.citeSeparator;
		}
		return result + canonicalLink;
	}

	getBorderWords (/** @type {String} */ safeSelectedText, /** @type {String} */ bodyText, /** @type {Array} */ words )
	{
		const firstMatch = bodyText.indexOf( safeSelectedText );
		const lastMatch = bodyText.lastIndexOf( safeSelectedText );

		let minimalStart = null;
		let minimalEnd = null;
		if ( lastMatch !== -1 && firstMatch === lastMatch ) {
			const selectedEnd = lastMatch + safeSelectedText.length;
			const lastWordLength = words[ words.length - 1 ].length;
			for ( let i = 1; i <= this.settings.maxWordSearchLength; i++ ) {
				if ( !minimalStart && this.settings.wordSeparators.includes( bodyText.substr( lastMatch - i, 1 ) ) ) {
					minimalStart = bodyText.substr( lastMatch - i + 1, words[ 0 ].length + i - 1 );
				}
				if ( !minimalEnd && this.settings.wordSeparators.includes( bodyText.substr( selectedEnd + i - 1, 1 ) ) ) {
					minimalEnd = bodyText.substr( selectedEnd - lastWordLength, lastWordLength + i - 1 );
					if ( this.settings.wordSeparators.includes( minimalEnd.substr( -1 ) ) ) {
						minimalEnd = bodyText.substr( selectedEnd - lastWordLength - 1, lastWordLength + i - 1 );
					}
				}
				if ( minimalStart && minimalEnd ) {
					return [ minimalStart, minimalEnd ];
				}
			}
		}
		return null;
	}

	isUniqueIn ( /** @type {String} */ search, /** @type {String} */ bodyText )
	{
		const regexp = new RegExp( search, 'g' );
		const count = ( bodyText.match( regexp ) || [] ).length;
		if ( count === 1 ) {
			return true;
		}
		return false;
	}

	constructLink ( /** @type {String} */ selectedText ) // bude to fungovat ? když se tam děje něco asynchroně, tak jestli to nepředěla na async tohle možná otextovat s chrome funkcí zpoždění
	{
		const url = new URL( window.location.href );
		if ( this.settings.scrollToTextFragment.autoAdd ) {
			let safeSelectedText = selectedText.trim().toLowerCase();
			const bodyText = document.body.innerText.toLowerCase();

			// @ts-ignore
			const words = safeSelectedText.splitIntoWords();

			const borderWords = this.getBorderWords( safeSelectedText, bodyText, words );
			if ( borderWords ) {
				let [ minimalStart, minimalEnd ] = borderWords;
				if ( words[ 0 ] !== minimalStart ) {
					safeSelectedText = minimalStart + safeSelectedText.substr( words[ 0 ].length );
					words[ 0 ] = minimalStart;
				}
				if ( words[ words.length - 1 ] !== minimalEnd ) {
					const lastWordIndex = words.length - 1;
					safeSelectedText = safeSelectedText.substr( 0, safeSelectedText.length - words[ lastWordIndex ].length ) + minimalEnd;
					words[ lastWordIndex ] = minimalEnd;
				}
				let scrollToTextFragmentPossible = false;
				for ( let i = 1; i <= this.settings.maxWordsAsIdentifier; i++ ) {
					if ( this.isUniqueIn( minimalStart, bodyText ) ) {
						scrollToTextFragmentPossible = true;
						break;
					} else if ( words[ i ] ) {
						const position = safeSelectedText.indexOf( words[ i ] );
						minimalStart = safeSelectedText.substr( 0, position + words[ i ].length );
					} else {
						break;
					}
				}
				const wordsLength = words.length - 1;
				const position = safeSelectedText.lastIndexOf( words[ wordsLength ] );
				if ( scrollToTextFragmentPossible ) {
					scrollToTextFragmentPossible = false;
					const breakFor = wordsLength - this.settings.maxWordsAsIdentifier;
					const startPosition = wordsLength - 1;
					for ( let i = startPosition; i > breakFor; i-- ) {
						if ( this.isUniqueIn( minimalEnd, bodyText ) ) {
							scrollToTextFragmentPossible = true;
							break;
						} else if ( words[ i ] ) {
							minimalEnd = safeSelectedText.substr( safeSelectedText.lastIndexOf( words[ i ] ) );
						} else {
							break;
						}
					}
				}
				if ( scrollToTextFragmentPossible ) {
					url.hash = this.settings.scrollToTextFragment.hashPrefix + minimalStart + ',' + minimalEnd;
					return url;
				}
			}
		}
		return url;
	}
}

/**
* @public
* @module CopyWithQ
* @classdesc CopyWithQ Automatic Quotes!
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/copywithq-automatic-quotes
* @link https://github.com/iiic/copywithq
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2011
* @version 2.0
*/
export class CopyWithQ
{
	static URL_LIST = 'text/uri-list';
	static PLAIN_TEXT = 'text/plain';
	static HTML = 'text/html';

	/**
	 * @private
	 * @description '#private' is not currently supported by Firefox, so that's why '_private'
	 */
	_private;

	constructor (
		/** @type {String | HTMLLinkElement | null} */ author = null,
		/** @type {Object | null} */ settings = null
	)
	{
		this._private = new CopyWithQPrivate;
		this._private.author = author;

		this._private.initImportWithIntegrity( settings ).then( () =>
		{
			if ( settings ) {
				this.setSettings( settings ).then( () =>
				{
					if ( this.settings.autoRun ) {
						this.run();
					}
				} );
			} else if ( this.settings.autoRun ) {
				this.run();
			}
		} );
	}

	get importWithIntegrity ()
	{
		return this._private.importWithIntegrity;
	}

	/**
	 * @description : get script settings
	 * @returns {Object} settings of self
	 */
	get settings ()
	{
		return this._private.settings;
	}

	async setSettings ( /** @type {Object} */ inObject )
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
				// @ts-ignore
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				// @ts-ignore
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	addCopyListener ()
	{
		if ( this.settings.autoQuotesMinLength ) {
			document.body.addEventListener( 'copy', ( /** @type {ClipboardEvent} */ event ) =>
			{
				/** @type {Selection} */
				const selection = document.getSelection();

				/** @type {String} */
				let selectedText = selection.toString();

				if ( selectedText.length >= this.settings.autoQuotesMinLength ) {
					while ( this.settings.wordSeparators.includes( selectedText.charAt( 0 ) ) ) {
						selectedText = selectedText.substr( 1 );
					}

					/** @type {String} */
					const canonicalLink = this._private.constructLink( selectedText ).href;

					/** @type {DataTransfer} */
					const dataTransfer = event.clipboardData;

					if ( this.settings.dataTypes.includes( CopyWithQ.URL_LIST ) ) {
						dataTransfer.setData( CopyWithQ.URL_LIST, canonicalLink );
					}
					if ( this.settings.dataTypes.includes( CopyWithQ.PLAIN_TEXT ) ) {

						/** @type {String} */
						const selectedPlainText = this._private.getSelectedPlainText( canonicalLink, selectedText );

						dataTransfer.setData( CopyWithQ.PLAIN_TEXT, selectedPlainText );
					}
					if ( this.settings.dataTypes.includes( CopyWithQ.HTML ) ) {

						/** @type {DocumentFragment} */
						const fragment = selection.getRangeAt( selection.rangeCount - 1 ).cloneContents();

						/** @type {HTMLQuoteElement} */
						const blockquote = this._private.getResultSnippetElementBy( canonicalLink, fragment );

						dataTransfer.setData( CopyWithQ.HTML, blockquote.outerHTML );
					}

					event.preventDefault();
					event.stopPropagation();
				}
			}, false );
		}
	}

	addLinkListener ()
	{
		if ( this.settings.linkListenerOnKeyCode ) {
			document.addEventListener( 'keyup', ( /** @type {KeyboardEvent} */ event ) =>
			{
				if ( event.ctrlKey && event.shiftKey && event.keyCode === this.settings.linkListenerOnKeyCode ) {
					let selectedText = window.getSelection().toString();
					while ( this.settings.wordSeparators.includes( selectedText.charAt( 0 ) ) ) {
						selectedText = selectedText.substr( 1 );
					}
					if ( selectedText ) {
						const canonicalLink = this._private.constructLink( selectedText ).href;
						if ( confirm( canonicalLink ) ) {
							navigator.clipboard.writeText( canonicalLink );
						}
					}
				}
			}, false );
		}
	}

	async prepareAsyncMethods ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/string/splitIntoWords.mjs',
				'v1xNwYk+N83b8eyzPmlz/I6hBWAnwCU1mCx62E61SGE='
				// @ts-ignore
			).then( (/** @type { Module } */ splitIntoWords ) =>
			{
				new splitIntoWords.append( String );
				resolve( true );
			} );
		} );
	}

	run ()
	{
		this.prepareAsyncMethods().then( () =>
		{
			this.addCopyListener();
			this.addLinkListener();
		} );

		return true;
	}

}
