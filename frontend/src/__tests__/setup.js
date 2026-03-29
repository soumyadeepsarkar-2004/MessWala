// Mock react-joyride
vi.mock('react-joyride', () => {
  const MockComp = () => null;
  return {
    Joyride: MockComp,
    STATUS: {
      FINISHED: 'finished',
      SKIPPED: 'skipped',
    },
    default: MockComp,
  };
});

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
