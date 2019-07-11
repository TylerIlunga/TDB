const config = require('../../config');
const RPC = require('../../../tools/Common/Network/RPC');
const Errors = require('../../../tools/Common/Errors');

/**
 * parseListOptions: Option format ["key0:value0,key1:value1"]
 * @param {*} listOptions
 */
const parseListOptions = listOptions => {
  const resultant = {};
  const splitList = listOptions.split(',');
  console.log('splitList:::', splitList);
  if (splitList.length < 2) return {};
  splitList.map(options => {
    const pair = options.split(':');
    resultant[pair[0]] = pair[1];
  });
  console.log('resultant:::', resultant);
  let options = {};
  if (resultant.order) {
    options['order'] = resultant.order;
    resultant.order = null;
    delete resultant.order;
  }
  if (resultant.limit) {
    options['limit'] = Number(resultant.limit);
    resultant.limit = null;
    delete resultant.limit;
  }
  return {
    ...options,
    where: {
      ...resultant,
    },
    order: [['created_at', 'DESC']],
  };
};

/** Basic CRUD Operations for the Questions Controller */
module.exports = {
  // NOTE: Handle querying via labels(BLOB) and not just id
  list(req, res) {
    const promises = [];
    promises.push(
      config['Subject'].findAll().then(resources => {
        return resources.map(resource => {
          return {
            ...resource.dataValues,
            type: 'Subject',
          };
        });
      }),
      config['Topic'].findAll().then(resources => {
        return resources.map(resource => {
          return {
            ...resource.dataValues,
            type: 'Topic',
          };
        });
      }),
      config['Question'].findAll().then(resources => {
        return resources.map(resource => {
          return {
            ...resource.dataValues,
            type: 'Question',
          };
        });
      }),
    );
    Promise.all(promises)
      .then(resources => {
        resources = Array.prototype.concat.apply([], resources);
        if (resources && resources.length === 0) {
          return res.json({
            resources: [],
            success: true,
          });
        }
        return res.json({
          resources,
          success: true,
        });
      })
      .catch(error => {
        console.log('Error fetching all resources: ', error);
        return res.json({
          error,
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
    console.log('req query:', req.query);
    if (req.query.structureType === 'list') {
      return config[req.query.resourceType]
        .findAll(parseListOptions(req.query.listOptions))
        .then(resources => {
          console.log(
            `stored resources from resource type[${req.query.resourceType}]:`,
            resources,
          );
          if (resources && resources.length === 0) {
            return res.json({
              resources: [],
              success: true,
            });
          }
          return res.json({
            resources: resources.map(resource => {
              return {
                ...resource.dataValues,
                type: req.query.resourceType,
              };
            }),
            success: true,
          });
        })
        .catch(error => {
          console.log('Error fetching all resources: ', error);
          return res.json({
            error,
            success: false,
          });
        });
    }
    config[req.query.resourceType]
      .findOne(parseListOptions(req.query.listOptions))
      .then(resource => {
        console.log(
          `stored resource with resource type[${req.query.resourceType}]:`,
          resource,
        );
        // ** Try converting Buffer to String on FE **//
        // question = question ? {
        //     ...question.dataValues,
        //     label: question.get('label')
        // } : null;
        resource = resource ? resource.dataValues : null;
        return res.json({
          resource,
          success: true,
        });
      })
      .catch(error => {
        console.log('Error fetching resource: ', error);
        return res.json({
          error,
          success: false,
        });
      });
  },
  store(req, res) {
    console.log(req.body);
    if (!(req.body && req.body.type && req.body.storageOptions)) {
      return Errors.Network.missingFields(res);
    }
    console.log('storageOptions::', req.body.storageOptions);
    config[req.body.type]
      .findOne({
        where: {
          ...req.body.storageOptions,
        },
      })
      .then(resource => {
        if (resource) {
          return res.json({
            error: `${req.body.type} already exists.`,
            success: false,
          });
        }
        config[req.body.type]
          .create(req.body.storageOptions)
          .then(storedResource => {
            console.log('Stored question:', storedResource);
            storedResource = storedResource.dataValues;
            if (req.body.type !== 'Question') {
              return res.json({
                success: true,
                resource: storedResource,
              });
            }
            let promises = [];
            req.body.answers.map(content => {
              promises.push(
                config['Answer'].create({
                  content,
                  question_id: storedResource.id,
                }),
              );
            });
            Promise.all(promises)
              .then(sa => {
                console.log('Stored answers:', sa);
                return res.json({
                  success: true,
                  question: storedResource,
                });
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            console.log('Error storing question: ', error);
            return res.json({
              error,
              success: false,
            });
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
    console.log('req.body:::', req.body);
    console.log('req.query:::', req.query);
    config[req.query.type]
      .findOne({
        where: {
          id: req.query.resourceId,
        },
      })
      .then(storedResource => {
        if (!storedResource) {
          return res.json({
            error: `${req.query.type} does not exist.`,
            success: false,
          });
        }
        storedResource
          .update(req.body.updatedValues)
          .then(updatedQuestion => {
            console.log('updatedQuestion:::', updatedQuestion);
            return res.json({
              success: true,
            });
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(error => {
        console.log('Error updating question: ', error);
        return res.json({
          error,
          success: false,
        });
      });
  },
  delete(req, res) {
    if (!(req.query && req.query.resourceId && req.query.type)) {
      return Errors.Network.missingFields(res);
    }
    console.log('req.query:::', req.query);
    config[req.query.type]
      .destroy({
        where: {
          id: req.query.resourceId,
        },
      })
      .then(deletedResource => {
        console.log('deleted resource:', deletedResource);
        return res.json({
          success: true,
        });
      })
      .catch(error => {
        console.log(`Error deleting resource type[${req.query.type}]: `, error);
        return res.json({
          error,
          success: false,
        });
      });
  },
};
