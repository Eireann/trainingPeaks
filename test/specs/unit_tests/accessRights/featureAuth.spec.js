// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "TP",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "testUtils/xhrDataStubs"
],
function(
    moment,
    TP,
    UserModel,
    UserAccessRightsModel,
    FeatureAuthorizer,
    xhrData
    )
{

    describe("Feature Authorizer", function ()
    {
        var featureAuthorizer;

        beforeEach(function()
        {
            var userAccessRights = new UserAccessRightsModel();
            var user = new UserModel({ userId: 1 });
            var athlete = new TP.Model({ athleteId: 1 });
            user.set("athletes", [athlete]);
            user.setCurrentAthleteId(1);
            featureAuthorizer = new FeatureAuthorizer(user, userAccessRights);
        });

        it("Should have a list of features", function()
        {
            expect(featureAuthorizer.features).toBeDefined();
        });

        it("Should have some features in the list of features", function()
        {
            expect(featureAuthorizer.features.SaveWorkoutToDate).toBeDefined();
        });

        describe("canAccessFeature", function()
        {
            it("Should have a canAccessFeature method to check whether a user can access a feature", function()
            {
                expect(featureAuthorizer.canAccessFeature).toBeDefined();
                expect(_.isFunction(featureAuthorizer.canAccessFeature)).toBe(true);
            });

            it("Should throw an exception if an invalid feature is used", function()
            {
                var invalidFeature = function()
                {
                    return featureAuthorizer.canAccessFeature(null);
                };

                expect(invalidFeature).toThrow();
            });

            it("Should throw an exception if featureChecker doesn't return boolean", function()
            {
                var returnsSomethingElse = function(){return 1;};
                
                var runsInvalidFeatureChecker = function()
                {
                    return featureAuthorizer.canAccessFeature(returnsSomethingElse);
                };

                expect(runsInvalidFeatureChecker).toThrow();
            });

            it("Should return a boolean if a valid feature is used", function()
            {
                var userCanPlanWorkouts = featureAuthorizer.canAccessFeature(
                    featureAuthorizer.features.SaveWorkoutToDate,
                    {targetDate: "2013-01-01"}
                );
                expect(typeof userCanPlanWorkouts).toBe("boolean");
            });

        });

        describe("runCallbackOrShowUpgradeMessage", function()
        {
            it("Should have a runCallbackOrShowUpgradeMessage method", function()
            {
                expect(featureAuthorizer.runCallbackOrShowUpgradeMessage).toBeDefined();
                expect(_.isFunction(featureAuthorizer.runCallbackOrShowUpgradeMessage)).toBe(true);
            });

            it("Should run the callback if feature is authorized", function()
            {
                spyOn(featureAuthorizer, "showUpgradeMessage");
                var callback = jasmine.createSpy("the callback");
                var myFeatureCheckerReturnsTrue = function(){return true;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(myFeatureCheckerReturnsTrue, callback);
                expect(callback).toHaveBeenCalled();
                expect(featureAuthorizer.showUpgradeMessage).not.toHaveBeenCalled();
            });

            it("Should not run the callback if feature is authorized", function()
            {
                spyOn(featureAuthorizer, "showUpgradeMessage");
                var callback = jasmine.createSpy("the callback");
                var myFeatureCheckerReturnsFalse = function(){return false;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(myFeatureCheckerReturnsFalse, callback);
                expect(callback).not.toHaveBeenCalled();
                expect(featureAuthorizer.showUpgradeMessage).toHaveBeenCalled();
            });
        });

    
        describe("features", function()
        {
            describe("SaveWorkoutToDate", function()
            {

                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var userAccessRights = new UserAccessRightsModel();
                    userAccessRights.set({
                    "rights":[xhrData.accessRights.planFutureWorkouts]
                    });
                    var user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedFeatureAuthorizer = new FeatureAuthorizer(user, userAccessRights);

                    var userAccessRights2 = new UserAccessRightsModel();
                    var user2 = new UserModel({ userId: 1 });
                    var athlete = new TP.Model({ athleteId: 1 });
                    user2.set("athletes", [athlete]);
                    user2.setCurrentAthleteId(1);

                    unauthorizedFeatureAuthorizer = new FeatureAuthorizer(user2, userAccessRights2);
                });

                it("Should allow any user to save workout to a past date", function()
                {
                    var attributes = { targetDate: moment().subtract("days", 1)};
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(
                           unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate,
                           attributes
                           )
                    ).toBe(true);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(
                           unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate,
                           attributes
                           )
                    ).toBe(true);
                });

                it("Should allow only an authorized user to save workout to a future date", function()
                {
                    var attributes = { targetDate: moment().add("days", 1)};
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(
                           unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate,
                           attributes
                           )
                    ).toBe(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(
                           unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate,
                           attributes
                           )
                    ).toBe(true);
                });
            });

        });

    });

});