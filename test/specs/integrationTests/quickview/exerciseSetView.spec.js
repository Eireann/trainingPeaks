define(
[
    "jquery",
    "underscore",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "utilities/workout/workoutTypes",
    "views/workout/ExerciseSetView"
],
function(
    $,
    _,
    TP,
    testHelpers,
    xhrData,
    WorkoutTypes,
    ExerciseSetView
)
{
    var setupTest = function(workoutName, workoutType, expectedResult)
    {
        describe("Exercise Set View for " + workoutName, function()
        {
            var exerciseSetData =
                {
                    "instructions": [
                        {
                            "actualMaxSpecified": false,
                            "actualMinSpecified": false,
                            "actualNote": null,
                            "actualUnitsSpecified": false,
                            "actualValueSpecified": false,
                            "isEmpty": false,
                            "name": "Reps",
                            "planMaxSpecified": false,
                            "planMinSpecified": false,
                            "planNote": null,
                            "planUnitsSpecified": false,
                            "planValue": 1.0,
                            "planValueSpecified": true,
                            "type": 0
                        },
                        {
                            "actualMaxSpecified": false,
                            "actualMinSpecified": false,
                            "actualNote": null,
                            "actualUnitsSpecified": false,
                            "actualValueSpecified": false,
                            "isEmpty": false,
                            "name": "Duration",
                            "planMaxSpecified": false,
                            "planMinSpecified": false,
                            "planNote": null,
                            "planUnits": 19,
                            "planUnitsSpecified": true,
                            "planValue": 10.0,
                            "planValueSpecified": true,
                            "type": 1
                        },
                        {
                            "actualMaxSpecified": false,
                            "actualMinSpecified": false,
                            "actualNote": null,
                            "actualUnitsSpecified": false,
                            "actualValue": 1.0,
                            "actualValueSpecified": true,
                            "isEmpty": false,
                            "name": "Active or Rest",
                            "planMaxSpecified": false,
                            "planMinSpecified": false,
                            "planNote": null,
                            "planUnitsSpecified": false,
                            "planValue": 1.0,
                            "planValueSpecified": true,
                            "type": 25
                        },
                        {
                            "actualMaxSpecified": false,
                            "actualMinSpecified": false,
                            "actualNote": null,
                            "actualUnitsSpecified": false,
                            "actualValueSpecified": false,
                            "isEmpty": false,
                            "name": "Speed Zones",
                            "planMaxSpecified": false,
                            "planMinSpecified": false,
                            "planNote": null,
                            "planUnitsSpecified": false,
                            "planValue": 2.0,
                            "planValueSpecified": true,
                            "type": 26
                        }
                    ]
                };

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);

                exerciseSetModel = new TP.Model(exerciseSetData);
                exerciseSetView = new ExerciseSetView({ index: 0, model: exerciseSetModel, workoutTypeId: workoutType });
                exerciseSetView.render();
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            var exerciseSetModel, exerciseSetView;

            it("Should display speed zones using paces.", function()
            {
                // Something may be off here...class "propertyPlannedMinValue" may not be right.
                expect(exerciseSetView.$("[data-property='Speed Zones'] .propertyPlannedMinValue").text()).to.contain(expectedResult);
            });
        });
    };

    var pacedWorkouts = [
        { name: "Swim", type: WorkoutTypes.typesByName.Swim, expectedResult: "Zone 2 (32:43 - 30:51)" },
        { name: "Run", type: WorkoutTypes.typesByName.Run, expectedResult: "Zone 2 (15:29 - 13:41)" },
        { name: "Walk", type: WorkoutTypes.typesByName.Walk, expectedResult: "Zone 2 (15:29 - 13:41)" }
    ];

    _.each(pacedWorkouts, function(workout)
    {
        setupTest(workout.name, workout.type, workout.expectedResult);
    });
});
