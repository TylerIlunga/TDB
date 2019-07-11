import { CLEAR_MODAL, UPDATE_MODAL } from '../constants';

export default (state = {}, action) => {
  switch (action.type) {
    case CLEAR_MODAL:
      return {};
    case UPDATE_MODAL:
      return {
        ...state,
        info: action.info,
      };
    default:
      return state;
  }
};
