const axios = require('axios');

module.exports = {
  request({ method, url, headers, body, meta }) {
    return axios({
      data: body,
      method,
      url,
      headers,
    }).then(res => {
      console.log('axios res.data', res.data);
      return res.data;
    });
  },
};
