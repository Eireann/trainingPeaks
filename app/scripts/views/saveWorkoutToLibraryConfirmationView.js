define(
[
    "TP",
    "hbs!templates/views/saveWorkoutToLibraryConfirmationView"
],
function(TP, saveWorkoutToLibraryTemplate)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: true,
            shadow: true
        },

        showThrobbers: false,
        tagName: "div",
        className: "saveWorkoutToLibraryConfirmation",

        events:
        {
            "click #confirmationOk": "onOk",
            "click #confirmationCancel" : "onCancel"
        },

        template:
        {
            type: "handlebars",
            template: saveWorkoutToLibraryTemplate
        },

        onOk: function()
        {
            alert('fixme');
        },

        onCancel: function()
        {
            this.close();
        },

        initialize: function(options)
        {
            this.libraries = options && options.libraries ? options.libraries : new TP.Collection();
        },

        serializeData: function()
        {
            var data = {
                libraries: []
            };

            var self = this;
            this.libraries.each(function(library)
            {
                var libraryData = library.toJSON();
                data.libraries.push(libraryData);
            });

            return data;
        }

    });
});