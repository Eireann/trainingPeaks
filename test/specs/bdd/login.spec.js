// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "app"
],
function(
    testHelpers,
    theApp)
{

    describe("Login", function()
    {
        testHelpers.startTheApp();
        var $el = theApp.mainRegion.$el;

        beforeEach(function()
        {
            testHelpers.setupFakeAjax();
        });

        /*afterEach not defined in this version of jasmine?
        afterEach(function()
        {
            testHelpers.removeFakeAjax();
        });
        */

        it("Should have a username input", function()
        {
            theApp.router.navigate("login", true);
            //console.log($el.html());
            expect($el.find("#username")).toBeDefined();
            expect($el.find("#username").length).toBe(1);
        });

        it("Should respond to a click on the input button", function()
        {
            spyOn(theApp.session, "authenticate").andCallThrough();
            var submitButton = $el.find("input[name=Submit]");
            expect(submitButton.length).toBe(1);
            submitButton.trigger("click");
            expect(theApp.session.authenticate).toHaveBeenCalled();

            testHelpers.resolveRequest("Token", { token: 'someToken' });
        });

    });


});