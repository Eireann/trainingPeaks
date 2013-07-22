requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    testHelpers,
    xhrData,
    theApp)
{

    describe("Apply Training Plan", function()
    {

        var $mainRegion;
        var $body;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theApp.mainRegion.$el;
            $body = theApp.getBodyElement();
            theApp.router.navigate("calendar", true);
            testHelpers.resolveRequest("GET", "plans/v1/athletes/426489", xhrData.trainingPlans);
            $mainRegion.find("#plansLibrary").trigger("click");
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display a modal training plan details tomahawk", function()
        {
            // no modal view or plan details yet
            expect($body.find(".modal").length).toBe(0);
            expect($body.find(".trainingPlanDetails").length).toBe(0);

            // click on a plan
            $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");

            // tomahawk opens
            expect($body.find(".modal").length).toBe(1);
            expect($body.find(".trainingPlanDetails").length).toBe(1);

        });

        describe("Training plan tomahawk", function()
        {
            it("Should display plan title and status", function()
            {
                // click on a plan
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");

                // tomahawk opens
                expect($body.find(".trainingPlanDetails").text()).toContain("Training Plan One");
                expect($body.find(".trainingPlanDetails").text()).toContain("Applied");
            });
        });

    });


});