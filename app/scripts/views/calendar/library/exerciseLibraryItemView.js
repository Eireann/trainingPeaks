define(
[
    "jquery",
    "underscore",
    "jqueryui/touch-punch",
    "jqueryui/draggable",

    "TP",
    "views/calendar/library/exerciseDetailsView",

    "hbs!templates/views/calendar/library/exerciseLibraryItemView",
    "hbs!templates/views/calendar/library/exerciseLibraryItemViewDragState"
],
function(
    $,
    _,
    touchPunch,
    draggable,

    TP,
    ExerciseDetailsView,

    exerciseLibraryItemViewTemplate,
    exerciseLibraryItemViewTemplateDragState)
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "libraryExercise workout",

        attributes: function()
        {
            return {
                "data-ExerciseId": this.model.id
            };
        },

        events:
        {
            click: "showDetails"
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryItemViewTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a LibraryExerciseItemView without a model";

            options = options || {};

            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;
            this.listenTo(this.model, "state:change:isSelected", _.bind(this._updateSelected, this));

            this.listenTo(this.model, "select", _.bind(this.onItemSelect, this));
            this.listenTo(this.model, "unselect", _.bind(this.onItemUnSelect, this));

            _.bindAll(this, "draggableHelper", "onDragStart", "onDragStop");

            this.listenTo(theMarsApp.user, "change:units", _.bind(this.render, this));
            this.getIconType();
        },

        _updateSelected: function()
        {
            this.$el.toggleClass("selected", this.model.getState().get("isSelected") || false);
        },

        onRender: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            this.$el.draggable({
                appendTo: theMarsApp.getBodyElement(),
                'z-index': 100,
                helper: this.draggableHelper,
                start: this.onDragStart,
                stop: this.onDragStop
            }).data({ handler: this.model });
        },

        draggableHelper: function()
        {
            var $helperEl = $(exerciseLibraryItemViewTemplateDragState(this.serializeData()));
            $helperEl.addClass(this.className);
            $helperEl.addClass(this.getWorkoutTypeCssClassName());
            $helperEl.addClass("future");
            $helperEl.width(this.$el.width());
            return $helperEl;
        },

        onDragStart: function()
        {
            this.$el.addClass("dragging");
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        },

        getIconType: function ()
        {
            this.$el.addClass(this.getWorkoutTypeCssClassName());
            // we need the "future" class to get the right icon.
            this.$el.addClass("future");
        },

        getWorkoutTypeCssClassName: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeId")).replace(/ /g, "");
        },

        showDetails: function(e)
        {
            this.selectionManager.setSelection(this.model, e);
            if(this.detailsView)
            {
                return;
            }
            this.detailsView = new ExerciseDetailsView({ model: this.model });
            this.listenTo(this.detailsView, "close", this.onDetailsClose);
            this.detailsView.render().alignArrowTo(this.$el);
            e.preventDefault();
        },

        onDetailsClose: function()
        {
            this.stopListening(this.detailsView);
            this.detailsView = null;
        }

    });
});
