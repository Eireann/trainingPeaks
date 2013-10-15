define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var SelectableLayout = TP.Layout.extend({

        className: "selectableLayout",

        template: function(){return "<div class='navigationRegion'></div><div class='bodyRegion'></div>";},

        regions:
        {
            bodyRegion: ".bodyRegion"
        },

        ui: {
            navigationContainer: ".navigationRegion"
        },

        currentView: null,

        constructor: function()
        {
            TP.Layout.apply(this, arguments);
            this.on("render", this._renderNavigation, this);
            this.on("render", this._displayDefaultView, this);            
        },

        _renderNavigation: function()
        {
            this.ui.navigationContainer.empty();
            _.each(this._getNavigationElements(), function($item)
            {
                this.ui.navigationContainer.append($item);
            }, this);
        },

        _getNavigationElements: function()
        {
            return [];
        },

        _selectView: function(navItem, $uiElement)
        {
            this.trigger("before:switchView", navItem, $uiElement);
            if(this.currentView)
            {
                this.stopListening(this.currentView, "all");
            }            
            var view = new navItem.view(navItem.options);
            navItem.viewInstance = view;
            this.currentView = view;
            this.currentNavItem = navItem;
            this.listenTo(view, "all", _.bind(this._passthroughCurrentViewEvent, this));
            this._displayCurrentView();

            this.trigger("after:switchView", navItem, $uiElement);
        },

        _displayCurrentView: function()
        {
            this.bodyRegion.show(this.currentView);
        },

        _displayDefaultView: function()
        {
            this._selectView(this.navigation[0]);
        },

        _passthroughCurrentViewEvent: function(eventName)
        {
            var args = Array.prototype.slice.call(arguments, 0);
            args[0] = "itemView:" + eventName;
            this.trigger.apply(this, args);
        }

    });

    return SelectableLayout;

});
