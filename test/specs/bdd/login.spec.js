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

    describe("Login", function()
    {

        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            $mainRegion = theApp.mainRegion.$el;
            theApp.router.navigate("login", { trigger: true });
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should have a login form", function()
        {
            var loginForm = $mainRegion.find("#loginForm");
            expect(loginForm.length).toBe(1);
        });

        it("Should have a submit button", function()
        {
            var submitButton = $mainRegion.find("#loginForm input[name=Submit]");
            expect(submitButton.length).toBe(1);
        });

        it("Should have a username input", function()
        {
            expect($mainRegion.find("#loginForm #username").length).toBe(1);
        });

        it("Should respond to a click on the submit button", function()
        {
            spyOn(theApp.session, "authenticate");
            var submitButton = $mainRegion.find("#loginForm input[name=Submit]");
            submitButton.trigger("click");
            expect(theApp.session.authenticate).toHaveBeenCalled();
        });

        it("Should request user data after resolving the login", function()
        {
            var submitButton = $mainRegion.find("#loginForm input[name=Submit]");
            submitButton.trigger("click");
            expect(testHelpers.hasRequest("POST", "Token")).toBe(true);
            testHelpers.resolveRequest("POST", "Token", { token: 'someToken' });
            expect(testHelpers.hasRequest("GET", "users/v1/user")).toBe(true);
        });

        it("Should request athlete settings after loading the user", function()
        {

            // should not request until after user request is resolved
            var testUser = xhrData.users.barbkprem;
            testHelpers.submitLogin(testUser);
            var athleteSettingsUrl = "fitness/v1/athletes/" + testUser.athletes[0].athleteId + "/settings";
            //expect(testHelpers.hasRequest("GET", athleteSettingsUrl)).toBeTruthy();
        });
    });


});