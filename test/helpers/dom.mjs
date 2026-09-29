import { JSDOM } from 'jsdom';

export const MODULES_URL = new URL( '../../modules', import.meta.url ).href;

/**
 * Creates browser-like globals (window, document, …) for code written for the browser.
 */
export function setupDom ( /** @type {String} */ body = '', /** @type {String} */ url = 'https://example.com/article' )
{
	const dom = new JSDOM( `<!DOCTYPE html><html><head><title>Test article</title></head><body>${ body }</body></html>`, { url } );
	const { window } = dom;

	// jsdom does not implement layout, so innerText behaves like textContent here
	Object.defineProperty( window.HTMLElement.prototype, 'innerText', {
		get () { return this.textContent; },
		configurable: true,
	} );

	globalThis.window = window;
	globalThis.document = window.document;
	globalThis.confirm = () => true;

	return dom;
}

/**
 * The library logs a lot to the console, keep the test output clean.
 */
export function silenceConsole ()
{
	for ( const method of [ 'debug', 'log', 'warn', 'groupCollapsed', 'groupEnd' ] ) {
		console[ method ] = () => {};
	}
}

/**
 * Adds a JSON settings element, the same way as documented in the readme.
 */
export function addSettingsElement ( /** @type {Object} */ settings )
{
	const element = document.createElement( 'script' );
	element.type = 'text/json';
	element.id = 'copy-with-q-settings';
	element.text = JSON.stringify( settings );
	document.body.appendChild( element );
	return element;
}
