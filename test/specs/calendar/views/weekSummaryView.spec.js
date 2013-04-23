// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/weekSummary/weekSummaryView"
],
function (TP, WeekSummaryView)
{
    describe("WeekSummaryView", function ()
    {
        beforeEach(function ()
        {
        });

        it("Is contained within a div with a weekSummary class", function()
        {
            expect(WeekSummaryView.prototype.tagName).toBe("div");
            expect(WeekSummaryView.prototype.className).toBe("weekSummary");
        });

        it("Throws an exception when the model or the model's parent collection are not defined", function()
        {
            expect(function () { new WeekSummaryView(); }).toThrow();
            expect(function () { new WeekSummaryView({ model: new TP.Model() }); }).toThrow();

            var parentCollection = new TP.Collection();
            var model = new TP.Model();
            parentCollection.add(model);
            
            expect(function() { new WeekSummaryView({ model: model }); }).not.toThrow();
        });

        it("Rerenders itself when workouts are changed, added, or removed for the week", function()
        {
            spyOn(WeekSummaryView.prototype, "render");

            var weekCollection = new TP.Collection();
            var dayModel = new TP.Model();
            dayModel.itemsCollection = new TP.Collection();
            
            var summaryModel = new TP.Model();

            weekCollection.add(dayModel);
            weekCollection.add(summaryModel);
            
            var view = new WeekSummaryView({ model: summaryModel });

            expect(WeekSummaryView.prototype.render).not.toHaveBeenCalled();

            dayModel.itemsCollection.add(new TP.Model());
            
            expect(WeekSummaryView.prototype.render).toHaveBeenCalled();

            WeekSummaryView.prototype.render.reset();
            //change
            dayModel.itemsCollection.at(0).set("key", "0");
            expect(WeekSummaryView.prototype.render).toHaveBeenCalled();
            
            WeekSummaryView.prototype.render.reset();
            
            //remove
            dayModel.itemsCollection.remove(dayModel.itemsCollection.at(0));
            expect(WeekSummaryView.prototype.render).toHaveBeenCalled();
        });

        it("Should aggregate weekly workout data totals correctly", function()
        {
            WeekSummaryView.prototype.render = function(){};

            var weekCollection = new TP.Collection();
            var dayModel1 = new TP.Model();
            var dayModel2 = new TP.Model();
            dayModel1.itemsCollection = new TP.Collection();
            dayModel2.itemsCollection = new TP.Collection();

            var summaryModel = new TP.Model();

            weekCollection.add(dayModel1);
            weekCollection.add(dayModel2);
            weekCollection.add(summaryModel);

            var view = new WeekSummaryView({ model: summaryModel });

            var workout1 = new TP.Model({ totalTime: 1, totalTimePlanned: 2, tssActual: 100, tssPlanned: 200 });
            var workout2 = new TP.Model({ totalTime: 2, totalTimePlanned: 4, tssActual: 200, tssPlanned: 400 });
            var workout3 = new TP.Model({ totalTime: 3, totalTimePlanned: 6, tssActual: 300, tssPlanned: 600 });
            var workout4 = new TP.Model({ totalTime: 4, totalTimePlanned: 8, tssActual: 400, tssPlanned: 800 });

            view.onBeforeRender();

            expect(view.model.get("totalTimeCompleted")).toBe(0);
            expect(view.model.get("totalTimePlanned")).toBe(0);
            expect(view.model.get("tssCompleted")).toBe('0');
            expect(view.model.get("tssPlanned")).toBe('0');

            dayModel1.itemsCollection.add(workout1);
            
            view.onBeforeRender();

            expect(view.model.get("totalTimeCompleted")).toBe(1);
            expect(view.model.get("totalTimePlanned")).toBe(2);
            expect(view.model.get("tssCompleted")).toBe('100');
            expect(view.model.get("tssPlanned")).toBe('200');

            dayModel1.itemsCollection.add(workout2);
            dayModel2.itemsCollection.add(workout3);
            dayModel2.itemsCollection.add(workout4);

            view.onBeforeRender();
            
            expect(view.model.get("totalTimeCompleted")).toBe(10);
            expect(view.model.get("totalTimePlanned")).toBe(20);
            expect(view.model.get("tssCompleted")).toBe('1000');
            expect(view.model.get("tssPlanned")).toBe('2000');
        });

        it("Should aggregate weekly workout totals by workout type correctly", function()
        {
            WeekSummaryView.prototype.render = function () { };

            var weekCollection = new TP.Collection();
            var dayModel1 = new TP.Model();
            var dayModel2 = new TP.Model();
            dayModel1.itemsCollection = new TP.Collection();
            dayModel2.itemsCollection = new TP.Collection();

            var summaryModel = new TP.Model();

            weekCollection.add(dayModel1);
            weekCollection.add(dayModel2);
            weekCollection.add(summaryModel);

            var view = new WeekSummaryView({ model: summaryModel });

            var bike1 = new TP.Model({ distance: 1, distancePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Bike")});
            var bike2 = new TP.Model({ distance: 2, distancePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Bike")});
            var run1 = new TP.Model({ distance: 3, distancePlanned: 6, tssActual: 300, tssPlanned: 600, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Run")});
            var run2 = new TP.Model({ distance: 4, distancePlanned: 8, tssActual: 400, tssPlanned: 800, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Run") });
            var swim1 = new TP.Model({ distance: 1, distancePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Swim") });
            var swim2 = new TP.Model({ distance: 2, distancePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Swim") });
            var strength1 = new TP.Model({ totalTime: 3, totalTimePlanned: 6, tssActual: 300, tssPlanned: 600, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Strength") });
            var strength2 = new TP.Model({ totalTime: 4, totalTimePlanned: 8, tssActual: 400, tssPlanned: 800, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Strength") });
            var rowing1 = new TP.Model({ totalTime: 1, totalTimePlanned: 2, tssActual: 100, tssPlanned: 200, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Rowing") });
            var rowing2 = new TP.Model({ totalTime: 2, totalTimePlanned: 4, tssActual: 200, tssPlanned: 400, workoutTypeValueId: TP.utils.workoutTypes.getIdByName("Rowing") });

            view.onBeforeRender();

            expect(view.model.get("bikeDistanceCompleted")).toBe(0);
            expect(view.model.get("bikeDistancePlanned")).toBe(0);
            expect(view.model.get("runDistanceCompleted")).toBe(0);
            expect(view.model.get("runDistancePlanned")).toBe(0);
            expect(view.model.get("swimDistanceCompleted")).toBe(0);
            expect(view.model.get("swimDistancePlanned")).toBe(0);
            expect(view.model.get("strengthDurationCompleted")).toBe(0);
            expect(view.model.get("strengthDurationPlanned")).toBe(0);

            dayModel1.itemsCollection.add(bike1);
            dayModel1.itemsCollection.add(run1);
            dayModel1.itemsCollection.add(swim1);
            dayModel1.itemsCollection.add(strength1);
            dayModel1.itemsCollection.add(rowing1);
            
            dayModel2.itemsCollection.add(bike2);
            dayModel2.itemsCollection.add(run2);
            dayModel2.itemsCollection.add(swim2);
            dayModel2.itemsCollection.add(strength2);
            dayModel1.itemsCollection.add(rowing2);
            
            view.onBeforeRender();

            expect(view.model.get("bikeDistanceCompleted")).toBe(3);
            expect(view.model.get("bikeDistancePlanned")).toBe(6);
            expect(view.model.get("runDistanceCompleted")).toBe(7);
            expect(view.model.get("runDistancePlanned")).toBe(14);
            expect(view.model.get("swimDistanceCompleted")).toBe(3);
            expect(view.model.get("swimDistancePlanned")).toBe(6);
            expect(view.model.get("strengthDurationCompleted")).toBe(7);
            expect(view.model.get("strengthDurationPlanned")).toBe(14);
        });
    });
});