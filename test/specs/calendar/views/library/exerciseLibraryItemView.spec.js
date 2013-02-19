// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/library/exerciseLibraryItemView"
],
function(ExerciseLibraryItemView)
{

    describe("ExerciseLibraryItemView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(ExerciseLibraryItemView).toBeDefined();
        });

        describe("Make draggable", function()
        {

            var viewSpy;

            beforeEach(function()
            {
                viewSpy = jasmine.createSpyObj("View spy", ["makeDraggable"]);
                viewSpy.$el = jasmine.createSpyObj("$el spy", ["data", "draggable"]);
                viewSpy.model = {
                    id: 12345,
                    webAPIModelName: 'FakeModel'
                };
            });

            it("Should be called from onRender", function()
            {
                ExerciseLibraryItemView.prototype.onRender.call(viewSpy);
                expect(viewSpy.makeDraggable).toHaveBeenCalled();
            });

            it("Should add appropriate attributes to $el", function()
            {
                ExerciseLibraryItemView.prototype.makeDraggable.call(viewSpy);
                expect(viewSpy.$el.data).toHaveBeenCalledWith("DropEvent", "addExerciseFromLibrary");
                expect(viewSpy.$el.data).toHaveBeenCalledWith("ItemId", 12345);
                expect(viewSpy.$el.data).toHaveBeenCalledWith("ItemType", "FakeModel");
            });

            it("Should make $el draggable", function()
            {
                ExerciseLibraryItemView.prototype.makeDraggable.call(viewSpy);
                expect(viewSpy.$el.draggable).toHaveBeenCalled();
            });
        });

    });

});