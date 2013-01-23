describe("Backbone/Marionette Dependencies", function()
{

    it("Should be able to load a full Backbone/Marionette environment in node.js", function(done)
    {

        /**
        Test to make sure we can load all of the dependencies we need for backbone and marionette,
        for use in a node.js environment
        */
        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "document",
            "window",
            "jquery",
            "localStorage",
            "backbone",
            "backbone.marionette",
            "Backbone.Marionette.Handlebars",
            "i18nprecompile",
            "json2",
            "hbs"
        ],
        function(document, window, jquery, localStorage, Backbone, Marionette, MarionetteHandlebars, precompile, json2, hbs)
        {
            describe("Dependencies", function()
            {

                it("Should fail on purpose", function () {
                    expect(false).toBe(true);
                });

                describe("document", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(document).toBeDefined();
                    });
                });

                describe("window", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(window).toBeDefined();
                    });
                });

                describe("jquery", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(jquery).toBeDefined();
                    });
                });

                describe("backbone", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(Backbone).toBeDefined();
                    });
                });

                describe("marionette", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(Marionette).toBeDefined();
                        expect(Backbone.Marionette).toBeDefined();
                    });
                });

                describe("MarionetteHandlebars", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(MarionetteHandlebars).toBeDefined();
                    });
                });

                describe("hbs", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(hbs).toBeDefined();
                    });
                });

                describe("precompile", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(precompile).toBeDefined();
                    });
                });

                describe("json2", function()
                {
                    it("should be loaded as a module", function()
                    {
                        expect(json2).toBeDefined();
                    });
                });

                describe("localStorage", function()
                {
                    it("Should be defined", function()
                    {
                        expect(localStorage).toBeDefined();
                    });

                    it("Should have a setItem", function()
                    {
                        expect(typeof localStorage.setItem).toBe("function");
                    });

                    it("Should have a getItem", function()
                    {
                        expect(typeof localStorage.getItem).toBe("function");
                    });

                    it("Should get and set a key", function()
                    {
                        var theValue = "I AM THE VALUE";
                        var theKey = "I AM THE KEY";
                        localStorage.setItem(theKey, theValue);
                        expect(localStorage.getItem(theKey)).toBe(theValue);
                    });

                    it("Should have a removeItem", function()
                    {
                        expect(typeof localStorage.removeItem).toBe("function");
                    });

                    it("Should remove an item", function()
                    {
                        var myKey = "My Key";
                        localStorage.setItem(myKey, "My Value");
                        localStorage.removeItem(myKey);
                        expect(localStorage.getItem(myKey)).toBeNull();
                    });

                    it("Should return null for undefined key", function()
                    {
                        expect(localStorage.getItem("some useless key")).toBeNull();
                    });
                });
            });

            done();
        });

    });

});