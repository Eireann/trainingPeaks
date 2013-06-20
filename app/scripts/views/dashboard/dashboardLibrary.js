define(
[
    "TP",
    "views/pageContainer/libraryContainerView",
    "hbs!templates/views/dashboard/dashboardLibrary"
],
function(
    TP,
    LibraryContainerView,
    dashboardLibraryTemplate)
{
    return LibraryContainerView.extend(
    {

        template:
        {
            type: "handlebars",
            template: dashboardLibraryTemplate
        },

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, options);
        },

        buildViews: function(options)
        {
            var ChartsLibraryView = TP.ItemView.extend(
                {
                    template:
                    {
                        type: "handlebars",
                        template: function() { return "<div>Charts Library</div>"; }
                    }
                }
            );

            this.views = {
                chartsLibrary: new ChartsLibraryView()
            };
        }

    });
});