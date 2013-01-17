describe("Example jasmine spec", function () {

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Should wrap everything in this outer block, so we can trigger done", function (done) {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        [],
        function () {
            describe("Some Tests", function () 
            {
                it("should do something useful", function () 
                {
                    expect(true).toBe(true);
                });

            });

            // have to call done() after our final test
            done();
        });

    });

});