  CopyWithQ
=============

**Automatic Quotes**

Simple javascript for automatic citation creation.
When use selects a part of the text, and copy it in the usual way
(both the shortcut Ctrl + c works and the use of the context menu called up by the right mouse button, the citation is automatically added to the copied text.
Just vanilla javascript. Example html included in repo.

It creates 3 different data types (depends on `settings`) in clipboard. Plain text, HTML snippet and single link. Snippets are used by data type when pasting (CTRL + V) the data. For example pasting in `notepad` it places plain text, when pasting in Word or [Google Docs](https://docs.google.com/document/) it places rich html snippet.

What's new in version 2.2
------------------------

- Fixed author name in citation when the author element is not a link
- Fixed multi level merge of settings
- Failed module import no longer blocks the script, settings fall back to single level merge
- Automatic tests, linting, type check and SRI integrity check before every commit

(older news 2.1)

- Script settings by json file
- In text snippet (mime type 'text/plain') there will be author name instead of author URL
- Automatic author select from HTML by list of possible selectors

(older news 2.0)

- Removed jQuery dependency. Away with jQuery!
- Added Scroll-to-text Fragment feature ([support in Chrome, Edge and Opera only](https://caniuse.com/#feat=url-scroll-to-text-fragment))
- Ability to get a link with the selected part of the text by selecting the text and using the keyboard shortcut CTRL + SHIFT + L

Use
---

Paste the script file anywhere in the page, like any regular `javascript` module

``` html
<script type="module" src="/copyWithQ.mjs?v2.2" crossorigin="anonymous" integrity="sha256-zclZH6CdOj6dSs/FZNV17X9LBCjkWOjpUlqxkhyY5fw="></script>
```

And that's all, now will be everything works with default settings.

But if you want to change settings this can be done by inline json file like this:

``` html
<script type="text/json" id="copy-with-q-settings">
	{
		"author": "John Doe",
		"autoQuotesMinLength": 240,
		"modulesImportPath": "/modules"
	}
</script>
<script type="module" src="/copyWithQ.mjs?v2.2" crossorigin="anonymous" integrity="sha256-zclZH6CdOj6dSs/FZNV17X9LBCjkWOjpUlqxkhyY5fw="></script>
```

### a simple example of usage is in the `example-usage.html` file ###

# Possible problems?

The mjs extension must have the correct mime type set to `text/javascript`, if it is too laborious, rename the suffix from `.mjs` to `.js`.

Development
-----------

``` sh
npm install        # installs dev tools and the git pre-commit hook
npm run check      # everything below, also runs automatically before every commit
npm run lint       # ESLint, HTML validation, Markdown lint, .editorconfig + JSON syntax
npm run typecheck  # TypeScript type check of JSDoc types
npm run sri        # checks SRI integrity hashes (npm run sri:fix updates them)
npm test           # unit tests (node:test + jsdom)
```

Services
--------

Unpkg: https://unpkg.com/copywithq-automatic-quotes

NPM: https://www.npmjs.com/package/copywithq-automatic-quotes

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

More info at https://iiic.dev/copywithq-automatic-quotes
