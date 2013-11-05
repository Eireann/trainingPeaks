define(
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
            sinon.stub($, "ajax", function ()
            {
                return $.Deferred();
            });
        });

        it("Should load successfully as a module", function()
        {
            expect(ExpandoController).to.not.be.undefined;
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof ExpandoController.prototype.getLayout).to.equal("function");
            });
            
            it("Should have a layout", function()
            {
                var controller = new ExpandoController({ model: null, prefetchConfig: null });
                expect(controller.getLayout()).to.not.be.undefined;
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
                expect(controller.prefetchConfig).to.equal(prefetchConfig);
                controller.preFetchDetailData();
                expect(controller.prefetchConfig).to.equal(prefetchConfig);
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
                expect(controller.prefetchConfig.detailDataPromise).to.equal(null);
                controller.preFetchDetailData();
                expect(controller.prefetchConfig.detailDataPromise).to.not.equal(null);
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
                expect(prefetchConfig.workoutDetailDataFetchTimeout).to.equal(123);
            });
        });

    });
});
