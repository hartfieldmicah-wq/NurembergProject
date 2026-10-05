/* i18n.js - English / German UI strings and localised landmark text. */
(function (global) {
'use strict';
const NM = global.NM = global.NM || {};
const D = NM.data;
const S = {
en: {
  style_modern: 'Modern', style_old: 'Old map', hint: 'Tap a pin or any building · use the timeline below to travel in time',
  all: 'All', landmarks: 'Landmarks', search: 'Search landmarks', no_matches: 'No matches',
  eras_h: 'Through the eras', facts_h: 'Did you know?', directions: 'Directions', read_more: 'Read more (online)', sources_h: 'Sources (online)',
  right_here: 'You are right here.', from_here: 'You are {d} from here{p}', of_you: '{d} {dir} of you · about {m} min on foot{p}',
  pretend_tag: ' (pretend location)', tap_target: 'Tap the target button to see how far this is from you.',
  at_: 'You are at ', nearest_: 'Nearest: ', from_nearest: 'You are {d} from the nearest landmark', pretend_short: ' (pretend)',
  far: 'You are far from Nuremberg ({d}). Long-press the map to place a pretend location.',
  no_geo: 'This browser cannot provide your location.', blocked: 'Location is blocked. Allow it in your browser or iOS settings, or long-press the map to pretend.',
  geo_fail: 'Could not get your location. Try again outdoors.', pretend_loc: 'Pretend location: {c}', copy: 'Copy', copied: 'Copied {c}',
  saved_off: 'Saved for offline use ✓', updated: 'Updated.', reload: 'Reload',
  off_unsupported: 'Offline mode is not supported in this browser.', off_ready: '✓ Ready for offline use.', off_not: 'Not saved for offline yet; stay online a moment.',
  dirs: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
  close: 'Close', locate: 'Show my location', list_aria: 'List of landmarks', info_aria: 'About and help', zin: 'Zoom in', zout: 'Zoom out', lang_aria: 'Switch language to German',
ph_hist: 'Historic image', ph_now: 'Today', ph_h: 'Photos', ph_p: 'Photos come from Wikimedia Commons (free licences, credits under each picture). A photo is saved on your phone the first time you open it. To have them all offline before a trip, load them now.', ph_btn: 'Download all photos for offline use', ph_confirm: 'Download {n} photos (about 20 MB)? Use Wi-Fi if you can.', ph_done: 'Done: {n} photos saved offline.', ph_partial: 'Saved {n} of {m} photos. Try again later for the rest.', ph_nocache: 'This browser cannot store photos offline.',
  tours: 'Tours', tours_h: 'Guided walks', tour_start: 'Start tour', tour_stop: 'Stop {i} of {n}', tour_next: 'Next', tour_prev: 'Back', tour_end: 'End tour', tour_stops: '{n} stops · {m} km', tour_time: '≈ {t}', d3_aria: 'Switch between 2D and 3D buildings', m_foot: 'On foot', m_bike: 'By bike', tour_leg: 'Next stop: {d} · about {t}', tour_last: 'Whole route: {d} · about {t}', tour_note: 'Routes follow real streets and paths (OpenStreetMap). Times are moving time only (walking 4.5 km/h, cycling 13 km/h); add time for visiting. Bike routes avoid steps and footpaths but may use pedestrian zones where you should dismount.',
  time_aria: 'Timeline slider', time_h: 'Timeline', time_hint: 'Drag to any year from 1450 to today', year_not_yet: 'Not built yet in {y}. ({b})', year_stood: 'In {y} this building still stood.',
  bld: 'Building', addr: 'Address', yr_built: 'Year built (OpenStreetMap)', bld_type: 'Type', osm_note: 'From OpenStreetMap tags where mapped.', no_info: 'No address or year recorded for this building.',
  snap: 'In this era', snap1648: 'Inside the old walls. Today\'s footprint is shown as a stand-in; real 1648 footprints are planned.', snap1648_out: 'Outside the 1648 city walls: probably open land or gardens then.',
  dmg2: 'Total loss on the City of Nuremberg damage plan of 12 Feb 1945. Footprint matched to today\'s outline, so it may be off by a few metres.', dmg1: 'Gravely damaged on the City of Nuremberg damage plan of 12 Feb 1945 (shown half-ruined).', dmg0: 'No heavy damage recorded on the City of Nuremberg plan of 12 Feb 1945.',
  snap1939: 'Today\'s footprint is shown as a stand-in for the 1939 building.', snap1945_ruin: 'Shown as rubble. This is a modelled estimate, not archival damage data.', snap1945_ok: 'Shown standing. The 1945 damage pattern is a modelled estimate, not archival data.',
  snapnow: 'Standing today.', church: 'church', bt: {church:'Church',cathedral:'Cathedral',chapel:'Chapel',house:'House',residential:'Residential',apartments:'Apartments',commercial:'Commercial',retail:'Shop',office:'Office',school:'School',university:'University',hospital:'Hospital',public:'Public building',civic:'Civic building',industrial:'Industrial',garage:'Garage',garages:'Garages',yes:'Building',detached:'House',terrace:'Terraced house',service:'Service building',museum:'Museum',hotel:'Hotel',train_station:'Station',kindergarten:'Kindergarten',roof:'Roof',warehouse:'Warehouse',religious:'Religious building',dormitory:'Dormitory'},
  v_label: 'Version',
  about_h: 'Nuremberg Then & Now',
  about_intro: 'An offline historical map with 50 landmarks. Pick a time with the buttons at the bottom or the timeline slider, and tap any pin or building.',
  about_pins: 'Pins', about_pins_p: 'A small badge on a pin shows its condition in the chosen year.',
  about_loc: 'Your location', about_loc_p: 'Tap the target button. Away from Nuremberg, long-press the map to place a pretend location (and copy its coordinates).',
  about_inst: 'Install and offline', about_ios: '<b>iPhone:</b> open in Safari, tap Share, then Add to Home Screen.', about_and: '<b>Android:</b> browser menu, then Install app.', about_off: 'Open it once online; after that it works with no connection.',
  about_map: 'About the map', about_map_p: 'Streets, buildings, river, parks and the city wall are real geometry from OpenStreetMap, drawn in two styles. Today\'s building outlines are used for the older eras too, so 1648 and 1939 are an approximation of the layout; the 1945 damage inside the old town comes from the City of Nuremberg plan of destruction of 12 Feb 1945 (public domain, via Wikimedia Commons), matched to today\'s outlines, and is modelled only outside that plan (about 90% of the old town was destroyed on 2 January 1945 and in the battle that April). Landmark texts were checked against Wikipedia and other sources; links are at the bottom of each card. Map data © OpenStreetMap contributors (ODbL).'
},
de: {
  style_modern: 'Modern', style_old: 'Alte Karte', hint: 'Tippe auf einen Pin oder ein Gebäude · die Zeitleiste unten bringt dich in die Vergangenheit',
  all: 'Alle', landmarks: 'Orte', search: 'Orte suchen', no_matches: 'Keine Treffer',
  eras_h: 'Im Lauf der Zeit', facts_h: 'Wusstest du?', directions: 'Route', read_more: 'Mehr lesen (online)', sources_h: 'Quellen (online)',
  right_here: 'Du bist genau hier.', from_here: 'Du bist {d} von hier entfernt{p}', of_you: '{d} {dir} von dir · etwa {m} Min. zu Fuß{p}',
  pretend_tag: ' (Testposition)', tap_target: 'Tippe auf die Zielscheibe, um die Entfernung zu sehen.',
  at_: 'Du bist bei ', nearest_: 'Nächster Ort: ', from_nearest: 'Du bist {d} vom nächsten Ort entfernt', pretend_short: ' (Test)',
  far: 'Du bist weit von Nürnberg entfernt ({d}). Halte die Karte gedrückt, um eine Testposition zu setzen.',
  no_geo: 'Dieser Browser kann deinen Standort nicht ermitteln.', blocked: 'Standort ist blockiert. Erlaube ihn in den Browser- oder iOS-Einstellungen oder halte die Karte gedrückt, um zu testen.',
  geo_fail: 'Standort nicht verfügbar. Versuche es im Freien erneut.', pretend_loc: 'Testposition: {c}', copy: 'Kopieren', copied: '{c} kopiert',
  saved_off: 'Für Offline-Nutzung gespeichert ✓', updated: 'Aktualisiert.', reload: 'Neu laden',
  off_unsupported: 'Offline-Modus wird in diesem Browser nicht unterstützt.', off_ready: '✓ Bereit für die Offline-Nutzung.', off_not: 'Noch nicht offline gespeichert; bleibe kurz online.',
  dirs: ['nördlich', 'nordöstlich', 'östlich', 'südöstlich', 'südlich', 'südwestlich', 'westlich', 'nordwestlich'],
  close: 'Schließen', locate: 'Meinen Standort zeigen', list_aria: 'Liste der Orte', info_aria: 'Info und Hilfe', zin: 'Vergrößern', zout: 'Verkleinern', lang_aria: 'Sprache auf Englisch umstellen',
ph_hist: 'Historische Aufnahme', ph_now: 'Heute', ph_h: 'Fotos', ph_p: 'Die Fotos stammen von Wikimedia Commons (freie Lizenzen, Urheber unter jedem Bild). Ein Foto wird beim ersten Öffnen auf dem Handy gespeichert. Um alle vor einer Reise offline zu haben, lade sie jetzt herunter.', ph_btn: 'Alle Fotos für den Offline-Gebrauch laden', ph_confirm: '{n} Fotos laden (etwa 20 MB)? Am besten im WLAN.', ph_done: 'Fertig: {n} Fotos offline gespeichert.', ph_partial: '{n} von {m} Fotos gespeichert. Später erneut versuchen.', ph_nocache: 'Dieser Browser kann keine Fotos offline speichern.',
  tours: 'Touren', tours_h: 'Geführte Spaziergänge', tour_start: 'Tour starten', tour_stop: 'Station {i} von {n}', tour_next: 'Weiter', tour_prev: 'Zurück', tour_end: 'Tour beenden', tour_stops: '{n} Stationen · {m} km', tour_time: '≈ {t}', d3_aria: 'Zwischen 2D und 3D wechseln', m_foot: 'Zu Fuß', m_bike: 'Mit dem Rad', tour_leg: 'Nächste Station: {d} · etwa {t}', tour_last: 'Gesamte Route: {d} · etwa {t}', tour_note: 'Die Routen folgen echten Straßen und Wegen (OpenStreetMap). Die Zeiten gelten nur für die Bewegung (zu Fuß 4,5 km/h, Rad 13 km/h); Besichtigungszeit kommt dazu. Radrouten meiden Treppen und Fußwege, können aber durch Fußgängerzonen führen, in denen man schieben sollte.',
  time_aria: 'Zeitleiste', time_h: 'Zeitleiste', time_hint: 'Ziehe zu einem beliebigen Jahr von 1450 bis heute', year_not_yet: '{y} noch nicht gebaut. ({b})', year_stood: '{y} stand dieses Gebäude noch.',
  bld: 'Gebäude', addr: 'Adresse', yr_built: 'Baujahr (OpenStreetMap)', bld_type: 'Art', osm_note: 'Aus OpenStreetMap-Angaben, soweit erfasst.', no_info: 'Für dieses Gebäude sind weder Adresse noch Baujahr erfasst.',
  snap: 'In dieser Epoche', snap1648: 'Innerhalb der alten Mauern. Der heutige Grundriss dient als Platzhalter; echte Grundrisse von 1648 sind geplant.', snap1648_out: 'Außerhalb der Stadtmauer von 1648: damals wohl freies Land oder Gärten.',
  dmg2: 'Totalverlust laut Zerstörungsplan der Stadt Nürnberg vom 12.2.1945. Grundriss mit heutigem Umriss abgeglichen, daher einige Meter Abweichung möglich.', dmg1: 'Schwer beschädigt laut Zerstörungsplan der Stadt Nürnberg vom 12.2.1945 (halb zerstört dargestellt).', dmg0: 'Laut Plan der Stadt Nürnberg vom 12.2.1945 keine schwere Zerstörung verzeichnet.',
  snap1939: 'Der heutige Grundriss steht stellvertretend für das Gebäude von 1939.', snap1945_ruin: 'Als Trümmer dargestellt. Das ist eine modellierte Schätzung, keine Schadensdaten aus Archiven.', snap1945_ok: 'Als stehend dargestellt. Das Schadensmuster von 1945 ist eine modellierte Schätzung, keine Archivdaten.',
  snapnow: 'Steht heute.', church: 'Kirche', bt: {church:'Kirche',cathedral:'Kathedrale',chapel:'Kapelle',house:'Haus',residential:'Wohngebäude',apartments:'Mehrfamilienhaus',commercial:'Gewerbe',retail:'Geschäft',office:'Büro',school:'Schule',university:'Universität',hospital:'Krankenhaus',public:'Öffentliches Gebäude',civic:'Städtisches Gebäude',industrial:'Industrie',garage:'Garage',garages:'Garagen',yes:'Gebäude',detached:'Einfamilienhaus',terrace:'Reihenhaus',service:'Betriebsgebäude',museum:'Museum',hotel:'Hotel',train_station:'Bahnhof',kindergarten:'Kindergarten',roof:'Überdachung',warehouse:'Lager',religious:'Religiöses Gebäude',dormitory:'Wohnheim'},
  v_label: 'Version',
  about_h: 'Nürnberg damals & heute',
  about_intro: 'Eine historische Offline-Karte mit 50 Orten. Wähle eine Zeit mit den Knöpfen unten oder dem Zeitregler und tippe auf einen Pin oder ein Gebäude.',
  about_pins: 'Pins', about_pins_p: 'Ein kleines Abzeichen am Pin zeigt den Zustand im gewählten Jahr.',
  about_loc: 'Dein Standort', about_loc_p: 'Tippe auf die Zielscheibe. Außerhalb von Nürnberg kannst du die Karte gedrückt halten, um eine Testposition zu setzen (und ihre Koordinaten zu kopieren).',
  about_inst: 'Installieren und offline nutzen', about_ios: '<b>iPhone:</b> in Safari öffnen, Teilen antippen, dann „Zum Home-Bildschirm“.', about_and: '<b>Android:</b> Browsermenü, dann „App installieren“.', about_off: 'Einmal online öffnen; danach funktioniert sie ohne Verbindung.',
  about_map: 'Über die Karte', about_map_p: 'Straßen, Gebäude, Fluss, Parks und Stadtmauer sind echte Geometrie von OpenStreetMap, in zwei Stilen gezeichnet. Die heutigen Gebäudeumrisse werden auch für die älteren Epochen genutzt; 1648 und 1939 sind daher eine Annäherung an den Grundriss, und die Zerstörung von 1945 in der Altstadt stammt aus dem Zerstörungsplan der Stadt Nürnberg vom 12.2.1945 (gemeinfrei, via Wikimedia Commons), abgeglichen mit heutigen Umrissen, und ist nur außerhalb des Plans modelliert (rund 90 % der Altstadt wurden am 2. Januar 1945 und in der Schlacht im April zerstört). Die Ortstexte wurden anhand von Wikipedia und weiteren Quellen geprüft; Links stehen unten auf jeder Karte. Kartendaten © OpenStreetMap-Mitwirkende (ODbL).'
}
};
const ERA_DE = { '1648': ['Merian-Zeit', 'Ummauerte Reichsstadt'], '1939': ['Vor dem Krieg', 'Die Altstadt unversehrt'], '1945': ['Nach den Bomben', 'Trümmer und Ruinen'], now: ['Gegenwart', 'Wiederaufgebaut'] };
const CAT_DE = { castle: 'Burg & Tore', church: 'Kirchen', civic: 'Bürgerlich & Brücken', culture: 'Museen & Gedenkorte', trials: 'NS-Zeit & Prozesse', transport: 'Verkehr' };
const ST_DE = { standing: 'Erhalten', damaged: 'Beschädigt', ruin: 'In Trümmern', rebuilt: 'Wiederaufgebaut', absent: 'Noch nicht gebaut' };
const IDX = { '1648': 0, '1939': 1, '1945': 2, now: 3 };
let lang = 'en';
try { lang = localStorage.getItem('nm_lang') || ((navigator.language || '').toLowerCase().indexOf('de') === 0 ? 'de' : 'en'); } catch (_) {}
if (lang !== 'de') lang = 'en';
function t(k, v) {
  let s = (S[lang][k] !== undefined ? S[lang][k] : S.en[k]); if (s === undefined) return k;
  if (v && typeof s === 'string') for (const n in v) s = s.split('{' + n + '}').join(v[n]);
  return s;
}
NM.i18n = {
  get lang() { return lang; },
  t,
  setLang(l) { lang = l === 'de' ? 'de' : 'en'; try { localStorage.setItem('nm_lang', lang); } catch (_) {} document.documentElement.lang = lang; },
  eraName(e) { return lang === 'de' ? ERA_DE[e.id][0] : e.name; },
  eraSub(e) { return lang === 'de' ? ERA_DE[e.id][1] : e.sub; },
  eraYear(e) { return lang === 'de' && e.id === 'now' ? 'Heute' : e.year; },
  cat(k) { return lang === 'de' ? CAT_DE[k] : D.CATS[k].label; },
  status(k) { return lang === 'de' ? ST_DE[k] : D.STATUS[k].label; },
  L(l) {
    const de = lang === 'de' && D.DE && D.DE[l.id];
    if (!de) return { name: l.name, blurb: l.blurb, built: l.built, text: (e) => l.eras[e][1], badge: (e) => l.eras[e][2] || '', facts: l.facts || [] };
    return { name: de.n, blurb: de.b, built: de.bu, text: (e) => de.e[IDX[e]], badge: (e) => (de.bg && de.bg[IDX[e]]) || '', facts: de.f || [] };
  }
};
document.documentElement.lang = lang;
})(window);
