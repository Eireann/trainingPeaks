define(
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
            expect(ExerciseLibraryView).to.not.be.undefined;
        });

        describe("getItemView", function()
        {
            it("Should return TP.ItemView if no item is passed", function()
            {
                expect(ExerciseLibraryView.prototype.getItemView()).to.equal(TP.ItemView);
            });

            it("Should return ExerciseLibraryItemView if item is passed", function()
            {
                expect(ExerciseLibraryView.prototype.getItemView({})).to.equal(ExerciseLibraryItemView);
            });
        });

// Test for incomplete feature that was disabled
//         describe("add item", function()
//         {
//             it("Should subscribe to add click events", function()
//             {
//                 expect(ExerciseLibraryView.prototype.events["click button#add"]).to.not.be.undefined;
//                 expect(ExerciseLibraryView.prototype.events["click button#add"]).to.equal("addToLibrary");
//                 expect(typeof ExerciseLibraryView.prototype.addToLibrary).to.equal("function");
//             });

//         });

    });

});
