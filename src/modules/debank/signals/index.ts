import topHolders from './topHolders';

export const getSignals = async (symbol) => {
  await topHolders({ symbol });
};
