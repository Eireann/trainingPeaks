define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    testHelpers,
    xhrData
)
{

    describe("Training Plan Library", function()
    {

        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = testHelpers.theApp.mainRegion.$el;
            testHelpers.theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should have a training plans library icon", function()
        {
            expect($mainRegion.find("#plansLibrary").length).to.equal(1);
        });

        it("Should display the training plans library container after clicking on the library icon", function()
        {
            expect($mainRegion.find(".trainingPlanLibrary").closest(".open")).to.have.length(0);
            $mainRegion.find("#plansLibrary").trigger("click");
            expect($mainRegion.find(".trainingPlanLibrary").closest(".open")).to.have.length(1);
        });

        it("Should request the training plan library data on calendar load", function()
        {
            expect(testHelpers.hasRequest("GET", "plans/v1/plans$")).to.equal(true);
        });

        it("Should resolve the training plan library data request without errors", function()
        {
            var resolvePlans = function()
            {
                testHelpers.resolveRequest("GET", "plans/v1/plans$", xhrData.trainingPlans);
            };
            expect(resolvePlans).to.not.throw();
        });

        describe("Search", function()
        {
            var $mainRegion;
            var $library;
            var $searchBox;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar", true);
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
                expect($searchBox.length).to.equal(1);
            });

            it("Should filter exact matches on key up", function()
            {
                expect($library.find(".trainingPlan").length).to.equal(3);
                $searchBox.val("training plan one");
                $searchBox.trigger("keyup");
                expect($library.find(".trainingPlan").length).to.equal(1);
                var libraryContainerText = $library.text();
                expect(libraryContainerText).to.contain("Training Plan One");
                expect(libraryContainerText).to.not.contain("Training Plan Three");
            });

            it("Should match words or partial words in any order", function()
            {
                expect($library.find(".trainingPlan").length).to.equal(3);
                $searchBox.val("three plan train");
                $searchBox.trigger("keyup");
                expect($library.find(".trainingPlan").length).to.equal(1);
                var libraryContainerText = $library.text();
                expect(libraryContainerText).to.contain("Training Plan Three");
                expect(libraryContainerText).to.not.contain("Training Plan One");
            });

        });

    });


});
