/* Historic city plans, georeferenced to the OpenStreetMap footprints (fitted by matching building blocks and landmarks).
   M maps the plan's own pixel grid (rw x rh) to world metres: x = M0*X + M2*Y + M4, y = M1*X + M3*Y + M5. All images load from Wikimedia Commons. */
window.NM = window.NM || {};
NM.maps = [
 {
  "id": "pfinzing",
  "clip": [28, 6, 1130, 804],
  "yr": "1594",
  "en": "Pfinzing ground plan",
  "de": "Pfinzing-Grundriss",
  "u1": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Pfinzing_N%C3%BCrnberg_Grundriss.jpg",
  "u2": null,
  "rw": 1159,
  "rh": 810,
  "M": [
   1.799949014,
   0.205078286,
   0.205078286,
   -1.799949014,
   -1131.6635,
   486.6348
  ],
  "cen": "Paul Pfinzing, ground plan of Nuremberg, 1588-1598 (public domain)",
  "cde": "Paul Pfinzing, Grundriss von Nürnberg, 1588-1598 (gemeinfrei)",
  "page": "https://commons.wikimedia.org/wiki/File:Pfinzing_N%C3%BCrnberg_Grundriss.jpg",
  "nen": "Old-town only. Hand-drawn, so streets drift by up to a few dozen metres.",
  "nde": "Nur die Altstadt. Handgezeichnet, daher Abweichungen von einigen Dutzend Metern."
 },
 {
  "id": "annert",
  "clip": [45, 50, 1875, 1465],
  "yr": "c. 1800",
  "en": "Annert geometric plan",
  "de": "Annert-Grundriss",
  "u1": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Geometrischer_Grundriss_der_Reichs-Stadt_N%C3%BCrnberg_-_Friedrich_Albrecht_Annert_-_um_1800.jpg/1920px-Geometrischer_Grundriss_der_Reichs-Stadt_N%C3%BCrnberg_-_Friedrich_Albrecht_Annert_-_um_1800.jpg",
  "u2": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Geometrischer_Grundriss_der_Reichs-Stadt_N%C3%BCrnberg_-_Friedrich_Albrecht_Annert_-_um_1800.jpg/3840px-Geometrischer_Grundriss_der_Reichs-Stadt_N%C3%BCrnberg_-_Friedrich_Albrecht_Annert_-_um_1800.jpg",
  "rw": 1920,
  "rh": 1671,
  "M": [
   1.698559116,
   -0.293573975,
   -0.293573975,
   -1.698559116,
   -1253.4854,
   1628.6932
  ],
  "cen": "Friedrich Albrecht Annert, Geometrischer Grundriss der Reichs-Stadt Nürnberg, c. 1800 (CC0)",
  "cde": "Friedrich Albrecht Annert, Geometrischer Grundriss der Reichs-Stadt Nürnberg, um 1800 (CC0)",
  "page": "https://commons.wikimedia.org/wiki/File:Geometrischer_Grundriss_der_Reichs-Stadt_N%C3%BCrnberg_-_Friedrich_Albrecht_Annert_-_um_1800.jpg",
  "nen": "Closest surviving survey to the Merian-era town. Fits the centre to about 10 m.",
  "nde": "Die älteste Vermessung nahe der Merian-Zeit. Passt im Zentrum auf etwa 10 m."
 },
 {
  "id": "wenng",
  "clip": [255, 125, 1620, 1182],
  "yr": "c. 1850",
  "en": "Wenng special plan",
  "de": "Wenng-Spezialplan",
  "u1": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Special_Plan_der_K._B._Stadt_N%C3%BCrnberg_-_bearbeitet_und_herausgegeben_von_G._Ludwig_Wenng_-_btv1b53023061s.jpg/1920px-Special_Plan_der_K._B._Stadt_N%C3%BCrnberg_-_bearbeitet_und_herausgegeben_von_G._Ludwig_Wenng_-_btv1b53023061s.jpg",
  "u2": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Special_Plan_der_K._B._Stadt_N%C3%BCrnberg_-_bearbeitet_und_herausgegeben_von_G._Ludwig_Wenng_-_btv1b53023061s.jpg/3840px-Special_Plan_der_K._B._Stadt_N%C3%BCrnberg_-_bearbeitet_und_herausgegeben_von_G._Ludwig_Wenng_-_btv1b53023061s.jpg",
  "rw": 1920,
  "rh": 1455,
  "M": [
   2.838386642,
   0.544668352,
   0.544668352,
   -2.838386642,
   -3143.2506,
   1149.9252
  ],
  "cen": "G. Ludwig Wenng, Special-Plan der K. B. Stadt Nürnberg, c. 1850 as dated on Commons (public domain, via BnF Gallica)",
  "cde": "G. Ludwig Wenng, Special-Plan der K. B. Stadt Nürnberg, um 1850 laut Commons (gemeinfrei, via BnF Gallica)",
  "page": "https://commons.wikimedia.org/wiki/File:Special_Plan_der_K._B._Stadt_N%C3%BCrnberg_-_bearbeitet_und_herausgegeben_von_G._Ludwig_Wenng_-_btv1b53023061s.jpg",
  "nen": "Whole city. Fits the old town to about 15 m.",
  "nde": "Gesamte Stadt. Passt in der Altstadt auf etwa 15 m."
 },
 {
  "id": "schwarz",
  "clip": [70, 130, 1850, 2380],
  "yr": "1888",
  "en": "Schwarz city plan",
  "de": "Schwarz-Stadtplan",
  "u1": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Plan_der_Stadt_Nurnberg._1888%2C_bearbeitet_-_von_geometer_Schwarz..._-_btv1b530252797_%282_of_2%29.jpg/1920px-Plan_der_Stadt_Nurnberg._1888%2C_bearbeitet_-_von_geometer_Schwarz..._-_btv1b530252797_%282_of_2%29.jpg",
  "u2": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Plan_der_Stadt_Nurnberg._1888%2C_bearbeitet_-_von_geometer_Schwarz..._-_btv1b530252797_%282_of_2%29.jpg/3840px-Plan_der_Stadt_Nurnberg._1888%2C_bearbeitet_-_von_geometer_Schwarz..._-_btv1b530252797_%282_of_2%29.jpg",
  "rw": 1920,
  "rh": 2523,
  "M": [
   1.93044831,
   0.014388462,
   0.014388462,
   -1.93044831,
   -1141.8606,
   1962.2999
  ],
  "cen": "Geometer Schwarz, Plan der Stadt Nürnberg, 1888, sheet 2 of 2 (public domain, via BnF Gallica)",
  "cde": "Geometer Schwarz, Plan der Stadt Nürnberg, 1888, Blatt 2 von 2 (gemeinfrei, via BnF Gallica)",
  "page": "https://commons.wikimedia.org/wiki/File:Plan_der_Stadt_Nurnberg._1888%2C_bearbeitet_-_von_geometer_Schwarz..._-_btv1b530252797_%282_of_2%29.jpg",
  "nen": "Every house footprint of 1888 in red. Fits to about 5 m. Large file.",
  "nde": "Jedes Haus von 1888 in Rot. Passt auf etwa 5 m. Große Datei."
 },
 {
  "id": "plan45",
  "clip": [0, 40, 1920, 1675],
  "yr": "1945",
  "en": "Plan of destruction",
  "de": "Zerstörungsplan",
  "u1": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/1945.02.12._Plan_der_Zerst%C3%B6rungen_N%C3%BCrnbergs.jpg/1920px-1945.02.12._Plan_der_Zerst%C3%B6rungen_N%C3%BCrnbergs.jpg",
  "u2": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/1945.02.12._Plan_der_Zerst%C3%B6rungen_N%C3%BCrnbergs.jpg/3840px-1945.02.12._Plan_der_Zerst%C3%B6rungen_N%C3%BCrnbergs.jpg",
  "rw": 1920,
  "rh": 1675,
  "M": [
   1.058154731,
   -0.012718184,
   -0.012718184,
   -1.058154731,
   -1092.4543,
   658.8958
  ],
  "cen": "Stadt Nürnberg, Plan der Zerstörungen, 12 Feb 1945 (public domain)",
  "cde": "Stadt Nürnberg, Plan der Zerstörungen, 12.2.1945 (gemeinfrei)",
  "page": "https://commons.wikimedia.org/wiki/File:1945.02.12._Plan_der_Zerst%C3%B6rungen_N%C3%BCrnbergs.jpg",
  "nen": "The plan the 1945 damage colours come from. Fits to about 10 m.",
  "nde": "Der Plan, aus dem die Schadensfarben von 1945 stammen. Passt auf etwa 10 m."
 }
];
