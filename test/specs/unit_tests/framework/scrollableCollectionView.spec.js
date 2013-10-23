requirejs(
["TP",
 "moment",
 "jquery",
 "views/scrollableCollectionView"//,
 // "models/calendar/calendarCollection"
],
 function(TP, moment, $, ScrollableCollectionView/*, CalendarCollection*/)
 {
     describe("ScrollableCollectionView", function()
     {
        var view, collection;
        beforeEach(function()
        {
            collection = new TP.Collection();
            collection.prepareNext = function(){ return []; };
            collection.preparePrevious = function(){ return []; };

            view = new ScrollableCollectionView({collection: collection});
        });

        it("Should be exposed as a module", function()
        {
            expect(view).toBeDefined();
        });

        // pending
        xit("Should scroll to the correct model with scrollToModel", null, function() {
            var collection = new CalendarCollection([new TP.Model()], {
                    startDate: moment().day(0),
                    endDate: moment().day(7).add("weeks", 2)
                }),
                view = new ScrollableCollectionView({collection: collection});
            spyOn(collection, "requestWorkouts").andReturn(new $.Deferred());
            collection.prepareNext(3);
            view.scrollToModel(collection.at(2));
        });

        it("Should fetch more results when scrolling above the threshhold", function() {
            spyOn(view.$el, "scrollTop").andReturn(0);
            spyOn(view.$el, "height").andReturn(100);
            spyOn(view.$el, "prop").andReturn(200);
            spyOn(view, "snapToChild").andReturn([]);

            spyOn(view, "_fetchMore");
            view.render();
            view.$el.trigger('scroll'); // this passes when the spec is run alone, but breaks the full spec suite run task
            expect(view._fetchMore).toHaveBeenCalledWith('top');
        });

        // pending
        it("Should fetch more results when scrolling below the bottom threshhold", function() {
            spyOn(view.$el, "scrollTop").andReturn(2000);
            spyOn(view.$el, "prop").andReturn(2200);
            spyOn(view.$el, "height").andReturn(100);
            spyOn(view, "snapToChild").andReturn([]);

            spyOn(view, "_fetchMore");
            view.render();
            view.$el.trigger('scroll'); // this passes when the spec is run alone, but breaks the full spec suite run task
            expect(view._fetchMore).toHaveBeenCalledWith('bottom');
        });
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
