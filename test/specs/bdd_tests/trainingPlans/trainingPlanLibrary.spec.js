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

    describe("Training Plan Library", function()
    {

        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theApp.mainRegion.$el;
            theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should have a training plans library icon", function()
        {
            expect($mainRegion.find("#plansLibrary").length).toBe(1);
        });

        it("Should have a training plans library container", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary").length).toBe(1);
        });

        it("Should display the training plans library container after clicking on the library icon", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary").is(":visible")).toBe(false);
            $mainRegion.find("#plansLibrary").trigger("click");
            expect($mainRegion.find(".trainingPlanLibrary").is(":visible")).toBe(true);
        });

        it("Should request the training plan library data on calendar load", function()
        {
            expect(testHelpers.hasRequest("GET", "plans/v1/plans$")).toBe(true);
        });

        it("Should resolve the training plan library data request without errors", function()
        {
            var resolvePlans = function()
            {
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            };
            expect(resolvePlans).not.toThrow();
        });

        it("Should display the training plans", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan").length).toBe(0);
            testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan").length).toBe(3);
        });

        it("Should make the plans accessible by plan id", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").length).toBe(0);
            testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").length).toBe(1);
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").length).toBe(1);
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").length).toBe(1);
        });

        it("Should display the training plan titles", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary").text()).not.toContain("Training Plan One");
            testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            var libraryContainerText = $mainRegion.find(".trainingPlanLibrary").text();
            expect(libraryContainerText).toContain("Training Plan One");
            expect(libraryContainerText).toContain("Training Plan Two");
            expect(libraryContainerText).toContain("Training Plan Three");
        });

        it("Should display the training plan status", function()
        {
            testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=1]").text()).toContain("Applied");
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=2]").text()).toContain("Available");
            expect($mainRegion.find(".trainingPlanLibrary .trainingPlan[data-trainingplanid=3]").text()).toContain("Purchased");
        });

        describe("Search", function()
        {

            var $mainRegion;
            var $library;
            var $searchBox;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = theApp.mainRegion.$el;
                theApp.router.navigate("calendar", true);
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
                $mainRegion.find("#plansLibrary").trigger("click");
                $library = $mainRegion.find(".trainingPlanLibrary");
                $searchBox = $library.find("#search");
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have a search box", function()
            {
                expect($searchBox.length).toBe(1);
            });

            it("Should filter exact matches on key up", function()
            {
                expect($library.find(".trainingPlan").length).toBe(3);
                $searchBox.val("training plan one");
                $searchBox.trigger("keyup");
                expect($library.find(".trainingPlan").length).toBe(1);
                var libraryContainerText = $library.text();
                expect(libraryContainerText).toContain("Training Plan One");
                expect(libraryContainerText).not.toContain("Training Plan Three");
            });

            it("Should match words or partial words in any order", function()
            {
                expect($library.find(".trainingPlan").length).toBe(3);
                $searchBox.val("three plan train");
                $searchBox.trigger("keyup");
                expect($library.find(".trainingPlan").length).toBe(1);
                var libraryContainerText = $library.text();
                expect(libraryContainerText).toContain("Training Plan Three");
                expect(libraryContainerText).not.toContain("Training Plan One");
            });

        });

    });


});