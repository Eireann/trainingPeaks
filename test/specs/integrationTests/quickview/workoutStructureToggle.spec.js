define(
[
    "jquery",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "utilities/workout/workoutTypes",
    "views/quickView/summaryView"
],
function(
    $,
    TP,
    testHelpers,
    xhrData,
    WorkoutModel,
    WorkoutTypes,
    SummaryView
)
{
    // From an actual CTS structured workout
    var workoutDetails =
    {
        "attachmentFileInfos": null,
        "meanMaxCadences": null,
        "meanMaxHeartRates": null,
        "meanMaxPowers": null,
        "meanMaxSpeeds": null,
        "timeInHeartRateZones": null,
        "timeInPowerZones": null,
        "timeInSpeedZones": null,
        "workoutDeviceFileInfos": [],
        "workoutId": 139265979,
        "workoutStructure": {
            "exercises": [
                {
                    "exerciseId": "7796b456-3a36-486f-a7d7-0b77866615fc",
                    "location": 1,
                    "mediaAssetGuids": null,
                    "mediaGroupGuids": null,
                    "notes": "Goal: To improve running mechanics and agility. How to do it: High Knees are done like the old football drills. Pump your legs up and down all the while keeping on the balls of your feet. Your thigh should come up to parallel with the ground. Focus on turnover and form here and not speed. Please see the video on high knees for a visual description.",
                    "sets": [
                        {
                            "instructions": [
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
                                    "planUnits": 20,
                                    "planUnitsSpecified": true,
                                    "planValue": 20.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 7.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 2.0,
                                    "planMaxSpecified": true,
                                    "planMin": 1.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 19,
                                    "planUnitsSpecified": true,
                                    "planValue": 1.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 5.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
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
                                    "planUnits": 20,
                                    "planUnitsSpecified": true,
                                    "planValue": 20.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 7.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 2.0,
                                    "planMaxSpecified": true,
                                    "planMin": 1.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 19,
                                    "planUnitsSpecified": true,
                                    "planValue": 1.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 5.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
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
                                    "planUnits": 20,
                                    "planUnitsSpecified": true,
                                    "planValue": 20.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 7.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 2.0,
                                    "planMaxSpecified": true,
                                    "planMin": 1.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 19,
                                    "planUnitsSpecified": true,
                                    "planValue": 1.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 5.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 600.0,
                                    "planMaxSpecified": true,
                                    "planMin": 600.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 20,
                                    "planUnitsSpecified": true,
                                    "planValue": 20.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 7.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 2.0,
                                    "planMaxSpecified": true,
                                    "planMin": 1.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 19,
                                    "planUnitsSpecified": true,
                                    "planValue": 1.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 5.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        },
                        {
                            "instructions": [
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "Duration",
                                    "planMax": 600.0,
                                    "planMaxSpecified": true,
                                    "planMin": 600.0,
                                    "planMinSpecified": true,
                                    "planNote": null,
                                    "planUnits": 20,
                                    "planUnitsSpecified": true,
                                    "planValue": 20.0,
                                    "planValueSpecified": true,
                                    "type": 1
                                },
                                {
                                    "actualMaxSpecified": false,
                                    "actualMinSpecified": false,
                                    "actualNote": null,
                                    "actualUnitsSpecified": false,
                                    "actualValueSpecified": false,
                                    "isEmpty": false,
                                    "name": "RPE",
                                    "planMaxSpecified": false,
                                    "planMinSpecified": false,
                                    "planNote": null,
                                    "planUnitsSpecified": false,
                                    "planValue": 7.0,
                                    "planValueSpecified": true,
                                    "type": 15
                                }
                            ]
                        }
                    ],
                    "source": "ccbf8eb9-f268-bd6a-e9e6-f0467b72745d",
                    "sourceSpecified": true,
                    "title": "High Knees 5 x 20sec",
                    "type": 0,
                    "workoutTypeID": 3
                }
            ],
            "workoutId": 139265979
        }
    };

    function getSummaryView(workoutType)
    {
        var workoutModel = new WorkoutModel({ workoutId: 1, athleteId: 426489, workoutTypeValueId: workoutType }, { } );
        
        workoutModel.set("details", new TP.Model(workoutDetails));

        return new SummaryView({ model: workoutModel });
    }

    describe("Workout Structure Toggle", function()
    {
        var saveSpy;
        var summaryView;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);

            saveSpy = sinon.spy(WorkoutModel.prototype, "autosave");
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display as 'Intervals' for non-strength workouts.", function()
        {
            summaryView = getSummaryView(WorkoutTypes.typesByName.Run);
            summaryView.render();

            expect(summaryView.$(".workoutStructureToggle").filter(function() { return $(this).css('display') === 'inline'; }).text()).to.contain("Intervals");
        });

        it("Should display as 'Exercises' for strength workouts.", function()
        {
            summaryView = getSummaryView(WorkoutTypes.typesByName.Strength);
            summaryView.render();

            expect(summaryView.$(".workoutStructureToggle").filter(function() { return $(this).css('display') === 'inline'; }).text()).to.contain("Exercises");
        });
    });
});
