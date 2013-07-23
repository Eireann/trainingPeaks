requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    moment,
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
                testHelpers.resolveRequest("GET", "plans/v1/athletes/426489/plans$", xhrData.trainingPlans);
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

            it("Should request the tier2 plan details after opening the tomahawk", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect(testHelpers.hasRequest("GET", "plans/v1/athletes/426489/plans/3/details$")).toBe(true);
            });

            it("Should display the tier2 plan details", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Description of a training plan");
                testHelpers.resolveRequest("GET", "plans/v1/athletes/426489/plans/3/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails").text()).toContain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).toContain("Description of a training plan");
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

            it("Should display applied plans", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).toBe(0);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).toBe(0);
                testHelpers.resolveRequest("GET", "plans/v1/athletes/426489/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).toBe(1);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).toBe(1);
            });

            it("Should display applied plan start and end dates", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/athletes/426489/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).toContain("01/02/2013");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).toContain("09/10/2013");
            });

        });

        describe("Apply", function()
        {

            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = theApp.mainRegion.$el;
                $body = theApp.getBodyElement();
                theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/athletes/426489/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a command request when the apply button is clicked", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply")).toBe(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply")).toBe(true);
            });

            it("Should trigger an end on date apply command", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply")).toBe(false);

                var tomorrow = moment().add("days", 1);
                $body.find("#applyDateType").val("end");
                $body.find("#applyDate").val(tomorrow.format("MM/DD/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply/end/" + tomorrow.format("YYYY-MM-DD") + "$")).toBe(true);
            });

            it("Should trigger a start on date apply command", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply")).toBe(false);

                var tomorrow = moment().add("days", 1);
                $body.find("#applyDateType").val("start");
                $body.find("#applyDate").val(tomorrow.format("MM/DD/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply/start/" + tomorrow.format("YYYY-MM-DD") + "$")).toBe(true);
            });

            it("Should trigger an end on event date apply command", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply")).toBe(false);

                var tomorrow = moment().add("days", 1);
                $body.find("#applyDateType").val("endOnEventDate");
                $body.find("#applyDate").val(tomorrow.format("MM/DD/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply/endOnEventDate/" + tomorrow.format("YYYY-MM-DD") + "$")).toBe(true);
            });

            it("Should refresh the plan details after applying the plan", function()
            {
                testHelpers.clearRequests();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply", { startDate: "2010-01-01", endDate: "2014-12-31", appliedPlanId: 11 });
                expect(testHelpers.hasRequest("GET", "plans/v1/athletes/426489/plans/3$")).toBe(true);
                expect(testHelpers.hasRequest("GET", "plans/v1/athletes/426489/plans/3/details$")).toBe(true);
            });

            it("Should refresh the calendar after applying the plan", function()
            {
                testHelpers.clearRequests();
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/426489/workouts")).toBe(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/athletes/426489/plans/3/commands/apply", { startDate: "2010-01-01", endDate: "2014-12-31", appliedPlanId: 11 });
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/426489/workouts")).toBe(true);
            });
        });


    });


});