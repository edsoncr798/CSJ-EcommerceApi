import admin from 'firebase-admin';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, 'firebase-service-account.json');

let firebaseAdmin = null;

try {
    if (existsSync(serviceAccountPath)) {
        const require = createRequire(import.meta.url);
        const serviceAccount = require('./firebase-service-account.json');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        firebaseAdmin = admin;
        console.log('Firebase Admin inicializado correctamente');
    } else {
        console.warn('Archivo firebase-service-account.json no encontrado. Firebase Admin no está disponible.');
    }
} catch (error) {
    console.error('Error al inicializar Firebase Admin:', error.message);
}

export default firebaseAdmin;

