# SPACE1889-FVTT
Unofficial SPACE 1889 Ubiquity system for FoundryVTT

English version below

Das ist eine Fanprojekt, um das vom Uhrwerk Verlag veröffentlichte SPACE 1889 für Foundry Virtual Tabletop nutzbar zu machen. 

Neben einem funktionierenden Charakterbogen, mit dem sich alle wesentliche Charakterfunktionen und Proben abbilden lassen, existiert auch einen Kreaturenbogen, sowie ein Bogen für die Nichtspielercharakter. Der NSC Bogen ist zwar kompakter als der Charakterbogen gehalten, kann aber trotzdem alle Daten eines Charakters aufnehmen. Entscheidender Unterschied zum Charakterbogen ist die fehlende Kopplung an die in den System Settings einstellbare Heldenstufe. D.h. NSCs können beliebig hohe Primäre Attributswerte habe und die Maximalstufe von Fertigkeiten und Spezialisierungen liegt bei 10.

Das Projekt wurde auf mehrsprachigkeit angelegt und mit Version 0.7.0 ist die interne Verwaltung und auch die Übersetzung soweit gediehen, dass sich neben dem Deutschen auch Englisch nutzen lässt. 
Die Spieler und der Spielleiter können ihre Spracheinstellung unabhängig voneinander vornehmen, wodurch sie dann die Bögen der Charakter, Kreaturen und NSC in ihrer jeweiligen Sprache sehen und auch die von ihnen erzeugten Chat Ausgaben folgen dieser Einstellung. Einzig die Namen der Elemente in den Kompendien sind global und folgen der Spracheinstellung des Spielleiters. 
Für weitere Sprachen muss nur die entsprechende Sprachdatei erzeugt und eingebunden werden. Wie bei Foundry üblich, liegen die Sprachdateien im \lang\ Verzeichnis. 

Bedienhilfe für Charakter-, NSC- und Kreaturenbogen: 
* [Alt] Taste + Linksklick: anstatt des normalen Würfelwurfes wird eine Info (z.B. zum Attribut) im Chat ausgegeben (mit zusätzlich [Shift] oder [Strg] wird aus dem geflüsterten Wurf an sich selbst ein öffentlicher Wurf)
* [Strg] Taste + Linksklick: anstatt des normalen Würfelwurfes wird ein Dialog geöffnet der die Eingabe von Zusatzwürfeln (auch negative) ermöglicht
  
* Die meisten veränderbaren Werte wie Stufe der Primären Attribute, Fertigkeiten, Spezialisierungen, Talenten und Ressourcen usw. können über links Mausklick erhöht und rechts Mausklick verringert werden
* [Shift] + Mausklick erhöht das Inkrement von 1 auf 5
* [Strg] + Mausklick erhöht das Inkrement auf 10
* [Strg] + [Shift] + Mausklick erhöht das Inkrement auf 100
* Der Lagerort von Gegenständen, Rüstungen und Waffen kann ebenfalls durch Mausklick verändert werden, hier wird einfach durch die drei Möglichkeiten "am Körper", "im Rucksack" und "im Lager" durchgeschaltet.


Empfohlene Module: 
* Token Action HUD: ermöglicht direkten Zugriff auf fast alle Würfe, ohne den Bogen des Akteurs öffnen zu müssen. Auch hier haben die zusätzlich zum Mausklick gedrückten Tasten [Strg], [Shift] und [Alt] die gleiche Funktion wie in den Bögen.
* Journal Anchor Links: ermöglicht Sprungmarken innerhalb eines Dokumentes
* Compendium Folders: ermöglicht Verzeichnisstrukturen auch bei den Kompendien


Unofficial SPACE 1889 Ubiquity system for FoundryVTT

This is a fan project to make the SPACE 1889 published by Uhrwerk Verlag usable for Foundry Virtual Tabletop. 

In addition to a working character sheet, which can be used to map all essential character functions and samples, there is also a creature sheet, as well as a sheet for non-player characters. The NPC sheet is more compact than the character sheet, but can still hold all the data of a character. The main difference to the character sheet is that it is not linked to the hero level, which can be set in the system settings. That is, NPCs can have any primary attribute value and the maximum level of skills and specializations is 10.

The project was designed to be multilingual and with version 0.7.0 the internal management and also the translation has progressed so far that English can be used in addition to German. 
The players and the gamemaster can set their language independently, so they will see the sheets of the characters, creatures and NPCs in their respective language and also the chat outputs generated by them will follow this setting. Only the names of the items in the compendiums are global and follow the language setting of the game master. 
For other languages only the corresponding language file has to be created and included. As usual with Foundry, the language files are located in the \lang\ directory. 


Help for character, NPC and creature sheets: 
* [Alt] key + left click: instead of the normal dice roll, an info (e.g. about the attribute) is output in the chat (with additional [Shift] or [Ctrl], the whispered roll to yourself becomes a public roll).
* [Ctrl] key + left click: instead of the normal dice roll a dialog is opened which allows the input of additional dice (also negative)
  
* Most changeable values like level of primary attributes, skills, specializations, talents and resources etc. can be increased by left mouse click and decreased by right mouse click
* [Shift] + mouse click increases the increment from 1 to 5
* [Ctrl] + mouse click increases the increment to 10
* [Ctrl] + [Shift] + mouse click increases the increment to 100
* The storage location of items, armor and weapons can also be changed by mouse click, here you simply cycle through the three options "on body", "in backpack" and "in storage".


Recommended modules: 
* Token Action HUD: allows direct access to almost all rolls without opening the actor's sheet. Again, the [Ctrl], [Shift] and [Alt] keys pressed in addition to the mouse click have the same function as in the sheets.
* Journal Anchor Links: links entities (journal entries, actors and items) that reference each other. 
* Compendium Folders: allows you to manage compendiums a bit easier by implementing a folder system.