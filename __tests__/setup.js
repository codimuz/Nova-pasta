import 'react-native-gesture-handler/jestSetup';

// Mock do React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock das animações nativas
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock do expo-sqlite para testes
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    withTransactionAsync: jest.fn((callback) => callback()),
    closeAsync: jest.fn(),
  })),
}));

// Setup global para testes
global.__DEV__ = true;

// Silence warnings durante os testes
console.warn = jest.fn();
console.error = jest.fn();

// Note: @testing-library/jest-native is deprecated
// Built-in matchers are now available in @testing-library/react-native v12.4+