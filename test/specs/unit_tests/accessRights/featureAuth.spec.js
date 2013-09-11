// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "shared/models/userModel",
    "shared/utilities/featureAuthorization/featureAuthorizer"
],
function(
    TP,
    UserModel,
    FeatureAuthorizer
    )
{

    describe("Feature Authorizer", function ()
    {

        var user;
        var featureAuthorizer;

        beforeEach(function()
        {
            var user = new UserModel({ userId: 1 });
            var athlete = new TP.Model({ athleteId: 1 });
            user.set("athletes", [athlete]);
            user.setCurrentAthleteId(1);
            featureAuthorizer = new FeatureAuthorizer(user);
        });

        it("Should have a list of features", function()
        {
            expect(featureAuthorizer.features).toBeDefined();
        });

        it("Should have some features in the list of features", function()
        {
            expect(featureAuthorizer.features.PlanFutureWorkouts).toBeDefined();
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
                var userCanPlanWorkouts = featureAuthorizer.canAccessFeature(featureAuthorizer.features.PlanFutureWorkouts);
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
                var featureChecker = function(){return true;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(featureChecker, callback);
                expect(callback).toHaveBeenCalled();
                expect(featureAuthorizer.showUpgradeMessage).not.toHaveBeenCalled();
            });

            it("Should not run the callback if feature is authorized", function()
            {
                spyOn(featureAuthorizer, "showUpgradeMessage");
                var callback = jasmine.createSpy("the callback");
                var featureChecker = function(){return false;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(featureChecker, callback);
                expect(callback).not.toHaveBeenCalled();
                expect(featureAuthorizer.showUpgradeMessage).toHaveBeenCalled();
            });
        });

    });

});