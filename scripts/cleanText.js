// Tidies the text of one Kural record from the source files. Used by
// transform_data.js; also run once over the existing data file.

// Zero-width characters the sources carry inside Tamil words. Tamil prose
// doesn't need them, and between a consonant and its vowel sign they split
// the letter.
const INVISIBLE = /[\u200B\u200C\uFEFF]/g;

const ENGLISH_FIELDS = ['eng', 'eng_exp', 'sect_eng', 'chapgrp_eng', 'chap_eng'];

// Footnotes and stray markup were run into these translations.
const CORRECTIONS = {
  560: { eng: 'The six-functioned forget their lore Cows give less if kings guard no more' },
  610: { eng: 'The slothless king shall gain en masse All regions trod by Lord apace' },
  617: { eng: "Illuck abides with sloth they say Laxmi's gifts with labourers stay" },
  1060: { eng: 'The needy should not scowl at "No" His need another\'s need must show' },
  1131: { eng: "Pangs of passion find no recourse Except riding 'palmyra horse'" },
};

const cleanEnglish = (text) =>
  text
    .replace(/\\"/g, '"') // \"quoted\" -> "quoted"
    .replace(/(\w)"(s\b)/g, "$1'$2") // another"s -> another's
    .replace(/ +([,.;:!?])/g, '$1'); // "possess ?" -> "possess?"

function cleanKural(kural) {
  const out = { ...kural };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value !== 'string') continue;
    // Translations join their two verse lines with one space or two; use one
    let text = value.replace(INVISIBLE, '').replace(/ {2,}/g, ' ').trim();
    if (ENGLISH_FIELDS.includes(key)) text = cleanEnglish(text);
    out[key] = text;
  }
  return { ...out, ...CORRECTIONS[out.number] };
}

module.exports = { cleanKural };
