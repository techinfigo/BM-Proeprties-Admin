import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBXXuO3GpFmnu5lWEDZk1oLP6T8_frK2k",
  authDomain: "bm-properties-b8b9e.firebaseapp.com",
  projectId: "bm-properties-b8b9e",
  storageBucket: "bm-properties-b8b9e.firebasestorage.app",
  messagingSenderId: "784394030612",
  appId: "1:784394030612:web:d1b0eb9a6e26e039c0e101"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const snap = await getDocs(collection(db, 'blogs'));

console.log(`Collection: "blogs"`);
console.log(`Document count: ${snap.size}`);
console.log('---');

snap.forEach((doc) => {
  const data = doc.data();
  console.log(`Doc ID: ${doc.id}`);
  console.log(`  Fields: ${Object.keys(data).join(', ')}`);
  console.log(`  published: ${JSON.stringify(data.published)} (type: ${typeof data.published})`);
  console.log(`  Full data:`, JSON.stringify(data, null, 2));
  console.log('---');
});

process.exit(0);
