import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { setupDom, silenceConsole, addSettingsElement, MODULES_URL } from './helpers/dom.mjs';

const LONG_TEXT = 'Simple javascript for automatic citation creation. When user selects a part of the text and copies it in the usual way, the citation is automatically added to the copied text.';

const BODY = `
	<article>
		<h1>Article title</h1>
		<p id="first">${ LONG_TEXT }</p>
		<p id="second">Another paragraph with other words. Another paragraph with other words.</p>
		<a href="https://iiic.dev/" class="p-author" title="Author page">Michal</a>
	</article>
	<div itemtype="https://schema.org/Article"><span itemprop="author">Jana</span></div>
`;

const SETTINGS = {
	author: 'John Doe',
	autoQuotesMinLength: 40,
	modulesImportPath: MODULES_URL,
};

/** @type {typeof import('../copyWithQ.mjs').CopyWithQ} */
let CopyWithQ;

const waitFor = async ( /** @type {Function} */ condition, timeout = 2000 ) =>
{
	const start = Date.now();
	while ( !condition() ) {
		if ( Date.now() - start > timeout ) {
			throw new Error( 'waitFor timeout' );
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 5 ) );
	}
};

const createInstance = async ( /** @type {Object} */ settings = {} ) =>
{
	const allSettings = { ...SETTINGS, autoRun: false, ...settings };
	const instance = new CopyWithQ( addSettingsElement( allSettings ) );
	await instance.initImportWithIntegrity( allSettings );
	await instance.setSettings( allSettings );
	return instance;
};

const selectText = ( /** @type {Node} */ node, start = 0, end = node.textContent.length ) =>
{
	const range = document.createRange();
	range.setStart( node, start );
	range.setEnd( node, end );
	const selection = document.getSelection();
	selection.removeAllRanges();
	selection.addRange( range );
	return selection;
};

const fakeClipboardEvent = () =>
{
	const event = new window.Event( 'copy', { bubbles: true, cancelable: true } );
	const data = {};
	event.clipboardData = { setData: ( type, value ) => { data[ type ] = value; } };
	return { event, data };
};

before( async () =>
{
	silenceConsole();
	setupDom( BODY );
	addSettingsElement( SETTINGS );
	( { CopyWithQ } = await import( '../copyWithQ.mjs' ) );
	await waitFor( () => typeof String.prototype.splitIntoWords === 'function' );
	await new Promise( ( resolve ) => setTimeout( resolve, 20 ) ); // let run() finish adding listeners
} );

test( 'exports public constants', () =>
{
	assert.equal( CopyWithQ.URL_LIST, 'text/uri-list' );
	assert.equal( CopyWithQ.PLAIN_TEXT, 'text/plain' );
	assert.equal( CopyWithQ.HTML, 'text/html' );
} );

test( 'settings from JSON element are deep merged with defaults', async () =>
{
	const instance = await createInstance( { resultSnippet: { citePrefix: ' ~ ' } } );
	assert.equal( instance.settings.author, 'John Doe' );
	assert.equal( instance.settings.autoQuotesMinLength, 40 );
	assert.equal( instance.settings.resultSnippet.citePrefix, ' ~ ' );
	assert.equal( instance.settings.resultSnippet.citeSeparator, ', ', 'default nested value is kept' );
	assert.equal( instance.settings.maxWordsAsIdentifier, 5, 'default value is kept' );
} );

test( 'checkRequirements throws without settings', async () =>
{
	const instance = await createInstance();
	instance.settings = null;
	assert.throws( () => instance.checkRequirements(), /Settings object is missing/ );
} );

test( 'getAuthor finds author element by query selectors', async () =>
{
	const instance = await createInstance( { author: null } );
	instance.getAuthor();
	assert.equal( instance.settings.author.textContent, 'Michal' );
} );

test( 'getAuthor keeps author from settings', async () =>
{
	const instance = await createInstance();
	instance.getAuthor();
	assert.equal( instance.settings.author, 'John Doe' );
} );

test( 'getSelectedPlainText adds author and link', async () =>
{
	const instance = await createInstance();
	assert.equal(
		instance.getSelectedPlainText( 'https://example.com/', 'Quote' ),
		'Quote\n — John Doe, https://example.com/'
	);
} );

test( 'getSelectedPlainText without author', async () =>
{
	const instance = await createInstance( { author: null } );
	assert.equal( instance.getSelectedPlainText( 'https://example.com/', 'Quote' ), 'Quote\n — https://example.com/' );
} );

test( 'getSelectedPlainText uses text of author link', async () =>
{
	const instance = await createInstance( { author: null } );
	instance.getAuthor();
	assert.equal( instance.getSelectedPlainText( 'https://example.com/', 'Quote' ), 'Quote\n — Michal, https://example.com/' );
} );

test( 'author element which is not a link is used as text', async () =>
{
	const instance = await createInstance( { author: null, possibleAuthorQuerySelectors: [ '[itemprop="author"]' ] } );
	instance.getAuthor();
	assert.equal( instance.getSelectedPlainText( 'https://example.com/', 'Quote' ), 'Quote\n — Jana, https://example.com/' );

	const blockquote = instance.getResultSnippetElementBy( 'https://example.com/', document.createDocumentFragment() );
	assert.equal( blockquote.querySelector( 'footer' ).textContent, ' — Jana, Test article' );
} );

test( 'getResultSnippetElementBy creates blockquote with citation', async () =>
{
	const instance = await createInstance( { author: null } );
	instance.getAuthor();
	const fragment = document.createDocumentFragment();
	fragment.appendChild( document.createTextNode( 'Quote' ) );

	const blockquote = instance.getResultSnippetElementBy( 'https://example.com/#x', fragment );
	assert.equal( blockquote.nodeName, 'BLOCKQUOTE' );
	assert.equal( blockquote.cite, 'https://example.com/#x' );
	assert.equal( blockquote.firstChild.textContent, 'Quote' );

	const author = blockquote.querySelector( 'footer a[rel="author"]' );
	assert.equal( author.href, 'https://iiic.dev/' );
	assert.equal( author.title, 'Author page' );
	assert.equal( author.textContent, 'Michal' );

	const cite = blockquote.querySelector( 'footer cite a' );
	assert.equal( cite.href, 'https://example.com/#x' );
	assert.equal( cite.textContent, 'Test article' );
	assert.equal( blockquote.querySelector( 'footer' ).textContent, ' — Michal, Test article' );
} );

test( 'isUniqueIn', async () =>
{
	const instance = await createInstance();
	assert.equal( instance.isUniqueIn( 'b', 'abc' ), true );
	assert.equal( instance.isUniqueIn( 'x', 'abc' ), false );
	assert.equal( instance.isUniqueIn( 'a', 'abca' ), false );
} );

test( 'constructLink adds scroll-to-text fragment for unique text', async () =>
{
	const instance = await createInstance();
	const url = instance.constructLink( 'automatic citation creation. When user selects a part' );
	assert.equal( url.origin + url.pathname, 'https://example.com/article' );
	assert.match( decodeURIComponent( url.hash ), /^#:~:text=automatic.*,.*part$/ );
} );

test( 'constructLink without fragment for repeated text', async () =>
{
	const instance = await createInstance();
	const url = instance.constructLink( 'Another paragraph with other words' );
	assert.equal( url.hash, '' );
} );

test( 'constructLink without fragment when disabled', async () =>
{
	const instance = await createInstance( { scrollToTextFragment: { autoAdd: false } } );
	const url = instance.constructLink( 'automatic citation creation. When user selects a part' );
	assert.equal( url.hash, '' );
} );

test( 'copy event of long selection fills clipboard with all data types', () =>
{
	selectText( document.getElementById( 'first' ).firstChild );
	const { event, data } = fakeClipboardEvent();
	document.getElementById( 'first' ).dispatchEvent( event );

	assert.equal( event.defaultPrevented, true );
	assert.ok( data[ 'text/uri-list' ].startsWith( 'https://example.com/article' ) );
	assert.ok( data[ 'text/plain' ].startsWith( LONG_TEXT + '\n — John Doe, https://example.com/article' ) );
	assert.match( data[ 'text/html' ], /^<blockquote cite="https:\/\/example\.com\/article[^"]*">Simple javascript/ );
	assert.match( data[ 'text/html' ], /<footer> — John Doe, <cite><a href="[^"]+">Test article<\/a><\/cite><\/footer><\/blockquote>$/ );
} );

test( 'copy event of short selection is not changed', () =>
{
	selectText( document.getElementById( 'first' ).firstChild, 0, 10 );
	const { event, data } = fakeClipboardEvent();
	document.getElementById( 'first' ).dispatchEvent( event );

	assert.equal( event.defaultPrevented, false );
	assert.deepEqual( data, {} );
} );

test( 'CTRL + SHIFT + L copies link to selected text', async () =>
{
	let written = null;
	Object.defineProperty( globalThis, 'navigator', {
		value: { clipboard: { writeText: ( text ) => { written = text; } } },
		configurable: true,
	} );
	selectText( document.getElementById( 'first' ).firstChild, 7, 60 );
	document.dispatchEvent( new window.KeyboardEvent( 'keyup', { ctrlKey: true, shiftKey: true, keyCode: 76 } ) );
	assert.ok( written && written.startsWith( 'https://example.com/article' ) );
} );
