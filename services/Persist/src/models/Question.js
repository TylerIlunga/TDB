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
  let Question = sequelize.define(
    'question',
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
      passedCount: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      failedCount: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
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

  Question.associate = models => {
    Question.hasMany(models.Answer, {
      as: 'question_answer',
      foreignKey: 'question_id',
    });
  };

  return Question;
};
