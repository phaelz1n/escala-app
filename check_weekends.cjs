const xlsx = require('xlsx');

const filePath = '../Escala 07.08.26.xlsx';
const workbook = xlsx.readFile(filePath);

console.log('Headers in MENSAL sabado:');
const sheetSab = workbook.Sheets['MENSAL sabado'];
if (sheetSab) {
  const dataSab = xlsx.utils.sheet_to_json(sheetSab, { header: 1 }).slice(0, 3);
  console.log(JSON.stringify(dataSab, null, 2));
}

console.log('\nHeaders in MENSAL domingo:');
const sheetDom = workbook.Sheets['MENSAL domingo'];
if (sheetDom) {
  const dataDom = xlsx.utils.sheet_to_json(sheetDom, { header: 1 }).slice(0, 3);
  console.log(JSON.stringify(dataDom, null, 2));
}
