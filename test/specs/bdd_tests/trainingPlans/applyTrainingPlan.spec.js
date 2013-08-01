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
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
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

            });

            it("Should request the tier2 plan details after opening the tomahawk", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect(testHelpers.hasRequest("GET", "plans/v1/plans/3/details$")).toBe(true);
            });

            it("Should display the tier2 plan details", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).not.toContain("Description of a training plan");
                testHelpers.resolveRequest("GET", "plans/v1/plans/3/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails").text()).toContain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).toContain("Description of a training plan");
            });

            it("Should not have an apply button if it was not purchased", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).toBe(0);
            });

            it("Should have an apply button if it was already applied", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).toBe(1);
            });

            it("Should have an apply button if it was purchased", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/3/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).toBe(1);
            });

            it("Should display applied plans", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).toBe(0);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).toBe(0);
                testHelpers.resolveRequest("GET", "plans/v1/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).toBe(1);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).toBe(1);
            });

            it("Should display applied plan start and end dates", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).toContain("1/2/2013");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).toContain("9/10/2013");
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
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", xhrData.trainingPlanDetails);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a command request when the apply button is clicked", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);
            });

            it("Should trigger an end on date apply command, ending on any day", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var wednesday = moment().day(3);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDate").val(wednesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(3);
                expect(applyRequest.model.attributes.targetDate).toBe(wednesday.format("M/D/YYYY"));
            });

            it("Should trigger a start on date apply command, starting on any day", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var tuesday = moment().day(2);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(1);
                expect(applyRequest.model.attributes.targetDate).toBe(tuesday.format("M/D/YYYY"));
            });

            it("Should trigger an end on event date apply command, ending on the event date", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var tomorrow = moment().add("days", 1);
                $body.find("#applyDateType").val("2");
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(2);
                expect(applyRequest.model.attributes.targetDate).toBe(moment(xhrData.trainingPlanDetails.eventDate).format("M/D/YYYY"));
            });

            it("Should refresh the plan after applying the plan", function()
            {
                testHelpers.clearRequests();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/commands/applyplan", { startDate: "2010-01-01", endDate: "2014-12-31", appliedPlanId: 11 });
                expect(testHelpers.hasRequest("GET", "plans/v1/plans/1$")).toBe(true);
            });

            it("Should refresh the calendar after applying the plan", function()
            {
                testHelpers.clearRequests();
                expect(testHelpers.hasRequest("GET", "fitness/v1/workouts")).toBe(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/commands/applyplan", { startDate: "2010-01-01", endDate: "2014-12-31", appliedPlanId: 11 });
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/426489/workouts")).toBe(true);
            });
        });


        describe("Restrict to week start / end dates", function()
        {
            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = theApp.mainRegion.$el;
                $body = theApp.getBodyElement();
                theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");


                var trainingPlanRestrictedToWeekDates = _.extend({}, xhrData.trainingPlanDetails, { hasWeeklyGoals: true });

                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", trainingPlanRestrictedToWeekDates);

            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a start on date apply command, starting on a monday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var thursday = moment().day(4);
                var monday = moment().day(1);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDate").val(thursday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(1);
                expect(applyRequest.model.attributes.targetDate).toBe(monday.format("M/D/YYYY"));
            });

            it("Should trigger an end on date apply command, ending on a sunday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var sunday = moment().day(0);
                if(sunday.format("YYYY-MM-DD") < moment().format("YYYY-MM-DD"))
                {
                    sunday.add("weeks", 1);
                }
                var tuesday = moment().day(2);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(3);
                expect(applyRequest.model.attributes.targetDate).toBe(sunday.format("M/D/YYYY"));
            });

        });

        describe("Restrict to plan start / end week days", function()
        {
            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = theApp.mainRegion.$el;
                $body = theApp.getBodyElement();
                theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");


                var trainingPlanRestrictedToWeekDates = _.extend({}, xhrData.trainingPlanDetails, { hasWeeklyGoals: true });
                trainingPlanRestrictedToWeekDates.startDate = moment().day(5).format("YYYY-MM-DD");
                trainingPlanRestrictedToWeekDates.endDate = moment().add("weeks", 12).day(4).format("YYYY-MM-DD");

                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", trainingPlanRestrictedToWeekDates);

            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a start on date apply command, starting on a friday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var thursday = moment().day(4);
                var friday = moment().day(5);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDate").val(thursday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(1);
                expect(applyRequest.model.attributes.targetDate).toBe(friday.format("M/D/YYYY"));
            });

            it("Should trigger an end on date apply command, ending on a thursday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(false);

                var thursday = moment().day(4);
                var tuesday = moment().day(2);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).toBe(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(applyRequest.model.attributes.athleteId).toBe(xhrData.users.barbkprem.userId);
                expect(applyRequest.model.attributes.planId).toBe(1);
                expect(applyRequest.model.attributes.startType).toBe(3);
                expect(applyRequest.model.attributes.targetDate).toBe(thursday.format("M/D/YYYY"));
            });

        });
    });


});