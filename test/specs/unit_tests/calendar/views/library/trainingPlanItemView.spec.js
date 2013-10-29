// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/calendar/library/trainingPlanItemView"
],
function(TP, TrainingPlanItemView)
{
    describe("Training Plan Item View", function()
    {
        it("Should be draggable", function()
        {
            var itemView = new TrainingPlanItemView({model: new TP.Model({title: "Foobar", id: 123 })});
            itemView.model.webAPIModelName = "TrainingPlan";

            spyOn(itemView, "makeDraggable").andCallThrough();
            spyOn(itemView.$el, "draggable").andCallThrough();

            itemView.render();

            expect(itemView.makeDraggable).toHaveBeenCalled();
            expect(itemView.$el.draggable).toHaveBeenCalled();
        });
    });

});
