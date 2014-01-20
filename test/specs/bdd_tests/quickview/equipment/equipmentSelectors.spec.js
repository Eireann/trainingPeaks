define(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "utilities/workout/workoutTypes",
    "views/quickView/summaryView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    WorkoutModel,
    WorkoutTypes,
    SummaryView
)
{
    describe("Workout Equipment View within Summary View (BDD_tests)", function()
    {
        var saveSpy;
        var workoutModel;
        var summaryView;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);

            saveSpy = sinon.spy(WorkoutModel.prototype, "autosave");

            workoutModel = new WorkoutModel({ workoutId: 1, athleteId: 426489, workoutTypeValueId: WorkoutTypes.typesByName.Bike }, { equipment: new Backbone.Collection(xhrData.equipment.barbkprem) } );
            summaryView = new SummaryView({ model: workoutModel });
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should load successfully as a module", function()
        {
            expect(SummaryView).to.not.be.undefined;
        });

        it("Should not throw exceptions during lifecycle calls", function()
        {
            renderAndClose = function()
            {
                summaryView.render();

                summaryView.close();
            };

            expect(renderAndClose).not.to.throw();
        });

        it("Should save bike equipment when a new bike is selected.", function()
        {
            summaryView.render();

            var $bikeSelector = summaryView.$("select.bikeSelector");

            $bikeSelector.val("124");
            $bikeSelector.change();

            expect(saveSpy).to.have.been.called;

            var endpoint = "fitness/v1/athletes/" + workoutModel.get("athleteId") + "/workouts/" + workoutModel.get("workoutId");

            expect(testHelpers.hasRequest("PUT", endpoint)).to.equal(true);
        });

        it("Should save shoe equipment when a new shoe is selected.", function()
        {
            summaryView.render();

            var $shoeSelector = summaryView.$("select.shoeSelector");

            $shoeSelector.val("123");
            $shoeSelector.change();

            expect(saveSpy).to.have.been.called;

            var endpoint = "fitness/v1/athletes/" + workoutModel.get("athleteId") + "/workouts/" + workoutModel.get("workoutId");

            expect(testHelpers.hasRequest("PUT", endpoint)).to.equal(true);
        });
    });
});