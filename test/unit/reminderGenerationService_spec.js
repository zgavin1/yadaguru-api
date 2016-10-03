var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var moment = require('moment');
var Promise = require('bluebird');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();


describe('The reminderGenerationService', function() {
  var reminderGenerator, todaysDate;

  beforeEach(function() {
    reminderGenerator = require('../../services/reminderGenerationService');
    todaysDate = moment.utc('2016-09-01');
    this.clock = sinon.useFakeTimers(todaysDate.valueOf());
  });

  afterEach(function() {
    this.clock.restore();
  });

  describe('getRemindersForSchool method', function() {
    var baseReminders, timeframes, schoolId, userId, dueDate;
    var baseReminderService, findAllIncludingTimeframes;

    beforeEach(function() {
      dueDate = '2017-02-01';
      schoolId = '1';
      userId = '1';

      timeframes = {
        now: {
          id: 1,
          name: 'Today',
          type: 'now',
          formula: undefined
        },
        relative: {
          id: 2,
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        },
        absolute: {
          id: 3,
          name: 'January 1',
          type: 'absolute',
          formula: '2017-01-01'
        }
      };

      baseReminders = [{
        id: '1',
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframes: [timeframes.now, timeframes.relative],
        categoryId: 1
      }, {
        id: '2',
        name: 'Get Recommendations',
        message: 'Ask your counselor',
        detail: 'Tips for asking your counselor',
        lateMessage: 'Too late',
        lateDetail: '',
        timeframes: [timeframes.absolute],
        categoryId: 2
      }];

      baseReminderService = require('../../services/baseReminderService');
      findAllIncludingTimeframes = sinon.stub(baseReminderService, 'findAllIncludingTimeframes');

    });

    afterEach(function() {
      findAllIncludingTimeframes.restore();
    });

    it('should generate a reminder on today\'s date if it has a timeframe type of "now"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.now];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);

    });

    it('should generate a reminder N days from the due date if it has a timeframe type of "relative"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.relative];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders =[{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: moment.utc(dueDate).subtract(baseReminder.timeframes[0].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);

    });

    it('should generate a reminder on a specified date if the timeframe has a type of "absolute"', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.absolute];
      baseReminders = [baseReminder];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: baseReminder.timeframes[0].formula,
        timeframe: baseReminder.timeframes[0].name
      }];

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });

    it('should generate a reminder for each timeframe associated with the baseReminder', function() {
      var baseReminder = baseReminders[0];
      baseReminder.timeframes = [timeframes.now, timeframes.relative, timeframes.absolute];
      baseReminders = [baseReminder];

      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[0].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: moment.utc(dueDate).subtract(baseReminder.timeframes[1].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminder.timeframes[1].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminder.id,
        dueDate: baseReminder.timeframes[2].formula,
        timeframe: baseReminder.timeframes[2].name
      }];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });

    it('should generate reminders for each baseReminder', function() {
      var generatedReminders = [{
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[0].id,
        dueDate: todaysDate.format('YYYY-MM-DD'),
        timeframe: baseReminders[0].timeframes[0].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[0].id,
        dueDate: moment.utc(dueDate).subtract(baseReminders[0].timeframes[1].formula, 'Days').format('YYYY-MM-DD'),
        timeframe: baseReminders[0].timeframes[1].name
      }, {
        schoolId: schoolId,
        userId: userId,
        baseReminderId: baseReminders[1].id,
        dueDate: baseReminders[1].timeframes[0].formula,
        timeframe: baseReminders[1].timeframes[0].name
      }];

      findAllIncludingTimeframes.withArgs()
        .returns(Promise.resolve(baseReminders));

      return reminderGenerator.getRemindersForSchool(schoolId, userId, dueDate)
        .should.eventually.deep.equal(generatedReminders);
    });
  });
});