define(
[
    "backbone",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "testUtils/xhrDataStubs",
    "models/dashboard/availableChartsCollection"
],
function(
    Backbone,
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
            user.setCurrentAthlete(new Backbone.Model(xhrData.users.barbkprem.athletes[0]));

            var userAccessRights = new UserAccessRightsModel();

            var viewablePods = xhrData.accessRights.canViewPods;
            viewablePods.accessRightData = _.without(viewablePods.accessRightData, "pod_PerformanceManagerChart");
            userAccessRights.set({
            "rights":[viewablePods, xhrData.accessRights.canUsePodsLimited]
            });

            featureAuthorizer = new FeatureAuthorizer(user, userAccessRights);

            charts = new AvailableChartsCollection(null,{featureAuthorizer: featureAuthorizer});
        });

        it("Should contain some charts", function()
        {
            expect(charts.length).to.not.equal(0);
        });

        it("Should contain charts that user is allowed to view", function()
        {
            var fitnessSummary = charts.find(function(chart)
            {
                return chart.get("chartType") === 3;
            });
            expect(fitnessSummary).to.not.equal(undefined);
        });

        it("Should not contain charts that user is not allowed to view", function()
        {
            var pmc = charts.find(function(chart)
            {
                return chart.get("chartType") === 32;
            });
            expect(pmc).to.equal(undefined);
        });
                
        it("Should not mark charts as premium if a user is allowed to use", function()
        {
            var fitnessSummary = charts.find(function(chart)
            {
                return chart.get("chartType") === 3;
            });
            expect(fitnessSummary.get("premium")).to.equal(false);
        });

        it("Should mark premium charts if a user is allowed to view but not use", function()
        {
            var peakPower = charts.find(function(chart)
            {
                return chart.get("chartType") === 8;
            });
            expect(peakPower).to.not.equal(undefined);
            expect(peakPower.get("premium")).to.equal(true);
        });

    });

});

