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
            tabbedLayoutBodyRegion: ".tabbedLayoutBody"
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
                var $item = $("<li>").text(navItem.title);

                $item.click(function()
                {
                    self._setCurrent(navItem);
                });

                $nav.append($item);
            }, this);

            if(this.navigation.length > 0)
            {
                this._setCurrent(this.navigation[0]);
            }
        },

        _setCurrent: function(navItem)
        {
            var view = new navItem.view(navItem.options);
            this.tabbedLayoutBodyRegion.show(view);
        }

    });

    return TabbedLayout;

});
