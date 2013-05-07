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

    describe("open the quick view", function()
    {

        describe("For a new workout", function()
        {
            var $el;

            beforeEach(function()
            {
                testHelpers.startTheApp();
                $el = theApp.mainRegion.$el;
                testHelpers.setupFakeAjax();
            });

            // for some reason afterEach is undefined here, 
            // but we can access it via jasmine.getEnv()
            // need to cleanup our mess
            jasmine.getEnv().afterEach(function()
            {
                testHelpers.reset();
            });


            xit("Clicking on a day should bring up the add workout view", function()
            {
                theApp.router.navigate("calendar", true);
                spyOn(theApp.getBodyElement(), "append").andCallThrough();
                expect(theApp.isBlurred).toBe(false);
                $el.find(".day.today").trigger("click");
                expect(theApp.getBodyElement().append).toHaveBeenCalled();
                expect(theApp.getBodyElement().find(".newItemView").length).toBe(1);
            });

        });

    });


});