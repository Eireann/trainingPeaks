define(
[
    "jquery",
    "setImmediate",
    "underscore",
    "TP",
    "shared/views/selectableLayout",
    "hbs!shared/templates/tabbedLayout"
],
function(
    $,
    setImmediate,
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
            this.onScroll = _.bind(_.debounce(this._onScroll, 100), this);

            this.listenTo(this.bodyRegion, "show", _.bind(this._updateScrollTargetSize, this));
            $(window).on("resize.tabbedLayout", this._updateScrollTargetSize);
            this.on("close", function(){$(window).off("resize.tabbedLayout");});
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
                $subItem.data("target", subNavItem.target);
                var $subLink = $("<span/>").text(subNavItem.title);

                $subItem.append($subLink);

                $subLink.click(function()
                {
                    self._scrollTo(subNavItem, $subItem);
                    $item.find("ul.tabbedLayoutSubNav .active").removeClass("active");
                    $subItem.addClass("active");
                });

                $subNav.append($subItem);
            });

            $item.append($subNav);

            this.$current = $item;

            this.$current.addClass("active");

            $subNav.find("li:first").addClass("active");

            this._listenToScroll();
        },

        _scrollTo: function(subNavItem, $subItem)
        {
            var target = this.$(".tabbedLayoutBody [data-target=" + subNavItem.target + "]");
            var $container = this.$(".tabbedLayoutBody");
            var self = this;
            self.scrolling = true;
            $container.animate({
                scrollTop: target.position().top + $container.scrollTop()
            }, {
                done: function(){self.scrolling = false;}
            });
        },

        _listenToScroll: function()
        {
            this.$(".tabbedLayoutBody").on("scroll.tabbedLayout", _.bind(_.debounce(this.onScroll, 200), this));
        },

        _stopListeningToScroll: function()
        {
            this.$(".tabbedLayoutBody").off("scroll.tabbedLayout");
        },

        _onScroll: function()
        {
            if(this.scrolling)
            {
                return;
            }

            var bodyPosition = this.$(".tabbedLayoutBody").offset();
            var margin = 100;
            var topElement = document.elementFromPoint(bodyPosition.left + margin, bodyPosition.top + margin);
            var scrollTarget = topElement ? $(topElement).closest(".scrollTarget") : null;
            if(scrollTarget)
            {
                var targetName = scrollTarget.data("target");
                if(targetName)
                {
                    this.$("ul.tabbedLayoutSubNav .active").removeClass("active");
                    this.$("ul.tabbedLayoutSubNav li").filter(function(){
                        return $(this).data("target") === targetName;
                    }).addClass("active");
                }
            }
        },

        _updateScrollTargetSize: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.$(".tabbedLayoutBody .scrollTarget:last").css("min-height", self.$(".tabbedLayoutBody").height());
            });
        }
    });

    return TabbedLayout;

});
