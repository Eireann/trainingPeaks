define(
[
    "underscore",
    "TP",
    "views/workoutLibraryView",
    "views/mealLibraryView",
    "hbs!templates/views/library"
],
function(_, TP, WorkoutLibraryView, MealLibraryView, libraryTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function()
        {
            this.views = {
                workoutLibrary: new WorkoutLibraryView(),
                mealLibrary: new MealLibraryView()
            };

            this.activeLibrary = this.views.workoutLibrary;
        },

        ui:
        {
            "activeLibraryContainer": "#activeLibraryContainer"
        },

        events:
        {
            "click #tabs > div": "onTabClick"
        },

        onTabClick: function(e)
        {
            var libraryName = $(e.target).data("library");
            this.switchLibrary(libraryName);
        },

        switchLibrary: function(libraryName)
        {
            var newLibrary = this.views[libraryName];
            if (newLibrary !== this.activeLibrary)
            {
                this.activeLibrary.close();
                this.activeLibrary = newLibrary;
                this.render();
                this.showLibrary();
            } else
            {
                this.toggleLibrary();
            }
        },

        showLibrary: function()
        {
            this.$el.parent().removeClass("closed").addClass("open");
        },

        hideLibrary: function()
        {
            this.$el.parent().removeClass("open").addClass("closed");
        },

        toggleLibrary: function()
        {
            if (this.$el.parent().hasClass("open"))
            {
                this.hideLibrary();
            } else
            {
                this.showLibrary();
            }
        },

        onRender: function()
        {
            this.renderActiveLibrary();
        },

        renderActiveLibrary: function()
        {
            this.ui.activeLibraryContainer.html("");
            this.activeLibrary.render();
            this.ui.activeLibraryContainer.append(this.activeLibrary.$el);
        }

    });
});