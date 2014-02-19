define(
[
    "jquery",
    "testUtils/xhrDataStubs",
    "shared/models/userModel",
    "models/workoutModel",
    "models/equipmentCollection",
    "utilities/workout/workoutTypes",
    "views/workout/workoutEquipmentView"
],
function(
    $,
    xhrData,
    UserModel,
    WorkoutModel,
    EquipmentCollection,
    WorkoutTypes,
    WorkoutEquipmentView
)
{
    describe("Workout Equipment View within Summary View (unit_tests)", function()
    {
        var workoutModel;
        var workoutEquipmentView;
        var equipmentCollection;

        beforeEach(function()
        {
            equipmentCollection = new EquipmentCollection(xhrData.equipment.barbkprem, { userModel: new UserModel(), athleteId: 426489});
            workoutModel = new WorkoutModel({ workoutId: 1, athleteId: 426489, workoutTypeValueId: WorkoutTypes.typesByName.Run }, { equipment: equipmentCollection });
            workoutEquipmentView = new WorkoutEquipmentView({ model: workoutModel, collection: equipmentCollection });
        });

        it("Should render without throwing any exception.", function()
        {
            var render = function()
            {
                workoutEquipmentView.render();
            };

            expect(render).not.to.throw();
        });

        it("Should not throw any exception while closing.", function()
        {
            var closeIt = function()
            {
                workoutEquipmentView.close();
            };

            expect(closeIt).not.to.throw();
        });

        describe("Equipment selectors", function()
        {
            beforeEach(function()
            {
                workoutEquipmentView.render();
            });

            afterEach(function()
            {
                workoutEquipmentView.close();
            });

            it("Should have a Bike selector and a Shoe selector.", function()
            {
                var $bikeSelector = workoutEquipmentView.$("select.bikeSelector");

                expect($bikeSelector.length).to.equal(1);

                var $shoeSelector = workoutEquipmentView.$("select.shoeSelector");

                expect($shoeSelector.length).to.equal(1);
            });

            describe("Bike selector", function()
            {
                it("Should have a 'no equipment' option.", function()
                {
                    var $bikeSelector = workoutEquipmentView.$("select.bikeSelector");

                    expect($bikeSelector.children()[0].value).to.equal("");
                });

                it("Should be populated with bikes.", function()
                {
                    var $bikeSelector = workoutEquipmentView.$("select.bikeSelector");

                    // 2 bikes plus one 'no equipment'
                    expect($bikeSelector.children().length).to.equal(3);
                });

                it("Should be hidden for this 'run' workout.", function()
                {
                    var $bikeSelector = workoutEquipmentView.$("select.bikeSelector:hidden");

                    expect($bikeSelector.length).to.equal(1);
                });

            });

            describe("Shoe selector", function()
            {
                it("Should have a 'no equipment' option.", function()
                {
                    var $shoeSelector = workoutEquipmentView.$("select.shoeSelector");

                    expect($shoeSelector.children()[0].value).to.equal("");
                });

                it("Should be populated with shoes.", function()
                {
                    var $shoeSelector = workoutEquipmentView.$("select.shoeSelector");

                    // two shoes plus one 'no equipment'
                    expect($shoeSelector.children().length).to.equal(3);
                });

            });
        });
    });
});
