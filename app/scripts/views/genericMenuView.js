define(
[
    "TP",
    "hbs!templates/views/genericMenu"
],
function(TP, genericMenuTemplate)
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

            this.model = new TP.Model({ labels: options.labels });

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