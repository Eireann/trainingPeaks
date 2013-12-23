define(
[
    "TP",
    "models/equipmentCollection",
    "shared/views/userSettings/userSettingsEquipmentView"
],
function(
    TP,
    EquipmentCollection,
    UserSettingsEquipmentView
)
{
    describe("User Settings Equipment View", function()
    {
        var equipmentCollection;
        var userSettingsEquipmentView;

        beforeEach(function()
        {
            var userModel = {
                getCurrentAthleteId: function()
                {
                    return 646464;
                }
            };

            equipmentCollection = new EquipmentCollection(
                [
                    {
                        equipmentId: 124,
                        name: "Speed 007",
                        notes: "It's great!",
                        brand: "Cyclery",
                        model: "Speed",
                        dateOfPurchase: "12/20/2013",
                        athleteId: 646464,
                        retired: false,
                        retiredDate: null,
                        isDefault: true,
                        startingDistance: 0,
                        actualDistance: 1609.344,
                        crankLengthMillimeters: "172.5",
                        wheels: "2 or more",
                        maxDistance: null,
                        type: 1        
                    },
                    {
                        equipmentId: 123,
                        name: "Awesome Shoe 9000",
                        notes: "It's great!",
                        brand: "Shoe Factory",
                        model: "9000",
                        dateOfPurchase: "12/20/2013",
                        athleteId: 646464,
                        retired: false,
                        retiredDate: null,
                        isDefault: true,
                        startingDistance: 0,
                        actualDistance: 1609.344,
                        crankLengthMillimeters: null,
                        wheels: null,
                        maxDistance: 500,
                        type: 2        
                    }
                ],
                {
                    athleteId: 646464
                }
            );

            userSettingsEquipmentView = new UserSettingsEquipmentView(
            {
                collection: equipmentCollection,
                user: userModel
            });
        });

        afterEach(function()
        {
        });

        it("Should render without throwing any exception.", function()
        {
            var render = function()
            {
                userSettingsEquipmentView.render();
            };

            expect(render).not.to.throw();
        });

        it("Should populate the view with the collection data.", function()
        {
            userSettingsEquipmentView.render();

            expect(userSettingsEquipmentView.$(".bikeList input[name=name]").val()).to.equal("Speed 007");
            expect(userSettingsEquipmentView.$(".shoeList input[name=name]").val()).to.equal("Awesome Shoe 9000");
        });

        it("Should add an empty form to the view when the Add Bike or Add Shoe buttons are clicked.", function()
        {
            userSettingsEquipmentView.render();

            // For bikes

            userSettingsEquipmentView.$("div[data-target=bikes] .action button").trigger("click");

            expect(userSettingsEquipmentView.$(".bikeList .equipmentItem").length).to.equal(2);

            // For shoes

            userSettingsEquipmentView.$("div[data-target=shoes] .action button").trigger("click");

            expect(userSettingsEquipmentView.$(".shoeList .equipmentItem").length).to.equal(2);
        });

        it("Should remove the targeted equipment when the Remove button is clicked.", function()
        {
            userSettingsEquipmentView.render();

            // For bikes

            userSettingsEquipmentView.$(".bikeList .removeEquipment").trigger("click");

            expect(userSettingsEquipmentView.$(".bikeList equipmentItem").length).to.equal(0);

            // For shoes

            userSettingsEquipmentView.$(".shoeList .removeEquipment").trigger("click");

            expect(userSettingsEquipmentView.$(".shoeList equipmentItem").length).to.equal(0);
        });
    });

});
