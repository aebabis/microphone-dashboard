const localStorageMock = {
  getItem: jest.fn(), // eslint-disable-line no-undef
  setItem: jest.fn(), // eslint-disable-line no-undef
  clear: jest.fn(), // eslint-disable-line no-undef
};
global.localStorage = localStorageMock;

global.navigator.mediaDevices = {
  getUserMedia: () => new Promise(() => {}),
};
