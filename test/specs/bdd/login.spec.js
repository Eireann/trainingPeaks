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

        it("Should have a username input", function()
        {
            theApp.router.navigate("login", true);
            expect($el.find("#username")).toBeDefined();
            expect($el.find("#username").length).toBe(1);
        });

        it("Should respond to a click on the input button", function()
        {
            spyOn(theApp.session, "authenticate");
            theApp.router.navigate("login", true);
            var submitButton = $el.find("input[name=Submit]");
            expect(submitButton.length).toBe(1);
            submitButton.trigger("click");
            expect(theApp.session.authenticate).toHaveBeenCalled();
        });

        it("Should request user data after resolving the login", function()
        {
            theApp.router.navigate("login", true);
            var submitButton = $el.find("input[name=Submit]");

            submitButton.trigger("click");
            expect(testHelpers.hasRequest("POST", "Token")).toBe(true);

            testHelpers.resolveRequest("POST", "Token", { token: 'someToken' });
            expect(testHelpers.hasRequest("GET", "users/v1/user")).toBe(true);
        });

    });


});