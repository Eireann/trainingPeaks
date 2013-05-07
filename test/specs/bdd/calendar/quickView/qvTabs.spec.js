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

    describe("Quick View", function()
    {

        describe("heart rate tab", function()
        {

            // start the app
            testHelpers.startTheApp();
            testHelpers.setupFakeAjax();
            testHelpers.submitLogin(xhrData.users.barbkprem);
            theApp.router.navigate("calendar", true);
            var $el = theApp.mainRegion.$el;
            var $body = theApp.getBodyElement();

            // open the qv
            $el.find(".day.today").trigger("click");
            theApp.getBodyElement().find("button[data-workoutid=3]").trigger("click"); // 3=run

            //var $el;
            //beforeEach(function()
            //{
            /*
                testHelpers.startTheApp();
                testHelpers.setupFakeAjax();
                testHelpers.submitLogin(xhrData.users.barbkprem);
                theApp.router.navigate("calendar", true);
                */
            //});

            // for some reason afterEach is undefined here, 
            // but we can access it via jasmine.getEnv()
            // need to cleanup our mess
            /*jasmine.getEnv().afterEach(function()
            {
                testHelpers.reset();
            });*/

            it("Should open the heart rate tab", function()
            {
                $body.find(".heartrateTab").trigger("click");
                expect($body.find("#quickViewHRTab").is(":visible")).toBe(true);
            });
        });

    });


});