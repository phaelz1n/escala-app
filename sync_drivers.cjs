const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../escala-f2f7f-firebase-adminsdk-fbsvc-618ff54a43.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  console.log('Fetching existing drivers...');
  const driversSnap = await db.collection('drivers').get();
  const existingDrivers = new Set();
  driversSnap.forEach(doc => {
    if(doc.data().name) {
      existingDrivers.add(doc.data().name.toUpperCase().trim());
    }
  });

  console.log(`Found ${existingDrivers.size} existing drivers.`);

  console.log('Fetching all linhas to find motoristas...');
  const linhasSnap = await db.collection('linhas').get();
  
  const allNames = new Set();
  const ignoreList = ['X', 'FOLGA', 'NÃO RODA', 'NAO RODA'];

  linhasSnap.forEach(doc => {
    const data = doc.data();
    if (data.motoristaTitularName) {
      const clean = data.motoristaTitularName.toUpperCase().trim();
      if (clean && !ignoreList.includes(clean)) allNames.add(clean);
    }
    if (data.dias) {
      Object.values(data.dias).forEach(val => {
        if (typeof val === 'string') {
          const clean = val.toUpperCase().trim();
          if (clean && !ignoreList.includes(clean)) {
            allNames.add(clean);
          }
        }
      });
    }
  });

  console.log(`Found ${allNames.size} unique motorista names in the schedule.`);

  const namesToAdd = Array.from(allNames).filter(name => !existingDrivers.has(name));

  console.log(`${namesToAdd.length} new drivers need to be added.`);

  if (namesToAdd.length === 0) {
    console.log('No new drivers to add.');
    return;
  }

  // We need to commit them iteratively because batch might exceed limit if too many, but limit is 500
  let batch = db.batch();
  let count = 0;

  for (const name of namesToAdd) {
    const ref = db.collection('drivers').doc();
    batch.set(ref, {
      name: name,
      type: 'Titular',
      createdAt: new Date().toISOString()
    });
    count++;
    
    // Batch limit is 500
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Committed ${count} drivers...`);
      batch = db.batch(); // create a new batch
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
  }

  console.log(`Successfully added ${count} missing drivers to the database.`);
}

run().catch(console.error);
