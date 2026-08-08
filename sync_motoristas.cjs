const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../escala-f2f7f-firebase-adminsdk-fbsvc-618ff54a43.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  console.log('Fetching existing motoristas...');
  const motoristasSnap = await db.collection('motoristas').get();
  
  const existingMotoristasByName = new Map();
  const docsToDelete = [];

  // Deduplicate existing motoristas
  motoristasSnap.forEach(doc => {
    const data = doc.data();
    if (!data.name) {
      docsToDelete.push(doc.ref);
      return;
    }
    const cleanName = data.name.toUpperCase().trim();
    if (existingMotoristasByName.has(cleanName)) {
      docsToDelete.push(doc.ref); // Duplicate, mark for deletion
    } else {
      existingMotoristasByName.set(cleanName, doc.ref);
    }
  });

  console.log(`Found ${motoristasSnap.size} total docs in 'motoristas'.`);
  console.log(`Found ${existingMotoristasByName.size} unique motoristas.`);
  console.log(`${docsToDelete.length} duplicates to delete.`);

  if (docsToDelete.length > 0) {
    let delBatch = db.batch();
    let dCount = 0;
    for (const ref of docsToDelete) {
      delBatch.delete(ref);
      dCount++;
      if (dCount % 400 === 0) {
        await delBatch.commit();
        delBatch = db.batch();
      }
    }
    if (dCount % 400 !== 0) await delBatch.commit();
    console.log(`Deleted ${dCount} duplicate motoristas.`);
  }

  console.log('Fetching all linhas to find missing motoristas...');
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

  const namesToAdd = Array.from(allNames).filter(name => !existingMotoristasByName.has(name));

  console.log(`${namesToAdd.length} new motoristas need to be added.`);

  if (namesToAdd.length === 0) {
    console.log('No new motoristas to add.');
    return;
  }

  let addBatch = db.batch();
  let aCount = 0;

  for (const name of namesToAdd) {
    const ref = db.collection('motoristas').doc();
    addBatch.set(ref, {
      name: name,
      type: 'Titular',
      createdAt: new Date().toISOString()
    });
    aCount++;
    
    if (aCount % 400 === 0) {
      await addBatch.commit();
      console.log(`Committed ${aCount} new motoristas...`);
      addBatch = db.batch();
    }
  }

  if (aCount % 400 !== 0) {
    await addBatch.commit();
  }

  console.log(`Successfully added ${aCount} missing motoristas to the database.`);
}

run().catch(console.error);
