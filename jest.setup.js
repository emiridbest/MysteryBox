// Using CommonJS require instead of ES module import
require('@testing-library/jest-dom');

// Mock window.ethereum globally
global.window = Object.create(window);
global.window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock console.error to reduce noise during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning: ReactDOM.render') || 
     args[0].includes('Warning: React.createElement') || 
     args[0].includes('Error: Uncaught'))
  ) {
    return;
  }
  originalConsoleError(...args);
};