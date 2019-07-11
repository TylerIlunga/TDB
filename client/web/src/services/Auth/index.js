import config from '../../config';

export default class AuthService {
  constructor() {
    this.localStorage = window.localStorage;
    this.fetch = this.fetch.bind(this);
    this.login = this.login.bind(this);
  }

  fetch(domain, endpoint, options = {}) {
    // performs api calls sending the required authentication headers
    const headers = {
      'Access-Control-Allow-Origin': domain,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `BEARER ${this.getToken()}`,
      api_key: `BEARER ${this.getDomainKey('api')}`,
      auth_key: `OHM ${this.getDomainKey('auth')}`,
    };

    return fetch(`${domain}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    })
      .then(this._checkStatus)
      .then(response => response.json())
      .catch(err => err);
  }

  _checkStatus(response) {
    // raises an error in case response status is not a success
    if (response.status >= 200 && response.status < 300) {
      // Success status lies between 200 to 300
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  setUserToken(token) {
    // Saves user token to this.localStorage
    // NOTE: get if "" is returned instead of "".
    if (this.getToken()) return;
    this.localStorage.setItem('user_token', token);
  }

  setDomainKey(domain, key) {
    if (this.getDomainKey(domain)) return;
    this.localStorage.setItem(`${domain}_key`, key);
  }

  getToken() {
    // Retrieves the user token from this.localStorage
    return this.localStorage.getItem('user_token');
  }

  getDomainKey(domain) {
    return this.localStorage.getItem(`${domain}_key`);
  }

  retrieveAccount() {
    console.log('retrieving account');
    const token = this.getToken();
    return this.fetch(
      config.auth_base,
      `/api/search/auth/retrieve?token=${token}`,
    )
      .then(res => {
        console.log('retrieveAccount RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  login({ email, password, recaptchaResponse }) {
    console.log('logging in ' + email, password, recaptchaResponse);
    // Get a token from api server using the fetch api
    return this.fetch(config.auth_base, '/api/search/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        recaptchaResponse,
      }),
    })
      .then(res => {
        console.log('login RESPONSE', res);
        // if (!res.error && res.userToken && res.domainKey) {
        //   this.setUserToken(res.userToken);
        //   this.setDomainKey(res.domainKey);
        // }
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  handleTFA({ token, recaptchaResponse }) {
    console.log('handleTFA() token', token);
    return this.fetch(
      config.auth_base,
      `/api/search/auth/handleTFA?token=${token}&rr=${recaptchaResponse}`,
    )
      .then(res => {
        console.log('handleTFA RESPONSE', res);
        // if (!res.error && res.userToken && res.domainKey) {
        //   this.setUserToken(res.userToken);
        //   this.setDomainKey(res.domainKey);
        // }
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  signUp({ email, password, business, recaptchaResponse }) {
    return this.fetch(config.auth_base, '/api/search/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        business,
        recaptchaResponse,
      }),
    })
      .then(res => {
        console.log('signUp RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  verifyAccount({ email, token }) {
    return this.fetch(
      config.auth_base,
      `/api/search/auth/verify?email=${email}&token=${token}`,
    )
      .then(res => {
        console.log('verifyAccount RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  forgotPassword({ email }) {
    return this.fetch(config.auth_base, '/api/search/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
      .then(res => {
        console.log('forgotPassword RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  resetPassword({ email, token, newPassword }) {
    return this.fetch(config.auth_base, '/api/search/auth/reset', {
      method: 'POST',
      body: JSON.stringify({
        email,
        token,
        newPassword,
      }),
    })
      .then(res => {
        console.log('resetPassword RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  logout() {
    return this.fetch(config.auth_base, '/api/search/auth/logout')
      .then(res => {
        console.log('LOGOUT RESPONSE', res);
        // Clear user token and profile data from this.localStorage
        this.localStorage.removeItem('user_token');
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  deleteAccount({ id, email, password }) {
    return this.fetch(
      config.auth_base,
      `'/api/search/auth/delete?email=${email}&id=${id}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      },
    )
      .then(res => {
        console.log('SIGNUP RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }
}
