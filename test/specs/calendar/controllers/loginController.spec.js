// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "app",
    "controllers/loginController"
],
function (_, theApp, LoginController)
{

    describe("The Login Controller", function ()
    {

        var triggerSpy;

        beforeEach(function ()
        {
            triggerSpy = jasmine.createSpyObj("Trigger spy", ["trigger"]);
        });

        it("Should trigger an event login success", function ()
        {
            LoginController.prototype.onLoginSuccess.call(triggerSpy);
            expect(triggerSpy.trigger).toHaveBeenCalledWith("login:success");
        });

        it("Should log a client event on login success", function ()
        {
            spyOn(theApp.clientEvents, "logEvent");
            LoginController.prototype.onLoginSuccess.call(triggerSpy);
            expect(theApp.clientEvents.logEvent).toHaveBeenCalledWith({ Event: { Type: "Login", Label: "Login", AppContext: "Login" } });
        });

        // can't test this because the window refresh breaks jasmine.html test runner,
        // and we can't spy on native window functions 
        xit("Should attempt to navigate and reload on logout", function()
        {
            spyOn(theApp.router, "navigate");
            spyOn(window.location, "reload");
            LoginController.prototype.onLogout.call();
            expect(theApp.router.navigate).toHaveBeenCalledWith("login");
        });
    });
});