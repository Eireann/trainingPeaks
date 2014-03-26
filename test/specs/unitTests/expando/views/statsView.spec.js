define(
[
    "jquery",
    "TP",
    "expando/models/expandoStateModel",
    "shared/models/userAccessRightsModel",
    "shared/models/userModel",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "views/expando/statsView",
],
function(
    $,
    TP,
    ExpandoStateModel,
    UserAccessRightsModel,
    UserModel,
    FeatureAuthorizer,
    StatsView
)
{
    function _buildWorkoutModel()
    {
        return new TP.Model({
            id: 1234,
            workoutTypeValueId: 8,
            details: new TP.Model(),
            detailData: new TP.Model({
                totalStats: {
                    "averageCadence": null,
                    "averageElevation": 1573.91162,
                    "averageHeartRate": 143,
                    "averagePower": 149,
                    "averageSpeed": 15.0813731672213,
                    "averageTemp": null,
                    "averageTorque": null,
                    "begin": 0,
                    "calories": 539,
                    "distance": 54383.431641,
                    "efficiencyFactor": 1.055944055944056,
                    "elapsedTime": 3606000,
                    "elevationGain": null,
                    "elevationLoss": 0.0,
                    "end": 3606000,
                    "energy": 539.0,
                    "energyRight": null,
                    "grade": null,
                    "intensityFactorActual": 0.7535005325524868,
                    "maximumCadence": null,
                    "maximumElevation": 1577.99792,
                    "maximumHeartRate": 161,
                    "maximumPower": 184,
                    "maximumSpeed": 16.634323,
                    "maximumTemp": null,
                    "maximumTorque": null,
                    "minimumCadence": null,
                    "minimumElevation": 1567.07666,
                    "minimumHeartRate": 109,
                    "minimumPower": 0,
                    "minimumSpeed": 8.60118293762207,
                    "minimumTemp": null,
                    "minimumTorque": null,
                    "name": "",
                    "normalizedPowerActual": 151.0,
                    "normalizedSpeedActual": null,
                    "powerBalanceLeft": null,
                    "powerBalanceRight": null,
                    "powerPulseDecoupling": 6.628558802125103,
                    "rangeLabel": "",
                    "speedPulseDecoupling": 5.094083104775288,
                    "stoppedTime": 0,
                    "trainingStressScoreActual": 56.525830853607914,
                    "trainingStressScoreActualSource": "PowerTss",
                    "vam": null,
                    "vamPerKg": null,
                    "vamWattsPerKg": null,
                    "vi": 1.0134228187919463,
                    "wattsPerKg": 0.41061047379516
                },
                lapsStats: []
            })
        });
    }

    function _buildFeatureAuthorizer(userAccessRights) 
    {
        var user = new UserModel({ userId: 1 });
        user.set("athletes", [{ athleteId: 1, userType: 4 }]);
        user.setCurrentAthlete(new TP.Model(user.get("athletes")[0]));

        return new FeatureAuthorizer(user, userAccessRights);
    }

    describe("StatsView", function()
    {
        it("Should display 'power pulse decoupling' for Mountain Bike workouts.", function()
        {
            sinon.stub(FeatureAuthorizer.prototype, "canAccessFeature").returns(true);

            var featureAuthorizer = _buildFeatureAuthorizer(new UserAccessRightsModel());

            var view = new StatsView({ model: _buildWorkoutModel(), detailDataPromise: {}, stateModel: new ExpandoStateModel(), featureAuthorizer: featureAuthorizer });
            view.render();

            expect(view.$el.find("#powerPulseDecoupling .value").text()).to.eql("6.63%");
        });
    });
});
