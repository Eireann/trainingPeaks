requirejs(
[
    "TP",
    "framework/filteredSubCollection"
], function(
    TP,
    FilteredSubCollection
)
{
    describe("Filtered sub collection", function()
    {

        var sourceCollection, filteredCollection;

        beforeEach(function()
        {
            sourceCollection = new TP.Collection(
                [
                    new TP.Model({ id: 1, sortValue: 3, included: false }),
                    new TP.Model({ id: 2, sortValue: 2, included: true }),
                    new TP.Model({ id: 3, sortvalue: 1, included: false }),
                    new TP.Model({ id: 4, sortValue: 0, included: true }),
                    new TP.Model({ id: 5, sortvalue: 4, included: false })
                ],
                {
                    comparator: "sortValue"
                }
            );

            var filter = function(model)
            {
                return model.get("included");
            };

            filteredCollection = new FilteredSubCollection(null, {
                sourceCollection: sourceCollection,
                filterFunction: filter
            });

        });

        it("Should contain the filtered models from the source collection", function()
        {
            expect(filteredCollection.length).toBe(2);
            expect(filteredCollection.get(1)).toBe(undefined);
            expect(filteredCollection.get(3)).toBe(undefined);
            expect(filteredCollection.get(5)).toBe(undefined);
            expect(filteredCollection.get(2)).toBeDefined();
            expect(filteredCollection.get(4)).toBeDefined();
        });

        it("Should sort if the source collection is sortable", function()
        {
            var model2 = sourceCollection.get(2);
            var model4 = sourceCollection.get(4);
            expect(filteredCollection.indexOf(model4)).toBe(0);
            expect(filteredCollection.indexOf(model2)).toBe(1);
        });

        it("Should add new items to itself when source collection is added if filter matches", function()
        {
            var newModel = new TP.Model({ id: 99, included: true });
            sourceCollection.add(newModel);
            expect(filteredCollection.get(99)).toBe(newModel);
        });

        it("Should not add new items to itself when source collection is added if filter does not match", function()
        {
            var newModel = new TP.Model({ id: 99, included: false });
            sourceCollection.add(newModel);
            expect(filteredCollection.get(99)).toBe(undefined);
        });

        it("Should allow to add an item that matches the filter", function()
        {
            var newModel = new TP.Model({ id: 99, included: true });
            filteredCollection.add(newModel);
            expect(filteredCollection.get(99)).toBe(newModel);
        });

        it("Should not add an item that doesn't match the filter", function()
        {
            var newModel = new TP.Model({ id: 99, included: false });
            filteredCollection.add(newModel);
            expect(filteredCollection.get(99)).toBe(undefined);
        });

        it("Should add items to source collection when item is added to itself, if filter matches", function()
        {
            var newModel = new TP.Model({ id: 99, included: true });
            filteredCollection.add(newModel);
            expect(sourceCollection.get(99)).toBe(newModel);
        });

        it("Should remove items from itself when item is removed from source collection", function()
        {
            var newModel = new TP.Model({ id: 99, included: true });
            sourceCollection.add(newModel);
            sourceCollection.remove(newModel);
            expect(filteredCollection.get(99)).toBe(undefined);
        });

        it("Should remove items from source collection when items are removed from itself", function()
        {
            var newModel = new TP.Model({ id: 99, included: true });
            sourceCollection.add(newModel);
            filteredCollection.remove(newModel);
            expect(sourceCollection.get(99)).toBe(undefined);
        });

    });
});