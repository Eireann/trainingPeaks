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
                    },
                    {
                        "actualMaxSpecified": false,
                        "actualMinSpecified": false,
                        "actualNote": null,
                        "actualUnitsSpecified": false,
                        "actualValueSpecified": false,
                        "isEmpty": false,
                        "name": "HeartRate",
                        "planMaxSpecified": false,
                        "planMinSpecified": false,
                        "planNote": null,
                        "planUnitsSpecified": false,
                        "planValue": 140.0,
                        "planValueSpecified": true,
                        "type": 10
                    },
                    {
                        "type": 1,
                        "isEmpty": false,
                        "name": "Duration",
                        "planNote": null,
                        "planValueSpecified": true,
                        "planMinSpecified": false,
                        "planMaxSpecified": false,
                        "planUnitsSpecified": true,
                        "planUnits": 21,
                        "planValue": 375,
                        "actualNote": null,
                        "actualValueSpecified": false,
                        "actualMinSpecified": false,
                        "actualMaxSpecified": false,
                        "actualUnitsSpecified": false
                    },
                    {
                        "actualMaxSpecified": false,
                        "actualMinSpecified": false,
                        "actualNote": null,
                        "actualUnitsSpecified": false,
                        "actualValueSpecified": false,
                        "isEmpty": false,
                        "name": "Percent HR",
                        "planMaxSpecified": false,
                        "planMinSpecified": false,
                        "planNote": null,
                        "planUnits": 16,
                        "planUnitsSpecified": true,
                        "planValue": 75.0,
                        "planValueSpecified": true,
                        "type": 24
                    },
                    {
                        "actualMaxSpecified": false,
                        "actualMinSpecified": false,
                        "actualNote": null,
                        "actualUnitsSpecified": false,
                        "actualValueSpecified": false,
                        "isEmpty": false,
                        "name": "Energy",
                        "planMaxSpecified": false,
                        "planMinSpecified": false,
                        "planNote": null,
                        "planUnitsSpecified": false,
                        "planValue": 1000.0,
                        "planValueSpecified": true,
                        "type": 20
                    },
                    {
                        "actualMaxSpecified": false,
                        "actualMinSpecified": false,
                        "actualNote": null,
                        "actualUnitsSpecified": false,
                        "actualValueSpecified": false,
                        "isEmpty": false,
                        "name": "Power",
                        "planMaxSpecified": false,
                        "planMinSpecified": false,
                        "planNote": null,
                        "planUnitsSpecified": false,
                        "planValue": 150.0,
                        "planValueSpecified": true,
                        "type": 12
                    },
                    {
                        "actualMaxSpecified": false,
                        "actualMinSpecified": false,
                        "actualNote": null,
                        "actualUnitsSpecified": false,
                        "actualValueSpecified": false,
                        "isEmpty": false,
                        "name": "Peak Power",
                        "planMaxSpecified": false,
                        "planMinSpecified": false,
                        "planNote": null,
                        "planUnitsSpecified": false,
                        "planValue": 300.0,
                        "planValueSpecified": true,
                        "type": 13
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
            expect(exerciseSetView.$("[data-property=Reps] .propertyPlannedMinValue").text()).to.contain("10");
        });

        it("Should not have an 'Active or Rest' property", function()
        {
            expect(exerciseSetView.$("[data-property='Active or Rest']").length).to.equal(0);
        });

        it("Should have a weight range", function()
        {
            expect(exerciseSetView.$("[data-property=Weight] .propertyPlannedMinValue").text()).to.contain("150");
            expect(exerciseSetView.$("[data-property=Weight] .propertyPlannedMaxValue").text()).to.contain("300");
        });

        it("Should have actual values for RPE", function()
        {
            expect(exerciseSetView.$("[data-property=RPE] .propertyCompletedMinValue").text()).to.contain("2");
            expect(exerciseSetView.$("[data-property=RPE] .propertyCompletedMaxValue").text()).to.contain("10");
        });

        it("Should display the right unit for Weight", function()
        {
            expect(exerciseSetView.$("[data-property=Weight] .propertyUnit").text()).to.contain("lb");
        });

        it("Should display duration in seconds as HH:MM:SS", function()
        {
            expect(exerciseSetView.$("[data-property=Duration] .propertyPlannedMinValue").text()).to.contain("06:15");
        });

        // The following data items are served without a unit by the backend, but we must display a unit in the front-end.
        // Check that all units are correctly added.

        it("Should display a proper unit for Power and Peak Power.", function()
        {
            expect(exerciseSetView.$("[data-property=Power] span.propertyUnit").text()).to.contain("watts");
            expect(exerciseSetView.$("[data-property='Peak Power'] span.propertyUnit").text()).to.contain("watts");
        });

        it("Should display a proper unit for Energy.", function()
        {
            expect(exerciseSetView.$("[data-property=Energy] span.propertyUnit").text()).to.contain("kj");
        });

        it("Should display 'Percent HR' as either '%max HR' or '%LT HR' with a 'bpm' unit.", function()
        {
            var target = exerciseSetView.$("[data-property='%max HR'] span.propertyUnit")[0] || exerciseSetView.$("[data-property='%LT HR'] span.propertyUnit")[0];
            
            expect(target.innerText).to.contain("bpm");
        });

        it("Should correct 'HeartRate' to 'Heart Rate' with a 'bpm' unit.", function()
        {
            expect(exerciseSetView.$("[data-property='Heart Rate'] span.propertyUnit").text()).to.contain("bpm");
        });
    });
});
