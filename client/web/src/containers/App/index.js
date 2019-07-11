import React, { Component } from 'react';
import Router from '../Router';
import { CookiesProvider } from 'react-cookie';
import './styles.css';

export default class App extends Component {
  render() {
    return (
      <CookiesProvider>
        <Router />
      </CookiesProvider>
    );
  }
}
