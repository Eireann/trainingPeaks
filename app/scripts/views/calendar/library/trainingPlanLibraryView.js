define(
[
    "underscore",
    "TP",
    "views/calendar/library/trainingPlanItemView",
    "hbs!templates/views/calendar/library/trainingPlanLibraryView"
],
function(
    _,
    TP,
    TrainingPlanItemView,
    trainingPlanLibraryViewTemplate)
{
    var TrainingPlanLibraryView = {
        
        className: "trainingPlanLibrary",

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        },

        collectionEvents: {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop",
            "refresh": "render",
            "destroy": "onWaitStop",
            "select": "onSelectItem",
            "unselect": "unSelectItem"
        },

        initialize: function()
        {
            this.on("library:unselect", this.unSelectItem, this);
        },

        getItemView: function(item)
        {
            if (item)
            {
                return TrainingPlanItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        onSelectItem: function(model)
        {
            if (this.selectedItem && this.selectedItem !== model)
            {
                this.unSelectItem();
            }

            this.selectedItem = model;
            this.trigger("select");
        },

        unSelectItem: function()
        {
            if (this.selectedItem)
            {
                var previouslySelectedItem = this.selectedItem;
                this.selectedItem = null;
                previouslySelectedItem.trigger("unselect", previouslySelectedItem);
            }
        }
    };

    return TP.CompositeView.extend(TrainingPlanLibraryView);
});