define(
[
    "TP",
    "views/workout/ExerciseSetView"
],
function (
    TP,
    ExerciseSetView
)
{

    describe("Exercise Set View", function()
    {
        var exerciseSetData =
            {
                "instructions": [
                    {
                        "type": 0,
                        "isEmpty": false,
                        "name": "Reps",
                        "planNote": null,
                        "planValueSpecified": true,
                        "planMinSpecified": false,
                        "planMaxSpecified": false,
                        "planUnitsSpecified": false,
                        "planValue": 10,
                        "actualNote": null,
                        "actualValueSpecified": false,
                        "actualMinSpecified": false,
                        "actualMaxSpecified": false,
                        "actualUnitsSpecified": false
                    },
                    {
                        "type": 5,
                        "isEmpty": false,
                        "name": "Weight",
                        "planNote": null,
                        "planValueSpecified": true,
                        "planMinSpecified": true,
                        "planMaxSpecified": true,
                        "planMin": 150,
                        "planMax": 300,
                        "planUnitsSpecified": true,
                        "planValue": 150,
                        "planUnits": 5,
                        "actualNote": null,
                        "actualValueSpecified": false,
                        "actualMinSpecified": false,
                        "actualMaxSpecified": false,
                        "actualUnitsSpecified": false
                    },
                    {
                        "type": 15,
                        "isEmpty": false,
                        "name": "RPE",
                        "planNote": null,
                        "planValueSpecified": true,
                        "planMinSpecified": false,
                        "planMaxSpecified": false,
                        "planUnitsSpecified": false,
                        "planValue": 6,
                        "actualNote": null,
                        "actualValueSpecified": true,
                        "actualValue": 2,
                        "actualMinSpecified": true,
                        "actualMin": 2,
                        "actualMaxSpecified": true,
                        "actualMax": 10,
                        "actualUnitsSpecified": false
                    },
                    {
                        "type": 25,
                        "isEmpty": false,
                        "name": "Active or Rest",
                        "planNote": null,
                        "planValueSpecified": true,
                        "planMinSpecified": false,
                        "planMaxSpecified": false,
                        "planUnitsSpecified": false,
                        "planValue": 1,
                        "actualNote": null,
                        "actualValueSpecified": false,
                        "actualMinSpecified": false,
                        "actualMaxSpecified": false,
                        "actualUnitsSpecified": false
                    }
                ]
            };

        var exerciseSetModel, exerciseSetView;

        beforeEach(function()
        {
            exerciseSetModel = new TP.Model(exerciseSetData);
            exerciseSetView = new ExerciseSetView({ index: 0, model: exerciseSetModel });
            exerciseSetView.render();
        });

        it("Should have a step number", function()
        {
            expect(exerciseSetView.$(".setIndex").text()).to.contain("Step 1");
        });

        it("Should be an active set", function()
        {
            expect(exerciseSetView.$(".setType").text()).to.contain("Active");
        });

        it("Should have a number of reps", function()
        {
            expect(exerciseSetView.$("[data-property=Reps]").length).to.equal(1);
            expect(exerciseSetView.$("[data-property=Reps]").text()).to.contain("Reps");
        });

        it("Should have a number of reps equal to 10", function()
        {
            expect(exerciseSetView.$("[data-property=Reps] .propertyPlannedValue").text()).to.contain("10");
        });

        it("Should not have an 'Active or Rest' property", function()
        {
            expect(exerciseSetView.$("[data-property='Active or Rest']").length).to.equal(0);
        });

        it("Should have a weight range", function()
        {
            expect(exerciseSetView.$("[data-property=Weight] .propertyPlannedValue").text()).to.contain("150 - 300");
        });

        it("Should have actual values for RPE", function()
        {
            expect(exerciseSetView.$("[data-property=RPE] .propertyCompletedValue").text()).to.contain("2 - 10");
        });

        it("Should display the right unit for Weight", function()
        {
            expect(exerciseSetView.$("[data-property=Weight] .propertyUnit").text()).to.contain("lb");
        });
    });
});
