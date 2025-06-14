# Changelog 

## Mondreich

### v2.3.6
- Talente haben nun einen Schalter Kampagnen Effekt. Wird dieser aktiviert, wird das Talent von der Berechnung der verwendeten Erfahrungspunkte ausgenommen.

### v2.3.5
- Das Figuren bzw. das Charakterbild einer Figur kann nun per Tastendruck, Standard ist [I] bzw. [SHIFT][I], in groß angezeigt werden. Dafür muss nur der Mauszeiger vorher über der gewünschten Figur platziert werden.
- Bugfixes:
  - Beim Laden und Entladen von Waffen wird im Chat nun auch die Munitionsart mit angegeben
  - Berechnung des Schwerkraftmalus im Charakterbogen wurde korrigiert, wodurch das Talent Schwerkraftadaption richtig beachtet wird, d.h. von allen Heimat Schwerkraftzone wird die, die am nächsten an der aktuellen Zone liegt, für die Malusberechnung herangezogen.
  - Entfernen von Foundry V12 warnings

### v2.3.4
- Schwerkraft:
  - Bei SCs und NSCs kann jetzt die Heimatschwerkraft eingetragen werden
  - Im Charakterbogen erscheint ein Hinweis, falls sich der Charakter im ungewohnten Schwerkraftfeld bewegt
  - Der Tooltip gibt über den Malus Auskunft, wobei Eingewöhnungszeit, sowie die Talente Schwerkrafterfahren und Schwerkraftadaption beachtet werden
  - Anpassung der Charakter in den Kompendien
- Überarbeitung der Bearbeiten / Löschen Icons im Charakterbogen (Stil und Tooltip)
- Grundressourcen lassen sich nun im Charakterbogen editieren
- Überarbeitung des Talentbogens: Anstelle der in der Hilfe aufgelisteten Schlüssel einzutragen, lassen sich nun alle Werte bequem über Auswahlboxen einstellen
- Neuer Munitionstyp Sonnenstrahlen eingeführt, für Waffen die kein Munitionselement benötigen. z.B. wie das Solargewehr
- Bugfix: fix Add Ressource Knopf im NPC Bogen
- Bugfix: Talent Innerer Kompass im Kompendium korrigiert, sodass der Bonus auf Orientierung nun enthalten ist

### v2.3.3
- Lichtquellen und Sicht: Das System besitzt zwei neue Item Typen (Lichtquelle Sichtverbesserung), die im Inventar von Charakteren dazu genutzt werden können, schnell die Licht und Sicht Einstellungen von Figuren zu beeinflussen. Ist das Modul Simple Calendar aktiv, werden die Einstellungen nach Ablauf der Wirkungsdauer automatisch zurückgesetzt. Einzelheiten dazu können der Hilfe entnommen werden.   
- Gehaltene Lichtquellen können fallen gelassen werden, falls die den Sturz unbeschadet überstehen, wird an der Stelle des Token eine Lichtquelle auf der Beleuchtungsebene platziert, die nach der Restleuchtzeit automatisch verlischt (benötigt Simple Calendar). 
- Automatische Figurenauswahl: Für die SL wird in Begegnungen automatisch die (NSC-) Figur selektiert, die am Zug ist. Ausgenommen davon sind Figuren, die einem Spieler gehören. Die Funktion lässt sich in den SPACE 1889 Einstellungsoptionen abschalten.
- Erweiterte Liste für die SL bei der Gravitationseinstellung,  d.h. sie kann nun in 0.1g Schritten gewählt werden. Zusätzlich sind die Monde Io, Ganymed und Titan hinzugekommen.
- Mehr Informationen bei Mehrfachverteidigung im Chat, also der wievielte Abwehrwurf in der Runde war das und welchen Malus bewirkt er.
- Die Add Item Auswahlliste ist jetzt für deutsch alphabetisch sortiert.

### v2.3.2
- Bugfix: Fehlende Icons bei den Musiksteuerungsknöpfen ([#21](https://github.com/Scepfari/SPACE1889-FVTT/issues/21))
- Bugfix: Fehlerhafte Fertigkeitswertberechnung ([#22](https://github.com/Scepfari/SPACE1889-FVTT/issues/22))
- Bugfix: Im Fahrzeugbogen lassen sich keine selbst definierten Fertigkeiten als Pilotenfertigkeit auswählen ([#23](https://github.com/Scepfari/SPACE1889-FVTT/issues/23))
- Bugfix: Die Zeit wird bei Begegnungsrundenwechsel nicht vorgesetzt ([#24](https://github.com/Scepfari/SPACE1889-FVTT/issues/24))
- Bugfix: Automatische Verteidigung: Knopf fehlt bzw. funktioniert nicht ([#25](https://github.com/Scepfari/SPACE1889-FVTT/issues/25))
- Bugfix: Anwendung der Ersten Hilfe funktioniert nicht immer ([#26](https://github.com/Scepfari/SPACE1889-FVTT/issues/26))

### v2.3.1
- Neue Item Typen für Archetyp, Motivation und Spezies hinzugefügt. Mit diesen Typen erstellte Items erweitern die entsprechenden Auswahllisten im Charakter- und NSC- Bogen.
- Bugfix: Fehlende englisch Übersetzung der Schwäche Arten

### v2.3.0
- Unterstützung für Foundry VTT V12. Die alten Versionen V10 und V11 werden weiterhin unterstützt.
- Systemunterstützung für die Kampfmanöver Entwaffnen, Festhalten und Bein stellen
- Figur HUD Erweiterung: Beim Rechtsklick auf eine Figur werden nun zusätzliche Schaltflächen unter der Figur eingeblendet. Je nachdem ob die Aktion gerade möglich ist, sind das: 
  - Angriff mit der Primärhand Waffe
  - Angriff mit der Nebenhand Waffe
  - Festhalten
  - Bein stellen
  - Entwaffnen
  - Talent Angriff, wie Paralysierender Schlag oder Assassine
  - beliebiger Fertigkeitswurf
- [Shift] oder [STRG] + Linksklick auf eine dieser Schaltflächen öffnet den zugehörigen Dialog für spezielle Optionen und Modifikatoren 
- Anpassung der Tooltip Position in den Charakterbögen, damit der Tooltip weniger über den Knöpfen zum auslösen von Würfen liegen, insbesondere wenn der Charakterbogen sich in der Nähe des linken Bildschirmrands befindet.
- Verbesserte Rüstung-Tooltips
- kleiner Bugfixes

## Niedergang der Errungenschaften

### v2.2.5
- Neuer Dialog um auf beliebige Fertigkeiten, Fertigkeitsgruppen oder Spezialisierungen zu würfeln 
  - Ungelernte Fertigkeiten/Spezialisierungen erhalten die von den Regeln vorgesehenen Abzüge, einschließlich Beachtung der Talente Vielseitig und Universalist
  - Der Dialog lässt sich auch per konfigurierbarer Tastenkombination (Standard: [F]) öffnen. Als Basis dient dann die aktuelle ausgewählte Figur oder der zugeordnete Spieler
- Verbesserte Effekt Tooltips
- Veränderung des aktiven Elements in einigen Würfelwurfmodifikationsdialogen 

### v2.2.4
- Verbesserungen an der Langfristigen Probe
- Unterstützung der Schwarm Kampfregeln, falls die Kampfunterstützung in den Einstellungen aktiv ist. Ob eine Kreatur ein Schwarm ist oder nicht wird an dem Vorhandensein des Talentes "Schwarm" festgemacht, welches jetzt neu im Kompendium enthalten ist. Die im Kompendium enthaltenen Schwarmkreaturen wurden mit dem Talent ausgestattet.
- Neuer Dialog für Automatische Verteidigung, erreichbar über [STRG] und oder [SHIFT] und Klick auf den "Automatische Verteidigung" Knopf im Chat. Der Dialog zeigt die möglichen Abwehrkampfmanöver an, die bei diesem Angriff gewählt werden können. Damit sind auch Volle Verteidigung und nicht instinktives Blocken, Parieren oder Ausweichen möglich. 
- Neuer Zustand (Effekt) Volle Verteidigung. Charakter mit diesem Zustand können in dieser Kampfrunde nicht angreifen
- Im Waffenbogen enthält die Auswahlbox für die Kampfspezialisierung nur noch die Spezialisierungen an die zur ausgewählten Kampffertigkeit gehören
- Tooltip für Effekte im Charakterbogen 

### v2.2.3
- Systemunterstützung für Langfristige Proben => Einzelheiten in der Hilfe
- Abstandsmessung zur Entfernungsbestimmung für Fernangriffe beachten nun den Höhenunterschied der beteiligten Figuren.
- lokalisierte Standardnamen für Items die über den Charakterbogen erzeugt werden. Z.B. erhält ein neu erstellter Gegenstand den Namen "Gegenstand (42)" anstelle von "new item"
- fix Rundumschlag: Exception wenn die Charakter Größe > 0 war
- fix: Spezialisierung "Bomben" im Kompendium hat nun die korrekte Basisfertigkeit eingetragen
- weitere V12 Vorarbeiten

### v2.2.2
- Space Menü Überarbeitung:
  - Ein Klick auf den Knopf wechselt nicht mehr in eine spezielle Foundry Ebene, sondern lässt die aktuelle Foundry Ebene unangetastet und öffnet ein schwebendes Fenster in dem die bekannten Menüunterfunktionen enthalten sind.
  - Damit ist es nun auch mit V11 wieder möglich Figuren auszuwählen, bevor eine der Funktion aufgerufen wird
  - Die Position des Space Menü-Fensters wird sich vom System gemerkt, womit es nach dem Schließen und erneuten Öffnen an der vorhergehenden Position erscheint
  - Neuer Eintrag "Schwerkraft" im Space Menü: Damit lässt sich die aktuelle Schwerkraft einstellen, die sich auf die Beladungsstufe der Charaktere auswirkt
  - Neuer Eintrag "Figurennamen verschleiern" im Space Menü, mit dem ausgewählte oder alle Figuren der Szene einen generischen Namen erhalten, soweit die Spielenden keine Rechte an der Figur haben. Damit sehen die Spieler weder im Chat noch in der Begegnungsliste, dass sie es z.B. mit der Rechten Hand des Oberbösewichtes zu tun haben, sondern nur mit NPC 1.
- Weiter Arbeiten an den Tooltips
  - Sowohl die Tooltips als auch die Chat info Erzeugung von Items basieren jetzt auf dem gleichen Code und unterscheiden sich nur noch in der Darstellung die per css geregelt ist
  - Tooltips von den Listen Objekten (wie Fertigkeiten, Talente, Gegenstände, Waffen, Munition, Geld usw.) erfolgt nun nicht mehr unter, sondern links vom Feld.
  - Tooltips für primäre und sekundäre Attribute
  - Tooltips auch im NPC und Kreaturen Bogen
  - Damage Tooltip im gleichen Design wie der Rest
- Unterstützung von Feuerlanzen, d.h. in den Kompendien befinden sich nun die Waffe "Feuerlanze", die Munition "FL-Energiespeicherkristall", als auch die Gewehr Spezialisierung "Feuerlanze"
- Fremdsprachenlimit erhöht sich jetzt weiter, wenn Linguistik größer als 10 wird, und zwar um 4 pro Stufe
- Automatische Heilzeit Updates im Charakterbogen. Das funktioniert allerdings nur, wenn die Spieler auch das Recht im Simple Calendar Modul erhalten haben, die Zeit zu verstellen, da sonst der Simple Calendar kein DateTimeChange Event feuert.
- Neuer Archetyp "Artefakt" hinzugefügt
- Neue Spezies "Konstrukt" hinzugefügt
- Im Hilfedokument, erreichbar über das i im Space Menü, wurde um Informationen zur Talenterstellung ergänzt, insbesondere um die Auflistung und Bedeutung der Schlüssel Ids.
- Bugfix: Überladungssymbol wird nun auch im NSC Bogen angezeigt
- Bugfix: Die Miniaturbilder von Gegenständen behalten nun ihr ursprünglichen aspect ratio bei.
- Bugfix: Abstandsberechnung bei Fernkampfangriffen, liefert nun 1,5m anstelle von 2,12m zurück, wenn die zwei Figuren diagonal nebeneinander stehen und die Gittergröße kleiner gleich 1,5m ist.
- Erste interne Umbauten um Foundry V12 kompatibel zu werden

### v2.2.1
- Migration bugfix

### v2.2.0
- Heilung und Schaden überarbeitet 
  - Einführung des Zustandes Lebensgefahr 
  - Unterstützung für Stabilisieren, automatisch über Konstitionsprobe oder Erste Hilfe/Medizinprobe
  - direkte Möglichkeit, um Stilpunkte bei einem Stabilisierungswurf einzusetzen
  - Erste Hilfe
  - natürliche Heilung über die Zeit (setzt das Modul Simple Calendar voraus)
  - entfernen von Effekten nach deren Ablauf (setzt das Modul Simple Calendar voraus)
  - verbesserter Schadens-Tooltip im SC/NSC Bogen
  - erweiterter Schadensbogen
  - Hilfe um das Thema Heilung erweitert
- Direkte Möglichkeit bei Erhalt von Schaden Stilpunkten zur Reduzierung aufzuwenden, wodurch der Schaden reduziert wird und ggf. dann nicht mehr auftretenden Effekte, wie Betäubt, wieder entfernt werden.
- Überarbeitung der Tooltips
  - nun alle im Foundry Style 
  - nun auch für Gegenstände und Fertigkeiten
- neue Knöpfe in den Spieleinstellungen -> Dokumentation um direkt per Klick sowohl die Bedienhilfe aufzurufen, als auch einen Fehler zu melden
- die Eingabe vom Gewicht von Gegenständen erlaubt nun sowohl "." als auch "," als Dezimaltrennzeichen
- bugfixes


## Dynastie der Sterngeborenen

### v2.1.1
- Anzeige der Initiativewürfe im Chat (einschließlich der Würfelanimation) lässt sich in den Einstellungen optional abschalten. Würfelt die SL so für unsichtbare Gegner, bemerken die Spieler das nicht.
- css für schmale Scrollbars hinzugefügt
- Englische Übersetzung für die Munition im Munitionskompendium hinzugefügt
- Fix: Im Fahrzeugbogen lässt sich die Pilotenfertigkeit wieder verändern
- Fix: Ausgabe der Ressourceninformation im Chat enthält jetzt auch die Benutzerbeschreibung
- Fix: Fertigkeitswürfe werden im Kampf im Chat nicht mehr als Angriffsaktion bezeichnet
- Fix: Gewichtsberechnung, d.h. das Gewicht von Geschützen wird nur noch ignoriert, wenn es sich um ein montiertes Geschütz handelt

### v2.1.0
- Hinzufügen der Effekt-Unterstützung für Attribute. Damit ist es nun möglich Effekte hinzuzufügen, die die primären und sekundären Attribute verändern. Die nötigen Attributschlüssel sind in der Hilfe unter Effekte aufgelistet.
- Die temporäre Talentsteigerung per Stilpunkt, kann nun direkt per Mausklick im Charakterbogen ausgelöst werden. Dafür wird das Talent mit einem entsprechenden Effekt versehen. Diese Funktion ist nur ab Foundry VTT V11 verfügbar, V10 unterstützt das Editieren von eingebetteten Dokumenten in eingebetteten Dokumentn nicht. Einzelheiten dazu [hier.](https://foundryvtt.com/article/v11-document-hierarchy/)
- Neuer Angriffsdialog für modifizierte Angriffe (benötigt aktivierte Kampfunterstützung und ist über Shift + Mausklick erreichbar):  
  - der Angriffsdialog enthält nun alle Optionen des vollen Angriffes sowie die Optionen für Autofeuer, soweit die verwendete Waffe dies unterstützt
  - der jeweilige Munitionsverbrauch wird automatisch abgezogen, auch bei Angriffen die mehr als eine Kugel benötigen
  - die Voller Angriff als auch die Autofeuer Manöver bewirken jetzt auch den Zustand Voller Angriff in dem die Aktive Abwehr auf 0 sinkt. Dieser Zustand verschwindet automatisch beim Übergang in die nächste Kampfrunde bzw. beim Beenden der Begegnung
- Das Messband im UI ist nun Euklidisch, also so wie auch die interne Entfernungsberechnung für Schußwaffenangriffe
- Fix: Angriffe sind nur noch möglich wenn der Angreifer Teilnehmer einer Begegnung ist oder keine Begegnung aktiv ist
- Bugfix: Bei der Beladungsberechung werden die bedienten Geschütze nicht mehr mit einbezogen. 
- Bugfix: In die Berechnung von Blocken, Parade und Ausweichen geht die getragene Rüstung nicht mehr doppelt ein.
- Bugfix Laden von Begegnungswerten: Die Anzahl der in der Kampfrunde schon durchgeführten Verteidigungen, bleibt nun auch nach einem Neuladen wie einem Browser F5 Refresh erhalten.


## Zeit der drei namenlosen Weltreiche

### v2.0.6
- Bugfix: Fehlerhafte Berechnung der automatischen Abzüge bei Mehrfachverteidigung für kleinen Kreaturen ([#19](https://github.com/Scepfari/SPACE1889-FVTT/issues/19))

### v2.0.5
- Würfeldialogverbesserungen: 
  - bei primären Attributswürfen: Umschalter ob einfach oder doppelter Primärattributwert verwendet werden soll, Anzeige der resultierenden Würfelanzahl, sowie Tooltip für die Würfelanzahl im Chat, der über die Zusammensetzung aufklärt
  - Die Dialoge haben nun die Option ob der Wurf öffentlich, privat oder privat & SL durchgeführt werden soll
- Neue Einstellungsoption: Der Spieler kann nun erwingen, dass bei jedem Attributswurf der Modifikationsdialog angezeigt werden soll, unabhängig davon ob dabei die Tasten [SHIFT] oder [STRG] gedrückt wurden
- Bugfix: fehlende Schadensausgabe bei Gegenangriffen wie "Gegenschalg" und "Riposte".
- Bugfix: Kaputte Chat Ausgabe von Fertigkeitswürfen mit Foundry Version 308

### v2.0.4
- Neue veränderbare Tastenkombination zum Schließen des aktiven Fensters. Die Standardbelegung ist die ESC Taste, womit das von Foundry übliche Verhalten auf Druck der ESC Taste alle offenen, einschließlich der minimierten, Fenster zu schließen, unterbunden wird. Soll die ESC Taste wie früher funktionieren, muss der Funktion zum Schließen des aktiven Fensters eine andere Tastenkombination zugewiesen werden. Dank an Forien auf Discord für das Teilen des Quellcodes.

### v2.0.3
- Neue Option in den Einstellungen, um NSCs wie SCs zu behandeln. Wenn aktiv, sind NSCs nicht schon bei Gesundheit von 0 besiegt, sondern sterben wie die Charaktere erst bei einer Gesundheit von -5
- Waffen können nun spezielle Effekte verursachen die zusätzlich oder ausschließlich bei einem Treffer angewendet werden. Ein Beispiel dafür ist der nun im Kompendium enthaltene Flammenwerfer.
- Neuer Munitionstyp Chemikalien und zugehöriger Kapazitätstyp Tank
- Neuer externer Link zum Zeughaus, verfügbar über das Foudry Symbol links oben
- Fix: Angriffe mit Flächenschadenswaffen sind jetzt erst erfolgreich wenn sie die Abwehrprobe übertreffen, nicht schon bei Gleichstand.
- Fix: Auto Verteidigung Flächenschaden: Die Abzüge/Zuschläge werden nun richtig berechnet, womit große Kreaturen weniger und kleine Kreaturen mehr Flächenschaden erhalten. Zuvor war es fälschlicherweise umgekehrt.
- Fix: V11 der durch Schaden automatisch erzeugte "Tot Marker" überdeckt nun auch, wie bei V10, die gesamte Figur

### v2.0.2
- Neue Option in den Einstellungen, um die Einrücktiefe der Ordner und Unterordner zu definieren
- Liste der empfohlenen Module, verfügbar über das Foundry Symbol links oben
- Fix: Negative Gesundheit bei Kreaturen wird nun korrekt wie bei SCs und NSCs angewendet
- Fix: Negative Gesundheit führt nicht mehr zu negativen Wahrnehmungs bzw. Initiative Werten
- Fix: V11 Warnung bezüglich pack.private durch Umstieg auf pack.ownership entfernt
- Fix: V11 Immersionsrahmen der Schnellleiste

### v2.0.1
- Die Bögen von Charakteren, NSCs, Kreaturen und Fahrzeugen besitzen jetzt zwei neue Textfelder: 
  - SL Info: Ist nur für den Spielleiter sichtbar, selbst wenn die Spieler Besitzer des Akteurs sind.
  - Spieler Info: Ist für Spieler auch dann sichtbar und editierbar, wenn er nur beschränkte Rechte am Akteur hat. Das Editieren mit beschränkten Rechten funktioniert allerdings nur wenn die Spielleitung im Spiel angemeldet ist.
- Fix: Der Effekt gelähmt wirkt sich jetzt auch auf die Werte im Charakterbogen aus, indem die aktive Abwehr auf 0 fällt und das in alle davon abgeleiteten Größen mit einfließt. Gelähmt heißt auch, das keine volle Abwehr mehr möglich ist.
- Fix: Negativer Gesundheit wirkt sich nun regelkonform auch auf die Sekundären und Teile der Primären (Stärke und Geschicklichkeit) automatisch aus. Das schließt auch die speziellen Verteidigungsmanöver wie Parade und Co ein.
- Fix: Effekte in Foundry V11

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
