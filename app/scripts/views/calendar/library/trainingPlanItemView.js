define(
[
    "TP",
    "./trainingPlanDetailsView",
    "hbs!templates/views/calendar/library/trainingPlanItemView"
],
function(TP, TrainingPlanDetailsView, trainingPlanItemViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlan",

        attributes: function()
        {
            return {
                "data-TrainingPlanId": this.model.get("planId")
            };
        },

        template:
        {
            type: "handlebars",
            template: trainingPlanItemViewTemplate
        },

        events:
        {
            mousedown: "onMouseDown",
            mouseup: "openPlanDetailsOnClick"
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a TrainingPlanItemView without a model";

            this.model.on("select", this.onItemSelect, this);
            this.model.on("unselect", this.onItemUnSelect, this);
        },

        onMouseDown: function()
        {
            this.model.trigger("select", this.model);
        },

        onItemSelect: function()
        {
            this.$el.addClass("selected");
        },

        onItemUnSelect: function()
        {
            this.$el.removeClass("selected");
        },

        openPlanDetailsOnClick: function()
        {
            if(this.detailsView)
            {
                return;
            }
            this.detailsView = new TrainingPlanDetailsView({ model: this.model });
            this.detailsView.on("close", this.onDetailsClose, this);
            var myPosition = this.$el.offset();
            this.detailsView.render().top(myPosition.top).left(myPosition.left + this.$el.width() + 15);
        },

        onDetailsClose: function()
        {
            this.detailsView.off("close", this.onDetailsClose, this);
            this.detailsView = null;
        }

    });
});