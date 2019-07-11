module.exports = {
  missingFields(res) {
    return res.json({ error: 'Missing fields.', success: false });
  },
};
