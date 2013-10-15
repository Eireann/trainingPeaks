requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/expando/graphToolbarView"
],
function($, TP, moment, theMarsApp, GraphToolbarView)
{
    describe("GraphToolbarView", function()
    {
        var dataParser;
        var stateModel;

        beforeEach(function()
        {
            dataParser = jasmine.createSpy("Data Parser");
            stateModel = new TP.Model();
        });

        it("Should have a valid contructor", function()
        {
            expect(GraphToolbarView).toBeDefined();
            expect(function() { new GraphToolbarView({ dataParser: dataParser, stateModel: stateModel }); }).not.toThrow();
        });

        it("Should trigger an event when the slider bar changes value", function()
        {
            var view = new GraphToolbarView({ dataParser: dataParser, stateModel: stateModel });
            view.onRender = function()
            {
            };
            view.render();

            var called = false;
            var period = null;
            view.on("filterPeriodChanged", function(p)
            {
                called = true;
                period = p;
            });

            runs(function()
            {
                view.$("input[name=filterPeriod]").val(50).change();
            });

            waitsFor(function () { return called; }, 5000);

            runs(function()
            {
                expect(called).toBe(true);
                expect(period).toBe(50);
            });
        });
        it("Should correctly serialize data for distance units", null,function()
        {
            var view = new GraphToolbarView({ dataParser: dataParser, stateModel: stateModel, model: new TP.model({workoutTypeValueId: 1}) });
            expect(view.serializeData().speedLabel).toBe("yds");

            view.model.set({workoutTypeValueId: 3});
            expect(view.serializeData().speedLabel).toBe("mph");
        });
    });
});