/*

Testing some specific dependencies for CalendarDayView 
to see if our Marionette, Handlebars, hbs, and templates will load
shouldn't need to do this for any other views/controllers, 
this is just a sanity check to see if our test environment requirejs is working right
*/

// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "hbs",
    "hbs!templates/views/calendarDay"
],
function (Marionette, MarionetteHandlebars, hbs, CalendarDayTemplate) {
    return describe("Dependencies", function () {

        describe("Marionette", function () {
            it("should be loaded as a module", function () {
                expect(Marionette).toBeDefined();
            });
        });

        describe("MarionetteHandlebars", function () {
            it("should be loaded as a module", function () {
                expect(MarionetteHandlebars).toBeDefined();
            });
        });

        describe("hbs", function () {
            it("should be loaded as a module", function () {
                expect(hbs).toBeDefined();
            });
        });

        describe("CalendarDayTemplate", function () {
            it("should be loaded as a template", function () {
                expect(CalendarDayTemplate).toBeDefined();
            });
            it("should not die quietly", function () {
                expect(false).toBe(true);
            });
        });
    });

});