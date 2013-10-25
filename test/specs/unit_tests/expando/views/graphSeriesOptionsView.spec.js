requirejs(
[
    "jquery",
    "TP",
    "moment",
    "views/expando/graphSeriesOptionsMenuView"
],
function($, TP, moment, GraphSeriesOptionsMenuView)
{
    describe("GraphSeriesOptionsMenuView", function()
    {
        function buildView(series)
        {
            var stateModel = new TP.Model();
    
            var detailDataSpy = jasmine.createSpyObj("Workout Detail Data", ["disableChannel", "enableChannel", "cutChannel", "get"]);

            var workoutModel = new TP.Model({
                workoutTypeValueId: 1,
                detailData: detailDataSpy
            });


            return new GraphSeriesOptionsMenuView({ 
                stateModel: stateModel, 
                model: workoutModel,
                series: series
            });
        }

        describe("Hide Visible Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.model.get("detailData").get.andReturn([]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a hide option", function()
            {
                expect(view.$(".hideSeries").length).toBe(1);
            });

            it("Should not have a show option", function()
            {
                expect(view.$(".showSeries").length).toBe(0);
            });

            it("Should call disableChannel", function()
            {
                view.$(".hideSeries").trigger("click");
                expect(view.model.get("detailData").disableChannel).toHaveBeenCalledWith("Cadence");
            });
        });

        describe("Show Hidden Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.model.get("detailData").get.andReturn(["Cadence"]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a show option", function()
            {
                expect(view.$(".showSeries").length).toBe(1);
            });

            it("Should not have a hide option", function()
            {
                expect(view.$(".hideSeries").length).toBe(0);
            });

            it("Should call enableChannel", function()
            {
                view.$(".showSeries").trigger("click");
                expect(view.model.get("detailData").enableChannel).toHaveBeenCalledWith("Cadence");
            });
        });

        describe("Delete Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.model.get("detailData").get.andReturn([]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a delete option", function()
            {
                expect(view.$(".deleteSeries").length).toBe(1);
            });

            it("Should confirm before cutting channel", function()
            {
                view.$(".deleteSeries").trigger("click");
                expect(view.model.get("detailData").cutChannel).not.toHaveBeenCalled();
            });

            it("Should call cutChannel", function()
            {
                view.$(".deleteSeries").trigger("click");
                view.confirmationView.trigger("userConfirmed");
                expect(view.model.get("detailData").cutChannel).toHaveBeenCalledWith("Cadence" );
            });
        });

    });
});
