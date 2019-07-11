import { UPDATE_QUESTION } from '../constants';

export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_QUESTION:
      return {
        ...state,
        question: action.question,
      };
    default:
      return state;
  }
};
