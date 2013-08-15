// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/calendar/library/exerciseLibraryView",
    "views/calendar/library/exerciseLibraryItemView",
    "views/calendar/library/exerciseLibraryAddItemView",
    "hbs!templates/views/calendar/library/exerciseLibraryView"
],
function(TP, ExerciseLibraryView, ExerciseLibraryItemView, ExerciseLibraryAddItemView, ExerciseLibraryTemplate)
{

    describe("ExerciseLibraryView ", function()
    {
        it("Should be loaded as a module", function()
        {
            expect(ExerciseLibraryView).toBeDefined();
        });

        describe("getItemView", function()
        {
            it("Should return TP.ItemView if no item is passed", function()
            {
                expect(ExerciseLibraryView.prototype.getItemView()).toBe(TP.ItemView);
            });

            it("Should return ExerciseLibraryItemView if item is passed", function()
            {
                expect(ExerciseLibraryView.prototype.getItemView({})).toBe(ExerciseLibraryItemView);
            });
        });

        describe("add item", function()
        {
            it("Should subscribe to add click events", function()
            {
                expect(ExerciseLibraryView.prototype.events["click button#add"]).toBeDefined();
                expect(ExerciseLibraryView.prototype.events["click button#add"]).toBe("addToLibrary");
                expect(typeof ExerciseLibraryView.prototype.addToLibrary).toBe("function");
            });

        });

    });

});
