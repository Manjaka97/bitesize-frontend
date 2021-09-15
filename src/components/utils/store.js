import { combineReducers, createStore } from 'redux';

// reducers

// Authentication
export const authReducer = (state={token: '', user: {}}, action) => {
  switch (action.type) {
    case 'GET_TOKEN':
      return state.token;
    case 'SET_TOKEN':
      return {...state, token: action.payload};
    case 'GET_USER':
      return state.user;
    case 'SET_USER':
      return {...state, user: action.payload};
    default:
      return {...state};
  }
};

// Theme colors
export const colorReducer = (state={primary: '#27767C', error: 'red', grayBg: '#F2F4F8'}, action) => {
  switch (action.type) {
    case 'GET_COLOR':
      return state;
    default:
      return state;
  }
};

// Goals list
export const goalsReducer = (state={goals: [], stale: true}, action) => {
  switch (action.type) {
    case 'GET_GOALS':
      return state.goals;
    case 'SET_GOALS':
      return {...state, goals: action.payload};
    case 'GET_GOALS_STALE':
      return state.stale;
    case 'SET_GOALS_STALE':
      return {...state, stale: action.payload};
    default:
      return {...state};
  }
};

// User profile
export const userReducer = (state={user: {encouragement:''}}, action) => {
  switch (action.type) {
    case 'GET_USER_PROFILE':
      return {...state};
    case 'SET_USER_PROFILE':
      return {...state, user: action.payload};
    default:
      return {...state};
  }
};

// Goal categories
export const categoriesReducer = (state={categories: []}, action) => {
      switch (action.type) {
        case 'GET_CATEGORIES':
          return {...state};
        case 'SET_CATEGORIES':
          return {...state, categories: action.payload};
        default:
          return state;
      }
};


export const reducers = combineReducers({
  authReducer,
  colorReducer,
  goalsReducer,
  categoriesReducer,
  userReducer
});

export const store = createStore(reducers, {});