define(
[
    "underscore",
    "TP",
    "hbs!shared/templates/tabbedLayout"
],
function(
    _,
    TP,
    tabbedLayoutTemplate
)
{

    var SelectableMultiView = TP.Layout.extend({

        className: "selectableMultiView",

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

    var TabbedLayout = SelectableMultiView.extend({

        className: "tabbedLayout",

        template:
        {
            type: "handlebars",
            template: tabbedLayoutTemplate
        },

        regions:
        {
            bodyRegion: ".tabbedLayoutBody",
            footerRegion: ".tabbedLayoutFooter"
        },

        ui: {
            navigationContainer: ".tabbedLayoutNav"
        },

        constructor: function()
        {
            SelectableMultiView.apply(this, arguments);
            this.on("after:switchView", this._updateNavigation, this);
        },

        _getNavigationElements: function()
        {
            var navElements = [];
            var self = this;
            _.each(this.navigation, function(navItem)
            {
                var $item = $("<li/>");
                var $link = $("<span class='tabbedLayoutNavLink'/>").text(navItem.title);

                $item.append($link);

                $link.click(function()
                {
                    self._selectView(navItem, $item);
                });

                navElements.push($item);
            }, this);

            return navElements;
        },

        _displayDefaultView: function()
        {
            this.$(".tabbedLayoutNavLink:first").trigger("click");
        },

        _updateNavigation: function(navItem, $item)
        {

            // before
            if(this.$current)
            {
                this.$current.removeClass("active");
            }

            var self = this;

            setImmediate(function()
            {
                self.$(".tabbedLayoutBody").scrollTop(0);
                self.$(".tabbedLayoutBody").scrollLeft(0);
            });

            $item.find("ul.tabbedLayoutSubNav").remove();

            var $subNav = $("<ul class='tabbedLayoutSubNav'/>");

            var subNavItems = _.result(this.currentView, "subNavigation");

            _.each(subNavItems, function(subNavItem)
            {
                var $subItem = $("<li/>");
                var $subLink = $("<span/>").text(subNavItem.title);

                $subItem.append($subLink);

                $subLink.click(function()
                {
                    self._scrollTo(subNavItem, $subItem);
                });

                $subNav.append($subItem);
            });

            $item.append($subNav);

            this.$current = $item;

            this.$current.addClass("active");
        },

        _scrollTo: function(subNavItem, $subItem)
        {
            var target = this.$(".tabbedLayoutBody").find(subNavItem.target);
            var $container = this.$(".tabbedLayoutBody");
            $container.animate({
                scrollTop: target.position().top + $container.scrollTop()
            });
        }

    });

    return TabbedLayout;

});
