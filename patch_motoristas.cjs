const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../escala-f2f7f-firebase-adminsdk-fbsvc-618ff54a43.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Array from mockData.js to restore phone numbers if possible
const initialDrivers = [
  { name: 'ADEMAR DOS SANTOS',       phone: '51985290147' },
  { name: 'ADEMIR MONTEIRO',          phone: '51997226927' },
  { name: 'ADILSON MILANEZI',         phone: '51989616531' },
  { name: 'AGNALDO GENEROSO',         phone: '51982024282' },
  { name: 'ALBERTO DE SOUZA',         phone: '51985517213' },
  { name: 'ALCANTARA - FABIANO',      phone: '51984444047' },
  { name: 'ALDEMIR NASCIMENTO',       phone: '51998595701' },
  { name: 'ALECSANDRO RIBEIRO SILVA', phone: '51981775730' },
  { name: 'ALESSANDRO BANDEIRA',      phone: '51982006180' },
  { name: 'ALEX ALVES',               phone: '51998246387' },
  { name: 'ALEXANDRE PEREIRA',        phone: '51996236319' },
  { name: 'ALEXSANDRO DE OLIVEIRA',   phone: '51992038706' },
  { name: 'ALTAIR RAMOS',             phone: '51996022634' },
  { name: 'ANDERSON MOITOSO',         phone: '51989255675' },
  { name: 'ANDRE ALMEIDA',            phone: '51992765660' },
  { name: 'ANDRE MELO',               phone: '51997097305' },
  { name: 'ANDREIA MERCEDES',         phone: '51993437299' },
  { name: 'ANTONIO LEAL',             phone: '51994191319' },
  { name: 'ARIANE MILLEO',            phone: '51994165688' },
  { name: 'ARNALDO TEIXEIRA',         phone: '51995874288' },
  { name: 'BRUNO DA SILVA',           phone: '51981711718' },
  { name: 'CARLOS ALFEU',             phone: '51997226927' },
  { name: 'CARLOS EDUARDO',           phone: '51984920216' },
  { name: 'CARLOS FERREIRA',          phone: '51986422896' },
  { name: 'CARLOS MACHADO',           phone: '51997097305' },
  { name: 'CARLOS ZIMMERMAN',         phone: '51994191319' },
  { name: 'CASSIO HENRIQUE',          phone: '51992765660' },
  { name: 'CELITO CARMINATTI',        phone: '51982006180' },
  { name: 'CELSO GONÇALVES',          phone: '51985290147' },
  { name: 'CELSO MACIEL',             phone: '51989616531' },
  { name: 'CILENO SILVA',             phone: '51996022634' },
  { name: 'CLEBER SILVA',             phone: '51998595701' },
  { name: 'CLEBERTON',                phone: '51981775730' },
  { name: 'CRISTIAN BARCELLOS',       phone: '51998246387' },
  { name: 'CRISTIAN OLIVEIRA',        phone: '51982024282' },
  { name: 'DANIEL FERREIRA',          phone: '51994165688' },
  { name: 'DARCI LUIS',               phone: '51995874288' },
  { name: 'DEIVISON WILLIAN',         phone: '51985517213' },
  { name: 'DIEGO SOUZA',              phone: '51992038706' },
  { name: 'DOUGLAS VINICIUS',         phone: '51984444047' },
  { name: 'EDER LEANDRO',             phone: '51993437299' },
  { name: 'EDGAR TAVARES',            phone: '51996236319' },
  { name: 'EDUARDO DE BORBA',         phone: '51981711718' },
  { name: 'ELISANDRO',                phone: '51989255675' },
  { name: 'EVANDRO BORBA',            phone: '51986422896' },
  { name: 'FABRICIO TAVARES',         phone: '51984920216' },
  { name: 'FELIPE CARLAN',            phone: '51997226927' },
  { name: 'FLAVIO BORGES',            phone: '51996022634' },
  { name: 'FLAVIO FREITAS',           phone: '51985290147' },
  { name: 'FRANCISCO CLAUDIO',        phone: '51982006180' },
  { name: 'GILBERTO DE LIMA',         phone: '51993437299' },
  { name: 'GILSON CARVALHO',          phone: '51989616531' },
  { name: 'IGOR MACHADO',             phone: '51981775730' },
  { name: 'JAIRO CHAVES',             phone: '51994191319' },
  { name: 'JARI GUNDEL',              phone: '51992765660' },
  { name: 'JEAN CARLE SOUZA',         phone: '51982024282' },
  { name: 'JEFERSON MARQUES',         phone: '51998595701' },
  { name: 'JULIO POLGA',              phone: '51995874288' },
  { name: 'LEANDRO NUNES',            phone: '51998246387' },
  { name: 'LEONARDO LOPES',           phone: '51997097305' },
  { name: 'LUIS HENRIQUE',            phone: '51984444047' },
  { name: 'LUIZ JOLNEI',              phone: '51985517213' },
  { name: 'MAGNUS VIEIRA',            phone: '51996236319' },
  { name: 'MARCELO DE MORAIS',        phone: '51986422896' },
  { name: 'MARCELO DE SOUZA',         phone: '51992038706' },
  { name: 'MARCELO NUNES',            phone: '51984920216' },
  { name: 'MARCELO SOUZA',            phone: '51989255675' },
  { name: 'MARCIO CASTILHO',          phone: '51981711718' },
  { name: 'MARCOS MARIANO',           phone: '51994165688' },
  { name: 'MARIO PEREIRA',            phone: '51984444047' },
  { name: 'MAURO DOS SANTOS',         phone: '51982006180' },
  { name: 'MICHELLE ROSA',            phone: '51989616531' },
  { name: 'MIGUEL CARVALHO',          phone: '51997226927' },
  { name: 'RAFAEL DA SILVA',          phone: '51985290147' },
  { name: 'REGIS CORREA',             phone: '51998595701' },
  { name: 'RICARDO PEREIRA',          phone: '51982024282' },
  { name: 'ROGERIO RODRIGUES',        phone: '51993437299' },
  { name: 'RONALDO REIS',             phone: '51981775730' },
  { name: 'TALES SILVA',              phone: '51996022634' },
  { name: 'WAGNER DOS SANTOS',        phone: '51994191319' }
];

const phoneMap = new Map();
initialDrivers.forEach(d => phoneMap.set(d.name.toUpperCase().trim(), d.phone));

async function run() {
  console.log('Fetching all motoristas to patch...');
  const motoristasSnap = await db.collection('motoristas').get();
  
  let batch = db.batch();
  let count = 0;

  motoristasSnap.forEach(doc => {
    const data = doc.data();
    const cleanName = (data.name || '').toUpperCase().trim();
    
    const updateData = {};
    
    // Convert 'type' to 'categoria' if necessary
    if (data.type && !data.categoria) {
      updateData.categoria = data.type;
      updateData.type = FieldValue.delete();
    } else if (!data.categoria) {
      updateData.categoria = 'Titular';
    }

    // Set Status
    if (!data.status) {
      updateData.status = 'Ativo';
    }

    // Set Phone
    if (!data.phone) {
      if (phoneMap.has(cleanName)) {
        updateData.phone = phoneMap.get(cleanName);
      } else {
        updateData.phone = '';
      }
    }

    if (Object.keys(updateData).length > 0) {
      batch.update(doc.ref, updateData);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully patched ${count} motoristas with missing standard data (phone, status, categoria).`);
  } else {
    console.log('No motoristas needed patching.');
  }
}

run().catch(console.error);
