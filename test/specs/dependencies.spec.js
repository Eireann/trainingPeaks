describe("Backbone/Marionette Dependencies", function () 
{

    it("Should be able to load a full Backbone/Marionette environment in node.js", function (done) 
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
            "backbone",
            "backbone.marionette",
            "Backbone.Marionette.Handlebars",
            "i18nprecompile",
            "json2",
            "hbs"
        ],
        function (document, window, jquery, Backbone, Marionette, MarionetteHandlebars, precompile, json2, hbs) 
        {
            describe("Dependencies", function () 
            {

                describe("document", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(document).toBeDefined();
                    });
                });

                describe("window", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(window).toBeDefined();
                    });
                });

                describe("jquery", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(jquery).toBeDefined();
                    });
                });

                describe("backbone", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(Backbone).toBeDefined();
                    });
                });

                describe("marionette", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(Marionette).toBeDefined();
                        expect(Backbone.Marionette).toBeDefined();
                    });
                });

                describe("MarionetteHandlebars", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(MarionetteHandlebars).toBeDefined();
                    });
                });

                describe("hbs", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(hbs).toBeDefined();
                    });
                });

                describe("precompile", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(precompile).toBeDefined();
                    });
                });

                describe("json2", function () 
                {
                    it("should be loaded as a module", function () 
                    {
                        expect(json2).toBeDefined();
                    });
                });
            });

            done();
        });

    });

});