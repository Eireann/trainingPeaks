define(
[
    "underscore",
    "TP",
    "hbs!shared/templates/tomahawkTemplate"
],
function(
    _,
    TP,
    tomahawkTemplate
)
{
    var TomahawkView = TP.ItemView.extend(
    {

        className: "tomahawk",
        modal: true,

        template:
        {
            type: "handlebars",
            template: tomahawkTemplate
        },

        ui:
        {
            "arrow": ".tomahawkArrow",
            "content": ".tomahawkContent"
        },

        events:
        {
            "click .closeIcon": "close"
        },

        initialize: function(options)
        {
            this.offset = options.offset;
            this.target = options.target;
        },

        serializeData: function()
        {
            return { hasClose: true };
        },

        onRender: function()
        {
            this.view = new this.viewClass(_.extend({ el: this.ui.content }, this.options));
            this.ui.content.addClass(_.result(this.view, "className"));

            if(this.$el.parent().length === 0)
            {
                $("body").append(this.$el);
            }

            this.view.render();
            this.position();
        },

        onClose: function()
        {
            this.view && this.view.close();
        },

        position: function()
        {
            var self = this;
            var table =
            {
                left:
                {
                    my: "right-12 top-8",
                    at: "left top",
                    collision: "flip fit",
                    axis: "horizontal"
                },
                right:
                {
                    my: "left+12 top-8",
                    at: "right top",
                    collision: "flip fit",
                    axis: "horizontal"
                },
                top:
                {
                    my: "center bottom-12",
                    at: "center top",
                    collision: "fit flip",
                    axis: "vertical"
                },
                bottom:
                {
                    my: "center top+12",
                    at: "center bottom",
                    collision: "fit flip",
                    axis: "vertical"
                }
            };

            var options = _.clone(table[this.offset]);
            options.of = this.target;
            options.using = function(style, feedback)
            {
                self.$el.css(style);

                var direction = feedback[options.axis];

                // Adjust for change in apparent width when rotated 45 degrees
                var shift = 5 + (Math.sqrt(2) - 1) * self.ui.arrow.width() / 2;

                var table =
                {
                    left:
                    {
                        my: "left+" + shift + " center",
                        at: "right center"
                    },
                    right:
                    {
                        my: "right-" + shift + " center",
                        at: "left center"
                    },
                    top:
                    {
                        my: "center top+" + shift,
                        at: "center bottom",
                    },
                    bottom:
                    {
                        my: "center bottom-" + shift,
                        at: "center top"
                    }
                };

                var arrowOptions = _.clone(table[direction]);
                arrowOptions.of = self.target;
                self.ui.arrow.position(arrowOptions);
            }

            this.$el.position(options);
        }

    });

    TomahawkView.wrap = function(viewClass)
    {
        viewClass.Tomahawk = TomahawkView.extend(
        {
            viewClass: viewClass
        });
    };


    return TomahawkView;

});
