export const initialBudgetState = {
  lines: [],
  loading: false,
  error: null,
};

export const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_LINES':
      return { ...state, lines: action.lines };
    case 'ADD_LINE':
      return { ...state, lines: [action.line, ...state.lines] };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        lines: state.lines.map((line) => (line.id === action.line.id ? action.line : line)),
      };
    default:
      return state;
  }
};
