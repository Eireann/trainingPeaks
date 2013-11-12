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
            var defaultLayout = { layoutId: 0, pods: [{ podType: 152 }, { podType: 108 }] };
            var swimLayout = { layoutId: 1, pods: [{ podType: 102 }] };
            var runLayout = { layoutId: 3, pods: [{ podType: 111 }, { podType: 112 }, { podType: 119 }] };
            settings = new ExpandoSettingsModel({layouts: [swimLayout]});
            settings._defaultLayouts = [defaultLayout, swimLayout, runLayout];
        });

        describe(".getLayout", function()
        {

            it("Should return the matching layout if it exists", function()
            {
                var layout = settings.getLayout(1);
                expect(layout.get("layoutId")).to.equal(1);
                expect(layout.get("pods").length).to.equal(1);
            });

            it("Should return a matching default layout if no matching layout is found but a matching default exists", function()
            {
                var layout = settings.getLayout(3);
                expect(layout.get("layoutId")).to.equal(3);
                expect(layout.get("pods").length).to.equal(3);
            });

            it("Should return a default layout if no matching layout is found and no matching default exists", function()
            {
                var layout = settings.getLayout(5);
                expect(layout.get("layoutId")).to.equal(5);
                expect(layout.get("pods").length).to.equal(2);
            });

            it("Should not modify the underlying defaults", function()
            {
                var layout = settings.getLayout(7);
                layout.attributes.pods[0].podType = 1081;

                expect(settings.getLayout(7).attributes.pods[0].podType).to.equal(152);
            });

        });

        describe(".addOrUpdateLayout", function()
        {
       
            it("Should add the layout if it does not yet exist", function()
            {
                var newLayout = settings.getLayout(10);
                newLayout.getPodsCollection().add({ index: 2, podType: 100 });

                settings.addOrUpdateLayout(newLayout);

                expect(settings.get("layouts").length).to.equal(2);
                expect(settings.getLayout(10).get("pods").length).to.equal(3);
            });

            it("Should overwrite the layout if it does exist", function()
            {
                var swimLayout = settings.getLayout(1);
                swimLayout.getPodsCollection().add({ index: 2, podType: 150 });

                settings.addOrUpdateLayout(swimLayout);

                expect(settings.get("layouts").length).to.equal(1);
                expect(settings.getLayout(1).get("pods").length).to.equal(2);
            });
        });

    });
});
