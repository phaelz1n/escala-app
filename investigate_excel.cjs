const xlsx = require('xlsx');

const filePath = '../Escala 07.08.26.xlsx';
const workbook = xlsx.readFile(filePath);

console.log('Sheets:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0]; // Assuming the first sheet has the scale
const worksheet = workbook.Sheets[sheetName];

// Get headers (first row)
const range = xlsx.utils.decode_range(worksheet['!ref']);
const headers = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
  const cellAddress = xlsx.utils.encode_cell({ r: range.s.r, c: C });
  const cell = worksheet[cellAddress];
  headers.push(cell ? cell.v : `UNKNOWN_${C}`);
}

console.log('Headers in first sheet:', headers);

// Get first few rows
const data = xlsx.utils.sheet_to_json(worksheet).slice(0, 3);
console.log('First 3 rows:', JSON.stringify(data, null, 2));
