  CopyWithQ
=============

**Automatic Quotes**

Simple javascript for automatic citation creation.
When use selects a part of the text, and copy it in the usual way
(both the shortcut Ctrl + c works and the use of the context menu called up by the right mouse button, the citation is automatically added to the copied text.

It creates 3 different data types (depends on `settings`) in clipboard. Plain text, HTML snippet and single link. Snippets are used by data type when pasting (CTRL + V) the data. For example pasting in `notepad` it places plain text, when pasting in Word or [Google Docs](https://docs.google.com/document/) it places rich html snippet.

What's new in version 2.0
------------------------

- Removed jQuery dependency. Away with jQuery!
- Added Scroll-to-text Fragment feature ([support in Chrome, Edge and Opera only](https://caniuse.com/#feat=url-scroll-to-text-fragment))
- Ability to get a link with the selected part of the text by selecting the text and using the keyboard shortcut CTRL + SHIFT + L

Use
---

Paste the script file anywhere in the page, like any regular `javascript` module

``` html
<script type="module" src="/copyWithQ.mjs" crossorigin="anonymous" integrity="sha256-eX4Yr7bQ38SW3yw8IoeRAvu5rr1Kd2wP4pRoe/45NRE="></script>
<script type="module">
	import { CopyWithQ } from '/copyWithQ.mjs';
	new CopyWithQ;
</script>
```

When instantiating a class, you can pass a parameter (string or HTMLLinkElement) to the constructor, which will then be used as the author of the copied text. javascript:

``` javascript
new CopyWithQ('Jon Doe');
```

using second parameter, you can adjust the script settings, for example, as follows:

``` javascript
import { CopyWithQ } from '/copyWithQ.mjs';
const settings = {
	modulesImportPath: '/vendor/js/modules',
	autoQuotesMinLength: 240,
};
new CopyWithQ( 'John Doe', settings );
```

### a simple example of usage is in the `example-usage.html` file ###

Why is there script embedding 2 times?
 Isn't the whole first script `<script type="module" …></script>` useless? It would work without him. Yes, it worked, but it would not be possible to check the integrity of the javascript module without it. Security is important, if you are interested in the security of modules more, read here: https://iiic.dev/subresource-integrity-check-u-javascriptovych-modulu

# Possible problems?
The mjs extension must have the correct mime type set to `text/javascript`, if it is too laborious, rename the suffix from `.mjs` to `.js`.

Services
--------

Unpkg: https://unpkg.com/copywithq-automatic-quotes

NPM: https://www.npmjs.com/package/copywithq-automatic-quotes

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

More info at https://iiic.dev/copywithq-automatic-quotes
