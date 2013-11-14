define(
[
    "underscore",
    "TP",
    "shared/models/expandoPodLayoutModel"
],
function(
    _,
    TP,
    ExpandoPodLayout
    )
{
    describe("ExpandoPodLayoutModel", function()
    {

        var layout;
        beforeEach(function()
        {
            layout = new ExpandoPodLayout({ workoutTypeId: 8, pods: [{ index: 1, podType: 108 }, { index: 0, podType: 152 }] });
        });

        describe(".getPodsCollection", function()
        {

            it("Should return a collection containing all of the pods in this layout, sorted by index", function()
            {
                var collection = layout.getPodsCollection();
                expect(collection.length).to.equal(2);
                expect(collection.at(0).get("podType")).to.equal(152);
            });

        });

        describe(".toJSON", function()
        {
            it("Should behave like the default model.toJSON if a collection has not been created", function()
            {
                var json = layout.toJSON();
                expect(json.workoutTypeId).to.equal(8);
                expect(json.pods.length).to.equal(2);
            });

            it("Should return the _podsCollection json if a collection has been created", function()
            {
                var collection = layout.getPodsCollection();
                collection.add({ index: 2, podType: 150 });
                var json = layout.toJSON();
                expect(json.workoutTypeId).to.equal(8);
                expect(json.pods.length).to.equal(3);
            });
        });

    });

});
