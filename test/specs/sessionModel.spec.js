describe("Session Model Tests", function ()
{

    it("Calling via requirejs", function (done)
    {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "models/session"
        ],
        function (theSession)
        {
            describe("Session Model ", function ()
            {
                it("should be loaded as a module", function ()
                {
                    expect(theSession).toBeDefined();
                });
            });

            done();
        });

    });
});