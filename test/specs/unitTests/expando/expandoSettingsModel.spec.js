define(
[
    "underscore",
    "TP",
    "shared/models/expandoSettingsModel"
],
function(
    _,
    TP,
    ExpandoSettingsModel
    )
{
    describe("ExpandoSettingsModel", function()
    {

        var settings;
        beforeEach(function()
        {
            var defaultLayout = { workoutTypeId: 0, pods: [{ podType: 152 }, { podType: 108 }] };
            var swimLayout = { workoutTypeId: 1, pods: [{ podType: 102 }] };
            settings = new ExpandoSettingsModel({layouts: [defaultLayout, swimLayout]});
        });

        describe(".getLayoutForWorkoutType", function()
        {

            it("Should return the matching layout if it exists", function()
            {
                var layout = settings.getLayoutForWorkoutType(1);
                expect(layout.get("workoutTypeId")).to.equal(1);
                expect(layout.get("pods").length).to.equal(1);
            });

            it("Should return a matching default layout if no matching layout is found but a matching default exists", function()
            {
                var layout = settings.getLayoutForWorkoutType(3);
                expect(layout.get("workoutTypeId")).to.equal(3);
                expect(layout.get("pods").length).to.equal(2);
            });

            it("Should not modify the underlying defaults", function()
            {
                var layout = settings.getLayoutForWorkoutType(7);
                layout.attributes.pods[0].podType = 1081;

                expect(settings.getLayoutForWorkoutType(7).attributes.pods[0].podType).to.equal(152);
            });

        });

        describe(".addOrUpdateLayoutForWorkoutType", function()
        {
       
            it("Should add the layout if it does not yet exist", function()
            {
                var newLayout = settings.getLayoutForWorkoutType(10);
                newLayout.getPodsCollection().add({ index: 2, podType: 100 });

                settings.addOrUpdateLayoutForWorkoutType(newLayout);

                expect(settings.get("layouts").length).to.equal(3);
                expect(settings.getLayoutForWorkoutType(10).get("pods").length).to.equal(3);
            });

            it("Should overwrite the layout if it does exist", function()
            {
                var swimLayout = settings.getLayoutForWorkoutType(1);
                swimLayout.getPodsCollection().add({ index: 2, podType: 150 });

                settings.addOrUpdateLayoutForWorkoutType(swimLayout);

                expect(settings.get("layouts").length).to.equal(2);
                expect(settings.getLayoutForWorkoutType(1).get("pods").length).to.equal(2);
            });
        });

    });
});
