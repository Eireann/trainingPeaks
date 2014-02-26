define(
[
    "jquery",
    "TP",
    "views/quickView/qvMain/qvOptionsMenuView"
],
function(
    $,
    TP,
    QVOptionsMenuView
    )
{

    function buildWorkoutModel()
    {
        return new TP.Model(
            {
                details: new TP.Model(),
                detailData: new TP.Model()
            }
        );
    }

    describe("QV Options Menu View", function()
    {

        it("Should require a valid model with detail data", function()
        {
            var constructorWithNoModel = function()
            {
                var view = new QVOptionsMenuView();
            };

            var constructorWithNoDetailData = function()
            {
                var view = new QVOptionsMenuView({ model: new TP.Model() });
            };

            expect(constructorWithNoModel).to.throw();
            expect(constructorWithNoDetailData).to.throw();
        });

        describe("Elevation Correction option", function()
        {
            it("Should have an elevation correction label ", function()
            {
                var view = new QVOptionsMenuView({ model: buildWorkoutModel() });
                view.render();
                expect(view.$el.find("#elevationCorrectionLabel").length).to.eql(1);
            });

            it("Should disable the correction label if there is not lat lng data", function()
            {
                var view = new QVOptionsMenuView({ model: buildWorkoutModel() });
                view.render();
                expect(view.$el.find("#elevationCorrectionLabel").is(".disabled")).to.be.ok;
            });

            it("Should enable the correction label if there is lat lng data", function()
            {
                var workoutModel = buildWorkoutModel();
                workoutModel.get("detailData").set("flatSamples", {
                    hasLatLngData: true
                });
                workoutModel.get("detailData").set("availableDataChannels", ["Elevation"]);

                var view = new QVOptionsMenuView({ model: workoutModel });
                view.render();
                expect(view.$el.find("#elevationCorrectionLabel").is(".disabled")).to.not.be.ok;
            });

            it("Should enable the correction label if the lat lng data arrives after initial render", function()
            {
                var workoutModel = buildWorkoutModel();
                var view = new QVOptionsMenuView({ model: workoutModel });

                view.render();
                expect(view.$el.find("#elevationCorrectionLabel").is(".disabled")).to.be.ok;

                workoutModel.get("detailData").set("flatSamples", {
                    hasLatLngData: true
                });
                workoutModel.get("detailData").set("availableDataChannels", ["Elevation"]);

                expect(view.$el.find("#elevationCorrectionLabel").is(".disabled")).to.not.be.ok;
            });

        });
    });
});
