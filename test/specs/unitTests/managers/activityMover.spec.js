define(
[
    "moment",
    "TP",
    "models/workoutModel",
    "shared/models/metricModel",
    "models/library/libraryExercise",
    "models/library/trainingPlan",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "shared/managers/activityMover",
    "views/calendar/library/applyTrainingPlanToCalendarConfirmationView"
],
function(
    moment,
    TP,
    WorkoutModel,
    MetricModel,
    LibraryExerciseModel,
    TrainingPlanModel,
    UserModel,
    UserAccessRightsModel,
    FeatureAuthorizer,
    ActivityMover,
    ApplyTrainingPlanConfirmationView
)
{

    function BuildUser()
    {
        var user = new UserModel({ userId: 1 });
        user.set("athletes", [{ athleteId: 1, userType: 4 }, { athleteId: 2, userType: 6 }, { athleteId: 3, userType: 4 }]);
        user.setCurrentAthlete(new TP.Model(user.get("athletes")[0]));
        return user;
    }

    function BuildFeatureAuthorizer(user) 
    { 
        return new FeatureAuthorizer(user, new UserAccessRightsModel());
    }

    describe("ActivityMover", function()
    {
        var user, featureAuthorizer;
        beforeEach(function()
        {
            user = BuildUser();
            featureAuthorizer = BuildFeatureAuthorizer(user);
        });

        it("Should require a feature authorizer", function()
        {
            expect(function(){ return new ActivityMover(); }).to.throw();

            expect(function(){ return new ActivityMover({ featureAuthorizer: featureAuthorizer, user: user, calendarManager: {}, selectionManager: {} }); }).to.not.throw();
        });

        describe(".moveActivity", function()
        {

            var activityMover, calendarManager, selectionManager;
            beforeEach(function()
            {
                calendarManager = { addItem: function(){} };
                selectionManager = { setSelection: function() {} };

                activityMover = new ActivityMover({ 
                    featureAuthorizer: featureAuthorizer,
                    user: user,
                    calendarManager: calendarManager,
                    selectionManager: selectionManager
                });
            });

            describe("Metric", function()
            {
                var metric;
                beforeEach(function()
                {
                    metric = new MetricModel({
                        timeStamp: "2014-01-01T06:30:00"
                    },{
                        user: user,
                        apiRoot: "https://tpapi.dev.trainingpeaks.com"
                    });

                    sinon.spy(metric, "save");
                });

                it("Should not save the model if the date has not changed", function()
                {
                    activityMover.moveActivityToDay(metric, "2014-01-01");
                    expect(metric.save).to.not.have.been.called;
                });

                it("Should save the model with a new timeStamp", function()
                {
                    activityMover.moveActivityToDay(metric, "2014-04-01");
                    expect(metric.save).to.have.been.calledOnce;
                    expect(metric.save.firstCall.args[0].timeStamp).to.not.be.undefined;
                });

                it("Should set a new date", function()
                {
                    activityMover.moveActivityToDay(metric, "2014-04-01");
                    expect(metric.save.firstCall.args[0].timeStamp).to.contain("2014-04-01");
                });

                it("Should preserve the original time", function()
                {
                    activityMover.moveActivityToDay(metric, "2014-04-01");
                    expect(metric.save.firstCall.args[0].timeStamp).to.contain("T06:30:00");
                });
            });

            describe("Workout", function()
            {
            
                var workout;
                beforeEach(function()
                {
                    workout = new WorkoutModel({
                        workoutDay: "2014-01-01T00:00:00"
                    },{
                        user: user,
                        apiRoot: "https://tpapi.dev.trainingpeaks.com"
                    });

                    sinon.spy(workout, "save");
                    sinon.spy(featureAuthorizer, "canAccessFeature");
                });

                it("Should not save the model if the date has not changed", function()
                {
                    activityMover.moveActivityToDay(workout, "2014-01-01");
                    expect(workout.save).to.not.have.been.called;
                });

                it("Should call the feature authorizer", function()
                {
                    activityMover.moveActivityToDay(workout, "2014-04-01");
                    expect(featureAuthorizer.canAccessFeature).to.have.been.calledWith(featureAuthorizer.features.EditLockedWorkout, { workout: workout });
                });

                it("Should save the model with a new workoutDay", function()
                {
                    activityMover.moveActivityToDay(workout, "2014-04-01");
                    expect(workout.save).to.have.been.calledOnce;
                    expect(workout.save.firstCall.args[0].workoutDay).to.not.be.undefined;
                });

                it("Should set a new date", function()
                {
                    activityMover.moveActivityToDay(workout, "2014-04-01");
                    expect(workout.save.firstCall.args[0].workoutDay).to.contain("2014-04-01");
                });
                
            });

            describe("TrainingPlan", function()
            {

                it("Should open a confirmation view", function()
                {
                    sinon.stub(ApplyTrainingPlanConfirmationView.prototype, "initialize");
                    sinon.stub(ApplyTrainingPlanConfirmationView.prototype, "render");
                    activityMover.moveActivityToDay(new TrainingPlanModel(), "2014-03-01");
                    expect(ApplyTrainingPlanConfirmationView.prototype.render).to.have.been.calledOnce;
                });
            });

            describe("LibraryExercise", function()
            {
            
                var libraryExercise;
                beforeEach(function()
                {
                    libraryExercise = new LibraryExerciseModel();
                    sinon.stub(libraryExercise, "createWorkout").returns(new WorkoutModel({ workoutDay: "2014-04-01" }));
                    sinon.stub(featureAuthorizer, "canAccessFeature").returns(true);
                });

                it("Should call the feature authorizer", function()
                {
                    activityMover.moveActivityToDay(libraryExercise, "2014-04-01");
                    expect(featureAuthorizer.canAccessFeature).to.have.been.calledWith(featureAuthorizer.features.SaveWorkoutToDate, { targetDate: "2014-04-01" });
                });
                
                it("Should create a workout", function()
                {
                    activityMover.moveActivityToDay(libraryExercise, "2014-04-01");
                    expect(libraryExercise.createWorkout).to.have.been.calledOnce;
                });

                it("Should add the workout to the calendar", function()
                {
                    sinon.spy(calendarManager, "addItem");
                    activityMover.moveActivityToDay(libraryExercise, "2014-04-01");
                    expect(calendarManager.addItem).to.have.been.calledOnce;
                });

                it("Should select the workout", function()
                {
                    sinon.spy(selectionManager, "setSelection");
                    activityMover.moveActivityToDay(libraryExercise, "2014-04-01");
                    expect(selectionManager.setSelection).to.have.been.calledOnce;
                });
            });

        });

        describe(".pasteActivitiesToDay", function()
        {

            var activityMover;
            beforeEach(function()
            {
                activityMover = new ActivityMover({ 
                    featureAuthorizer: featureAuthorizer,
                    user: user,
                    calendarManager: {},
                    selectionManager: {}
                });
            });

            it("Should call pasteActivityToDay for each activity", function()
            {
                sinon.stub(activityMover, "pasteActivityToDay");
                activityMover.pasteActivitiesToDay([
                                                        new WorkoutModel(),
                                                        new MetricModel()
                                                   ], "2014-02-01");
                expect(activityMover.pasteActivityToDay).to.have.been.calledTwice;
            });

        });

        describe(".pasteActivityToDay", function()
        {

            var activityMover, calendarManager;
            beforeEach(function()
            {
                calendarManager = { addItem: function(){} };

                activityMover = new ActivityMover({ 
                    featureAuthorizer: featureAuthorizer,
                    user: user,
                    calendarManager: calendarManager,
                    selectionManager: {}
                });
            });


            describe("Metric", function()
            {

                var metric;
                var metricAttributes = {
                    "id": 12345,
                    "athleteId": 1,
                    "timeStamp": moment().format("YYYY-MM-DDTHH:mm:ss"),
                    "details": []
                };

                beforeEach(function()
                {
                    sinon.stub(MetricModel.prototype, "save", function(attrs, options) { this.set(attrs, options); });
                    metric = new MetricModel(metricAttributes);
                    sinon.stub(activityMover, "moveActivityToDay");
                    sinon.stub(calendarManager, "addItem");
                });

                it("Should call moveActivityToDay when pasting an existing metric from cut", function()
                {
                    var cutMetric = metric;
                    var dateToPasteTo = "2012-10-10";
                    activityMover.pasteActivityToDay(cutMetric, dateToPasteTo);
                    expect(activityMover.moveActivityToDay).to.have.been.calledWith(cutMetric, dateToPasteTo);
                });

                it("Should not call moveActivityToDay when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    activityMover.pasteActivityToDay(copiedMetric, dateToPasteTo);
                    expect(activityMover.moveActivityToDay).to.not.have.been.called;
                });

                it("Should set the correct date on pasted metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = activityMover.pasteActivityToDay(copiedMetric, dateToPasteTo);
                    expect(pastedMetric.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the original metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = activityMover.pasteActivityToDay(copiedMetric, dateToPasteTo);
                    expect(copiedMetric.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedMetric.getCalendarDay()).to.equal(moment(metricAttributes.timeStamp).format("YYYY-MM-DD"));
                });

                it("Should add the new metric to the calendar", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = activityMover.pasteActivityToDay(copiedMetric, dateToPasteTo);
                    expect(calendarManager.addItem).to.have.been.calledWith(pastedMetric);
                });


            });

            describe("Workout", function()
            {
                var workout;
                var workoutAttributes = {
                    "workoutId": 12345,
                    "athleteId": 1,
                    "title": "My Copied Workout",
                    "workoutTypeValueId": 1,
                    "workoutDay": "2013-01-01T07:00:00",
                    "description": "Beach Volleyball",
                    "coachComments": "you are a horrible volleyball player",
                    "workoutComments": "beach volleyball is fun",
                    "distance": 10,
                    "distancePlanned": 20,
                    "totalTime": 22,
                    "totalTimePlanned": 11,
                    "heartRateMinimum": 100,
                    "heartRateMaximum": 190,
                    "heartRateAverage": 145,
                    "calories": 6500,
                    "caloriesPlanned": 9000,
                    "tssActual": 50,
                    "tssPlanned": 600,
                    "velocityAverage": 10,
                    "velocityPlanned": 20,
                    "energy": 250,
                    "energyPlanned": 100,
                    "elevationGain": 5,
                    "elevationGainPlanned": 1000
                };

                beforeEach(function()
                {
                    sinon.stub(WorkoutModel.prototype, "save", function(attrs, options) { this.set(attrs, options); });
                    workout = new WorkoutModel(workoutAttributes);
                    sinon.stub(activityMover, "moveActivityToDay");
                    sinon.stub(calendarManager, "addItem");
                });

                it("Should call moveActivityToDay when pasting an existing workout from cut", function()
                {
                    var cutWorkout = workout;
                    var dateToPasteTo = "2012-10-10";
                    activityMover.pasteActivityToDay(cutWorkout, dateToPasteTo);
                    expect(activityMover.moveActivityToDay).to.have.been.calledWith(cutWorkout, dateToPasteTo);
                });

                it("Should not call moveActivityToDay when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    activityMover.pasteActivityToDay(copiedWorkout, dateToPasteTo);
                    expect(activityMover.moveActivityToDay).to.not.have.been.called;
                });

                it("Should set the correct date on pasted workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = activityMover.pasteActivityToDay(copiedWorkout, dateToPasteTo);
                    expect(pastedWorkout.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the original workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = activityMover.pasteActivityToDay(copiedWorkout, dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).to.equal(moment(workoutAttributes.workoutDay).format("YYYY-MM-DD"));
                });

                it("Should add the new workout to the calendar", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = activityMover.pasteActivityToDay(copiedWorkout, dateToPasteTo);
                    expect(calendarManager.addItem).to.have.been.calledWith(pastedWorkout);
                });

            });

        });

        describe(".dropActivityOnDay", function()
        {

            var activityMover;
            beforeEach(function()
            {
                activityMover = new ActivityMover({ 
                    featureAuthorizer: featureAuthorizer,
                    user: user,
                    calendarManager: {},
                    selectionManager: {}
                });
            });

            it("Should call dropActivitiesOnDay", function()
            {
                sinon.stub(activityMover, "dropActivitiesOnDay");
                activityMover.dropActivityOnDay(new WorkoutModel(), "2014-12-25");
                expect(activityMover.dropActivitiesOnDay).to.have.been.calledOnce;
            });

        });

        describe(".dropActivitiesOnDay", function()
        {

            var activityMover;
            beforeEach(function()
            {
                activityMover = new ActivityMover({ 
                    featureAuthorizer: featureAuthorizer,
                    user: user,
                    calendarManager: {},
                    selectionManager: {}
                });
            });

            it("Should check feature authorizer if workouts are present", function()
            {
                sinon.stub(featureAuthorizer, "canAccessFeature").returns(false);
                sinon.stub(featureAuthorizer, "showUpgradeMessage");
                sinon.stub(activityMover, "moveActivityToDay");
                var returnValue = activityMover.dropActivitiesOnDay([new WorkoutModel()], "2014-12-31");
                expect(featureAuthorizer.canAccessFeature).to.have.been.calledOnce;
                expect(featureAuthorizer.showUpgradeMessage).to.have.been.calledOnce;
                expect(activityMover.moveActivityToDay).to.not.have.been.called;
                expect(returnValue).to.eql(false);
            });

            it("Should not check feature authorizer if no workouts are present", function()
            {
                sinon.stub(featureAuthorizer, "canAccessFeature").returns(false);
                sinon.stub(featureAuthorizer, "showUpgradeMessage");
                sinon.stub(activityMover, "moveActivityToDay");
                var returnValue = activityMover.dropActivitiesOnDay([new MetricModel()], "2014-12-31");
                expect(featureAuthorizer.canAccessFeature).to.not.have.been.called;
                expect(featureAuthorizer.showUpgradeMessage).to.not.have.been.called;
                expect(activityMover.moveActivityToDay).to.have.been.calledOnce;
                expect(returnValue).to.eql(true);
            });

            it("Should call moveActivityToDay for each activity", function()
            {
                sinon.stub(featureAuthorizer, "canAccessFeature").returns(true);
                sinon.stub(activityMover, "moveActivityToDay");
                activityMover.dropActivitiesOnDay([
                                                    new WorkoutModel(),
                                                    new MetricModel(),
                                                    new WorkoutModel()
                                                  ], "1999-12-31");
                expect(activityMover.moveActivityToDay).to.have.been.calledThrice;
            });
        });

    });

});
