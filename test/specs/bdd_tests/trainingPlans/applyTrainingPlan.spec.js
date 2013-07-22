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


        describe("Tomahawk", function()
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

            it("Should display plan title and status", function()
            {
                // click on a plan
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");

                // tomahawk opens
                expect($body.find(".trainingPlanDetails").text()).toContain("Training Plan One");
                expect($body.find(".trainingPlanDetails").text()).toContain("Applied");
            });

            it("Should not have an apply button if it was not purchased", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Apply");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Apply");
            });

            it("Should have an apply button if it was purchased", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).toContain("Apply");
                expect($body.find(".trainingPlanDetails .apply").length).toBe(1);
            });

        });

        describe("Tomahawk", function()
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
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a command request when the apply button is clicked", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/commands/apply/3")).toBe(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/commands/apply/3")).toBe(true);
            });

            it("Should display a confirmation after applying the plan", function()
            {
                testHelpers.clearRequests();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/athletes/426489/commands/apply/3", null);
                expect("FIX ME").toBe(true);
            });

            it("Should refresh the plan library after applying the plan", function()
            {
                testHelpers.clearRequests();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/athletes/426489/commands/apply/3", null);
                expect(testHelpers.hasRequest("GET", "^plans/v1/athletes/426489$")).toBe(true);
            });

            it("Should refresh the calendar after applying the plan", function()
            {
                testHelpers.clearRequests();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/athletes/426489/commands/apply/3", null);
                expect("FIX ME").toBe(true);
            });
        });


    });


});