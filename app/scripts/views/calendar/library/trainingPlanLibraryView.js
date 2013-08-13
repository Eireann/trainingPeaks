define(
[
    "underscore",
    "TP",
    "views/calendar/library/trainingPlanItemView",
    "models/library/trainingPlanCollection",
    "hbs!templates/views/calendar/library/trainingPlanLibraryView"
],
function(
    _,
    TP,
    TrainingPlanItemView,
    TrainingPlanCollection,
    trainingPlanLibraryViewTemplate)
{
    var TrainingPlanLibraryView = {
        
        className: "trainingPlanLibrary",
        searchText: null,

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        },

        events: {
            "keyup #search": "onSearch",
            "change #search": "onSearch"
        },

        ui: {
            search: "#search"
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
            this.sourceCollection = this.collection;
            this.model = new TP.Model({wwwRoot: theMarsApp.wwwRoot });
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
        },

        onSearch: function()
        {
            var searchText = this.ui.search.val().trim();
            this.collection = TP.utils.collections.search(
                                                          TrainingPlanCollection,
                                                          this.sourceCollection,
                                                          searchText,
                                                          ["title"]
                                                          );
          this._renderChildren();
        }
    };

    return TP.CompositeView.extend(TrainingPlanLibraryView);
});