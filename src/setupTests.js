const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

global.navigator.mediaDevices = {
  getUserMedia: () => new Promise(() => {}),
};
