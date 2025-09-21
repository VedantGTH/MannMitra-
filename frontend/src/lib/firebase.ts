import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  projectId: "manmitra-f60af",
  authDomain: "manmitra-f60af.firebaseapp.com",
  storageBucket: "manmitra-f60af.appspot.com"
};

const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, 'us-central1');

// Only connect to emulator if explicitly running locally
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}