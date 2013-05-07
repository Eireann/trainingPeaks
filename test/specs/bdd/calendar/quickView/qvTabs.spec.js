// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    $,
    testHelpers,
    xhrData,
    theApp)
{

    describe("qvTabs", function()
    {
        var $el, $body;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            $el = theApp.mainRegion.$el;
            testHelpers.setupFakeAjax();
            $body = $("<body>");
            spyOn(theApp, "getBodyElement").andReturn($body);
        });

        // for some reason afterEach is undefined here, 
        // but we can access it via jasmine.getEnv()
        // need to cleanup our mess
        jasmine.getEnv().afterEach(function()
        {
            testHelpers.reset();
        });



    });


});