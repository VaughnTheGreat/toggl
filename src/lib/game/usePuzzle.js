import { useReducer } from 'react';
import { applyPress } from './ruleEngine';

function init(level) {
  return { states: { ...level.start }, locks: {}, moves: 0, history: [], undosUsed: 0 };
}

function reducer(state, action) {
  switch (action.type) {
    case 'PRESS': {
      const res = applyPress(state.states, state.locks, action.button);
      return {
        ...state,
        states: res.states,
        locks: res.locks,
        moves: state.moves + 1,
        history: [...state.history, { states: state.states, locks: state.locks }],
      };
    }
    case 'UNDO': {
      if (!state.history.length) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        states: prev.states,
        locks: prev.locks,
        moves: state.moves - 1,
        history: state.history.slice(0, -1),
        undosUsed: state.undosUsed + 1,
      };
    }
    case 'RESET':
      return init(action.level);
    default:
      return state;
  }
}

export function usePuzzle(level) {
  return useReducer(reducer, level, init);
}