requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/library/trainingPlan",
    "app",
    "TP"
],
function(
    moment,
    testHelpers,
    xhrData,
    TrainingPlan,
    theMarsApp,
    TP)
{

    describe("Apply Training Plan", function()
    {
        var $mainRegion;
        var $body;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theMarsApp.mainRegion.$el;
            $body = theMarsApp.getBodyElement();
            theMarsApp.router.navigate("calendar", true);
            testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            $mainRegion.find("#plansLibrary").trigger("click");
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should drag a training plan from the library", function()
        {
            theMarsApp.controllers.calendarController.libraryCollections = {};
            var trainingPlan = new TrainingPlan({planId: 123});
            theMarsApp.controllers.calendarController.libraryCollections.trainingPlans = new TP.Collection([trainingPlan]);

            spyOn(trainingPlan, "applyToDate").andCallThrough();

            var eventOptions = {
                DropEvent: "addTrainingPlanFromLibrary",
                ItemId: 123,
                destinationCalendarDayModel: {
                    id: '2012-01-01'
                }
            };
            var controller = theMarsApp.currentController;
            controller.onDropItem(eventOptions);

            testHelpers.resolveRequest("GET", "plans/v1/plans/" + trainingPlan.get('planId') + "/details");

            expect(trainingPlan.applyToDate).toHaveBeenCalledWith(eventOptions.destinationCalendarDayModel.id, 1);
        });


    });


});