# Changelog 

## Zeit der drei namenlosen Weltreiche

### v2.0.1
- Die Bögen von Charakteren, NSCs, Kreaturen und Fahrzeugen besitzen jetzt zwei neue Textfelder: 
  - SL Info: Ist nur für den Spielleiter sichtbar, selbst wenn die Spieler Besitzer des Akteurs sind.
  - Spieler Info: Ist für Spieler auch dann sichtbar und editierbar, wenn er nur beschränkte Rechte am Akteur hat. Das Editieren mit beschränkten Rechten funktioniert allerdings nur wenn die Spielleitung im Spiel angemeldet ist.
- Fix: Der Effekt gelähmt wirkt sich jetzt auch auf die Werte im Charakterbogen aus, indem die aktive Abwehr auf 0 fällt und das in alle davon abgeleiteten Größen mit einfließt. Gelähmt heißt auch, das keine volle Abwehr mehr möglich ist.
- Fix: Negativer Gesundheit wirkt sich nun regelkonform auch auf die Sekundären und Teile der Primären (Stärke und Geschicklichkeit) automatisch aus. Das schließt auch die speziellen Verteidigungsmanöver wie Parade und Co ein.


### v2.0.0
- Foundry VTT V10 und V11 Unterstützung
- Einführung des neuen Item Typ "Behälter/Aufbewahrungsort". Dies ersetzt die alte Körper/Rucksack/Lager Zuordnung, das Umlagern von Gegenständen geht weiterhin über ein Klick auf den angezeigten Ort, oder per Drag & Drop. Die Reihenfolge der Behälter im Charakterbogen kann ebenfalls über Drag & Drop auf andere Behälter geändert werden.
- Alle Akteure werden beim Wechsel auf diese Version automatisch konvertiert. Importiert man Akteure aus älteren Versionen oder von selbst erstellten Kompendien, landet erstmal alles was zuvor im Lager oder Rucksack war am Körper. Zieht man diese Akteure in eine Szene und markiert sie, kann man die Konvertierung manuell über den folgenden Nachrichten Befehl anstoßen: /addContainer
- Die aktuelle Last des Akteurs wird nun einschließlich der getragenen Behälter berechnet und die Mali aus der Überladung fließen direkt in die Attribute, und damit auch in allen Proben, ein. 
- Das Ziehen bzw. Nachladen von Waffen ist nun nur noch möglich, wenn die Gegenstände auch von Akteur getragen werden. Ausnahme davon sind natürlich die Geschütze, die viel zu groß und schwer sind getragen zu werden.
- Space Menü Bereitmachen der Waffen:  
  - Funktion ist jetzt auch nur auf ausgewählte Figuren anwendbar
  - Funktion ist zusätzlich über eine Tastenkombination [K] erreichbar 
- Das System rechnet nun die Abzüge bei Proben mit negativer Gesundheit automatisch ein
- Die Bögen von Charakteren, NSCs und Kreaturen enthalten nun Links ( ) über die sich direkt das zugehörige Kompendium öffnen lässt.
- Fix Bewusstlos bei Talent zäher Hund


## Zeitalter der 1000 Weltkriege

### v1.4.3
- Anzeigen eines Bestätigungsdialogs bei Angriffen, falls die Kampfunterstützung aktiv ist und kein Ziel, bzw. ein totes Ziel ausgewählt ist
- Der Angriff über das Talent _Assassine_ wird jetzt richtigerweise wie ein Waffenangriff ausgewertet, d.h. das System überprüft ob eine Nahkampfwaffe in der Hand gehalten wird und nutzt die mit dem meisten Schaden unter Beachtung des _Beidhändig_ Talents.
- Bugfix: _SPACE 1889 Wurf_ Makro funktioniert nicht ([#18](https://github.com/Scepfari/SPACE1889-FVTT/issues/18))

### v1.4.2
- Eigener SPACE 1889 Stil für mehr Immersion.
Lässt sich in den Spieleinstellungen ab- und anschalten
- Figuren unterliegen nun einer Bewegungseinschränkung, falls sie mindestens einen der Zustände _Liegend_, _Betäubt_, _Gelähmt_ oder _Bewusstlos_ besitzen. In diesem Fall kann der Spieler die Figur nicht mehr bewegen, bis all diese Zustände wieder entfernt wurden.
- Die Spielleitung kann diese Bewegungseinschränkung auch für sich aktivieren, entweder in den Spieleinstellungen oder schneller über die konfigurierbare Tastenkombination [Strg + B]. Unabhängig von dieser Einstellung kann er Figuren immer verschieben, wenn diese zusätzlich den Zustand _Tot_ haben.
- Spezieller Listen Typ, in dem die Punkte durch Mars-Kugeln ersetzt wird, wie in dieser Auflistung. 
- Entfernung des SPACE Forum Links, da Uhrwerk sein Forum im April 2023 abgeschaltet hat.

### v1.4.1
- Space Menü um zwei Optionen erweitert:
  - Die Anzeige der Lebensbalken und der Token Namen kann nun für alle Tokens einer Szene gesetzt werden.
  - Bereitmachen der Waffen für alle NSCs einer Szene, mit Nachfrage ob Nahkampf oder Fernkampfwaffen bevorzugt werden sollen. Gewählt wird die Waffe mit dem höchsten Schaden. Die entsprechenden Meldungen im Chat werden an den SL geflüstert. 
- Beim Platzieren von Tokens auf der Szene wird geprüft ob der Akteur hinter der Figur schon auf der Szene ist und ob die Figur auf den Akteur verlinkt ist. Ist dies der Fall und die Figur steht unter alleiniger Kontrolle des SL, erscheint ein Dialog, über den die Verlinkung aufgehoben werden kann. Das ändert auch die Prototypen Figur des Akteurs.
- Das Foundry Pause Bild wurde durch ein Animiertes ersetzt. 

### v1.4.0
- SL Schirm (neues Notiz-Kompendium SPACE1889 GM Infos)
- Eigenes Space Menü in der linken Toolbar mit drei Optionen:
  - Bild im Chat anzeigen (Klick öffnet direkt den Bild-Browser, nur für SL)
  - SL Schirm anzeigen (Klick öffnet die Kompendium Notiz, nur für SL)
  - Bedienhilfe anzeigen (Klick öffnet die Hilfe Notiz aus dem Kompendium, identisch wie das Chat Kommando: "/help")
- Um Space 1889 erweitertes Foundry Anvil Logo links oben in der Ecke
- Das Logo ist anklickbar und öffnet ein Fenster mit nützlichen externen Links, wie auf die GitHub Seite zum eintragen von Fehlermeldungen bzw. Featurewünschen, oder der Link zum Foundry Discord Server


## Krieg der Götter

### v1.3.5
- Waffen haben jetzt einen Schalter, der sie als Zweihändig definiert.
- Alle zweihändigen Waffen im Kompendium, wurden als solche markiert, das schließt auch die getragenen Waffen der in den Kompendien aufgeführten Beispielcharakter und NSCs mit ein.
- Beim Update auf diese Version werden alle Akteure und auch Tokens auf den Szenen bezüglich ihrer zweihändigen Waffen aktualisiert 
- Charaktere und NSCs haben in ihrem Bogen bei den Waffen einen Schalter mit dem sie die Waffe kampfbereit machen können, also die Waffe ziehen und sie der Haupthand, Nebenhand oder bei zweihändigen Waffen in beiden Händen halten wollen.
- Ein Waffenangriff ist jetzt nur noch möglich wenn eine Waffe bereit ist, also in den Händen gehalten wird. 
- Waffen in der Nebenhand erhalten automatisch einen Abzug von -2, außer sie besitzen das Talent "Beidhändig".
- Bugfix: Fehlerhaftes Entladen von Schusswaffen ([#17](https://github.com/Scepfari/SPACE1889-FVTT/issues/17))
- Bugfix Gegenstand Chat Ausgabe: Die überflüssige Ausgabe "Der Eintrag {langId} ist nicht in der Sprach-Datei de.json enthalten." wurde entfernt

### v1.3.4

- Neuer Chat Befehl "/image url_oder_foundryBildpfad" zeigt das Bild hinter der url oder dem Foundry Bildpfad im Chat an. Klickt man auf  dieses Bild wird es groß in einem eigenen Foundry Fenster angezeigt
- Wenn eine Item Beschreibung, unabhängig vom Item Typ, im Chat angezeigt wird und das Standard Bild geändert wurde, wird das Bild mit im Chat angezeigt. Auch hier lässt es sich, über einen Klick, groß in einem eigenen Foundry Fenster anzeigen
- Automatisches Entladen bei Munitionswechsel von Fernkampfwaffen, d.h. die aktuell in der Waffe befindlichen Patronen bei Revolvern und internen Magazinen gehen zurück in den Vorrat
- Bugfix: Fehlende Kampf Zugmarkierung bei nicht mit Szenen verknüpften Begegnungen ([#16](https://github.com/Scepfari/SPACE1889-FVTT/issues/16))

### v1.3.3

- alle Akteur Bögen besitzen jetzt einen Abschnitt in dem die aktuellen Effekte aufgelistet sind
- das System unterbindet Angriffe von Token die von bestimmten Effekt betroffen sind, also Betäubt, Bewusstlos, Gelähmt und Liegend
- Bugfix: Fehlermeldung bei den Spielern wenn der GM einen Akteur erzeugt ([#15](https://github.com/Scepfari/SPACE1889-FVTT/issues/15))

### v1.3.2

- Rechtsklick auf die Illustration im Item Bogen öffnet eine vergrößerte Ansicht, analog zum Akteur Bogen
- neuer Akteur und Item Bögen für beschränkte Rechte, die nur den Namen und die Illustration enthalten, aber keine Werte
- Gegenschlag und Riposte, sowie Parade gegen Waffenlos werden nun beachtet. D.h bei  der Auto Verteidigung, erzeugen, bei entsprechenden Würfen, Parade, Gegenschlag und Riposte nun Schaden beim Angreifer
- Beim Hinzufügen von Tokens (die nicht mit dem Akteur verlinkt sind) in eine Szene, wird der Name hochgezählt, damit die Tokennamen eindeutig bleiben


### v1.3.1

- Automatisches Ausblenden des Automatischen Verteidigungsknopfes nach Benutzung für die Spieler
- Option "Ausblenden des Auto Verteidigung Knopfes" in den Settings, um auch für den SL den diesen Knopf nach Verwendung auszublenden
- BugFix Chat Befehl "/version"
- BugFix: Schadenstyp der über die Automatische Verteidigung erzeugt wird; d.h. jetzt wird der Schadenstyp der verwendeten Munition beachtet.
- BugFix: Angriff über das Talent Assasine ist nur noch Nahkampf/Waffenlos Nähe zum Gegner möglich


### v1.3.0

- neuer Chat Befehl "/version" zeigt die SPACE 1889 Versionsänderungshistorie an
- Neuer Item Typ Munition
- Munitionsverwaltung im Charakter und NSC Bogen, d.h. Akteur Waffen kann Munition zugewiesen werden. Schießen verbraucht Munition, Nachladen (beachtet die Feuerrate und auch das Schnellladen Talent) und Entladen werden unterstützt
- Die Fernkampfwaffe wird über die Munition beeinflusst (Schadenstyp, Schadensmodifikator, Reichweitenfaktor und Kegelaufweitung (Schrot vs. Flintenlaufgeschoss)
- Schrotflinten Korrekturen und Verbesserungen: Korrekter Würfelabzug entsprechend der  Entfernung, Berechnung des Kegel Öffnungswinkels
- Verbesserte Chatausgabe bei Angriffen, sie erfolgt jetzt unter Angabe der Schadensart und der verwendeten Munition
- Waffen-Kompendium erweitert, d.h. Schusswaffen haben jetzt ein Kaliber, das bei der Munition beachtet wird, sprich nur passende Munition kann in die Waffe geladen werden
- Munitions Kompendium, was die Munition der Waffen aus dem Kompendium abdeckt (ohne Schiffswaffen) 
- die Kompendien der Akteure (Beispielcharaktere und die NSCs) wurden aktualisiert, sodass diese jetzt passende Munition dabei haben
- Schusswaffen haben jetzt eine Checkbox um zu Markieren, dass die Waffe mit einem Zielfernrohr ausgestattet ist. Dies wird bei der Berechnung der Entfernungsabzüge berücksichtigt und auch als ToolTip im Charakterbogen (Maus über dem Namen der Waffe platzieren) angezeigt.
- Automatischer Update aller Tokens und Akteure beim ersten Start mit dieser Version. Dadurch werden alle Schusswaffen der Akteure, die aus dem Kompendium stammen, mit der passende Munition versehen. Für Eigenkreationen muss die passende Munition selber erstellt und hinzugefügt werden. 
- Einstellungsoption "Kampfunterstützung" ersetzt "Automatische Verteidigung" 

## Zeit der Kanalbaumeister

### v1.2.1

- Bei Attacken mit gewähltem Ziel wird die Entfernung zwischen Angreifer und Ziel bestimmt und bei Fernwaffen der Entfernungsmodifikator in den Wurf mit eingerechnet. Nahkampfangriffe auf Ziele die weiter als 1,5m entfernt sind werden geblockt. 
- Die automatisch beim Zuteilen von Schaden erzeugten Effekte wie Betäubt, Bewusstlos oder Gelähmt, werden nun nach dem Ablauf der Effektzeit automatisch entfernt. Gilt nur innerhalb einer Begegnung.
- Bugfix: Automatische Verteidigung: Verteidigungsmalus bei Mehrfachangriffen wird nun bei großen Kreaturen richtig berechnet

 ### v1.2.0

- Gegenstände, Waffen, Rüstungen und Geld können jetzt per Drag & Drop umsortiert werden
- Begegnung: der am Zug befindliche Teilnehmer wird mit einem drehenden Zahnrad markiert (kann in den Einstellungen abgeschaltet werden)
- Begegnung: nächster Zug [n] und vorheriger Zug [v] können nun per Tastatur ausgelöst werden (kann unter Steuerung anpassen konfiguriert werden)
- Automatische Verteidigung: Die automatische Verteidigung beachtet die Abzüge die durch mehrfache Angriffe in einer Runde entstehen
- Automatische Verteidigung: Korrektur Paralysierender Schlag, kann auch mit Blocken oder Parade abzüglich passiver Abwehr erfolgen
- Verletzungen erhalten jetzt automatisch den Zeitpunkt ihrer Entstehung. Ist das Modul Simple Calendar installiert und aktiv, wird die dadurch verfügbare In-Spiel-Zeit verwendet. Ohne das Modul wird die PC/Server Zeit verwendet
- In allen Akteur Bögen (Charakter, NSC, Kreatur, Fahrzeug) kann nun per Rechtsklick das Bild in Groß in einem eigenem Fenster angezeigt werden. Auf Wunsch wird dies auch den Spielern angezeigt. 
- Bugfix: Bilder in den Akteur und Item Bögen werden nicht mehr verzerrt dargestellt und behalten jetzt ihr Seitenverhältnis bei
- Bugfix: Parade-Berechnung (nur mit Nahkampfwaffe am Körper)


##Zeit der Zweifel

### v1.1.2

- Bugfix: Auslösen der automatischen Verteidigung durch Spieler nicht möglich ([#13](https://github.com/Scepfari/SPACE1889-FVTT/issues/13))
- Bugfix: Statuseffekte werden nicht erzeugt ([#14](https://github.com/Scepfari/SPACE1889-FVTT/issues/14))

### v1.1.1

- Automatische Verteidigung: schönerer Button, Nachricht bei erfolglosen Angriffen, Verzögerung für die Auswertung der Verteidigung, orientiert sich an den DiceSoNice Einstellungen 
- bei der Automatische Verteidigung wird nun der Typ des Angriffes mit ausgewertet und darauf basierend die richtige Verteidigung ausgewählt (Parade/Blocken falls instinktiv, aktive  oder passive Verteidigung)
- Paralysierender Schlag & Assassine wird von AutoDefense unterstützt
- Automatische Verteidigung bei Flächenschaden: Waffen wie Elektorschocker (also bei denen Flächenschaden aktiv ist), läuft die Verteidigung nur über die Aktive Abwehr und bei Treffer/Berührung (>=) wird der Waffenschaden ausgeteilt
- Neuer Schalter "Kampagnen Effekt" im Ressourcen Bogen, über den diese Ressource aus der EP Berechnung genommen werden kann
- Bugfix: bei Waffen die Flächenangriffe bei Treffer verursachen, wird nur der Fertigkeiten/Spezialisierungswert verwendet, der Flächenschaden geht nicht in den Angriffswurf ein

### v1.1.0

- Automatische Verteidigung
Zeigt einen Knopf für die Automatische Verteidigung bei Angriffswürfen im Chat an, falls ein Ziel markiert war. Der Eigner des Ziels kann über den Knopf direkt den Verteidigungswurf ausführen, wobei ggf. resultierender Schaden automatisch zugewiesen wird.
- Schalter zum Ein- und Ausschalten der Automatischen Verteidigung in den Spieleinstellungen

## Marsianische Moderne

### v1.0.3

- Beim Hinzufügen von Schaden, werden die daraus resultierenden Effekte nicht nur im Chat angezeigt, sondern auch dem Token als Effekt zugewiesen. Das betrifft Betäubt, Bewusstlos, Liegend und Tod.
- Erweiterung des Journals Space 1889 Hilfe im Kompendium
- Space 1889 Hilfe Journal lässt sich auch im Chat über "/help" öffnen
- Bugfix: Spezialisierungen für eigene Fertigkeiten lassen sich nicht erzeugen ([#12](https://github.com/Scepfari/SPACE1889-FVTT/issues/12))

### v1.0.2

- erste System Tour verfügbar: der Charakterbogen
- neues Journal Entry Kompendium: Space 1889 Hilfe
- passive-, aktive- und volle Abwehr ist nun direkt im SC bzw. NSC Bogen erreichbar
- Bugfix: Charakter lassen sich nicht mehr einer Fahrzeug Besatzungsposition zuweisen ([#10](https://github.com/Scepfari/SPACE1889-FVTT/issues/10))
- Bugfix: Passive Abwehr von Fahrzeugen lässt sich nicht ändern ([#11](https://github.com/Scepfari/SPACE1889-FVTT/issues/11))

### v1.0.1

- Fix Migration Workaround (Upgrade 9.280 => 10.284)

### v1.0.0

- Umstieg auf Foundry VTT Version 10
- Fahrzeuge werden von Token Action HUD (ab v3.0.6) unterstützt
- aktive und passive Verteidigung kann direkt über Token Action HUD angestoßen werden
- Bugfix: Fahrzeugverteidigung kann nicht mehr unter den Wert der passiven Verteidigung fallen (passiert in 0.8.0 bei großen negativen Werten für die Manövrierfähigkeit
