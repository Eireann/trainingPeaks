// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "testUtils/xhrDataStubs",
    "models/dashboard/availableChartsCollection"
],
function(
    UserModel,
    UserAccessRightsModel,
    FeatureAuthorizer,
    xhrData,
    AvailableChartsCollection
   )
{

    describe("Available Charts Collection", function()
    {

        var featureAuthorizer;
        var charts;

        beforeEach(function()
        {
            var user = new UserModel(xhrData.users.barbkprem);
            user.setCurrentAthleteId(xhrData.users.barbkprem.userId);

            var userAccessRights = new UserAccessRightsModel();

            var viewablePods = xhrData.accessRights.canViewPods;
            viewablePods.accessRightData = _.without(viewablePods.accessRightData, "pod_PerformanceManagerChart");
            userAccessRights.set({
            "rights":[viewablePods, xhrData.accessRights.canUsePods]
            });

            featureAuthorizer = new FeatureAuthorizer(user, userAccessRights);

            charts = new AvailableChartsCollection(null,{featureAuthorizer: featureAuthorizer});
        });

        it("Should contain some charts", function()
        {
            expect(charts.length).not.toBe(0);
        });

        it("Should contain charts that user is allowed to view", function()
        {
            var fitnessSummary = charts.find(function(chart)
            {
                return chart.get("chartType") === 3;
            });
            expect(fitnessSummary).not.toBe(undefined);
        });

        it("Should not contain charts that user is not allowed to view", function()
        {
            var pmc = charts.find(function(chart)
            {
                return chart.get("chartType") === 32;
            });
            expect(pmc).toBe(undefined);
        });
                
        it("Should not mark charts as premium if a user is allowed to use", function()
        {
            var fitnessSummary = charts.find(function(chart)
            {
                return chart.get("chartType") === 3;
            });
            expect(fitnessSummary.get("premium")).toBe(false);
        });

        it("Should mark premium charts if a user is allowed to view but not use", function()
        {
            var peakPower = charts.find(function(chart)
            {
                return chart.get("chartType") === 8;
            });
            expect(peakPower).not.toBe(undefined);
            expect(peakPower.get("premium")).toBe(true);
        });

    });

});

