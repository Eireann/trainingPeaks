define(
[
    "jquery",
    "TP",
    "moment",
    "framework/dataManager",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "shared/models/activityModel",
    "models/workoutsCollection"//,
    // "models/calendar/calendarCollection"
],
function($, TP, moment, DataManager, testHelpers, xhrData, WorkoutModel, ActivityModel, WorkoutsCollection/*, CalendarCollection*/)
{
    xdescribe("CalendarCollection ", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarCollection).to.not.be.undefined;
        });

        describe("prepareNext and preparePrevious", function()
        {
            var collection;
            var startDate = moment().day(0);
            var endDate = moment().day(7).add("weeks", 2);

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                collection = new CalendarCollection([],
                {
                    startDate: startDate,
                    endDate: endDate,
                    dataManager: new DataManager()
                });
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            describe("preparePrevious", function()
            {
                it("should return the models", function()
                {
                    expect(collection.preparePrevious(2).length).to.eql(2);
                });

                it("should add the models to the collection (via prependWeek)", function()
                {
                    sinon.stub(collection, "requestWorkouts").returns(new $.Deferred());
                    sinon.stub(collection, "prependWeek");
                    collection.preparePrevious(1);
                    expect(collection.prependWeek).to.have.been.calledWith(startDate.subtract("days", 7));
                });
            });

            describe("prepareNext", function()
            {
                it("should not request workouts", function()
                {
                    sinon.stub(collection, "requestWorkouts").returns(new $.Deferred());
                    collection.preparePrevious(1);
                    expect(collection.requestWorkouts).to.not.have.been.called;
                });
                it("should return the models", function()
                {
                    expect(collection.prepareNext(2).length).to.eql(2);
                });
                it("should add the models to the collection (via appendWeek)", function()
                {
                    sinon.stub(collection, "requestWorkouts").returns(new $.Deferred());
                    sinon.stub(collection, "appendWeek");
                    collection.prepareNext(1);
                    expect(collection.appendWeek).to.have.been.calledWith(endDate.add("days", 1));
                });
            });
        });
        

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Sunday", function()
        {
            var weekStartDate = moment().day(0);

            var collection = new CalendarCollection([],
            {
                startDate: weekStartDate,
                endDate: moment().day(6).add("weeks", 2),
                dataManager: new DataManager()
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).to.not.throw();
            expect(collection.getDayModel(dayInsideOfWeek)).to.not.be.undefined;
            expect(collection.getDayModel(dayInsideOfWeek).get("date")).to.equal(dayInsideOfWeek.format("YYYY-MM-DD"));
        });

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Monday", function()
        {

            var weekStartDate = moment().day(1);

            var collection = new CalendarCollection([],
            {
                startDate: weekStartDate,
                endDate: moment().day(7).add("weeks", 2),
                dataManager: new DataManager()
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).to.not.throw();
            expect(collection.getDayModel(dayInsideOfWeek)).to.not.be.undefined;
            expect(collection.getDayModel(dayInsideOfWeek).get("date")).to.equal(dayInsideOfWeek.format("YYYY-MM-DD"));

        });

        describe("createWeekCollectionStartingOn", function()
        {
            it("Should create a Backbone.Collection with seven DayModels without WeekSummary", function()
            {
                var startDate = moment();
                var contextWithoutSummary = _.extend({ summaryViewEnabled: false, daysCollection: new TP.Collection() }, CalendarCollection.prototype);
                var weekCollection = CalendarCollection.prototype.createWeekCollectionStartingOn.call(contextWithoutSummary, moment(startDate));

                expect(weekCollection.length).to.equal(7);
                expect(weekCollection.at(0).get("date")).to.equal(startDate.format("YYYY-MM-DD"));
                expect(weekCollection.at(6).get("date")).to.equal(startDate.add("days", 6).format("YYYY-MM-DD"));
                
               
            });

            it("Should create a Backbone.Collection with seven DayModels and one WeekSummaryModel", function()
            {
                var startDate = moment();

                var contextWithSummary = _.extend({ summaryViewEnabled: true, daysCollection: new TP.Collection() }, CalendarCollection.prototype);
                var weekCollectionWithSummary = CalendarCollection.prototype.createWeekCollectionStartingOn.call(contextWithSummary, moment(startDate));

                expect(weekCollectionWithSummary.length).to.equal(8);
                expect(weekCollectionWithSummary.at(0).get("date")).to.equal(startDate.format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(6).get("date")).to.equal(startDate.add("days", 6).format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(7).isSummary).to.equal(true);
            });

            it("Should add seven days to the daysCollection", function()
            {
                var startDate = moment();

                var daysSpy = createSpyObj("DaysCollection spy", ["add"]);
                var context = _.extend({ summaryViewEnabled: false, daysCollection: daysSpy }, CalendarCollection.prototype);
                var weekCollection = CalendarCollection.prototype.createWeekCollectionStartingOn.call(context, moment(startDate));
                expect(daysSpy.add).to.have.been.called;
                expect(daysSpy.add.calls.length).to.eql(7);
            });

        });

        describe("Prepend a week to the calendar", function()
        {

            var collection;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });

                expectedEndDate = moment(collection.startDate).subtract("days", 1);
                expectedStartDate = moment(expectedEndDate).subtract("days", 6);
            });

            it("Should create collection of days the appropriate dates", function()
            {
                sinon.spy(collection, "createWeekCollectionStartingOn");
                collection.prependWeek(expectedStartDate);
                expect(collection.createWeekCollectionStartingOn).to.have.been.called;
                var lastCall = collection.createWeekCollectionStartingOn.lastCall;
                expect(lastCall.args[0].format(dateFormat)).to.eql(expectedStartDate.format(dateFormat));
            });


            it("Should call collection.add with at:0 and append:false options", function()
            {
                sinon.spy(collection, "add");
                collection.prependWeek(expectedStartDate);
                expect(collection.add).to.have.been.called;
                var lastCall = collection.add.lastCall;
                expect(lastCall.args[1].at).to.not.be.undefined;
                expect(lastCall.args[1].at).to.eql(0);
                expect(lastCall.args[1].append).to.not.be.undefined;
                expect(lastCall.args[1].append).to.equal(false);
            });
        });

        describe("Append a week to the calendar", function()
        {

            var collection;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });

                expectedStartDate = moment(collection.endDate).add("days", 1);
                expectedEndDate = moment(expectedStartDate).add("days", 6);
            });


            it("Should create collection of days the appropriate dates", function()
            {
                sinon.spy(collection, "createWeekCollectionStartingOn");
                collection.appendWeek(expectedStartDate);
                expect(collection.createWeekCollectionStartingOn).to.have.been.called;
                var lastCall = collection.createWeekCollectionStartingOn.lastCall;
                expect(lastCall.args[0].format(dateFormat)).to.eql(expectedStartDate.format(dateFormat));
            });

            it("Should call collection.add with append option", function()
            {
                sinon.spy(collection, "add");
                collection.appendWeek(expectedStartDate);
                expect(collection.add).to.have.been.called;
                var lastCall = collection.add.lastCall;
                expect(lastCall.args[1].append).to.not.be.undefined;
                expect(lastCall.args[1].append).to.equal(true);
            });
        });

        describe("onItemMoved", function()
        {
            var yesterday = moment().subtract("days", 1).format("YYYY-MM-DD");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");
            var workoutId = "12345678";
            var collection;
            var workout;
            var yesterdayCalendarDay;
            var tomorrowCalendarDay;

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });
                workout = new WorkoutModel({ workoutDay: yesterday + "T00:00:00", workoutId: workoutId });
                collection.addWorkout(workout);
                yesterdayCalendarDay = collection.getDayModel(yesterday);
                tomorrowCalendarDay = collection.getDayModel(tomorrow);
            });

            xit("Should call moveToDay on workout", function()
            {
                sinon.stub(workout, "moveToDay");
                collection.onItemMoved({ ItemId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(workout.moveToDay).to.have.been.calledWith(tomorrow, tomorrowCalendarDay);
            });

        });

        it("Sets up the weeks based on a start and end date ", function()
        {
            expect(CalendarCollection.prototype.setUpWeeks).to.not.be.undefined;
            expect(typeof CalendarCollection.prototype.setUpWeeks).to.equal("function");

            var i = 0;
            var context = new CalendarCollection([],
            {
                startDate: moment().day(0),
                endDate: moment().day(6),
                dataManager: new DataManager()
            });
            
            sinon.stub(context.activitiesCollection, "reset");
            sinon.stub(context.daysCollection, "reset");
            sinon.stub(context, "add");

            var startDate = moment("2013-01-01");
            var endDate = moment("2013-03-01");
            CalendarCollection.prototype.setUpWeeks.call(context, startDate, endDate);

            expect(context.startDate.unix()).to.equal(startDate.unix());
            expect(context.endDate.unix()).to.equal(endDate.unix());
            expect(context.activitiesCollection.reset).to.have.been.called;
            expect(context.daysCollection.reset).to.have.been.called;
            expect(context.add.argsForCall[0][0].length).to.equal(9);
        });

        describe("Cut, Copy, Paste", function()
        {
            var collection;
            var copySpy;
            var cutSpy;
            var fakeData;
            var dateToPasteTo;

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });
                fakeData = {'some':'junk'};
                dateToPasteTo = moment().format("YYYY-MM-DD");
                copySpy = createSpyObj("Copy Spy", ["copyToClipboard", "cutToClipboard", "onPaste"]);
                copySpy.copyToClipboard.returns(fakeData);
                copySpy.cutToClipboard.returns(fakeData);
                copySpy.onPaste.returns(null);
            });

            it("Should call subscribeToCopyPasteEvents", function()
            {
                sinon.stub(CalendarCollection.prototype, "subscribeToCopyPasteEvents");
                var collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });
                expect(CalendarCollection.prototype.subscribeToCopyPasteEvents).to.have.been.called;
            });

            describe("onItemsCopy", function()
            {
                it("Should call copyToClipboard", function()
                {
                    collection.onItemsCopy(copySpy);
                    expect(copySpy.copyToClipboard).to.have.been.called;
                });

                it("Should copy to clipboard", function()
                {
                    sinon.spy(collection.clipboard, "set");
                    collection.onItemsCopy(copySpy);
                    expect(collection.clipboard.set).to.have.been.calledWith(fakeData, "copy");
                });
            });

            describe("onItemsCut", function()
            {
                it("Should call cutToClipboard", function()
                {
                    collection.onItemsCut(copySpy);
                    expect(copySpy.cutToClipboard).to.have.been.called;
                });

                it("Should cut to clipboard", function()
                {
                    sinon.spy(collection.clipboard, "set");
                    collection.onItemsCut(copySpy);
                    expect(collection.clipboard.set).to.have.been.calledWith(fakeData, "cut");
                });
            });

            describe("onPaste", function()
            {
                it("Should check whether clipboard is empty", function()
                {
                    sinon.stub(collection.clipboard, "hasData").returns(false);
                    collection.onPaste(dateToPasteTo);
                    expect(collection.clipboard.hasData).to.have.been.called;
                });

                it("Should call onPaste of clipboard data", function()
                {
                    collection.clipboard.set(copySpy, "copy");
                    collection.onPaste(dateToPasteTo);
                    expect(copySpy.onPaste).to.have.been.calledWith(dateToPasteTo);
                });

                it("Should call addItems", function()
                {
                    var fakeItem = {};
                    sinon.stub(collection, "addItems");
                    collection.clipboard.set(copySpy, "copy");
                    copySpy.onPaste.returns(fakeItem);
                    collection.onPaste(dateToPasteTo);
                    expect(collection.addItems).to.have.been.calledWith(fakeItem);
                });

                it("Should empty the clipboard after pasting a cut", function()
                {
                    collection.clipboard.set(copySpy, "cut");
                    sinon.stub(collection.clipboard, "empty");
                    collection.onPaste(dateToPasteTo);
                    expect(collection.clipboard.empty).to.have.been.called;
                });

                it("Should empty the clipboard after pasting a copy", function()
                {
                    collection.clipboard.set(copySpy, "copy");
                    sinon.stub(collection.clipboard, "empty");
                    collection.onPaste(dateToPasteTo);
                    expect(collection.clipboard.empty).to.not.have.been.called;
                });
            });

        });

        describe("addItems", function()
        {

            var collection;
            var workouts;

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2),
                    dataManager: new DataManager()
                });

                workouts = [];
                for (var i = 0; i < 5; i++)
                {
                    workouts.push(new TP.Model());
                }

                sinon.stub(collection, "addItem");
            });

            it("Should work with empty values", function()
            {
                collection.addItems(null);
                expect(collection.addItem).to.not.have.been.called;
            });

            it("Should work with single items", function()
            {
                var workout = new TP.Model();
                collection.addItems(workout);
                expect(collection.addItem).to.have.been.calledWith(workout);
            });

            it("Should work with collections", function()
            {
                collection.addItems(new TP.Collection(workouts));
                _.each(workouts, function(workout)
                {
                    expect(collection.addItem).to.have.been.calledWith(workout);
                });
            });

            it("Should work with arrays", function()
            {
                collection.addItems(workouts);
                _.each(workouts, function(workout)
                {
                    expect(collection.addItem).to.have.been.calledWith(workout);
                });
            });

            it("Should work with nested arrays", function()
            {
                var nestedWorkouts = [[], []];
                for (var i = 0; i < workouts.length; i++)
                {
                    var nestedIndex = i % 2 === 0 ? 0 : 1;
                    nestedWorkouts[nestedIndex].push(workouts[i]);
                }
                collection.addItems(nestedWorkouts);
                _.each(workouts, function(workout)
                {
                    expect(collection.addItem).to.have.been.calledWith(workout);
                });
            });

        });

        describe("Auto index by day", function()
        {
            var collection, workout, activity;
            var origDate = moment().format("YYYY-MM-DD");
            var newDate = moment().add(1, "day").format("YYYY-MM-DD");
            
            beforeEach(function()
            {
                testHelpers.setupFakeAjax();
                collection = new CalendarCollection([], {
                    startDate: moment(),
                    endDate: moment(),
                    dataManager: new DataManager()
                });
                workout = new WorkoutModel({ workoutId: 42, workoutDay: origDate });
                activity = ActivityModel.wrap(workout);
                collection.addItem(workout);
            });

            afterEach(function()
            {
                testHelpers.removeFakeAjax();
            });

            it("should be in the correct day collection", function()
            {
                expect(collection.getDayModel(origDate).itemsCollection.contains(activity)).to.equal(true);
            });

            it("moving the workout should move to the correct day collection immediately", function()
            {
                workout.moveToDay(newDate);
                expect(collection.getDayModel(newDate).itemsCollection.contains(activity)).to.equal(true);
            });

            it("moving the workout should remove the workout from the old collection", function()
            {
                workout.moveToDay(newDate);
                expect(collection.getDayModel(origDate).itemsCollection.contains(activity)).to.equal(false);
            });

            it("if moving the workout fails it should revert to the original date", function()
            {
                workout.moveToDay(newDate);
                testHelpers.rejectRequest("PUT", "/workouts/");
                expect(collection.getDayModel(origDate).itemsCollection.contains(activity)).to.equal(true);
                expect(collection.getDayModel(newDate).itemsCollection.contains(activity)).to.equal(false);
            });

        });

    });
});
