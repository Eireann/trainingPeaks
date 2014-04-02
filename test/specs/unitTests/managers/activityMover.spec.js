define(
[
    "TP",
    "models/workoutModel",
    "shared/models/metricModel",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "shared/managers/activityMover"
],
function(
    TP,
    WorkoutModel,
    MetricModel,
    UserModel,
    UserAccessRightsModel,
    FeatureAuthorizer,
    ActivityMover
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

            expect(function(){ return new ActivityMover({ featureAuthorizer: featureAuthorizer, user: user, calendarManager: {} }); }).to.not.throw();
        });

        describe(".moveActivity", function()
        {

            var activityMover;
            beforeEach(function()
            {
                activityMover = new ActivityMover({ featureAuthorizer: featureAuthorizer, user: user, calendarManager: {} });
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

        });

/*









                it("Should call moveActivityToDay when pasting an existing workout from cut", function()
                {
                    var cutWorkout = workout;
                    sinon.stub(theMarsApp.activityMover, "moveActivityToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutWorkout.pasted({ date: dateToPasteTo });
                    expect(theMarsApp.activityMover.moveActivityToDay).to.have.been.calledWith(dateToPasteTo);
                });

                it("Should not call moveActivityToDay when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    sinon.stub(copiedWorkout, "moveActivityToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    expect(copiedWorkout.moveActivityToDay).to.not.have.been.called;
                });

                it("Should set the correct date on pasted workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedWorkout.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the copied workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedWorkout.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).to.equal(moment(workoutAttributes.workoutDay).format("YYYY-MM-DD"));
                });

                it("Should return a workout with all of the copied attributes", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];

                    _.each(attributesToCopy, function(attributeName)
                    {
                        if (attributeName !== "workoutDay")
                        {
                            expect(pastedWorkout.get(attributeName)).to.equal(copiedWorkout.get(attributeName));
                        }
                    });

                });


        // metric
        describe("Cut, Copy, Paste", function()
        {
            var metric;
            var metricAttributes = {
                "id": 12345,
                "athleteId": 67890,
                "timeStamp": moment().format("YYYY-MM-DDTHH:mm:ss"),
                "details": []
            };
            var attributesToCopy = [
                "athleteId",
                "timeStamp",
                "details"
            ];

            beforeEach(function()
            {
                sinon.spy(testHelpers.theApp.calendarManager, "addItem");
                testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 67890 }));
                metric = new MetricModel(metricAttributes);
            });

            describe("cloneForCopy", function()
            {
                it("Should implement a cloneForCopy method", function()
                {
                    expect(MetricModel.prototype.cloneForCopy).to.not.be.undefined;
                    expect(typeof MetricModel.prototype.cloneForCopy).to.equal("function");

                });

                it("Should return a MetricModel", function()
                {
                    var result = metric.cloneForCopy();
                    expect(metric instanceof MetricModel).to.equal(true);
                });

                it("Should have the same attributes (except id)", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    expect(copiedMetric.attributes).to.eql(_.omit(metric.attributes, "id"));
                });
            });

            describe("pasted", function()
            {
                it("Should implement an pasted method", function()
                {
                    expect(MetricModel.prototype.pasted).to.not.be.undefined;
                    expect(typeof MetricModel.prototype.pasted).to.equal("function");
                });

                it("Should call moveToDay when pasting an existing metric from cut", function()
                {
                    var cutMetric = metric;
                    sinon.stub(cutMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutMetric.pasted({ date: dateToPasteTo });
                    expect(cutMetric.moveToDay).to.have.been.calledWith(dateToPasteTo);
                });
                
                it("Should not call moveToDay when pasting an existing metric from cut to a different athlete", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 42}));
                    var cutMetric = metric;
                    sinon.stub(cutMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutMetric.pasted({ date: dateToPasteTo });
                    expect(cutMetric.moveToDay).to.not.have.been.called;
                });

                it("Should not call moveToDay when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    sinon.stub(copiedMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    expect(copiedMetric.moveToDay).to.not.have.been.called;
                });

                it("Should return a new metric when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric instanceof MetricModel).to.equal(true);
                    expect(pastedMetric).to.not.equal(copiedMetric);
                });

                it("Should set the correct date on pasted metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the copied metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedMetric.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedMetric.getCalendarDay()).to.equal(moment(metricAttributes.timeStamp).format("YYYY-MM-DD"));
                });
                
                it("Should set the correct athleteId on pasted metric", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 42 }));
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric.get("athleteId")).to.equal(42);
                });

                it("Should not change the date of the copied metric", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 42 }));
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedMetric.get("athleteId")).to.not.equal(42);
                });

            });
*/
    });

});
