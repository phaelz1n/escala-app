const xlsx = require('xlsx');

const filePath = '../Escala 07.08.26.xlsx';
const workbook = xlsx.readFile(filePath);

const sheetName = 'Escala Diária seg a sex';
const worksheet = workbook.Sheets[sheetName];

// Get headers
const range = xlsx.utils.decode_range(worksheet['!ref']);
const headers = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
  const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: C });
  const cell = worksheet[cellAddress];
  headers.push(cell ? cell.v : `UNKNOWN_${C}`);
}
console.log('Headers in Escala Diária seg a sex:', headers);

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }).slice(0, 5);
console.log('First 5 rows (as array of arrays):', JSON.stringify(data, null, 2));
