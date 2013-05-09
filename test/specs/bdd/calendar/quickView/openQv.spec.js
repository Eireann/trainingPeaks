// use requirejs() here, not define(), for jasmine compatibility
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

    xdescribe("open the quick view", function()
    {

        describe("For a new workout", function()
        {
            var $el;

            //beforeEach(function()
            //{
                testHelpers.startTheApp();
                $el = theApp.mainRegion.$el;
                testHelpers.setupFakeAjax();
                testHelpers.submitLogin(xhrData.users.barbkprem);
                theApp.router.navigate("calendar", true);
            //});

            // for some reason afterEach is undefined here, 
            // but we can access it via jasmine.getEnv()
            // need to cleanup our mess
            /*jasmine.getEnv().afterEach(function()
            {
                testHelpers.reset();
            });*/

            it("Clicking on a day should bring up the add workout view", function()
            {
                expect(theApp.getBodyElement().find(".newItemView").length).toBe(0);
                $el.find(".day.today").trigger("click");
                expect(theApp.getBodyElement().find(".newItemView").length).toBe(1);
            });

            it("Clicking on run should bring up the quick view", function()
            {
                expect(theApp.getBodyElement().find(".workoutQuickView").length).toBe(0);
                expect(theApp.getBodyElement().find("button[data-workoutid=3]").length).toBe(1);
                theApp.getBodyElement().find("button[data-workoutid=3]").trigger("click"); // 3=run
                expect(theApp.getBodyElement().find(".workoutQuickView").length).toBe(1);
            });
        });

    });


});