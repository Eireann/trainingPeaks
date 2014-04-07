define(
[
    "jquery",
    "underscore",
    "TP",
    "./trainingPlanDetailsView",
    "jqueryui/draggable",
    "hbs!templates/views/calendar/library/trainingPlanItemView"
],
function($, _, TP, TrainingPlanDetailsView, draggable, trainingPlanItemViewTemplate)
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

            options = options || {};
            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;

            this.listenTo(this.model, "state:change:isSelected", _.bind(this._updateSelected, this));
        },

        onRender: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            this.$el.draggable({
                helper: _.bind(this.draggableHelper, this),
                appendTo: theMarsApp.getBodyElement()
            }).data({ handler: this.model });
        },
        draggableHelper: function()
        {
            return $('<div/>', {"class": "dragging-training-plan"}).append(this.$el.clone());
        },
        serializeData: function()
        {
            var data = this.model.toJSON();
            var dayCount = this.model.get("daysDuration");
            var weekCount = Math.ceil(dayCount / 7);
            data.weekCount = weekCount;
            return data;
        },

        onMouseDown: function(e)
        {
            this.selectionManager.setSelection(this.model, e);
        },

        _updateSelected: function()
        {
            this.$el.toggleClass("selected", this.model.getState().get("isSelected") || false);
        },

        openPlanDetailsOnClick: function()
        {
            if(this.detailsView)
            {
                return;
            }
            this.detailsView = new TrainingPlanDetailsView.Tomahawk({ model: this.model, target: this.$el, offset: "right" });
            this.listenTo(this.detailsView, "close", _.bind(this.onDetailsClose, this));
            this.detailsView.render();
        },

        onDetailsClose: function()
        {
            this.detailsView = null;
        }

    });
});
