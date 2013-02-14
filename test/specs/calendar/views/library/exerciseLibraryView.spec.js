// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/library/exerciseLibraryView",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(ExerciseLibraryView, ExerciseLibraryTemplate)
{

    describe("ExerciseLibraryView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(ExerciseLibraryView).toBeDefined();
        });

        it("Should instantiate", function()
        {
            var newLibrary = function()
            {
                var view = new ExerciseLibraryView();
            };
            expect(newLibrary).not.toThrow();
        });

        it("Should render", function()
        {
            var view = new ExerciseLibraryView();
            view.render();
            expect(view.$el).toBeDefined();
        });

    });

});