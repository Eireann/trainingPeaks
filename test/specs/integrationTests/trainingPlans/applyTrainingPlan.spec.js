define(
[
    "underscore",
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    _,
    moment,
    testHelpers,
    xhrData
)
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
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
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
                expect($body.find(".modal").length).to.equal(0);
                expect($body.find(".trainingPlanDetails").length).to.equal(0);

                // click on a plan
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");

                // tomahawk opens
                expect($body.find(".modal").length).to.equal(1);
                expect($body.find(".trainingPlanDetails").length).to.equal(1);

            });

            it("Should display plan title and status", function()
            {
                // click on a plan
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");

                // tomahawk opens
                expect($body.find(".trainingPlanDetails").text()).to.contain("Training Plan One");

            });

            it("Should request the tier2 plan details after opening the tomahawk", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect(testHelpers.hasRequest("GET", "plans/v1/plans/3/details$")).to.equal(true);
            });

            it("Should display the tier2 plan details", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails").text()).to.not.contain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).to.not.contain("Description of a training plan");
                testHelpers.resolveRequest("GET", "plans/v1/plans/3/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails").text()).to.contain("Some Guy");
                expect($body.find(".trainingPlanDetails").text()).to.contain("Description of a training plan");
            });

            it("Should not have an apply button if it has no workouts", function()
            {
                var planDetails = _.clone(xhrData.trainingPlanDetails);
                planDetails.workoutCount = 0;
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/3/details$", planDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).to.equal(0);
            });

            it("Should have an apply button if it was not already applied", function()
            {
                var planDetails = _.clone(xhrData.trainingPlanDetails);
                planDetails.planApplications = null;
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", planDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).to.equal(1);
            });

            it("Should have an apply button if it was already applied", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).to.equal(1);
            });

            it("Should have an apply button if it was purchased", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/3/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails button.apply").length).to.equal(1);
            });

            it("Should display applied plans", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).to.equal(0);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).to.equal(0);
                testHelpers.resolveRequest("GET", "plans/v1/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").length).to.equal(1);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=22]").length).to.equal(1);
            });

            it("Should display applied plan start and end dates", function()
            {
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").trigger("mouseup");
                testHelpers.resolveRequest("GET", "plans/v1/plans/2/details$", xhrData.trainingPlanDetails);
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).to.contain("1/2/2013");
                expect($body.find(".trainingPlanDetails [data-appliedplanid=21]").text()).to.contain("9/10/2013");
            });

        });

        describe("Apply", function()
        {

            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
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
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);
            });

            it("Should trigger an end on date apply command, ending on any day", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var wednesday = moment.local().day(3);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDate").val(wednesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(3);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(wednesday.format("YYYY-MM-DD"));
            });

            it("Should trigger a start on date apply command, starting on any day", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var tuesday = moment.local().day(2);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(tuesday.format("YYYY-MM-DD"));
            });

            it("Should trigger an end on event date apply command, ending on the event date", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var tomorrow = moment.local().add("days", 1);
                $body.find("#applyDateType").val("2");
                $body.find("#applyDateType").trigger("change");

                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(2);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(moment(xhrData.trainingPlanDetails.eventDate).format("YYYY-MM-DD"));
            });

            it("Should refresh the calendar after applying the plan", function()
            {
                testHelpers.clearRequests();
                expect(testHelpers.hasRequest("GET", "fitness/v1/workouts")).to.equal(false);
                $body.find(".trainingPlanDetails .apply").trigger("click");
                testHelpers.resolveRequest(null, "plans/v1/commands/applyplan", { startDate: "2010-01-01", endDate: "2014-12-31", appliedPlanId: 11 });
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/426489/workouts")).to.equal(true);
            });
        });


        describe("Restrict to week start / end dates", function()
        {
            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
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
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);
                var thursday = moment.local().day(4);
                var monday = moment.local().day(1);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDateType").change();

                $body.find("#applyDate").val(thursday.format("M/D/YYYY"));
                $body.find("#applyDate").change();

                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(monday.format("YYYY-MM-DD"));
            });

            it("Should trigger an end on date apply command, ending on a sunday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var sunday = moment.local().day(0);
                if(sunday.format("YYYY-MM-DD") < moment.local().format("YYYY-MM-DD"))
                {
                    sunday.add("weeks", 1);
                }
                var tuesday = moment.local().day(2);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDateType").change();
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find("#applyDate").change();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(3);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(sunday.format("YYYY-MM-DD"));
            });

        });

        describe("Restrict to plan start / end week days", function()
        {
            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");


                var trainingPlanRestrictedToWeekDates = _.extend({}, xhrData.trainingPlanDetails, { hasWeeklyGoals: true });
                trainingPlanRestrictedToWeekDates.startDate = moment.local().day(5).format("YYYY-MM-DD");
                trainingPlanRestrictedToWeekDates.endDate = moment.local().add("weeks", 12).day(4).format("YYYY-MM-DD");

                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", trainingPlanRestrictedToWeekDates);

            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a start on date apply command, starting on a friday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var thursday = moment.local().day(4);
                var friday = moment.local().day(5);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDateType").change();
                $body.find("#applyDate").val(thursday.format("M/D/YYYY"));
                $body.find("#applyDate").change();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(friday.format("YYYY-MM-DD"));
            });

            it("Should trigger an end on date apply command, ending on a thursday", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var thursday = moment.local().day(4);
                if(thursday.format("YYYY-MM-DD") < moment.local().format("YYYY-MM-DD"))
                {
                    thursday.add("weeks", 1);
                }
                var tuesday = moment.local().day(2);
                $body.find("#applyDateType").val("3");
                $body.find("#applyDateType").change();
                $body.find("#applyDate").val(tuesday.format("M/D/YYYY"));
                $body.find("#applyDate").change();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(3);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal(thursday.format("YYYY-MM-DD"));
            });

        });

        describe("Restrict to specific plan start date", function()
        {
            var $mainRegion;
            var $body;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").trigger("mouseup");


                var trainingPlanRestrictedToStartDate = _.extend({}, xhrData.trainingPlanDetails, { isDynamic: true, startDate: "2013-09-03" });

                testHelpers.resolveRequest("GET", "plans/v1/plans/1/details$", trainingPlanRestrictedToStartDate);

            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should trigger a start on date apply command, starting on 2013-09-03", function()
            {
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(false);

                var thursday = moment.local().day(4);
                var friday = moment.local().day(5);
                $body.find("#applyDateType").val("1");
                $body.find("#applyDateType").change();
                $body.find("#applyDate").val(thursday.format("M/D/YYYY"));
                $body.find("#applyDate").change();
                $body.find(".trainingPlanDetails .apply").trigger("click");
                expect(testHelpers.hasRequest(null, "plans/v1/commands/applyplan")).to.equal(true);

                var applyRequest = testHelpers.findRequest(null, "plans/v1/commands/applyplan");
                expect(JSON.parse(applyRequest.requestBody).athleteId).to.equal(xhrData.users.barbkprem.userId);
                expect(JSON.parse(applyRequest.requestBody).planId).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).startType).to.equal(1);
                expect(JSON.parse(applyRequest.requestBody).targetDate).to.equal("2013-09-03");
            });
        });
    });


});
