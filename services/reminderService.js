var moment = require('moment');
var models = require('../models/');
var Reminder = models.Reminder;
var BaseReminder = models.BaseReminder;
var Category = models.Category;

var outputSanitizer = function(reminder) {
  reminder.dueDate = moment.utc(reminder.dueDate).format('YYYY-MM-DD');
  return reminder;
};

var reminderService = require('./baseDbService')(Reminder, outputSanitizer);

function getReminderResponse(row) {
  return {
    id: row.dataValues.id,
    dueDate: moment.utc(row.dataValues.dueDate).format('YYYY-MM-DD'),
    timeframe: row.dataValues.timeframe,
    name: row.dataValues.BaseReminder.dataValues.name,
    message: row.dataValues.BaseReminder.dataValues.message,
    detail: row.dataValues.BaseReminder.dataValues.detail,
    lateMessage: row.dataValues.BaseReminder.dataValues.lateMessage,
    lateDetail: row.dataValues.BaseReminder.dataValues.lateDetail,
    category: row.dataValues.BaseReminder.dataValues.Category.dataValues.name
  }
}

reminderService.findByUserWithBaseReminders = function(userId) {
  return Reminder.findAll({
    where: {
      userId: userId
    },
    include: {
      model: BaseReminder,
      include: {
        model: Category
      }
    }
  }).then(function(rows) {
    return rows.map(function(row) {
      return getReminderResponse(row);
    })
  })
};

reminderService.findByIdForUserWithBaseReminders = function(id, userId) {
  return Reminder.findAll({
    where: {
      id: id,
      userId: userId
    },
    include: {
      model: BaseReminder,
      include: {
        model: Category
      }
    }
  }).then(function(row) {
    if (row.length < 1) {
      return [];
    }
    return [getReminderResponse(row)];
  })
};

reminderService.findByUserForSchoolWithBaseReminders = function(schoolId, userId) {
  return Reminder.findAll({
    where: {
      userId: userId,
      schoolId: schoolId
    },
    include: {
      model: BaseReminder,
      include: {
        model: Category
      }
    }
  }).then(function(rows) {
    return rows.map(function(row) {
      return getReminderResponse(row);
    });
  });
};

module.exports = reminderService;
