# Changelog 

**Zeitalter der 1000 Weltkriege**

###v1.4.3
- Anzeigen eines Best�tigungsdialogs bei Angriffen, falls die Kampfunterst�tzung aktiv ist und kein Ziel, bzw. ein totes Ziel ausgew�hlt ist
- Der Angriff �ber das Talent Assassine wird jetzt richtigerweise wie ein Waffenangriff ausgewertet, d.h. das System �berpr�ft ob eine Nahkampfwaffe in der Hand gehalten wird und nutzt die mit dem meisten Schaden unter Beachtung des Beidh�ndig Talents.
- Bugfix: SPACE 1889 Wurf Makro funktioniert nicht ([#18](https://github.com/Scepfari/SPACE1889-FVTT/issues/18))

###v1.4.2
- Eigener SPACE 1889 Stil f�r mehr Immersion.
L�sst sich in den Spieleinstellungen ab- und anschalten
- Figuren unterliegen nun einer Bewegungseinschr�nkung, falls sie mindestens einen der Zust�nde Liegend, Bet�ubt, Gel�hmt oder Bewusstlos besitzen. In diesem Fall kann der Spieler die Figur nicht mehr bewegen, bis all diese Zust�nde wieder entfernt wurden.
- Die Spielleitung kann diese Bewegungseinschr�nkung auch f�r sich aktivieren, entweder in den Spieleinstellungen oder schneller �ber die konfigurierbare Tastenkombination [Strg + B]. Unabh�ngig von dieser Einstellung kann er Figuren immer verschieben, wenn diese zus�tzlich den Zustand Tot haben.
- Spezieller Listen Typ, in dem die Punkte durch Mars-Kugeln ersetzt wird, wie in dieser Auflistung. 
- Entfernung des SPACE Forum Links, da Uhrwerk sein Forum im April 2023 abgeschaltet hat.

###v1.4.1
- Space Men� um zwei  Optionen erweitert:
-- Die Anzeige der Lebensbalken und der Token Namen kann nun f�r alle Tokens einer Szene gesetzt werden.
-- Bereitmachen der Waffen f�r alle NSCs einer Szene, mit Nachfrage ob Nahkampf oder Fernkampfwaffen bevorzugt werden sollen. Gew�hlt wird die Waffe mit dem h�chsten Schaden. Die entsprechenden Meldungen im Chat werden an den SL gefl�stert. 
- Beim Platzieren von Tokens auf der Szene wird gepr�ft ob der Akteur hinter dem Token schon auf der Szene ist und ob der Token auf den Akteur verlinkt ist. Ist dies der Fall und der Token steht unter alleiniger Kontrolle des SL, erscheint ein Dialog, �ber den die Verlinkung aufgehoben werden kann. Das �ndert auch den Prototypen Token des Akteurs.
- Das Foundry Pause Bild wurde durch ein Animiertes ersetzt. 

###v1.4.0
- SL Schirm (neues Notiz-Kompendium SPACE1889 GM Infos)
- Eigenes Space Men� in der linken Toolbar mit drei Optionen:
-- Bild im Chat anzeigen (Klick �ffnet direkt den Bild-Browser, nur f�r SL)
-- SL Schirm anzeigen (Klick �ffnet die Kompendium Notiz, nur f�r SL)
-- Bedienhilfe anzeigen (Klick �ffnet die Hilfe Notiz aus dem Kompendium, identisch wie das Chat Kommando: "/help")
- Um Space 1889 erweitertes Foundry Anvil Logo links oben in der Ecke
- Das Logo ist anklickbar und �ffnet ein Fenster mit n�tzlichen externen Links, wie auf die GitHub Seite zum eintragen von Fehlermeldungen bzw. Featurew�nschen, oder der Link zum Foundry Discord Server


**Krieg der G�tter**

###v1.3.5
- Waffen haben jetzt einen Schalter, der sie als Zweih�ndig definiert.
- Alle zweih�ndigen Waffen im Kompendium, wurden als solche markiert, das schlie�t auch die getragenen Waffen der in den Kompendien aufgef�hrten Beispielcharakter und NSCs mit ein.
- Beim Update auf diese Version werden alle Akteure und auch Tokens auf den Szenen bez�glich ihrer zweih�ndigen Waffen aktualisiert 
- Charaktere und NSCs haben in ihrem Bogen bei den Waffen einen Schalter mit dem sie die Waffe kampfbereit machen k�nnen, also die Waffe ziehen und sie der Haupthand, Nebenhand oder bei zweih�ndigen Waffen in beiden H�nden halten wollen.
- Ein Waffenangriff ist jetzt nur noch m�glich wenn eine Waffe bereit ist, also in den H�nden gehalten wird. 
- Waffen in der Nebenhand erhalten automatisch einen Abzug von -2, au�er sie besitzen das Talent "Beidh�ndig".
- Bugfix: Fehlerhaftes Entladen von Schusswaffen ([#17](https://github.com/Scepfari/SPACE1889-FVTT/issues/17))
- Bugfix Gegenstand Chat Ausgabe: Die �berfl�ssige Ausgabe "Der Eintrag {langId} ist nicht in der Sprach-Datei de.json enthalten." wurde entfernt

###v1.3.4

- Neuer Chat Befehl "/image url_oder_foundryBildpfad" zeigt das Bild hinter der url oder dem Foundry Bildpfad im Chat an. Klickt man auf  dieses Bild wird es gro� in einem eigenen Foundry Fenster angezeigt
- Wenn eine Item Beschreibung, unabh�ngig vom Item Typ, im Chat angezeigt wird und das Standard Bild ge�ndert wurde, wird das Bild mit im Chat angezeigt. Auch hier l�sst es sich, �ber einen Klick, gro� in einem eigenen Foundry Fenster anzeigen
- Automatisches Entladen bei Munitionswechsel von Fernkampfwaffen, d.h. die aktuell in der Waffe befindlichen Patronen bei Revolvern und internen Magazinen gehen zur�ck in den Vorrat
- Bugfix: Fehlende Kampf Zugmarkierung bei nicht mit Szenen verkn�pften Begegnungen ([#16](https://github.com/Scepfari/SPACE1889-FVTT/issues/16))

###v1.3.3

- alle Akteur B�gen besitzen jetzt einen Abschnitt in dem die aktuellen Effekte aufgelistet sind
- das System unterbindet Angriffe von Token die von bestimmten Effekt betroffen sind, also Bet�ubt, Bewusstlos, Gel�hmt und Liegend
- Bugfix: Fehlermeldung bei den Spielern wenn der GM einen Akteur erzeugt ([#15](https://github.com/Scepfari/SPACE1889-FVTT/issues/15))

###v1.3.2

- Rechtsklick auf die Illustration im Item Bogen �ffnet eine vergr��erte Ansicht, analog zum Akteur Bogen
- neuer Akteur und Item B�gen f�r beschr�nkte Rechte, die nur den Namen und die Illustration enthalten, aber keine Werte
- Gegenschlag und Riposte, sowie Parade gegen Waffenlos werden nun beachtet. D.h bei  der Auto Verteidigung, erzeugen, bei entsprechenden W�rfen, Parade, Gegenschlag und Riposte nun Schaden beim Angreifer
- Beim Hinzuf�gen von Tokens (die nicht mit dem Akteur verlinkt sind) in eine Szene, wird der Name hochgez�hlt, damit die Tokennamen eindeutig bleiben


###v1.3.1

- Automatisches Ausblenden des Automatischen Verteidigungsknopfes nach Benutzung f�r die Spieler
- Option "Ausblenden des Auto Verteidigung Knopfes" in den Settings, um auch f�r den SL den diesen Knopf nach Verwendung auszublenden
- BugFix Chat Befehl "/version"
- BugFix: Schadenstyp der �ber die Automatische Verteidigung erzeugt wird; d.h. jetzt wird der Schadenstyp der verwendeten Munition beachtet.
- BugFix: Angriff �ber das Talent Assasine ist nur noch Nahkampf/Waffenlos N�he zum Gegner m�glich


###v1.3.0

- neuer Chat Befehl "/version" zeigt die SPACE 1889 Versions�nderungshistorie an
- Neuer Item Typ Munition
- Munitionsverwaltung im Charakter und NSC Bogen, d.h. Akteur Waffen kann Munition zugewiesen werden. Schie�en verbraucht Munition, Nachladen (beachtet die Feuerrate und auch das Schnellladen Talent) und Entladen werden unterst�tzt
- Die Fernkampfwaffe wird �ber die Munition beeinflusst (Schadenstyp, Schadensmodifikator, Reichweitenfaktor und Kegelaufweitung (Schrot vs. Flintenlaufgeschoss)
- Schrotflinten Korrekturen und Verbesserungen: Korrekter W�rfelabzug entsprechend der  Entfernung, Berechnung des Kegel �ffnungswinkels
- Verbesserte Chatausgabe bei Angriffen, sie erfolgt jetzt unter Angabe der Schadensart und der verwendeten Munition
- Waffen-Kompendium erweitert, d.h. Schusswaffen haben jetzt ein Kaliber, das bei der Munition beachtet wird, sprich nur passende Munition kann in die Waffe geladen werden
- Munitions Kompendium, was die Munition der Waffen aus dem Kompendium abdeckt (ohne Schiffswaffen) 
- die Kompendien der Akteure (Beispielcharaktere und die NSCs) wurden aktualisiert, sodass diese jetzt passende Munition dabei haben
- Schusswaffen haben jetzt eine Checkbox um zu Markieren, dass die Waffe mit einem Zielfernrohr ausgestattet ist. Dies wird bei der Berechnung der Entfernungsabz�ge ber�cksichtigt und auch als ToolTip im Charakterbogen (Maus �ber dem Namen der Waffe platzieren) angezeigt.
- Automatischer Update aller Tokens und Akteure beim ersten Start mit dieser Version. Dadurch werden alle Schusswaffen der Akteure, die aus dem Kompendium stammen, mit der passende Munition versehen. F�r Eigenkreationen muss die passende Munition selber erstellt und hinzugef�gt werden. 
- Einstellungsoption "Kampfunterst�tzung" ersetzt "Automatische Verteidigung" 

**Zeit der Kanalbaumeister**

###v1.2.1

- Bei Attacken mit gew�hltem Ziel wird die Entfernung zwischen Angreifer und Ziel bestimmt und bei Fernwaffen der Entfernungsmodifikator in den Wurf mit eingerechnet. Nahkampfangriffe auf Ziele die weiter als 1,5m entfernt sind werden geblockt. 
- Die automatisch beim Zuteilen von Schaden erzeugten Effekte wie Bet�ubt, Bewusstlos oder Gel�hmt, werden nun nach dem Ablauf der Effektzeit automatisch entfernt. Gilt nur innerhalb einer Begegnung.
- Bugfix: Automatische Verteidigung: Verteidigungsmalus bei Mehrfachangriffen wird nun bei gro�en Kreaturen richtig berechnet

 ###v1.2.0

- Gegenst�nde, Waffen, R�stungen und Geld k�nnen jetzt per Drag & Drop umsortiert werden
- Begegnung: der am Zug befindliche Teilnehmer wird mit einem drehenden Zahnrad markiert (kann in den Einstellungen abgeschaltet werden)
- Begegnung: n�chster Zug [n] und vorheriger Zug [v] k�nnen nun per Tastatur ausgel�st werden (kann unter Steuerung anpassen konfiguriert werden)
- Automatische Verteidigung: Die automatische Verteidigung beachtet die Abz�ge die durch mehrfache Angriffe in einer Runde entstehen
- Automatische Verteidigung: Korrektur Paralysierender Schlag, kann auch mit Blocken oder Parade abz�glich passiver Abwehr erfolgen
- Verletzungen erhalten jetzt automatisch den Zeitpunkt ihrer Entstehung. Ist das Modul Simple Calendar installiert und aktiv, wird die dadurch verf�gbare In-Spiel-Zeit verwendet. Ohne das Modul wird die PC/Server Zeit verwendet
- In allen Akteur B�gen (Charakter, NSC, Kreatur, Fahrzeug) kann nun per Rechtsklick das Bild in Gro� in einem eigenem Fenster angezeigt werden. Auf Wunsch wird dies auch den Spielern angezeigt. 
- Bugfix: Bilder in den Akteur und Item B�gen werden nicht mehr verzerrt dargestellt und behalten jetzt ihr Seitenverh�ltnis bei
- Bugfix: Parade-Berechnung (nur mit Nahkampfwaffe am K�rper)


**Zeit der Zweifel**

###v1.1.2

- Bugfix: Ausl�sen der automatischen Verteidigung durch Spieler nicht m�glich ([#13](https://github.com/Scepfari/SPACE1889-FVTT/issues/13))
- Bugfix: Statuseffekte werden nicht erzeugt ([#14](https://github.com/Scepfari/SPACE1889-FVTT/issues/14))

###v1.1.1

- Automatische Verteidigung: sch�nerer Button, Nachricht bei erfolglosen Angriffen, Verz�gerung f�r die Auswertung der Verteidigung, orientiert sich an den DiceSoNice Einstellungen 
- bei der Automatische Verteidigung wird nun der Typ des Angriffes mit ausgewertet und darauf basierend die richtige Verteidigung ausgew�hlt (Parade/Blocken falls instinktiv, aktive  oder passive Verteidigung)
- Paralysierender Schlag & Assassine wird von AutoDefense unterst�tzt
- Automatische Verteidigung bei Fl�chenschaden: Waffen wie Elektorschocker (also bei denen Fl�chenschaden aktiv ist), l�uft die Verteidigung nur �ber die Aktive Abwehr und bei Treffer/Ber�hrung (>=) wird der Waffenschaden ausgeteilt
- Neuer Schalter "Kampagnen Effekt" im Ressourcen Bogen, �ber den diese Ressource aus der EP Berechnung genommen werden kann
- Bugfix: bei Waffen die Fl�chenangriffe bei Treffer verursachen, wird nur der Fertigkeiten/Spezialisierungswert verwendet, der Fl�chenschaden geht nicht in den Angriffswurf ein

###v1.1.0

- Automatische Verteidigung
Zeigt einen Knopf f�r die Automatische Verteidigung bei Angriffsw�rfen im Chat an, falls ein Ziel markiert war. Der Eigner des Ziels kann �ber den Knopf direkt den Verteidigungswurf ausf�hren, wobei ggf. resultierender Schaden automatisch zugewiesen wird.
- Schalter zum Ein- und Ausschalten der Automatischen Verteidigung in den Spieleinstellungen

**Marsianische Moderne**

###v1.0.3

- Beim Hinzuf�gen von Schaden, werden die daraus resultierenden Effekte nicht nur im Chat angezeigt, sondern auch dem Token als Effekt zugewiesen. Das betrifft Bet�ubt, Bewusstlos, Liegend und Tod.
- Erweiterung des Journals Space 1889 Hilfe im Kompendium
- Space 1889 Hilfe Journal l�sst sich auch im Chat �ber "/help" �ffnen
- Bugfix: Spezialisierungen f�r eigene Fertigkeiten lassen sich nicht erzeugen ([#12](https://github.com/Scepfari/SPACE1889-FVTT/issues/12))

###v1.0.2

- erste System Tour verf�gbar: der Charakterbogen
- neues Journal Entry Kompendium: Space 1889 Hilfe
- passive-, aktive- und volle Abwehr ist nun direkt im SC bzw. NSC Bogen erreichbar
- Bugfix: Charakter lassen sich nicht mehr einer Fahrzeug Besatzungsposition zuweisen ([#10](https://github.com/Scepfari/SPACE1889-FVTT/issues/10))
- Bugfix: Passive Abwehr von Fahrzeugen l�sst sich nicht �ndern ([#11](https://github.com/Scepfari/SPACE1889-FVTT/issues/11))

###v1.0.1

- Fix Migration Workaround (Upgrade 9.280 => 10.284)

**Marsianische Moderne**

###v1.0.0

- Umstieg auf Foundry VTT Version 10
- Fahrzeuge werden von Token Action HUD (ab v3.0.6) unterst�tzt
- aktive und passive Verteidigung kann direkt �ber Token Action HUD angesto�en werden
- Bugfix: Fahrzeugverteidigung kann nicht mehr unter den Wert der passiven Verteidigung fallen (passiert in 0.8.0 bei gro�en negativen Werten f�r die Man�vrierf�higkeit