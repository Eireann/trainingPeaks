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

                var user;
                var authorizedUserAccessRights;
                var unauthorizedUserAccessRights;

                beforeEach(function()
                {
                    user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedUserAccessRights = new UserAccessRightsModel();
                    authorizedUserAccessRights.set({
                    "rights":[xhrData.accessRights.planFutureWorkouts]
                    });

                    unauthorizedUserAccessRights = new UserAccessRightsModel();
                    
                });

                it("Should allow any user to save workout to a past date", function()
                {
                    var attributes = { targetDate: moment().subtract("days", 1)};
                    expect(featureAuthorizer.features.SaveWorkoutToDate(
                                user,
                                unauthorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
 
                     expect(featureAuthorizer.features.SaveWorkoutToDate(
                                user,
                                authorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
                });

                it("Should allow only an authorized user to save workout to a future date", function()
                {
                    var attributes = { targetDate: moment().add("days", 1)};
                    expect(featureAuthorizer.features.SaveWorkoutToDate(
                                user,
                                unauthorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(false);

                     expect(featureAuthorizer.features.SaveWorkoutToDate(
                                user,
                                authorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
                });
            });

            describe("ShiftWorkouts", function()
            {
                var user;
                var authorizedUserAccessRights;
                var unauthorizedUserAccessRights;

                beforeEach(function()
                {
                    user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedUserAccessRights = new UserAccessRightsModel();
                    authorizedUserAccessRights.set({
                    "rights":[xhrData.accessRights.planFutureWorkouts]
                    });

                    unauthorizedUserAccessRights = new UserAccessRightsModel();
                    
                });

                it("Should allow only an authorized user to shift workouts", function()
                {
                    var attributes = { targetDate: moment().add("days", 1)};
                    expect(featureAuthorizer.features.ShiftWorkouts(
                                user,
                                unauthorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(false);
                    
                     expect(featureAuthorizer.features.ShiftWorkouts(
                                user,
                                authorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
                });
            });

            describe("ViewPod", function()
            {
                var user;
                var authorizedUserAccessRights;
                var unauthorizedUserAccessRights;

                beforeEach(function()
                {
                    user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedUserAccessRights = new UserAccessRightsModel();
                    authorizedUserAccessRights.set({
                    "rights":[xhrData.accessRights.canViewPods]
                    });

                    unauthorizedUserAccessRights = new UserAccessRightsModel();
                    
                });

                it("Should only allow authorized user to view chart", function()
                {
                    var attributes = { podTypeId: 3 }; // fitness summary
                    expect(featureAuthorizer.features.ViewPod(
                                user,
                                unauthorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(false);
                    
                     expect(featureAuthorizer.features.ViewPod(
                                user,
                                authorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
                });

                it("Should not allow unknown pod types if option is not set", function()
                {
                    var attributes = { podTypeId: 9999 }; 
                    var checkPodAccess = function()
                    {
                        return featureAuthorizer.features.ViewPod(
                            user,
                            authorizedUserAccessRights,
                            attributes
                        );
                    };
                    expect(checkPodAccess).toThrow();
                });

                it("Should allow unknown pod types if option is set", function()
                {
                    var attributes = { podTypeId: 9999 }; 
                    var options = { allowUnknownPodTypes: true };
                    expect(featureAuthorizer.features.ViewPod(
                        user,
                        authorizedUserAccessRights,
                        attributes,
                        options
                    )).toBe(true);
                });

            });

            describe("UsePod", function()
            {
                var user;
                var authorizedUserAccessRights;
                var unauthorizedUserAccessRights;

                beforeEach(function()
                {
                    user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedUserAccessRights = new UserAccessRightsModel();
                    authorizedUserAccessRights.set({
                    "rights":[xhrData.accessRights.canUsePodsLimited]
                    });

                    unauthorizedUserAccessRights = new UserAccessRightsModel();
                    
                });

                it("Should only allow authorized user to use chart", function()
                {
                    var attributes = { podTypeId: 3 }; // fitness summary
                    expect(featureAuthorizer.features.UsePod(
                                user,
                                unauthorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(false);
                    
                     expect(featureAuthorizer.features.UsePod(
                                user,
                                authorizedUserAccessRights,
                                attributes
                            )
                    ).toBe(true);
                });

                it("Should not allow unknown pod types if option is not set", function()
                {
                    var attributes = { podTypeId: 9999 }; 
                    var checkPodAccess = function()
                    {
                        return featureAuthorizer.features.UsePod(
                            user,
                            authorizedUserAccessRights,
                            attributes
                        );
                    };
                    expect(checkPodAccess).toThrow();
                });

                it("Should allow unknown pod types if option is set", function()
                {
                    var attributes = { podTypeId: 9999 }; 
                    var options = { allowUnknownPodTypes: true };
                    expect(featureAuthorizer.features.UsePod(
                        user,
                        authorizedUserAccessRights,
                        attributes,
                        options
                    )).toBe(true);
                });

            });

            describe("ElevationCorrection", function()
            {
                var user;
                var authorizedUserAccessRights;
                var unauthorizedUserAccessRights;

                beforeEach(function()
                {
                    user = new UserModel(xhrData.users.barbkprem);
                    user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

                    authorizedUserAccessRights = new UserAccessRightsModel();
                    authorizedUserAccessRights.set({
                    "rights":[xhrData.accessRights.canUsePodsFull]
                    });

                    unauthorizedUserAccessRights = new UserAccessRightsModel();
                    
                });

                it("Should only allow authorized user to use elevation correction", function()
                {
                    expect(featureAuthorizer.features.ElevationCorrection(
                                user,
                                unauthorizedUserAccessRights
                            )
                    ).toBe(false);
                    
                     expect(featureAuthorizer.features.ElevationCorrection(
                                user,
                                authorizedUserAccessRights
                            )
                    ).toBe(true);
                });

            });

        });

    });

});