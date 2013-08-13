define(
[
    "underscore",
    "TP",
    "views/dashboard/library/chartTileView",
    "models/dashboard/availableChartsCollection",
    "hbs!templates/views/dashboard/library/dashboardChartsLibraryView"
],
function(
    _,
    TP,
    ChartTileView,
    AvailableChartsCollection,
    DashboardChartsLibraryViewTemplate)
{
    var DashboardChartsLibraryView = {
        
        id: "dashboardChartsLibrary",
        className: "dashboardChartsLibrary",

        searchText: null,

        template:
        {
            type: "handlebars",
            template: DashboardChartsLibraryViewTemplate
        },

        events:
        {
            "change .search": "onSearch",
            "keyup .search": "onSearch"
        },

        ui:
        {
            "search": ".search"
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
        },

        getItemView: function(item)
        {
            if (item)
            {
                return ChartTileView;
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
                                                          AvailableChartsCollection,
                                                          this.sourceCollection,
                                                          searchText,
                                                          ["name"]
                                                          );
          this._renderChildren();
        }
    };

    return TP.CompositeView.extend(DashboardChartsLibraryView);
});

