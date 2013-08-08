define(
[
    "underscore",
    "TP",
    "views/dashboard/library/chartTileView",
    "hbs!templates/views/dashboard/library/dashboardChartsLibraryView"
],
function(
    _,
    TP,
    ChartTileView,
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
            // this.sourceCollection = this.collection;
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
        }
    };

    return TP.CompositeView.extend(DashboardChartsLibraryView);
});

