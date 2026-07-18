const state = {
  users: [],
  budgetLines: [],
  resources: [],
  resourceAssignments: [],
  materials: [],
  materialTransactions: [],
  budgetTransactions: [],
};

const resetStore = () => {
  state.users = [];
  state.budgetLines = [];
  state.resources = [];
  state.resourceAssignments = [];
  state.materials = [];
  state.materialTransactions = [];
  state.budgetTransactions = [];
};

const getState = () => state;

export { state, resetStore, getState };
