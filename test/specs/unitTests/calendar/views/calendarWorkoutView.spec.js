define(
[
    "moment",
    "models/workoutModel",
    "views/calendar/workout/calendarWorkoutView"
],
function(
    moment,
    WorkoutModel,
    CalendarWorkoutView)
{

    describe("CalendarWorkoutView ", function()
    {
        var featureAuthorizer = { canAccessFeature: function(){ return true; }, features: {}};
        it("should be loaded as a module", function()
        {
            expect(CalendarWorkoutView).to.not.be.undefined;
        });

        describe("Compliance Coloring", function()
        {
            it("Should return ComplianceNone if there is no value for planned time", function()
            {
                var model = new WorkoutModel({ workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceNone");
            });

            it("Should return ComplianceNone if there is a zero value for planned time and no value for completed time", function()
            {
                var model = new WorkoutModel({ totalTimePlanned: 0, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceNone");
            });

            it("Should return ComplianceNone if there is a zero value for planned time and zero value for completed time", function()
            {
                var model = new WorkoutModel({ totalTimePlanned: 0, totalTime: 0, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceNone");
            });

            it("Should return ComplianceRed if there is a zero value for planned time and non zero value for completed time", function()
            {
                var model = new WorkoutModel({ totalTimePlanned: 0, totalTime: 0.01, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceRed");
            });

            it("Should return ComplianceGreen if completed time is 80-120% of planned time", function()
            {
                var model = new WorkoutModel({ totalTime: 80, totalTimePlanned: 100, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceGreen");
                model.set("totalTime", 120);
                expect(view.getComplianceCssClassName()).to.equal("ComplianceGreen");
            });

            it("Should return ComplianceYellow if completed time is 50-79% of planned time", function()
            {
                var model = new WorkoutModel({ totalTime: 50, totalTimePlanned: 100, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceYellow");
                model.set("totalTime", 79);
                expect(view.getComplianceCssClassName()).to.equal("ComplianceYellow");
            });

            it("Should return ComplianceYellow if completed time is 121-150% of planned time", function()
            {
                var model = new WorkoutModel({ totalTime: 121, totalTimePlanned: 100, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceYellow");
                model.set("totalTime", 150);
                expect(view.getComplianceCssClassName()).to.equal("ComplianceYellow");
            });

            it("Should return ComplianceRed if completed time is > 150% of planned time", function()
            {
                var model = new WorkoutModel({ totalTime: 151, totalTimePlanned: 100, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceRed");
            });

            it("Should return ComplianceRed if completed time is < 50% of planned time", function()
            {
                var model = new WorkoutModel({ totalTime: 49, totalTimePlanned: 100, workoutDay: "2012-01-01" });
                var view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer });
                expect(view.getComplianceCssClassName()).to.equal("ComplianceRed");
            });
        });

        describe("Description truncation", function()
        {
            var model, view;
            beforeEach(function()
            {
                model = new WorkoutModel();
                var userLayoutSettings = [23, 26, 30, 24, 8, 7, 2, 1, 25, 31, 3, 4, 5, 40, 35, 38, 36, 39, 6, 41, 13];
                view = new CalendarWorkoutView({ model: model, featureAuthorizer: featureAuthorizer, workoutLabelLayout: userLayoutSettings });
            });

            it("Should truncate descriptions longer than 100 characters", function()
            {
                var description = "I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. " +
                    "I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. I am a very long description. " +
                    "I am the very end of a very long description";
                model.set("description", description);
                view.render();
                expect(view.$(".workoutBody").text()).to.contain("I am a very long description");
                expect(view.$(".workoutBody").text()).to.not.contain(description);
                expect(view.$(".workoutBody").text()).to.not.contain("I am the end of a very long description");
                expect(view.$(".workoutBody").text()).to.contain("more");
            });

            it("Should not truncate descriptions shorter than 100 characters", function()
            {
                var description = "I am a very short description";
                model.set("description", description);
                view.render();
                expect(view.$(".workoutBody").text()).to.contain(description);
                expect(view.$(".workoutBody").text()).to.not.contain("more");
            });

            it("SHould not truncate descriptions equal to 100 characters", function()
            {
                var description = "I am a description with exactly 100 characters. exactly. Here are a few other characters to make 100";
                model.set("description", description);
                expect(view.$(".workoutBody").text()).to.contain(description);
                expect(view.$(".workoutBody").text()).to.not.contain("more");
            });

        });

    });

});
