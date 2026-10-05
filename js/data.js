/* data.js - eras, categories and landmarks.
   Coordinates are approximate (+/- 50-100 m). Edit freely: long-press the map in the app to copy exact lat/lon. */
(function (global) {
'use strict';
const NM = global.NM = global.NM || {};

const ERAS = [
  { id: '1648', year: '1648', name: 'Merian era',        sub: 'Walled imperial city' },
  { id: '1939', year: '1939', name: 'Before the war',    sub: 'The old town intact' },
  { id: '1945', year: '1945', name: 'After the bombing', sub: 'Rubble and ruins' },
  { id: 'now',  year: 'Today', name: 'Present day',      sub: 'Rebuilt' }
];

const STATUS = {
  standing: { label: 'Standing',      color: '#2f8f5b' },
  damaged:  { label: 'Damaged',       color: '#e0a100' },
  ruin:     { label: 'In ruins',      color: '#c0392b' },
  rebuilt:  { label: 'Rebuilt',       color: '#2a6fb0' },
  absent:   { label: 'Not built yet', color: '#8d8d8d' }
};

const CATS = {
  castle:    { label: 'Castle & Gates',     color: '#a8322d' },
  church:    { label: 'Churches',           color: '#3b5ba9' },
  civic:     { label: 'Civic & Bridges',    color: '#d9822b' },
  culture:   { label: 'Museums & Memorials',color: '#1f8a82' },
  trials:    { label: 'Nazi Era & Trials',  color: '#6a3d8f' },
  transport: { label: 'Transport',          color: '#2f8f4e' }
};

// era entry: [status, text, optional badge text]
const LANDMARKS = [
{
  id: 'kaiserburg', name: 'Kaiserburg (Imperial Castle)', cat: 'castle', icon: 'castle',
  lat: 49.45808, lon: 11.07539, built: 'from c. 1050',
  blurb: 'The sandstone fortress above the old town, seat of Holy Roman Emperors.',
  fp: { type: 'castle', rot: 0, poly: [[-70,-8],[-50,12],[-20,16],[10,14],[50,10],[75,0],[60,-14],[20,-12],[-20,-16],[-55,-12]] },
  wiki: 'Nuremberg Castle',
  eras: {
    '1648': ['standing', 'Still the emperor\'s castle, high above a walled Free Imperial City. The Thirty Years\' War (1618-48) was ending; the city had been besieged in 1632 and was weakened, but its walls and towers stood.'],
    '1939': ['standing', 'A national monument. The Nazi regime leaned on Nuremberg\'s imperial past in its propaganda, and from the early war years rock cellars under the castle hill were used to shelter art treasures.'],
    '1945': ['ruin', 'The air raid of 2 January 1945 and the battle in April left the castle badly damaged; roofs and interiors of several buildings were destroyed.'],
    'now':  ['rebuilt', 'Rebuilt over decades and open as a museum. Climb the Sinwell Tower for the view and see the Deep Well, around 48 m deep.']
  },
  facts: ['The Golden Bull of 1356 required each new German king to hold his first imperial diet in Nuremberg.',
          'Nuremberg first appears in written records in 1050.',
          'The imperial crown jewels were kept in the city from 1424 until 1796.']
},
{
  id: 'durer', name: 'Albrecht Dürer\'s House', cat: 'culture', icon: 'house',
  lat: 49.45715, lon: 11.07377, built: 'c. 1420',
  blurb: 'Home and workshop of Germany\'s most famous Renaissance artist.',
  fp: { type: 'hall', w: 16, h: 11, rot: -10 },
  wiki: 'Albrecht Dürer\'s House',
  eras: {
    '1648': ['standing', 'Dürer died in 1528 and the half-timbered house had long passed to other owners; it was one more house on the slope below the castle.'],
    '1939': ['standing', 'A museum since 1871, the 400th anniversary of Dürer\'s birth, and one of the most photographed houses in the city.'],
    '1945': ['damaged', 'Damaged in the bombing, but the house survived and was repaired after the war.'],
    'now':  ['rebuilt', 'Restored and open to visitors, with furnished rooms and a graphics workshop that shows Dürer\'s working life.']
  },
  facts: ['Dürer lived and worked here from 1509 until his death in 1528.',
          'He is buried in the Johannisfriedhof, grave 649.']
},
{
  id: 'hauptmarkt', name: 'Hauptmarkt & Schöner Brunnen', cat: 'civic', icon: 'fountain',
  lat: 49.45423, lon: 11.07704, built: 'square after 1349; fountain 1385-96',
  blurb: 'The central market square and its 19-metre Gothic "Beautiful Fountain".',
  fp: { type: 'fountain', w: 8 },
  wiki: 'Hauptmarkt, Nuremberg',
  eras: {
    '1648': ['standing', 'The square was laid out after the Jewish quarter was destroyed in the pogrom of 1349. The Gothic Schöner Brunnen already stood at its edge.'],
    '1939': ['standing', 'The Nazis renamed the square "Adolf-Hitler-Platz" in 1933 and used it for rallies and parades. The old name returned in 1945.'],
    '1945': ['damaged', 'Houses around the square were reduced to rubble, but the Schöner Brunnen survived inside a protective concrete casing.', 'Fountain survived'],
    'now':  ['rebuilt', 'Rebuilt on its old plan. Every Advent it hosts the Christkindlesmarkt, which returned in the late 1940s.']
  },
  facts: ['The fountain is about 19 m tall and decorated with some 40 figures.',
          'Tradition says that turning the seamless ring set in its iron fence brings luck.']
},
{
  id: 'frauenkirche', name: 'Frauenkirche (Church of Our Lady)', cat: 'church', icon: 'church',
  lat: 49.45405, lon: 11.0782, built: '1352-1362',
  blurb: 'Gothic hall church on the Hauptmarkt, famous for its noon clock show.',
  fp: { type: 'church', w: 40, h: 20, rot: 0 },
  wiki: 'Frauenkirche, Nuremberg',
  eras: {
    '1648': ['standing', 'Built for Emperor Charles IV on the site of the synagogue destroyed in 1349. The Männleinlaufen clock, added around 1509, already paraded the electors past the emperor at noon.'],
    '1939': ['standing', 'A landmark of the Hauptmarkt; its ornate gabled front and the daily clock show drew visitors from all over Germany.'],
    '1945': ['damaged', 'Badly damaged by the air raids, with much of the roof and interior lost.'],
    'now':  ['rebuilt', 'Rebuilt after the war. Every day at noon the Männleinlaufen clock sets seven electors in motion around the emperor.']
  },
  facts: ['The church stands where the synagogue stood until the 1349 pogrom.']
},
{
  id: 'sebald', name: 'St. Sebaldus Church', cat: 'church', icon: 'church',
  lat: 49.45528, lon: 11.07644, built: 'c. 1225-1273',
  blurb: 'The oldest of Nuremberg\'s great churches, home to the bronze Shrine of St. Sebald.',
  fp: { type: 'church', w: 90, h: 32, rot: 0 },
  wiki: 'St. Sebaldus, Nuremberg',
  eras: {
    '1648': ['standing', 'A Lutheran parish church since the Reformation of 1525, holding Peter Vischer\'s bronze shrine of St. Sebald, finished in 1519.'],
    '1939': ['standing', 'One of the twin great churches of the old town, rising above the Rathaus and the road up to the castle.'],
    '1945': ['ruin', 'Roof and vaults collapsed in the January 1945 firestorm; only the shell and towers stood. Many treasures had been sheltered in advance.'],
    'now':  ['rebuilt', 'Rebuilt in the 1950s, with the Vischer shrine back on display.']
  },
  facts: ['The shrine was made by Peter Vischer the Elder and his sons between about 1508 and 1519.']
},
{
  id: 'lorenz', name: 'St. Lorenz Church', cat: 'church', icon: 'church',
  lat: 49.451, lon: 11.07865, built: 'c. 1250-1477',
  blurb: 'Twin-towered Gothic hall church with Veit Stoss\'s hanging "Angelic Salutation".',
  fp: { type: 'church', w: 100, h: 34, rot: 0 },
  wiki: 'St. Lorenz, Nuremberg',
  eras: {
    '1648': ['standing', 'Lutheran since 1525. Veit Stoss\'s carved "Angelic Salutation" (1517-18) hung in the choir, and Adam Kraft\'s 20 m stone tabernacle rose beside the altar.'],
    '1939': ['standing', 'The great church of the southern half of the old town, its twin spires visible along the main shopping street.'],
    '1945': ['ruin', 'Roof and vaulting were destroyed and the church stood open to the sky. The Angelic Salutation and the tabernacle had been protected and survived.'],
    'now':  ['rebuilt', 'Rebuilt in stages after the war; the Angelic Salutation again hangs in the choir.']
  },
  facts: ['Adam Kraft\'s tabernacle (1493-96) is about 20 m high.']
},
{
  id: 'rathaus', name: 'Old Town Hall (Altes Rathaus)', cat: 'civic', icon: 'hall',
  lat: 49.45525, lon: 11.07756, built: '1332; Renaissance wing 1616-22',
  blurb: 'Gothic and Renaissance town hall with medieval dungeons in its cellars.',
  fp: { type: 'hall', w: 80, h: 26, rot: -8 },
  wiki: 'Nuremberg Town Hall',
  eras: {
    '1648': ['standing', 'Newly extended (1616-22) in Italian Renaissance style. In 1649-50 envoys met here to settle how the Peace of Westphalia would be carried out.'],
    '1939': ['standing', 'Still the city\'s historic hall, its Renaissance front facing Rathausplatz.'],
    '1945': ['ruin', 'Largely burnt out. The medieval dungeons cut into the rock beneath it survived.'],
    'now':  ['rebuilt', 'Rebuilt after the war. The Lochgefängnisse, the old dungeons, can be visited on guided tours.']
  },
  facts: ['The Renaissance wing was designed by Jakob Wolff the Younger.']
},
{
  id: 'weisserturm', name: 'Weißer Turm (White Tower)', cat: 'castle', icon: 'tower',
  lat: 49.45045, lon: 11.07072, built: '14th century',
  blurb: 'A medieval gate tower at the western end of the main shopping streets.',
  fp: { type: 'tower', w: 14 },
  wiki: 'Weißer Turm Nuremberg',
  eras: {
    '1648': ['standing', 'Part of the medieval wall circuit, a gate tower on the western approach to the inner city.'],
    '1939': ['standing', 'Still a gate tower on the edge of the old town, with busy shopping streets leading toward it.'],
    '1945': ['damaged', 'Damaged in the air raids that flattened much of the quarter around it.'],
    'now':  ['rebuilt', 'Restored; it is still the western gateway to the pedestrian shopping streets.']
  },
  facts: ['It belongs to the second ring of city walls, built in the 14th century.']
},
{
  id: 'spital', name: 'Heilig-Geist-Spital', cat: 'civic', icon: 'bridge',
  lat: 49.45301, lon: 11.07963, built: 'founded 1332',
  blurb: 'A hospital built across the river Pegnitz, once guardian of the imperial crown jewels.',
  fp: { type: 'hall', w: 70, h: 26, rot: 0 },
  wiki: 'Heilig-Geist-Spital Nuremberg',
  eras: {
    '1648': ['standing', 'A charitable hospital founded in 1332 that arched across the river. Its church held the empire\'s crown jewels from 1424.'],
    '1939': ['standing', 'Still a charitable foundation and a familiar riverside sight in the old town.'],
    '1945': ['ruin', 'Burned out in the raids; only parts of the structure remained.'],
    'now':  ['rebuilt', 'Rebuilt after the war; its arches again span the Pegnitz.']
  },
  facts: ['In 1796 the crown jewels were evacuated ahead of French troops; today they are in Vienna.']
},
{
  id: 'henkersteg', name: 'Henkersteg & Weinstadel', cat: 'civic', icon: 'bridge',
  lat: 49.45311, lon: 11.07306, built: '16th century',
  blurb: 'The covered "Hangman\'s Bridge" beside the half-timbered Weinstadel.',
  fp: { type: 'hall', w: 55, h: 14, rot: 10 },
  wiki: 'Henkersteg',
  eras: {
    '1648': ['standing', 'A covered wooden footbridge beside the old wine warehouse, named for the executioner who lived nearby.'],
    '1939': ['standing', 'A postcard favourite: half-timbered houses, covered bridge and river, a symbol of "romantic" old Nuremberg.'],
    '1945': ['ruin', 'Severely damaged in the 1945 bombing; one of the most photographed corners of the city lay in ruins.'],
    'now':  ['rebuilt', 'Reconstructed after the war and again one of the city\'s classic views.']
  },
  facts: ['The bridge is named for the hangman, whose quarters stood nearby.']
},
{
  id: 'koenigstor', name: 'Königstor & Handwerkerhof', cat: 'castle', icon: 'tower',
  lat: 49.44784, lon: 11.08196, built: 'gate c. 1400; Handwerkerhof 1971',
  blurb: 'The round gate tower at the railway-station entrance to the old town.',
  fp: { type: 'tower', w: 24 },
  wiki: 'Königstor Nuremberg',
  eras: {
    '1648': ['standing', 'A massive round gate tower in the wall, with moat and bastions around it.'],
    '1939': ['standing', 'The gateway between the railway station and the old town, part of the wall circuit.'],
    '1945': ['damaged', 'The station quarter was among the most heavily bombed areas; the gate tower was damaged but survived.'],
    'now':  ['rebuilt', 'Restored. Just inside, the Handwerkerhof, a craft-market village built in 1971 in "old Nuremberg" style, welcomes visitors from the station.']
  },
  facts: ['The Handwerkerhof is a modern creation from 1971, not an original medieval quarter.']
},
{
  id: 'hbf', name: 'Hauptbahnhof (Central Station)', cat: 'transport', icon: 'train',
  lat: 49.44619, lon: 11.08187, built: '1906',
  blurb: 'Hub of Germany\'s first railway city, where the Ludwigsbahn began in 1835.',
  fp: { type: 'hall', w: 170, h: 34, rot: -4 },
  wiki: 'Nürnberg Hauptbahnhof',
  eras: {
    '1648': ['absent', 'Not built yet. Beyond the walls there were only moat, gardens and fields; the railway age was two centuries away.'],
    '1939': ['standing', 'A major rail hub; the present station dates from 1906. Special trains brought huge crowds to the Nazi Party rallies.'],
    '1945': ['damaged', 'Railway targets were bombed repeatedly in 1944-45; the station and the yards around it were badly damaged.'],
    'now':  ['rebuilt', 'Rebuilt and modernised. Next door the DB Museum tells the story of German railways, starting with the 1835 Nuremberg-Fürth line.']
  },
  facts: ['Germany\'s first public steam railway ran between Nuremberg and Fürth in 1835.']
},
{
  id: 'gnm', name: 'Germanisches Nationalmuseum', cat: 'culture', icon: 'museum',
  lat: 49.44809, lon: 11.0757, built: 'founded 1852',
  blurb: 'Germany\'s largest museum of cultural history, in a former Carthusian monastery.',
  fp: { type: 'hall', w: 110, h: 60, rot: 8 },
  wiki: 'Germanisches Nationalmuseum',
  eras: {
    '1648': ['standing', 'The Carthusian monastery, founded in 1380, still stood here, though the monks had left after the Reformation.'],
    '1939': ['standing', 'Founded in 1852; by now Germany\'s largest cultural-history museum, built around the old monastery.'],
    '1945': ['damaged', 'Heavily damaged by bombs, though much of the collection had been moved out for safekeeping.'],
    'now':  ['rebuilt', 'Rebuilt and expanded. Look for Martin Behaim\'s 1492 "Erdapfel", the oldest surviving terrestrial globe. Outside runs the Way of Human Rights.']
  },
  facts: ['The Way of Human Rights (1993) is a row of 30 white columns inscribed with the articles of the Universal Declaration of Human Rights.']
},
{
  id: 'justiz', name: 'Palace of Justice & Nuremberg Trials', cat: 'trials', icon: 'scales',
  lat: 49.45488, lon: 11.04586, built: '1909-1916',
  blurb: 'Courtroom 600, where the Nazi leaders were tried in 1945-46.',
  fp: { type: 'hall', w: 140, h: 60, rot: -25 },
  wiki: 'Nuremberg trials',
  eras: {
    '1648': ['absent', 'Not built yet. This was open land outside the city, well west of the walls.'],
    '1939': ['standing', 'Built in the early 1900s as the city\'s main courthouse, with a prison at its back.'],
    '1945': ['damaged', 'Damaged but largely usable in a city of ruins, which, with its attached prison, is why the Allies chose it for the International Military Tribunal.'],
    'now':  ['standing', 'Still a working court. The Memorium Nuremberg Trials museum, opened in 2010, includes Courtroom 600.', 'Still a courthouse']
  },
  facts: ['The main trial ran from 20 November 1945 to 1 October 1946, with 22 defendants judged.',
          'Twelve were sentenced to death, seven to prison terms, and three were acquitted.',
          'The Subsequent Nuremberg trials (1946-49) tried doctors, judges and industrialists.']
},
{
  id: 'zeppelin', name: 'Zeppelin Field & Tribune', cat: 'trials', icon: 'stadium',
  lat: 49.42989, lon: 11.12336, built: '1935-1937',
  blurb: 'The Nazi Party\'s main parade ground, designed by Albert Speer.',
  fp: { type: 'hall', w: 30, h: 360, rot: 0 },
  wiki: 'Zeppelinfeld',
  eras: {
    '1648': ['absent', 'Not built yet. Forest, ponds and farmland southeast of the city.'],
    '1939': ['standing', 'The stage for the Nazi Party rallies (1933-38): vast choreographed parades before a stone grandstand.'],
    '1945': ['damaged', 'On 22 April 1945 US Army engineers blew up the giant swastika on the tribune; the field became a US Army "Soldiers\' Field".'],
    'now':  ['standing', 'A protected monument. The tribune\'s flanking towers were removed in the 1960s, and the city works on how best to preserve and explain the site.', 'Protected monument']
  },
  facts: ['The tribune was inspired by the Pergamon Altar in Berlin.']
},
{
  id: 'kongress', name: 'Congress Hall & Documentation Center', cat: 'trials', icon: 'stadium',
  lat: 49.43264, lon: 11.11292, built: 'begun 1935 (unfinished)',
  blurb: 'The Nazis\' unfinished colossal congress hall, now a history museum.',
  fp: { type: 'horseshoe', r: 120, lw: 34 },
  wiki: 'Congress Hall (Nuremberg)',
  eras: {
    '1648': ['absent', 'Not built yet. Only the shore of the Dutzendteich pond lay here.'],
    '1939': ['standing', 'Construction began in 1935 for some 50,000 seats but stalled with the outbreak of war.', 'Unfinished'],
    '1945': ['standing', 'Never completed and left as a shell.', 'Unfinished'],
    'now':  ['standing', 'The northern wing houses the Documentation Center Nazi Party Rally Grounds (opened 2001), exploring how the regime staged itself.', 'Documentation Center']
  },
  facts: ['The hall was never roofed; its brick and granite shell stands as a monument.']
},
{
  id: 'johannis', name: 'Johannisfriedhof (St. John\'s Cemetery)', cat: 'culture', icon: 'cross',
  lat: 49.45858, lon: 11.06125, built: 'c. 1300',
  blurb: 'Medieval cemetery with the graves of Albrecht Dürer and other Nuremberg greats.',
  fp: { type: 'yard', w: 300, h: 120, rot: -20 },
  wiki: 'Johannisfriedhof Nuremberg',
  eras: {
    '1648': ['standing', 'Already centuries old, famous for flat sandstone graves with bronze epitaphs. Dürer had been buried here in 1528.'],
    '1939': ['standing', 'A tree-shaded cemetery just outside the old town and a place of pilgrimage for Dürer admirers.'],
    '1945': ['damaged', 'Air raids caused some damage, but the cemetery largely survived.'],
    'now':  ['standing', 'Still in use and open to visitors; look for Dürer\'s grave (no. 649).']
  },
  facts: ['Veit Stoss is buried here too.']
}
];

NM.data = { ERAS, STATUS, CATS, LANDMARKS };
})(window);
