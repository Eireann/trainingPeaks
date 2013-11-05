define(
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

            sinon.spy(itemView, "makeDraggable");
            sinon.spy(itemView.$el, "draggable");

            itemView.render();

            expect(itemView.makeDraggable).to.have.been.called;
            expect(itemView.$el.draggable).to.have.been.called;
        });
    });

});
