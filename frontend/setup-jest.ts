// Inicializa el entorno de pruebas de Angular para Jest (TestBed + zone.js).
// Se carga una sola vez desde jest.config.js (setupFilesAfterEnv).
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
