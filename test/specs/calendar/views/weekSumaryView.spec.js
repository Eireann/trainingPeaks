// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/weekSummaryView"
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
            var summaryModel = new TP.Model();

            weekCollection.add(dayModel);
            
            //var view = new WeekSummaryView({ model: summaryModel });

            //expect(WeekSummaryView.prototype.render).toNotHaveBeenCalled();
            
            dayModel.set("test", "test");

            //expect(WeekSummaryView.prototype.render).toHaveBeenCalled();
        });
    });
});