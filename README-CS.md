  CopyWithQ
=============

**Automatické citace**

Jednoduchý javascript pro automatickou tvorbu citací. Uživateli stačí označit
část textu, běžným způsobem ji zkopírovat (funguje jak zkratka Ctrl + c,
tak použití kontextové nabídky vyvolané pravým tlačítkem myši),a citace se do
kopírovaného textu doplní automaticky.

Vytváří 3 různé datový typy (v závislosti na nastavení) při kopírování do schránky (clipboard). Prostý text, HTML snippet a jednoduchý odkaz. Který datový typ se použije při vkládání (CTRL + V) se rozhodne v závislosti na tom, jaký typ dat přijímá program do kterého se vkládá. Například když vkládám do poznámkového bloku (`notepad`) vloží se prostý neformátovaný text, když vkládáte do `Word`u nebo [Google Docs](https://docs.google.com/document/) vloží se formátovaný text s odkazy.

Novinky ve verzi 2.0
-------------------

- Odstraněna závislost na jQuery. Pryč s jQuery!
- Přidána funkce Scroll-to-text Fragment ([podpora zatím jen v Chrome, Edge a Opera](https://caniuse.com/#feat=url-scroll-to-text-fragment))
- Možnost získat odkaz s vyznačenou částí textu pomocí označení textu a použití klávesové zkratky CTRL + SHIFT + L

Použití
-------

Soubor se scriptem vložte kamkoliv do stránky, jako jakýkoliv běžný `javascript`ový modul

``` html
<script type="module" src="/copyWithQ.mjs" crossorigin="anonymous" integrity="sha256-eX4Yr7bQ38SW3yw8IoeRAvu5rr1Kd2wP4pRoe/45NRE="></script>
<script type="module">
	import { CopyWithQ } from '/copyWithQ.mjs';
	new CopyWithQ;
</script>
```

Při vytváření instance třídy můžete konstruktoru předat parametr (řetězec nebo HTMLLinkElement),
který následně bude použit jako autor kopírovaného textu.
javascript:

``` javascript
new CopyWithQ('Jon Doe');
```

pomocí 2. parametru můžete upravit nastavení scriptu například takto:

``` javascript
import { CopyWithQ } from '/copyWithQ.mjs';
const settings = {
	modulesImportPath: '/vendor/js/modules',
	autoQuotesMinLength: 240,
};
new CopyWithQ( 'John Doe', settings );
```

### jednoduchý příklad použití je v souboru `example-usage.html` ###

Proč je tam vkládání scriptu 2x?
Není celý první script `<script type="module" …></script>` zbytečný? Fungovalo by to i bez něj. Ano to, fungovalo, ale nešlo by bez něj zajistit kontrolu integrity javascriptového modulu. Bezpečnost je důležitá, pokud vás zajímá o bezpečnosti modulů více, čtěte zde: https://iiic.dev/subresource-integrity-check-u-javascriptovych-modulu

# Možné problémy?

mjs přípona musí mít nastavený správný mime type a to `text/javascript`, pokud je to moc pracné přejmenujte koncovku z `.mjs` na `.js` . Více o modulech na https://www.vzhurudolu.cz/prirucka/js-moduly

Služby
------

Unpkg: https://unpkg.com/copywithq-automatic-quotes

NPM: https://www.npmjs.com/package/copywithq-automatic-quotes

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

Nějaké další info na https://iiic.dev/copywithq-automatic-quotes
