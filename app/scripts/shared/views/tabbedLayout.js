define(
[
    "underscore",
    "TP",
    "shared/views/selectableLayout",
    "hbs!shared/templates/tabbedLayout"
],
function(
    _,
    TP,
    SelectableLayout,
    tabbedLayoutTemplate
)
{

    var TabbedLayout = SelectableLayout.extend({

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
            SelectableLayout.apply(this, arguments);
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
