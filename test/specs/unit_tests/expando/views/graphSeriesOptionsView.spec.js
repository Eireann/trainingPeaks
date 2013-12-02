define(
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
    
            var detailDataSpy = createSpyObj("Workout Detail Data", ["disableChannel", "enableChannel", "cutChannel", "get"]);

            return new GraphSeriesOptionsMenuView({ 
                detailDataModel: detailDataSpy,
                model: new TP.Model({ series: series, title: "My Series" }),
                featureAuthorizer: {
                    canAccessFeature: function(){return true;},
                    features: {
                        ExpandoDataEditing: null
                    }
                }
            });
        }

        describe("Hide Visible Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.detailDataModel.get.returns([]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a hide option", function()
            {
                expect(view.$(".hideSeries").length).to.equal(1);
            });

            it("Should not have a show option", function()
            {
                expect(view.$(".showSeries").length).to.equal(0);
            });

            it("Should call disableChannel", function()
            {
                view.$(".hideSeries").trigger("click");
                expect(view.detailDataModel.disableChannel).to.have.been.calledWith("Cadence");
            });
        });

        describe("Show Hidden Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.detailDataModel.get.returns(["Cadence"]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a show option", function()
            {
                expect(view.$(".showSeries").length).to.equal(1);
            });

            it("Should not have a hide option", function()
            {
                expect(view.$(".hideSeries").length).to.equal(0);
            });

            it("Should call enableChannel", function()
            {
                view.$(".showSeries").trigger("click");
                expect(view.detailDataModel.enableChannel).to.have.been.calledWith("Cadence");
            });
        });

        describe("Delete Series", function()
        {            
            var view;
            beforeEach(function()
            {
                view = buildView("Cadence");
                view.detailDataModel.get.returns([]); // get("disabledDataChannels")
                view.render();
            });

            it("Should have a delete option", function()
            {
                expect(view.$(".deleteSeries").length).to.equal(1);
            });

            it("Should confirm before cutting channel", function()
            {
                view.$(".deleteSeries").trigger("click");
                expect(view.detailDataModel.cutChannel).to.not.have.been.called;
            });

            it("Should call cutChannel", function()
            {
                view.$(".deleteSeries").trigger("click");
                view.confirmationView.trigger("userConfirmed");
                expect(view.detailDataModel.cutChannel).to.have.been.calledWith("Cadence" );
            });
        });

    });
});
