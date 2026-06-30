// =============================================================================
//  Configuración de Jest para el proyecto Angular.
//
//  Usamos "jest-preset-angular", que integra Jest con el compilador de Angular
//  y un entorno de navegador simulado (jsdom). Gracias a jsdom NO se necesita
//  un navegador real: los tests corren en Node, ideal para CI.
// =============================================================================
module.exports = {
  // Preset que configura ts-jest + el entorno de Angular automáticamente.
  preset: 'jest-preset-angular',

  // Archivo que inicializa el entorno de pruebas de Angular (TestBed).
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  // No buscar tests dentro de estas carpetas.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
