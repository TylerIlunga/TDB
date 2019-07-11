import { CLEAR_MODAL, UPDATE_MODAL } from '../constants';

export const clearModal = () => {
  return { type: CLEAR_MODAL };
};

export const updateModal = info => {
  return {
    type: UPDATE_MODAL,
    info,
  };
};
