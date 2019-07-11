const url = require('url');
const { persist_base } = require('../config');
const RPC = require('../../tools/Common/Network/RPC');
const Errors = require('../../tools/Common/Errors');

// router.get('/api/persist/questions/query', Questions.query);
// router.post('/api/persist/questions/store', Questions.store);
// router.put('/api/persist/questions/update', Questions.update);
// router.delete('/api/persist/questions/delete', Questions.delete);

const hasCreationRequirements = body => {
  switch (body.type) {
    case 'Subject':
      return body.label !== null;
    case 'Topic':
      return body.label && body.subject_id;
    case 'Question':
      return body.content && body.topic_id && body.subject_id;
  }
};

const organizeSubjectPackage = body => {
  return {
    type: body.type,
    storageOptions: {
      label: body.label,
    },
  };
};

const organizeTopicPackage = body => {
  return {
    type: body.type,
    storageOptions: {
      label: body.label,
      subject_id: body.subject_id,
    },
  };
};

const organizeQuestionPackage = body => {
  return {
    type: body.type,
    storageOptions: {
      content: body.content,
      topic_id: body.topic_id,
      subject_id: body.subject_id,
    },
  };
};

const generateCreationBody = body => {
  switch (body.type) {
    case 'Subject':
      return organizeSubjectPackage(body);
    case 'Topic':
      return organizeTopicPackage(body);
    case 'Question':
      return organizeQuestionPackage(body);
  }
};

module.exports = {
  list(req, res) {
    RPC.request({
      method: 'GET',
      url: `${persist_base}/api/persist/questions/list`,
    })
      .then(response => {
        console.log('PERSIST LAYER RES::', response);
        return res.json(response);
      })
      .catch(error => {
        return res.json({
          error: 'Persist Service Error: ' + error,
          success: false,
        });
      });
  },
  query(req, res) {
    if (
      !(
        req.query &&
        req.query.resourceType &&
        req.query.structureType &&
        req.query.listOptions
      )
    ) {
      return Errors.Network.missingFields(res);
    }
    const queryString = url.parse(req.url).query;
    console.log(queryString);
    RPC.request({
      method: 'GET',
      url: `${persist_base}/api/persist/questions/query?${queryString}`,
    })
      .then(response => {
        console.log('PERSIST LAYER RES::', response);
        return res.json(response);
      })
      .catch(error => {
        return res.json({
          error: 'Persist Service Error: ' + error,
          success: false,
        });
      });
  },
  create(req, res) {
    console.log('req.body', req.body);
    if (!(req.body && req.body.type && hasCreationRequirements(req.body))) {
      return Errors.Network.missingFields(res);
    }
    RPC.request({
      method: 'POST',
      url: `${persist_base}/api/persist/questions/store`,
      headers: {
        TESTKEY: 'dnsdjkcs',
      },
      body: {
        ...generateCreationBody(req.body),
        answers: req.body.answers ? req.body.answers : null,
      },
    })
      .then(response => {
        console.log('PERSIST LAYER RES::', response);
        return res.json(response);
      })
      .catch(error => {
        return res.json({
          error: 'Persist Service Error: ' + error,
          success: false,
        });
      });
  },
  update(req, res) {
    if (
      !(
        req.query &&
        req.query.resourceId &&
        req.query.type &&
        req.body &&
        req.body.updatedValues
      )
    ) {
      return Errors.Network.missingFields(res);
    }
    const queryString = url.parse(req.url).query;
    RPC.request({
      method: 'PUT',
      url: `${persist_base}/api/persist/questions/update?${queryString}`,
      headers: {
        TESTKEY: 'sdkmdslk',
      },
      body: req.body,
    })
      .then(response => {
        console.log('Persist layer response:', response);
        return res.json(response);
      })
      .catch(error => {
        return res.json({
          error: 'Persist Service Error: ' + error,
          success: false,
        });
      });
  },
  discard(req, res) {
    if (!(req.query && req.query.resourceId && req.query.type)) {
      return Errors.Network.missingFields(res);
    }
    const queryString = url.parse(req.url).query;
    console.log('querySting::', queryString);
    RPC.request({
      method: 'DELETE',
      url: `${persist_base}/api/persist/questions/delete?${queryString}`,
      headers: {
        TESTKEY: 'snskdslk',
      },
    })
      .then(response => {
        console.log('PERSIST LAYER response:::', response);
        return res.json(response);
      })
      .catch(error => {
        return res.json({
          error: 'Persist Layer Error: ' + error,
          success: false,
        });
      });
  },
};
