const fs = require('fs');
const path = require('path');
const { cleanKural } = require('./cleanText');

// Rebuilds assets/data/thirukkural.json from the raw source files.
// Usage: node scripts/transform_data.js <path/to/thirukkural.json> <path/to/detail.json>
// (defaults to ../temp_data/ next to the repo, where the source files were originally kept)
const sourcePath = path.resolve(process.argv[2] || path.join(__dirname, '../../temp_data/thirukkural.json'));
const detailPath = path.resolve(process.argv[3] || path.join(__dirname, '../../temp_data/detail.json'));
const destPath = path.join(__dirname, '../assets/data/thirukkural.json');

try {
  const rawData = fs.readFileSync(sourcePath, 'utf8');
  const rawDetail = fs.readFileSync(detailPath, 'utf8');
  
  const source = JSON.parse(rawData);
  const details = JSON.parse(rawDetail);
  
  // Chapter details for each Kural number.
  // detail.json: [{ section: { detail: [book -> chapterGroup -> chapters (start-end)] } }]
  const kuralMap = new Map();
  const sections = details[0].section.detail;

  sections.forEach(section => {
    const sectionTam = section.name;
    const sectionEng = section.translation;
    
    const chapterGroups = section.chapterGroup.detail;
    
    chapterGroups.forEach(group => {
      const groupTam = group.name;
      const groupEng = group.translation;
      
      const chapters = group.chapters.detail;
      
      chapters.forEach(chapter => {
        const chapterTam = chapter.name;
        const chapterEng = chapter.translation;
        const start = chapter.start;
        const end = chapter.end;

        for (let i = start; i <= end; i++) {
          kuralMap.set(i, {
            sect_tam: sectionTam,
            sect_eng: sectionEng,
            chapgrp_tam: groupTam,
            chapgrp_eng: groupEng,
            chap_tam: chapterTam,
            chap_eng: chapterEng
          });
        }
      });
    });
  });

  const kurals = source.kural.map(item => {
    const number = item.Number;
    const meta = kuralMap.get(number) || {
      sect_tam: "Unknown",
      sect_eng: "Unknown",
      chapgrp_tam: "Unknown",
      chapgrp_eng: "Unknown",
      chap_tam: "Unknown",
      chap_eng: "Unknown"
    };

    return cleanKural({
      number,
      sect_tam: meta.sect_tam,
      chapgrp_tam: meta.chapgrp_tam,
      chap_tam: meta.chap_tam,
      line1: item.Line1,
      line2: item.Line2,
      tam_exp: item.mv, // Mu. Varadarasanar's explanation
      eng_exp: item.explanation,
      eng: item.Translation,
      sect_eng: meta.sect_eng,
      chapgrp_eng: meta.chapgrp_eng,
      chap_eng: meta.chap_eng
    });
  });

  if (kurals.length !== 1330) {
    throw new Error(`Expected 1330 kurals, got ${kurals.length}`);
  }
  const unknown = kurals.filter(k => k.chap_tam === 'Unknown').length;
  if (unknown > 0) {
    throw new Error(`${unknown} kurals have no chapter metadata`);
  }

  console.log(`Transformed ${kurals.length} kurals with metadata.`);
  fs.writeFileSync(destPath, JSON.stringify(kurals, null, 2));

} catch (error) {
  console.error('Error transforming data:', error.message || error);
  process.exit(1);
}