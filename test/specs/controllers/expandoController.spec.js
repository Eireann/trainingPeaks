// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "controllers/expandoController",
    "jquery"
],
function(TP, ExpandoController, $)
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

    });
});
