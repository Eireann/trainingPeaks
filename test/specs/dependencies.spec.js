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
    "hbs",
    "controllers/calendarController"
],
function (document, window, jquery, Backbone, Marionette, hbs, CalendarController) {
    return describe("Dependencies", function () {

        describe("document", function () {
            it("should be loaded as a module", function () {
                expect(document).toBeDefined();
            });
        });

        describe("window", function () {
            it("should be loaded as a module", function () {
                expect(window).toBeDefined();
            });
        });

        describe("jquery", function () {
            it("should be loaded as a module", function () {
                expect(jquery).toBeDefined();
            });
        });

        describe("backbone", function () {
            it("should be loaded as a module", function () {
                expect(Backbone).toBeDefined();
            });
        });

        describe("marionette", function () {
            it("should be loaded as a module", function () {
                expect(Marionette).toBeDefined();
                expect(Backbone.Marionette).toBeDefined();
            });
        });

        describe("hbs", function () {
            it("should be loaded as a module", function () {
                expect(hbs).toBeDefined();
            });
        });

        describe("CalendarController should load if all of the dependencies load", function () {
            it("should be loaded as a module", function () {
                expect(CalendarController).toBeDefined();
            });
        });

    });

});