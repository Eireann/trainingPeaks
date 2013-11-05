define(
[
    "underscore",
    "testUtils/testHelpers"
],
function( _, testHelpers )
{
    describe("The Mars App", function()
    {

        var theApp = testHelpers.theApp;

        it("Should exist globally", function()
        {
            var globalNamespace = typeof window !== 'undefined' ? window : jasmine.getGlobal();
            expect(_.keys(globalNamespace)).to.contain('theMarsApp');
        });

        describe("App Initializers", function()
        {
            theApp.start();

            it("Should have a session", function()
            {
                expect(theApp.hasOwnProperty('session')).to.be.ok;
            });

            it("Should have a logger", function()
            {
                expect(theApp.hasOwnProperty('logger')).to.be.ok;
            });

            it("Should have a navigation controller", function()
            {
                expect(theApp.controllers.navigationController).to.not.be.undefined;
            });
 
            it("Should have a calendar controller", function()
            {
                expect(theApp.controllers.calendarController).to.not.be.undefined;
            });

            xit("Should have a home controller", function()
            {
                expect(theApp.controllers.homeController).to.not.be.undefined;
            });

            it("Should have a dashboard controller", function()
            {
                expect(theApp.controllers.dashboardController).to.not.be.undefined;
            });

            it("Should have a client events tracker", function()
            {
                expect(theApp.hasOwnProperty('clientEvents')).to.be.ok;
            });

        });

    });

});
