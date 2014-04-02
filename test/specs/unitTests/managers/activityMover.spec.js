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

            expect(function(){ return new ActivityMover({ featureAuthorizer: featureAuthorizer }); }).to.not.throw();
        });

        describe(".moveActivity", function()
        {

            var activityMover;
            beforeEach(function()
            {
                activityMover = new ActivityMover({ featureAuthorizer: featureAuthorizer });
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
    });

});
