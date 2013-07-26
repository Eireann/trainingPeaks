requirejs(
["TP",
 "views/scrollableCollectionView"],
 function(TP, ScrollableCollectionView)
 {
     describe("ScrollableCollectionView", function()
     {

     });

    describe("ScrollableCollectionView.ScrollableCollectionViewAdapterCollection", function()
     {
        var collection, adapterCollection;
        beforeEach(function() 
        {
            collection = new TP.Collection();
            collection.prepareNext = function(){ return []; };
            collection.preparePrevious = function(){ return []; };

            var options =
            {
                collection: collection,
                maxSize: 3
            };
            adapterCollection = new ScrollableCollectionView.ScrollableCollectionViewAdapterCollection(null, options);
        });

        it("Should be exposed as a module", function() 
        {
            expect(adapterCollection).toBeDefined();
        });

        it("Should add models added to the sourceCollection", function()
        {
            var model = new TP.Model();
            collection.add(model);

            expect(adapterCollection.length).toBe(1);
        });
        it("Should remove models removed from the sourceCollection", function()
        {
            var model = new TP.Model();
            collection.add(model);
            collection.remove(model);

            expect(adapterCollection.length).toBe(0);
        });

        it("Should not add models added to the sourceCollection that are outside the current range", function()
        {
            _.times(3, function(){ collection.add(new TP.Model()); });
            expect(adapterCollection.length).toBe(3);
            var model = new TP.Model();
            collection.add(model);
            expect(adapterCollection.indexOf(model)).toBe(-1);
        });

        it("Should limit the number of models to maxSize by dropping models from the end if we add to the first half of the current source range", function()
        {
            _.times(3, function(){ collection.add(new TP.Model()); });

            var model = new TP.Model();
            collection.add(model, {at: 1});
            expect(adapterCollection.indexOf(model)).toBe(1);
            expect(adapterCollection.length).toBe(3);
        });

        it("Should limit the number of models to maxSize by dropping models from the beginning if we add to the second half of the current source range", function()
        {
            _.times(3, function(){ collection.add(new TP.Model()); });

            var model = new TP.Model();
            collection.add(model, {at: 2});
            expect(adapterCollection.indexOf(model)).toBe(1);
            expect(adapterCollection.length).toBe(3);
        });
        it("Should fill in the adapter collection with models from the end of the source collection to maintain adapter collections size", function()
        {
            var models = _.times(4, function() { return new TP.Model(); });
            collection.add(models);
            var model = adapterCollection.at(2);
            collection.remove(model);
            expect(adapterCollection.length).toBe(3);
            expect(adapterCollection.last()).toBe(models[3]);
        });
        it("Should fill in the adapter collection with models from the beginning of the source collection to maintain adapter collections size", function()
        {
            var models = _.times(5, function() { return new TP.Model(); });
            collection.add(models.slice(1,3));
            collection.add(models[0], {at: 0});
            collection.add(models[4], {at: 4});
            collection.remove(collection.at(1));
            expect(adapterCollection.length).toBe(3);
            expect(adapterCollection.first()).toBe(models[0]);
        });
     });
 }
 );