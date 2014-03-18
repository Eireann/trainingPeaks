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
    var setupTest = function(workoutName, workoutType, units, expectedValue)
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

            it("Should display speed zones using " + units + ".", function()
            {
                // Something may be off here...class "propertyPlannedMinValue" may not be right.
                expect(exerciseSetView.$("[data-property='Speed Zones'] .propertyPlannedMinValue").text()).to.contain(expectedValue);
            });
        });
    };

    var workouts = [
        { name: "Swim", type: WorkoutTypes.typesByName.Swim, units: "paces", expectedValue: "Zone 2 (01:52 - 01:45 sec/100y)" },
        { name: "Bike", type: WorkoutTypes.typesByName.Bike, units: "speeds", expectedValue: "Zone 2 (2.31 - 2.49 mph)" },
        { name: "Run", type: WorkoutTypes.typesByName.Run, units: "paces", expectedValue: "Zone 2 (15:29 - 13:41 min/mi)" },
        { name: "Walk", type: WorkoutTypes.typesByName.Walk, units: "paces", expectedValue: "Zone 2 (15:29 - 13:41 min/mi)" }
    ];

    _.each(workouts, function(workout)
    {
        setupTest(workout.name, workout.type, workout.units, workout.expectedValue);
    });
});
