// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "app",
    "views/calendar/library/trainingPlanItemView"
],
function(TP, theMarsApp, TrainingPlanItemView)
{
    describe("Training Plan Item View", function()
    {
        it("Should be draggable", function()
        {
            var itemView = new TrainingPlanItemView({model: new TP.Model({title: "Foobar", id: 123, webAPIModelName: "TrainingPlan"})});
            spyOn(itemView, "makeDraggable").andCallThrough();
            spyOn(itemView.$el, "draggable");

            itemView.render();

            expect(itemView.makeDraggable).toHaveBeenCalled();
            expect(itemView.$el.draggable).toHaveBeenCalled();

            expect(itemView.$el.data('ItemId')).toBeDefined();
            expect(itemView.$el.data('ItemType')).toBeDefined();   
            expect(itemView.$el.data('DropEvent')).toBeDefined();
        });
    });

});
