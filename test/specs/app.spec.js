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

            it("Should have three controllers", function()
            {
                expect(theApp.hasOwnProperty('controllers')).toBeTruthy();
                expect(_.keys(theApp.controllers).length).toEqual(3);
            });

            it("Should have a client events tracker", function()
            {
                expect(theApp.hasOwnProperty('clientEvents')).toBeTruthy();
            });

        });

    });

});