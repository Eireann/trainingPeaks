define(
[
    "moment",
    "testUtils/testHelpers",
    "TP",
    "views/workout/workoutBarView",
    "models/workoutModel"
],
function(moment, testHelpers, TP, WorkoutBarView, WorkoutModel)
{

    function buildWorkoutModel()
    {
        return new WorkoutModel({
            workoutTypeValueId: 1,
            totalTime: 1.25,
            totalTimePlanned: 1.5,
            distance: 1000,
            distancePlanned: 1200,
            tssActual: 100,
            tssPlanned: 110,
            title: "My workout title",
            workoutDay: "2013-01-01T00:00:00Z"
        });
    }

    describe("Workout Bar View", function()
    {
        var workoutModel, workoutBarView;
        beforeEach(function()
        {
            testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            workoutModel = buildWorkoutModel();
            workoutBarView = new WorkoutBarView({ model: workoutModel });
            workoutBarView.render();
        });


        it("Should render a title", function()
        {
            expect(workoutBarView.$(".title").length).to.equal(1);
            expect(workoutBarView.$(".title").text().trim()).to.equal("My workout title");
        });

        it("Should have the appropriate workout type class", function()
        {
            expect(workoutBarView.$el.is(".Swim")).to.equal(true);
        });

        describe("Workout Stats", function()
        {

            var workoutModel, workoutBarView;
            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
                workoutModel = buildWorkoutModel();
                workoutBarView = new WorkoutBarView({ model: workoutModel });
                workoutBarView.render();
            });

            it("Should have total time planned", function()
            {
                expect(workoutBarView.$("#qv-header-totaltimePlanned").text()).to.equal("1:30:00");
            });

            it("Should have total time completed", function()
            {
                expect(workoutBarView.$("#qv-header-totaltime").text()).to.equal("1:15:00");
            });

            it("Should have distance planned", function()
            {
                expect(workoutBarView.$("#qv-header-distancePlanned").text()).to.equal("1200");
            });

            it("Should have distance completed", function()
            {
                expect(workoutBarView.$("#qv-header-distance").text()).to.equal("1000");
            });

            it("Should have distance label", function()
            {
                expect(workoutBarView.$(".headerWorkoutValueLabel.distance").text().trim()).to.equal("m");
            });

        });

        describe("Compliance CSS Class", function()
        {
            var workoutModel, workoutBarView;
            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
                workoutModel = buildWorkoutModel();
                workoutBarView = new WorkoutBarView({ model: workoutModel });
                workoutBarView.render();
            });

            it("Should have ComplianceGreen", function()
            {
                expect(workoutBarView.$el.is(".ComplianceGreen")).to.equal(true);
            });

            it("Should change to ComplianceNone if there is no planned time", function()
            {
                workoutModel.set("totalTimePlanned", null);
                expect(workoutBarView.$el.is(".ComplianceGreen")).to.equal(false);
                expect(workoutBarView.$el.is(".ComplianceNone")).to.equal(true);
            });

            it("Should have past", function()
            {
                expect(workoutBarView.$el.is(".past")).to.equal(true);
            });

            it("Should change to future when date changes", function()
            {
                workoutModel.set("workoutDay", moment().add("years", 23).format("YYYY-MM-DD") + "T00:00:00Z");
                expect(workoutBarView.$el.is(".past")).to.equal(false);
                expect(workoutBarView.$el.is(".future")).to.equal(true);
            });


        });

    });
});
