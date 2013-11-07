define(
[
    "TP",
    "framework/settingsSubCollection"
], function(
    TP,
    SettingsSubCollection
)
{
    describe("Settings sub collection", function()
    {

        var sourceModel, settingsCollection;

        beforeEach(function()
        {

            sourceModel = new TP.Model({
                pods: [
                    {a: 1, sortValue: 3},
                    {b: 2, sortValue: 1},
                    {a: 3, sortValue: 2}
                ]
            });

            settingsCollection = new SettingsSubCollection(null, { 
                sourceModel: sourceModel,
                sourceKey: "pods"
            });

        });


        it("Should be defined", function()
        {
            expect(SettingsSubCollection).to.not.be.undefined;
        });

        it("Should have the correct number of models", function()
        {
            expect(settingsCollection.length).to.equal(3);
        });

        it("Should update the source model when collection models are changed", function()
        {
            var model = settingsCollection.first();
            model.set("a", 2);
            expect(sourceModel.get("pods.0.a")).to.equal(2);
        });

        it("Should work with deep keys", function()
        {
            var model = settingsCollection.first();
            model.set("x.y", 7);
            expect(sourceModel.get("pods.0.x.y")).to.equal(7);
        });

        it("Should save the source model when a collection model is saved", function()
        {
            sinon.stub(sourceModel, "save");
            var model = settingsCollection.first();
            model.save();
            expect(sourceModel.save).to.have.been.called;
        });

        it("Should not support saving collection model with arguments", function()
        {
            var model = settingsCollection.first();
            var saveWithArgs = function()
            {
                model.save("a", "b", {});
            };
            expect(saveWithArgs).to.throw();
        });

        it("Should support adding models", function()
        {
            var newModel = new TP.Model({iAmNew: true});
            settingsCollection.add(newModel);
            expect(sourceModel.get("pods.3.iAmNew")).to.equal(true);
        });

        it("Should support removing models", function()
        {
            settingsCollection.remove(settingsCollection.at(1));
            expect(sourceModel.get("pods").length).to.equal(2);
            expect(sourceModel.get("pods.0.a")).to.equal(1);
            expect(sourceModel.get("pods.1.a")).to.equal(3);
        });

        it("Should support sorting", function()
        {
            /*
                    {a: 1, sortValue: 3},
                    {b: 2, sortValue: 1},
                    {a: 3, sortValue: 2}
            */
            settingsCollection.comparator = "sortValue";
            settingsCollection.sort();
            expect(sourceModel.get("pods.0.b")).to.equal(2);
            expect(sourceModel.get("pods.1.a")).to.equal(3);
            expect(sourceModel.get("pods.2.a")).to.equal(1);

        });

        it("Should not allow changes to the source model", function()
        {
            var changeSourceModel = function()
            {
                sourceModel.set("pods.0.a", 10);
            };
            expect(changeSourceModel).to.throw();
        });

    });
});
