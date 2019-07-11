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
  let Answer = sequelize.define(
    'answer',
    {
      content: {
        type: Sequelize.BLOB,
        allowNull: false,
        get() {
          return this.getDataValue('content').toString('utf-8');
        },
        set(content) {
          this.setDataValue('content', Converter.toBuffer(content));
        },
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Answer.associate = models => {};

  return Answer;
};
