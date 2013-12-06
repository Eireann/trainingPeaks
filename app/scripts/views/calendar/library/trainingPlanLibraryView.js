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
    return TP.CompositeView.extend(
    {
        className: "trainingPlanLibrary",
        searchText: null,

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        },

        events:
        {
            "keyup #search": "onSearch",
            "change #search": "onSearch"
        },

        ui:
        {
            search: "#search"
        },

        collectionEvents:
        {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop",
            "refresh": "render",
            "destroy": "onWaitStop",
            "select": "onSelectItem",
            "unselect": "unSelect"
        },

        initialize: function()
        {
            this.on("library:unselect", this.unSelect, this);
            this.sourceCollection = this.collection;
            this.model = new TP.Model({storeUrl: theMarsApp.apiConfig.trainingPlanStoreUrl });
        },

        getItemView: function(item)
        {
            if (item)
                return TrainingPlanItemView;
            else
                return TP.ItemView;
        },

        onRender: function()
        {
            if(theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewPlanStore))
            {
                this.$(".helpText").removeClass("hidden");
            }
        },

        onSelectItem: function(model)
        {
            if (this.selectedItem && this.selectedItem !== model)
                this.unSelect();

            this.selectedItem = model;
            this.trigger("select");
        },

        unSelect: function()
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
    });
});
