# ADONIS Importer

Die Prozessmanagement-Software ADONIS bietet eine recht umständliche Konfiguration ihrer Imports an:

1. Die Eigenschaften müssen bekannt sein (meist sind sie in Produktionssystemen ausgeblendet).
2. Daraus muss eine XML-Konfigurationsdatei entwickelt werden.
3. Zum Schluss muss noch eine Excel-Vorlage erstellt werden, die zu dieser Konfigurationsdatei passt.

Da alles Handarbeit ist, ist die Fehleranfälligkeit hoch, und es werden lieber wenige, dafür aber überbordend umfangreiche Import-Konfigurationen erstellt, die auf alle möglichen Szenarien passen, statt zielgenaue kleine Listen.

Ziel dieser Anwendung ist es, dieses Problem zu lösen: Sie erhalten eine Übersicht über die Eigenschaften Ihrer Konfiguration, wählen aus, welche davon Sie importieren möchten, und erhalten dann die XML-Konfigurationsdatei und die Excel-Vorlage automatisch erstellt. Sie müssen diese nur noch importieren und können so die passenden Konfigurationen schnell und zielgenau erstellen.

> Ein direkter Import aus dieser Anwendung heraus ist theoretisch ebenfalls möglich und im Programm vorbereitet, aber solange deaktiviert, bis ADONIS eine REST-API mit allen benötigten Funktionen zur Verfügung stellt. Damit wäre es möglich, die Daten aus einer beliebigen Tabelle über die Zwischenablage einzufügen. Durch das Verschieben der Spaltenköpfe lassen sich die Import-Spalten der Tabelle anpassen. Allerdings können hier nur Attribute importiert werden, aber keine Verknüpfungen zu anderen Objekten.

Die Anwendung läuft vollständig in Ihrem Browser, d. h. nach dem Laden findet keine Kommunikation mit dem Ausgangssystem mehr statt. Damit können Sie auf eine sichere Art und Weise jedes ADONIS-System
erreichen, das Ihr PC erreichen kann.

Damit die Anwendung funktioniert, müssen REST mit Basic-Authentifzierung und CORS aktiviert sein. Eine Anleitund dazu finden Sie im [Administrationshandbuch](https://docs.boc-group.com/adonis/de/docs/17.1/admin_page/compset-00000/#compset-R0000").

Außerdem benötigen Sie ein lokales Benutzerkonto (LDAP-Konten funktionieren nicht) und müssen die IP-Adresse Ihres Clients freigeschaltet haben. Sind diese Voraussetzungen erfüllt, können Sie oben den Host-Namen Ihres ADONIS-Systems sowie Benutzername und Kennwort des eingerichteten Benutzerkontos eingeben und sich durch die Konfigurationsschritte führen lassen.

> Ein kleiner Hinweis: Die REST API von ADONIS ist etwas langsam und erfordert sehr viele Aufrufe. Während dieser Aufrufe pulsiert ein Quadrat. Die Bedienung währenddessen ist teilweise trotzdem ermöglicht, soweit dies sinnvoll ist.
