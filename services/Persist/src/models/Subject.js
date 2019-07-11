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
  let Subject = sequelize.define(
    'subject', {
      label: {
        type: Sequelize.BLOB,
        allowNull: false,
        get() {
          console.log('dfklnsdcklsdncklms')
          return this.getDataValue('label').toString('utf8');
        },
        set(label) {
          console.log('SETTT: ', label);
          this.setDataValue('label', Converter.toBuffer(label));
        },
      },
      // Times chosen for game(successfully => full game): Can get total appearances
      // from all subjects and rank them, trending via the last hour, etc.
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

  Subject.associate = models => {
    Subject.hasMany(models.Question, {
      as: 'question_subject',
      foreignKey: 'subject_id',
    });
    Subject.hasMany(models.Topic, {
      as: 'topic_subject',
      foreignKey: 'subject_id',
    });
  };

  return Subject;
};