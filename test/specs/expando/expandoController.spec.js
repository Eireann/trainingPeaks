// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "jquery",
    "TP",
    "controllers/expandoController"
],
function(
    _,
    $,
    TP,
    ExpandoController
    )
{
    describe("Expando Controller", function()
    {
        beforeEach(function ()
        {
            spyOn($, "ajax").andCallFake(function ()
            {
                return $.Deferred();
            });
        });

        it("Should load successfully as a module", function()
        {
            expect(ExpandoController).toBeDefined();
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof ExpandoController.prototype.getLayout).toBe("function");
            });
            
            it("Should have a layout", function()
            {
                var controller = new ExpandoController({ model: null, prefetchConfig: null });
                expect(controller.getLayout()).toBeDefined();
            });
        });

        describe("PrefetchConfig initialization parameter", function()
        {
            it("Should use an existing deferred inside the prefetchConfig if the detailData has already been requested", function()
            {
                var prefetchConfig =
                {
                    detailDataPromise: $.Deferred()
                };

                var controller = new ExpandoController({ model: new TP.Model(), prefetchConfig: prefetchConfig });
                expect(controller.prefetchConfig).toBe(prefetchConfig);
                controller.preFetchDetailData();
                expect(controller.prefetchConfig).toBe(prefetchConfig);
            });

            it("Should create a new deferred to request detailData if not already requested", function()
            {
                var prefetchConfig =
                {
                    detailDataPromise: null
                };

                var model = new TP.Model();
                var model2 = new TP.Model();
                model2.url = "http://url";
                model.set("detailData", model2);

                var controller = new ExpandoController({ model: model, prefetchConfig: prefetchConfig });
                expect(controller.prefetchConfig.detailDataPromise).toBe(null);
                controller.preFetchDetailData();
                expect(controller.prefetchConfig.detailDataPromise).not.toBe(null);
            });

            it("Should clear the prefetch timeout if the timeout had previously been set outside of this controller", function()
            {
                var prefetchConfig =
                {
                    detailDataPromise: null,
                    workoutDetailDataFetchTimeout: 123
                };

                var model = new TP.Model();
                var model2 = new TP.Model();
                model2.url = "http://url";
                model.set("detailData", model2);

                var controller = new ExpandoController({ model: model, prefetchConfig: prefetchConfig });
                controller.preFetchDetailData();
                expect(prefetchConfig.workoutDetailDataFetchTimeout).toBe(123);
            });
        });


        describe("Propagate View Events", function()
        {

            var controller;

            beforeEach(function()
            {
                var deferredSpy = jasmine.createSpyObj("deferred spy", ["done", "then"]);
                var workoutModel = new TP.Model({
                    details: new TP.Model(),
                    detailData: new TP.Model()
                });
                controller = new ExpandoController({ model: workoutModel, prefetchConfig: { detailDataPromise: deferredSpy } });

                spyOn(controller, "preFetchDetailData");
                spyOn(controller, "handleDetailDataPromise");
                spyOn(controller, "watchForWindowResize");

                controller.show();

                _.each(controller.views, function(view)
                {
                    spyOn(view, "trigger").andCallThrough();
                });

                spyOn(controller.views.statsView, "onWaitStart");
                spyOn(controller.views.statsView, "onWaitStop");
            });

            it("Should propagate rangeselect events as controller:rangeselect", function()
            {
                var workoutStatsForRange = new TP.Model();
                var options = {};
                var fetchDeferred = jasmine.createSpyObj("onfetch", ["done"]);
                spyOn(workoutStatsForRange, "fetch").andReturn(fetchDeferred);
                controller.views.lapsView.trigger("rangeselected", workoutStatsForRange, options, controller.views.lapsView);

                // for some reason toHaveBeenCalledWith was choking here ...
                expect(controller.views.mapView.trigger).toHaveBeenCalled();
                var callArgs = controller.views.mapView.trigger.calls[0].args;
                expect(callArgs[0]).toBe("controller:rangeselected");
                expect(callArgs[1]).toBe(workoutStatsForRange);
                expect(callArgs[2]).toBe(options);
                expect(callArgs[3]).toBe(controller.views.lapsView);
            });

            it("Should propagate graphhover events as controller:graphhover", function()
            {
                controller.views.graphView.trigger("graphhover", 3200);
                expect(controller.views.mapView.trigger).toHaveBeenCalledWith("controller:graphhover", 3200);
            });

            it("Should propagate graphleave events as controller:graphleave", function()
            {
                controller.views.graphView.trigger("graphleave");
                expect(controller.views.mapView.trigger).toHaveBeenCalledWith("controller:graphleave");
            });

            it("Should propagate unselectall events as controller:unselectall", function()
            {
                controller.views.lapsView.trigger("unselectall");
                expect(controller.views.mapView.trigger).toHaveBeenCalledWith("controller:unselectall");
            });
        });

    });
});
