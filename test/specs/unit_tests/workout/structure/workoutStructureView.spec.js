define(
[
    "TP",
    "views/workout/WorkoutStructureView"
],
function (
    TP,
    WorkoutStructureView
)
{

    describe("Workout Structure View", function()
    {
        var workoutStructureData =
            {
              "workoutId": 139263450,
              "exercises": [
                {
                  "exerciseId": "1f10dfda-0d97-4812-ac0f-001316284781",
                  "location": 1,
                  "mediaAssetGuids": null,
                  "mediaGroupGuids": [
                    "5ecbe7dd-40a5-4caa-a423-867948dd8e41",
                    "7937c61b-d75a-4692-b109-a4e81a2820d7"
                  ],
                  "notes": null,
                  "sets": [
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
                          "planMinSpecified": false,
                          "planMaxSpecified": false,
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
                          "actualValueSpecified": false,
                          "actualMinSpecified": false,
                          "actualMaxSpecified": false,
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
                    },
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
                          "planValue": 12,
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
                          "planMinSpecified": false,
                          "planMaxSpecified": false,
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
                          "planValue": 8,
                          "actualNote": null,
                          "actualValueSpecified": false,
                          "actualMinSpecified": false,
                          "actualMaxSpecified": false,
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
                    }
                  ],
                  "source": "ee210f68-8fe1-d2e3-b72b-630cb97296a2",
                  "sourceSpecified": true,
                  "title": "Strength Exercise Atte",
                  "type": 0,
                  "workoutTypeID": 9
                }
              ]
            };        

        var workoutStructureView;

        beforeEach(function()
        {
            workoutStructureView = new WorkoutStructureView({ workoutStructure: workoutStructureData });
            workoutStructureView.render();
        });

        it("Should have a header", function()
        {
            expect(workoutStructureView.$(".header:contains('Workout Structure')").length).to.equal(1);
            expect(workoutStructureView.$(".header").text()).to.contain("Workout Structure");
        });

        it("Should have an exercise with 2 sets", function()
        {
            expect(workoutStructureView.$(".workoutStructure .workoutExercise .exerciseSets .exerciseSet").length).to.equal(2);
        });
    });
});
