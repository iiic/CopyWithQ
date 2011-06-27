  CopyWithQ
=============

### Automatické citace ###

Jednoduchý javascript pro automatickou tvorbu citací. Uživateli stačí oznatit
část textu, běžným způsobem ji zkopírovat (funguje jak zkratka Ctrl + c,
tak použití kontextové nabýdky vyvolané pravým talčítkem myši),a citace se do
kopírovaného textu doplní automaticky.



Použití
-------

Soubor se scriptem vložte kamkoliv do stránky, jako jakýkoliv běžný javascript.
Nezapomeňte samozřejmě i na jQuery.
Při vytváření instance třídy můžete konstruktoru předat paramatr (řetězec),
který následně bude použit jako autor kopírovaného textu.
javascript:

	var linkQuote = new CopyWithQ('Jon Doe');

následně metoda set může upravit chování scriptu:

	linkQuote.set({proměnná:hodnota, proměnná:hodnota, ...});

nastavení obsahuje následující volby

* `id`: řetězec identifikátor elementu, který se musí při běhu scriptu vytvořit,
* `addLink`: pokud se nastaví na false nepřidá do citace odkaz na původní web,
* `sourceLinkText`: řetězec... vloží se před odkaz směřující na zdrojový web,
* `minLengthv`: integer, který určuje od kolika vybraných znaků se přidá citace,
* `preText`: bool, který při true zachová původní formátování zvoleného textu

Kolize id s jiným elementem s totožným id by neměla způsobit selhání sctiptu.
Objekt se vytváří na konci těla stránky (body) a z případných stejných id
se pracuje s poslením z nich.

Nakonec se script spustí metodou run:

	linkQuote.run();

### jednoduchý příklad použití je v souboru `example.html` ###



Testováno s pomocí jQuery 1.6.1 na prohlížečích
-----------------------------------------------

### funguje: ###
* IE 8.0.6001.18702 (nepříjemné probliknutí na stránkách s posuvníkem)
* FF 5.0
* Chrome 12.0.742.91
* Chrome 14.0.786.0 (canary build)
* Safari 5.0.2

### nefunguje: ###
* Opera 11.11



Licence
-------

Celý sctipt je vydán pod licencí Creative Commons verze 3.0 BY
[CC BY] (http://creativecommons.org/licenses/by/3.0/cz/)

Budu rád, když v souladu s licencí zachováte úvodní víceřádkový komentář
v javascript souboru ( `jquery.copywithq.js` )

                                                     ic
