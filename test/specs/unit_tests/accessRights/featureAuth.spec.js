define(
[
    "jquery",
    "moment",
    "TP",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "models/library/libraryExercise",
    "utilities/athlete/coachTypes",
    "testUtils/xhrDataStubs"
],
function(
    $,
    moment,
    TP,
    UserModel,
    UserAccessRightsModel,
    FeatureAuthorizer,
    ExerciseLibraryItem,
    coachTypes,
    xhrData
    )
{

    function BuildFeatureAuthorizer(userAccessRights) 
    {
        var user = new UserModel({ userId: 1 });
        user.set("athletes", [{ athleteId: 1, userType: 4 }, { athleteId: 2, userType: 6 }, { athleteId: 3, userType: 4 }]);
        user.setCurrentAthlete(new TP.Model(user.get("athletes")[0]));
        return new FeatureAuthorizer(user, userAccessRights);
    }

    describe("Feature Authorizer", function ()
    {
        var featureAuthorizer;

        beforeEach(function()
        {
            featureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());
        });

        it("Should have a list of features", function()
        {
            expect(featureAuthorizer.features).to.not.be.undefined;
        });

        it("Should have some features in the list of features", function()
        {
            expect(featureAuthorizer.features.SaveWorkoutToDate).to.not.be.undefined;
        });

        describe("canAccessFeature", function()
        {
            it("Should have a canAccessFeature method to check whether a user can access a feature", function()
            {
                expect(featureAuthorizer.canAccessFeature).to.not.be.undefined;
                expect(_.isFunction(featureAuthorizer.canAccessFeature)).to.equal(true);
            });

            it("Should throw an exception if an invalid feature is used", function()
            {
                var invalidFeature = function()
                {
                    return featureAuthorizer.canAccessFeature(null);
                };

                expect(invalidFeature).to.throw();
            });

            it("Should throw an exception if featureChecker doesn't return boolean", function()
            {
                var returnsSomethingElse = function(){return 1;};
                
                var runsInvalidFeatureChecker = function()
                {
                    return featureAuthorizer.canAccessFeature(returnsSomethingElse);
                };

                expect(runsInvalidFeatureChecker).to.throw();
            });

            it("Should return a boolean if a valid feature is used", function()
            {
                var userCanPlanWorkouts = featureAuthorizer.canAccessFeature(
                    featureAuthorizer.features.SaveWorkoutToDate,
                    {targetDate: "2013-01-01"}
                );
                expect(typeof userCanPlanWorkouts).to.equal("boolean");
            });

        });

        describe("runCallbackOrShowUpgradeMessage", function()
        {
            it("Should have a runCallbackOrShowUpgradeMessage method", function()
            {
                expect(featureAuthorizer.runCallbackOrShowUpgradeMessage).to.not.be.undefined;
                expect(_.isFunction(featureAuthorizer.runCallbackOrShowUpgradeMessage)).to.equal(true);
            });

            it("Should run the callback if feature is authorized", function()
            {
                sinon.stub(featureAuthorizer, "showUpgradeMessage");
                var callback = sinon.stub();
                var myFeatureCheckerReturnsTrue = function(){return true;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(myFeatureCheckerReturnsTrue, callback);
                expect(callback).to.have.been.called;
                expect(featureAuthorizer.showUpgradeMessage).to.not.have.been.called;
            });

            it("Should not run the callback if feature is authorized", function()
            {
                sinon.stub(featureAuthorizer, "showUpgradeMessage");
                var callback = sinon.stub();
                var myFeatureCheckerReturnsFalse = function(){return false;};
                featureAuthorizer.runCallbackOrShowUpgradeMessage(myFeatureCheckerReturnsFalse, callback);
                expect(callback).to.not.have.been.called;
                expect(featureAuthorizer.showUpgradeMessage).to.have.been.called;
            });
        });

    
        describe("features", function()
        {
            describe("PlanForAthlete", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.planFutureWorkouts]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should allow only an authorized user to plan for the current athlete", function()
                {
                    var attributes = { athlete: new TP.Model({ userType: 4 }) };

                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.PlanForAthlete, attributes)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.PlanForAthlete, attributes)).to.equal(true);
                });

                it("Should accept a plain object or a backbone model", function()
                {
                    var attributes = { athlete: { userType: 4 } };

                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.PlanForAthlete, attributes)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.PlanForAthlete, attributes)).to.equal(true);
                });
            });

            describe("SaveWorkoutToDate", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.planFutureWorkouts]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should allow any user to save workout to a past date", function()
                {
                    var attributes = { targetDate: moment().subtract("days", 1)};
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.SaveWorkoutToDate, attributes)).to.equal(true);
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate, attributes)).to.equal(true);
                });

                it("Should allow only an authorized user to save workout to a future date", function()
                {
                    var attributes = { targetDate: moment().add("days", 7)};

                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.SaveWorkoutToDate, attributes)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.SaveWorkoutToDate, attributes)).to.equal(true);
                });
            });

            describe("ShiftWorkouts", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.planFutureWorkouts]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should allow only an authorized user to shift workouts", function()
                {
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.ShiftWorkouts)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ShiftWorkouts)).to.equal(true);
                });
            });

            describe("ViewPod", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.canViewPods]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should only allow authorized user to view chart", function()
                {
                    var attributes = { podTypeId: 3 }; // fitness summary
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.ViewPod, attributes)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewPod, attributes)).to.equal(true);
                });

            });

            describe("UsePod", function()
            {

                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.canUsePodsLimited]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should only allow authorized user to use chart", function()
                {
                    var attributes = { podTypeId: 3 }; // fitness summary
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.UsePod, attributes)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.UsePod, attributes)).to.equal(true);
                });

            });

            describe("ElevationCorrection", function()
            {

                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.canUsePodsFull]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should only allow authorized user to use elevation correction", function()
                {
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.ElevationCorrection)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ElevationCorrection)).to.equal(true);
                });

            });

            describe("ViewGraphRanges", function()
            {

                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.canUsePodsFull]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should only allow authorized user to use graph ranges", function()
                {
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.ViewGraphRanges)).to.equal(false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewGraphRanges)).to.equal(true);
                });

            });

            describe("AddWorkoutTemplateToLibrary", function()
            {
                var authorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.maximumWorkoutTemplatesInOwnedLibrary]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                });

                it("Should only allow users to add up to maximum exercises in library", function()
                {
                    var collectionUnderLimit = new TP.Collection([
                        { itemName: "exercise one", itemType: 0, exerciseLibraryItemId: 1 },
                        { itemName: "exercise two", itemType: 0, exerciseLibraryItemId: 2 },
                        { itemName: "exercise routine", itemType: 1, exerciseLibraryItemId: 3 },
                        { itemName: "exercise routine two", itemType: 1, exerciseLibraryItemId: 4 },
                        { itemName: "exercise routine three", itemType: 1, exerciseLibraryItemId: 5 },
                        { itemName: "workout template one", itemType: 2, exerciseLibraryItemId: 6 }
                    ], { model: ExerciseLibraryItem });

                    var collectionOverLimit = new TP.Collection([
                        { itemName: "exercise one", itemType: 0, exerciseLibraryItemId: 1 },
                        { itemName: "exercise two", itemType: 0, exerciseLibraryItemId: 2 },
                        { itemName: "exercise routine one", itemType: 1, exerciseLibraryItemId: 3 },
                        { itemName: "exercise routine two", itemType: 1, exerciseLibraryItemId: 4 },
                        { itemName: "exercise routine three", itemType: 1, exerciseLibraryItemId: 5 },
                        { itemName: "workout template one", itemType: 2, exerciseLibraryItemId: 6 },
                        { itemName: "workout template two", itemType: 2, exerciseLibraryItemId: 7 },
                        { itemName: "workout template three", itemType: 2, exerciseLibraryItemId: 8 },
                        { itemName: "workout template four", itemType: 2, exerciseLibraryItemId: 9 },
                        { itemName: "workout template five", itemType: 2, exerciseLibraryItemId: 10 }
                    ], { model: ExerciseLibraryItem });

                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.AddWorkoutTemplateToLibrary, { collection: collectionUnderLimit })).to.equal(true);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.AddWorkoutTemplateToLibrary, { collection: collectionOverLimit })).to.equal(false);
                   
                });

            });

            describe("ViewICalendarUrl", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    var authorizedUserAccessRights = new UserAccessRightsModel({
                        rights: [xhrData.accessRights.planFutureWorkouts]
                    });

                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(authorizedUserAccessRights);
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });
                
                it("Should not allow basic users to view iCalendarUrl", function()
                {
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.ViewICalendarUrl)).to.equal(false);
                });

                it("Should allow premium users to view iCalendarUrl", function()
                {
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewICalendarUrl)).to.equal(true);
                });
            });

            describe("AutoApplyThresholdChanges", function()
            {
                var authorizedFeatureAuthorizer;
                var unauthorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());
                    authorizedFeatureAuthorizer.user.setCurrentAthlete(new TP.Model({ athleteId: 1, userType: 4 }));
                    
                    unauthorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                    unauthorizedFeatureAuthorizer.user.setCurrentAthlete(new TP.Model({ athleteId: 2, userType: 6 }));
                });

                it("Should not allow basic users to auto apply threshold changes", function()
                {
                    expect(unauthorizedFeatureAuthorizer.canAccessFeature(unauthorizedFeatureAuthorizer.features.AutoApplyThresholdChanges)).to.equal(false);
                });

                it("Should allow premium users to auto apply threshold changes", function()
                {
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.AutoApplyThresholdChanges)).to.equal(true);
                });
            });

            describe("ViewAthleteCalendar", function()
            {
                var authorizedFeatureAuthorizer;

                beforeEach(function()
                {
                    authorizedFeatureAuthorizer = BuildFeatureAuthorizer(new UserAccessRightsModel());  
                });

                it("Should allow a user to view themselves", function()
                {
                    var attributes = { athlete: new TP.Model({ athleteId: 1 }) };
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(true);
                });

                it("Should not allow athletes to view other athletes", function()
                {
                    var attributes = { athlete: { athleteId: 2 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", true);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(false);
                });

                it("Should not allow coach to view athletes that are not in their athletes list", function()
                {
                    var attributes = { athlete: { athleteId: 7 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", false);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(false);
                });

                it("Should not allow standard coach to view basic athletes", function()
                {
                    var attributes = { athlete: { athleteId: 2 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", false);
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("coachType", coachTypes.Standard);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(false);
                });

                it("Should allow standard coach to view premium athletes", function()
                {
                    var attributes = { athlete: { athleteId: 3 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", false);
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("coachType", coachTypes.Standard);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(true);
                });

                it("Should allow UBC coach to view basic athletes", function()
                {
                    var attributes = { athlete: { athleteId: 2 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", false);
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("coachType", coachTypes.UBC);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(true);
                });

                it("Should allow UBC coach to view premium athletes", function()
                {
                    var attributes = { athlete: { athleteId: 3 } };
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("isAthlete", false);
                    authorizedFeatureAuthorizer.user.getAccountSettings().set("coachType", coachTypes.UBC);
                    expect(authorizedFeatureAuthorizer.canAccessFeature(authorizedFeatureAuthorizer.features.ViewAthleteCalendar, attributes)).to.equal(true);
                });
            });

            describe("ViewPlanStore", function()
            {

                it("Should allow runnersworld affiliates", function()
                {
                    featureAuthorizer.user.getAffiliateSettings().set("code", "runnersworld");
                    expect(featureAuthorizer.canAccessFeature(featureAuthorizer.features.ViewPlanStore)).to.equal(true);
                });

                it("Should not allow coached athletes", function()
                {
                    featureAuthorizer.user.getAccountSettings().set("isCoached", true);
                    expect(featureAuthorizer.canAccessFeature(featureAuthorizer.features.ViewPlanStore)).to.equal(false);
                });

                it("Should allow other athletes", function()
                {
                    expect(featureAuthorizer.canAccessFeature(featureAuthorizer.features.ViewPlanStore)).to.equal(true);
                });

            });
        });


    });

});
