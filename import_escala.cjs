const xlsx = require('xlsx');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../escala-f2f7f-firebase-adminsdk-fbsvc-618ff54a43.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const filePath = '../Escala 07.08.26.xlsx';
const workbook = xlsx.readFile(filePath);

// Helper to format Excel time fraction to HH:MM
function formatExcelTime(timeFraction) {
  if (typeof timeFraction !== 'number') return String(timeFraction || '');
  const totalSeconds = Math.round(timeFraction * 24 * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Helper to convert Excel date serial to Day of Month (for August 2026)
function getDayFromExcelDate(excelDate) {
  if (typeof excelDate !== 'number') return null;
  // Excel date is days since Jan 1, 1900.
  // 46235 is approx August 1st 2026? Let's check using xlsx.SSF
  const parsed = xlsx.SSF.parse_date_code(excelDate);
  if (parsed && parsed.m === 8 && parsed.y === 2026) {
    return parsed.d;
  }
  return null;
}

const linhasMap = new Map(); // key: EMPRESA_HORARIO_DESCRICAO

function getLinhaKey(empresa, horario, descricao) {
  return `${String(empresa).trim()}_${String(horario).trim()}_${String(descricao).trim()}`;
}

function processSheet(sheetName, isWeekend) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return;
  
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  if (data.length < 3) return;

  const headerRow = data[1]; // Index 1 has EMPRESA, HORÁRIO, etc and dates
  const dateStartIndex = isWeekend ? 6 : 8; // For weekends, dates start at index 6, for weekday at index 8

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const empresa = isWeekend ? row[0] : row[0]; // Wait, MENSAL domingo has " EMPRESA" in index 0
    let cleanEmpresa = (String(empresa) || '').trim();
    if (cleanEmpresa === 'undefined') cleanEmpresa = '';

    const horarioRaw = isWeekend ? row[1] : row[2];
    const horario = formatExcelTime(horarioRaw);
    
    const descricao = String(isWeekend ? row[2] : row[3]).trim();
    const titular = String(isWeekend ? row[3] : row[4]).trim();
    
    if (!cleanEmpresa && !descricao) continue; // Skip empty rows

    const key = getLinhaKey(cleanEmpresa, horario, descricao);
    
    if (!linhasMap.has(key)) {
      linhasMap.set(key, {
        empresa: cleanEmpresa,
        horario: horario,
        descricao: descricao !== 'undefined' ? descricao : '',
        motoristaTitularName: titular !== 'undefined' ? titular : '',
        turno: 'Noite', // Default or parsed
        pontoInicio: 'Garagem',
        status: 'Escalado',
        dias: {}
      });
    }

    const linha = linhasMap.get(key);

    // Process dates
    for (let col = dateStartIndex; col < headerRow.length; col++) {
      const excelDate = headerRow[col];
      const motoristaCell = row[col];
      
      const day = getDayFromExcelDate(excelDate);
      if (day && motoristaCell && String(motoristaCell).trim() !== 'undefined') {
        linha.dias[`d${day}`] = String(motoristaCell).trim();
      }
    }
  }
}

async function clearCollection(colName) {
  const snapshot = await db.collection(colName).get();
  const batches = [];
  let currentBatch = db.batch();
  let count = 0;
  snapshot.docs.forEach((doc) => {
    currentBatch.delete(doc.ref);
    count++;
    if (count % 400 === 0) {
      batches.push(currentBatch);
      currentBatch = db.batch();
    }
  });
  batches.push(currentBatch);
  for (const b of batches) await b.commit();
  console.log(`Cleared collection ${colName}.`);
}

async function run() {
  console.log('Clearing old linhas...');
  await clearCollection('linhas');

  console.log('Processing sheets...');
  processSheet('Escala Diária seg a sex', false);
  processSheet('MENSAL sabado', true);
  processSheet('MENSAL domingo', true);

  console.log(`Found ${linhasMap.size} unique lines. Sending to Firestore...`);
  
  const batchArray = [];
  let currentBatch = db.batch();
  let count = 0;

  for (const [key, linha] of linhasMap.entries()) {
    const ref = db.collection('linhas').doc(`ESC_${Date.now()}_${count}`);
    currentBatch.set(ref, linha);
    count++;
    
    if (count % 400 === 0) {
      batchArray.push(currentBatch);
      currentBatch = db.batch();
    }
  }
  batchArray.push(currentBatch);

  console.log(`Committing ${batchArray.length} batches...`);
  for (const batch of batchArray) {
    await batch.commit();
  }
  
  console.log('Import complete!');
  process.exit(0);
}

run().catch(console.error);
