define(
[
    "TP",
    "./trainingPlanDetailsView",
    "jqueryui/draggable",
    "hbs!templates/views/calendar/library/trainingPlanItemView"
],
function(TP, TrainingPlanDetailsView, draggable, trainingPlanItemViewTemplate)
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
        onRender: function()
        {
            this.makeDraggable();
        },
        makeDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "addTrainingPlanFromLibrary");

            this.$el.draggable({containment: "#calendarWrapper", helper: 'clone', appendTo: theMarsApp.getBodyElement()});
        },
        serializeData: function()
        {
            var data = this.model.toJSON();
            var dayCount = this.model.get("daysDuration");
            var weekCount = Math.ceil(dayCount / 7);
            data.weekCount = weekCount;
            return data;
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
            this.detailsView.render().alignArrowTo(this.$el);
        },

        onDetailsClose: function()
        {
            this.detailsView.off("close", this.onDetailsClose, this);
            this.detailsView = null;
        }

    });
});