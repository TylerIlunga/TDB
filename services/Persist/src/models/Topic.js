const Sequelize = require('sequelize');
const Converter = require('../../tools/Common/Converter');

const options = {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeValidate(user, options) {},
    afterValidate(user, options) {},
    beforeCreate(user, options) {},
    afterCreate(user, options) {},
  },
};

module.exports = sequelize => {
  let Topic = sequelize.define(
    'topic',
    {
      label: {
        type: Sequelize.BLOB,
        allowNull: false,
        get() {
          return this.getDataValue('label').toString('utf-8');
        },
        set(label) {
          this.setDataValue('label', Converter.toBuffer(label));
        },
      },
      appearance: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Topic.associate = models => {
    Topic.hasMany(models.Question, {
      as: 'question_topic',
      foreignKey: 'topic_id',
    });
  };

  return Topic;
};
