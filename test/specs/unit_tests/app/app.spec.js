// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "app"
],
function( _, theApp)
{
    
    describe("The Mars App", function()
    {

        it("Should exist globally", function()
        {
            var globalNamespace = typeof window !== 'undefined' ? window : jasmine.getGlobal();
            expect(_.keys(globalNamespace)).toContain('theMarsApp');
        });

        describe("App Initializers", function()
        {

            theApp.start();

            it("Should have a session", function()
            {
                expect(theApp.hasOwnProperty('session')).toBeTruthy();
            });

            it("Should have a logger", function()
            {
                expect(theApp.hasOwnProperty('logger')).toBeTruthy();
            });

            it("Should have a login controller", function()
            {
                expect(theApp.controllers.loginController).toBeDefined();
            });

            it("Should have a navigation controller", function()
            {
                expect(theApp.controllers.navigationController).toBeDefined();
            });
 
            it("Should have a calendar controller", function()
            {
                expect(theApp.controllers.calendarController).toBeDefined();
            });

            xit("Should have a home controller", function()
            {
                expect(theApp.controllers.homeController).toBeDefined();
            });

            it("Should have a dashboard controller", function()
            {
                expect(theApp.controllers.dashboardController).toBeDefined();
            });

            it("Should have a client events tracker", function()
            {
                expect(theApp.hasOwnProperty('clientEvents')).toBeTruthy();
            });

        });

    });

});
