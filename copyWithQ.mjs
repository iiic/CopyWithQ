/**
* @private
* @module CopyWithQInternal
* @classdesc CopyWithQ Automatic Quotes - private part
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/copywithq-automatic-quotes
* @link https://github.com/iiic/copywithq
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2011
* @version 2.1
* @readonly
*/
const CopyWithQInternal = class
{

	static COPY_EVENT_NAME = 'copy';
	static KEYUP_EVENT_NAME = 'keyup';

	static ANCHOR_NODE_NAME = 'A';
	static BLOCKQUOTE_NODE_NAME = 'BLOCKQUOTE';
	static CITE_NODE_NAME = 'CITE';
	static FOOTER_NODE_NAME = 'FOOTER';

	static STRING_OBJECT_NAME = 'String';
	static ANCHOR_ELEMENT_NAME = 'HTMLAnchorElement';

	static NEWLINE = "\n";

	/**
	* @public
	* @description colors used for browser's console output
	*/
	static CONSOLE = {
		CLASS_NAME: 'color: gray',
		METHOD_NAME: 'font-weight: normal; color: green',
		INTEREST_PARAMETER: 'font-weight: normal; font-size: x-small; color: blue',
		EVENT_TEXT: 'color: orange',
		WARNING: 'color: red',
	};

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		author: null, // can be: null, String or HTMLAnchorElement
		possibleAuthorQuerySelectors: [ 'article .p-author', '[itemtype="https://schema.org/Article"] [itemprop="author"]' ],
		wordSeparators: [ ' ', ' ', '	', '.', ',', ';', '?', '!', '…', ':', '„', '“', "\n", '+', '–', '-' ],
		maxWordsAsIdentifier: 5,
		maxWordSearchLength: 20,
		linkListenerOnKeyCode: 76, // L key
		autoQuotesMinLength: 180,
		dataTypes: [ CopyWithQ.URL_LIST, CopyWithQ.PLAIN_TEXT, CopyWithQ.HTML ],
		scrollToTextFragment: {
			autoAdd: true,
			hashPrefix: ':~:text=',
		},
		resultSnippet: {
			citePrefix: ' — ',
			citeSeparator: ', ',
		},
		modulesImportPath: 'https://iiic.dev/js/modules',
		autoRun: true,
	};

	/**
	 * @public
	 * @type {Function}
	 */
	importWithIntegrity;

	async initImportWithIntegrity ( /** @type {Object} */ settings = null )
	{

		console.groupCollapsed( '%c CopyWithQInternal %c initImportWithIntegrity %c(' + ( settings === null ? 'without settings' : 'with settings' ) + ')',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME,
			CopyWithQ.CONSOLE.INTEREST_PARAMETER
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type { Function } */ resolve ) =>
		{

			/** @type {Object} */
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;

			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{

				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;

				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					console.warn( '%c CopyWithQInternal %c initImportWithIntegrity %c without security!',
						CopyWithQ.CONSOLE.CLASS_NAME,
						CopyWithQ.CONSOLE.METHOD_NAME,
						CopyWithQ.CONSOLE.WARNING
					);
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
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

	async setSettings ( /** @type {Object} */ inObject )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c setSettings',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				this.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	getResultSnippetElementBy ( /** @type {String} */ canonicalLink, /** @type {DocumentFragment} */ fragment )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c getResultSnippetElementBy',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );

		/** @type {HTMLQuoteElement} */
		const blockquote = ( document.createElement( CopyWithQInternal.BLOCKQUOTE_NODE_NAME ) );

		blockquote.cite = canonicalLink;
		blockquote.appendChild( fragment );

		/** @type {HTMLElement} */
		const footer = document.createElement( CopyWithQInternal.FOOTER_NODE_NAME );

		footer.appendChild( document.createTextNode( this.settings.resultSnippet.citePrefix ) );
		if ( this.settings.author ) {
			if ( this.settings.author.constructor.name === CopyWithQInternal.STRING_OBJECT_NAME ) {
				footer.appendChild( document.createTextNode( this.settings.author ) );
			} else if ( this.settings.author.constructor.name === CopyWithQInternal.ANCHOR_ELEMENT_NAME && this.settings.author.href ) {

				/** @type {HTMLAnchorElement} */
				const author = ( document.createElement( CopyWithQInternal.ANCHOR_NODE_NAME ) );

				author.rel = 'author';
				author.href = this.settings.author.href;
				if ( this.settings.author.title ) {
					author.title = this.settings.author.title;
				}
				author.appendChild( document.createTextNode( this.settings.author.textContent ) );
				footer.appendChild( author );
			}
			footer.appendChild( document.createTextNode( this.settings.resultSnippet.citeSeparator ) );
		}

		/** @type {HTMLElement} */
		const cite = document.createElement( CopyWithQInternal.CITE_NODE_NAME );

		/** @type {HTMLAnchorElement} */
		const citeLink = ( document.createElement( CopyWithQInternal.ANCHOR_NODE_NAME ) );

		citeLink.appendChild( document.createTextNode( document.title ? document.title : canonicalLink ) );
		citeLink.href = canonicalLink;
		cite.appendChild( citeLink );
		footer.appendChild( cite );
		blockquote.appendChild( footer );
		console.groupEnd();
		return blockquote;
	}

	getSelectedPlainText ( /** @type {String} */ canonicalLink, /** @type {String} */ selectedText )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c getSelectedPlainText',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		let result = selectedText + CopyWithQInternal.NEWLINE + this.settings.resultSnippet.citePrefix;
		if ( this.settings.author ) {
			const author = this.settings.author.constructor.name === CopyWithQInternal.ANCHOR_ELEMENT_NAME ? this.settings.author.textContent : this.settings.author;
			result += author + this.settings.resultSnippet.citeSeparator;
		}
		return result + canonicalLink;
	}

	getBorderWords (/** @type {String} */ safeSelectedText, /** @type {String} */ bodyText, /** @type {Array} */ words )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c getBorderWords',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

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
		console.groupCollapsed( '%c CopyWithQInternal %c isUniqueIn',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		const regexp = new RegExp( search, 'g' );
		const count = ( bodyText.match( regexp ) || [] ).length;
		if ( count === 1 ) {
			return true;
		}
		return false;
	}

	copyEventListener ( /** @type {ClipboardEvent} */ event )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c copyEventListener',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );

		/** @type {Selection} */
		const selection = document.getSelection();

		/** @type {String} */
		let selectedText = selection.toString();

		if ( selectedText.length >= this.settings.autoQuotesMinLength ) {
			while ( this.settings.wordSeparators.includes( selectedText.charAt( 0 ) ) ) {
				selectedText = selectedText.substr( 1 );
			}

			/** @type {DataTransfer} */
			const dataTransfer = event.clipboardData;

			const canonicalLink = this.constructLink( selectedText ).href;
			if ( this.settings.dataTypes.includes( CopyWithQ.URL_LIST ) ) {
				dataTransfer.setData( CopyWithQ.URL_LIST, canonicalLink );
			}
			if ( this.settings.dataTypes.includes( CopyWithQ.PLAIN_TEXT ) ) {

				/** @type {String} */
				const selectedPlainText = this.getSelectedPlainText( canonicalLink, selectedText );

				dataTransfer.setData( CopyWithQ.PLAIN_TEXT, selectedPlainText );
			}
			if ( this.settings.dataTypes.includes( CopyWithQ.HTML ) ) {

				/** @type {DocumentFragment} */
				const fragment = selection.getRangeAt( selection.rangeCount - 1 ).cloneContents();

				/** @type {HTMLQuoteElement} */
				const blockquote = this.getResultSnippetElementBy( canonicalLink, fragment );

				dataTransfer.setData( CopyWithQ.HTML, blockquote.outerHTML );
			}
			event.preventDefault();
			event.stopPropagation();
			console.groupEnd();
		}
	}

	keyupEventListener ( /** @type {KeyboardEvent} */ event )
	{
		console.groupCollapsed( '%c CopyWithQInternal %c keyupEventListener',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		if ( event.ctrlKey && event.shiftKey && event.keyCode === this.settings.linkListenerOnKeyCode ) {
			let selectedText = window.getSelection().toString();
			while ( this.settings.wordSeparators.includes( selectedText.charAt( 0 ) ) ) {
				selectedText = selectedText.substr( 1 );
			}
			if ( selectedText ) {
				const canonicalLink = this.constructLink( selectedText ).href;
				if ( confirm( canonicalLink ) ) {
					navigator.clipboard.writeText( canonicalLink );
				}
			}
		}
	}

	constructLink ( /** @type {String} */ selectedText )
	{
		console.groupCollapsed( '%c CopyWithQ %c constructLink',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);
		console.debug( { selectedText } );

		const currentUrl = new URL( window.location.href );
		if ( this.settings.scrollToTextFragment.autoAdd ) {
			let safeSelectedText = selectedText.trim().toLowerCase();
			const bodyText = document.body.innerText.toLowerCase();

			/** @type {Array} */
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
					currentUrl.hash = this.settings.scrollToTextFragment.hashPrefix + minimalStart + ',' + minimalEnd;
					console.groupEnd();
					return currentUrl;
				}
			}
		}
		console.groupEnd();
		return currentUrl;
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
* @version 2.1
*/
export class CopyWithQ extends CopyWithQInternal
{
	static URL_LIST = 'text/uri-list';
	static PLAIN_TEXT = 'text/plain';
	static HTML = 'text/html';

	constructor ( /** @type {HTMLScriptElement | null} */ settingsElement = null )
	{
		console.groupCollapsed( '%c CopyWithQ',
			CopyWithQ.CONSOLE.CLASS_NAME
		);
		console.debug( '%c' + 'constructor',
			CopyWithQ.CONSOLE.METHOD_NAME,
			[ { arguments } ]
		);

		super();

		/** @type {Object} */
		const settings = settingsElement ? JSON.parse( settingsElement.text ) : null;

		this.initImportWithIntegrity( settings ).then( () =>
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

		console.groupEnd();
	}

	addCopyListener ()
	{
		console.log( '%c CopyWithQInternal %c addCopyListener',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		if ( this.settings.autoQuotesMinLength ) {
			document.body.addEventListener( CopyWithQ.COPY_EVENT_NAME, this.copyEventListener.bind( this ), {
				capture: false,
				once: false,
				passive: false,
			} );
		}
	}

	addLinkListener ()
	{
		console.log( '%c CopyWithQInternal %c addLinkListener',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		if ( this.settings.linkListenerOnKeyCode ) {
			document.addEventListener( CopyWithQ.KEYUP_EVENT_NAME, this.keyupEventListener.bind( this ), {
				capture: false,
				once: false,
				passive: true,
			} );
		}
	}

	async initSplitIntoWords ()
	{
		console.log( '%c CopyWithQInternal %c initSplitIntoWords',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		return this.importWithIntegrity(
			this.settings.modulesImportPath + '/string/splitIntoWords.mjs',
			'sha256-v1xNwYk+N83b8eyzPmlz/I6hBWAnwCU1mCx62E61SGE='
		).then( (/** @type { Module } */ splitIntoWords ) =>
		{
			new splitIntoWords.append( String );
			return true;
		} );
	}

	checkRequirements ()
	{
		console.debug( '%c CopyWithQ %c checkRequirements',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		if ( !this.settings ) {
			throw new Error( 'Settings object is missing' );
		}
	}

	getAuthor ()
	{
		console.groupCollapsed( '%c CopyWithQ %c getAuthor',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		if ( !this.settings.author ) {

			/** @type {Array} */
			const qs = this.settings.possibleAuthorQuerySelectors;

			const qsLength = qs.length;
			for ( let i = 0; i < qsLength; i++ ) {

				/** @type {HTMLElement} */
				let el = document.querySelector( qs[ i ] );

				if ( el && el.textContent ) {
					this.settings.author = el;
					console.debug( el );
					break;
				}
			}
		}
		console.groupEnd();
	}

	async run ()
	{
		console.groupCollapsed( '%c CopyWithQ %c run',
			CopyWithQ.CONSOLE.CLASS_NAME,
			CopyWithQ.CONSOLE.METHOD_NAME
		);

		this.checkRequirements();
		this.getAuthor();
		await this.initSplitIntoWords();
		this.addCopyListener();
		this.addLinkListener();

		console.groupEnd();

		return this;
	}

}

new CopyWithQ( document.getElementById( 'copy-with-q-settings' ) );
