// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/library/exerciseLibraryView",
    "views/library/exerciseLibraryItemView",
    "views/library/exerciseLibraryAddItemView",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(TP, ExerciseLibraryView, ExerciseLibraryItemView, ExerciseLibraryAddItemView, ExerciseLibraryTemplate)
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
            it("Should have an add item button", function()
            {
                var view = new ExerciseLibraryView();
                view.render();
                expect(view.$("button#add").length).toBe(1);
            });

            it("Should subscribe to add click events", function()
            {
                expect(ExerciseLibraryView.prototype.events["click button#add"]).toBeDefined();
                expect(ExerciseLibraryView.prototype.events["click button#add"]).toBe("addToLibrary");
                expect(typeof ExerciseLibraryView.prototype.addToLibrary).toBe("function");
            });

            it("Should create and render an ExerciseLibraryAddItemView", function()
            {
                var view = new ExerciseLibraryView();
                spyOn(ExerciseLibraryAddItemView.__super__, "render");
                view.addToLibrary();
                expect(ExerciseLibraryAddItemView.__super__.render).toHaveBeenCalled();
            });

        });

    });

});