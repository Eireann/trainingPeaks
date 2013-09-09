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

    var TabbedLayout = TP.Layout.extend({

        className: "tabbedLayout",

        template:
        {
            type: "handlebars",
            template: tabbedLayoutTemplate
        },

        regions:
        {
            tabbedLayoutBodyRegion: ".tabbedLayoutBody",
            tabbedLayoutFooterRegion: ".tabbedLayoutFooter"
        },

        constructor: function()
        {
            TP.Layout.apply(this, arguments);
            this.on("render", this.renderNav, this);
        },

        renderNav: function()
        {
            var self = this;

            if(!this.navigation)
            {
                throw new Error("Tabbed Layout requires a navigation config array");
            }

            var $nav = this.$(".tabbedLayoutNav");

            $nav.empty();

            _.each(this.navigation, function(navItem)
            {
                var $item = $("<li/>");
                var $link = $("<span class='tabbedLayoutNavLink'/>").text(navItem.title);

                $item.append($link);

                $link.click(function()
                {
                    self._setCurrent(navItem, $item);
                });

                $nav.append($item);
            }, this);

            this.$(".tabbedLayoutNavLink:first").click();
        },

        _setCurrent: function(navItem, $item)
        {
            var self = this;

            if(this.$current)
            {
                this.$current.removeClass("active");
            }

            var view = new navItem.view(navItem.options);
            this.currentView = view;
            this.tabbedLayoutBodyRegion.show(view);

            setImmediate(function()
            {
                this.$(".tabbedLayoutBody").scrollTop(0);
                this.$(".tabbedLayoutBody").scrollLeft(0);
            });

            $item.find("ul.tabbedLayoutSubNav").remove();

            var $subNav = $("<ul class='tabbedLayoutSubNav'/>");

            var subNavItems = _.result(view, "subNavigation");

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
