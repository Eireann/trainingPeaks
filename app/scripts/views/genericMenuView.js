define(
[
    "underscore",
    "TP",
    "hbs!templates/views/genericMenu"
],
function(_, TP, genericMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: genericMenuTemplate
        },

        initialize: function(options)
        {

            if (!options.labels || !options.labels.length)
            {
                throw "GenericMenuView requires a labels array";
            }

            // we could have just kept labels as a simple array, but the template parser is failing randomly so trying a different approach
            var labels = [];
            _.each(options.labels, function(label)
            {
                labels.push({ labelText: label });
            });

            this.model = new TP.Model({ labels: labels });

            this.on("modalrender", this.addGenericClassName, this);
        },

        addGenericClassName: function()
        {
            // because css class name can be overridden in constructor options, but we still want the generic in there
            this.$el.addClass("genericMenu");
            this.$overlay.addClass("genericMenuOverlay");
        },

        events:
        {
            "click label": "onLabelClicked"
        },

        onLabelClicked: function(e)
        {
            var labelEventName = $(e.target).text();
            this.trigger(labelEventName);
            this.close();
        }
       
    });
});