module.exports = {
  missingFields(res) {
    return res.json({
      error: 'Missing fields.',
      success: false
    });
  },
  rpcFailure(serviceLabel, error, res) {
    return res.json({
      error: `${serviceLabel} service error: ` + error,
      success: false
    })
  }
};