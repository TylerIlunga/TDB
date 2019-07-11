/* @flow */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import authReducer from './auth';
import modalReducer from './modal';
import questionReducer from './question';

export default history =>
  combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    modal: modalReducer,
    question: questionReducer,
  });
