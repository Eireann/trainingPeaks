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
    describe("Summary View", function()
    {
        var workoutModel;
        var summaryView;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);

            workoutModel = new WorkoutModel({ workoutId: 1, athleteId: 426489, workoutTypeValueId: WorkoutTypes.typesByName.Run }, { equipment: xhrData.equipment.barbkprem });
            summaryView = new SummaryView({ model: workoutModel });
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should render without throwing any exception.", function()
        {
            var render = function()
            {
                summaryView.render();
            };

            expect(render).not.to.throw();
        });

        it("Should not throw any exception while closing.", function()
        {
            var closeIt = function()
            {
                summaryView.close();
            };

            expect(closeIt).not.to.throw();
        });

        describe("Equipment selectors", function()
        {
            it("Should have a Bike selector and a Shoe selector.", function()
            {
                summaryView.render();

                var $bikeSelector = summaryView.$("select.bikeSelector");

                expect($bikeSelector.length).to.equal(1);

                var $shoeSelector = summaryView.$("select.shoeSelector");

                expect($shoeSelector.length).to.equal(1);
            });

            describe("Bike selector", function()
            {
                it("Should have a 'no equipment' option.", function()
                {
                    summaryView.render();

                    var $bikeSelector = summaryView.$("select.bikeSelector");

                    expect($bikeSelector.children()[0].value).to.equal("");
                });
                it("Should be populated with bikes.", function()
                {
                    summaryView.render();

                    var $bikeSelector = summaryView.$("select.bikeSelector");

                    expect($bikeSelector.children()[1].value).to.equal("124"); // "124" is the id of the stub bike
                });
                it("Should be hidden for this 'run' workout.", function()
                {
                    summaryView.render();

                    var $bikeSelector = summaryView.$("select.bikeSelector:hidden");

                    expect($bikeSelector.length).to.equal(1);
                });
            });

            describe("Shoe selector", function()
            {
                it("Should have a 'no equipment' option.", function()
                {
                    summaryView.render();

                    var $shoeSelector = summaryView.$("select.shoeSelector");

                    expect($shoeSelector.children()[0].value).to.equal("");
                });
                it("Should be populated with shoes.", function()
                {
                    summaryView.render();

                    var $shoeSelector = summaryView.$("select.shoeSelector");

                    expect($shoeSelector.children()[1].value).to.equal("123"); // "123" is the id of the stub bike
                });
            });
        });
    });
});
