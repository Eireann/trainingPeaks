﻿define(
[
    "underscore",
    "TP",
    "views/library/libraryWorkoutItemView",
    "views/library/workoutLibraryAddView",
    "models/library/libraryWorkoutsCollection",
    "hbs!templates/views/library/workoutLibrary"
],
function(_, TP, LibraryWorkoutItemView, WorkoutLibraryAddView, LibraryWorkoutsCollection, workoutLibraryTemplate)
{
    return TP.CompositeView.extend(
    {
        libraryName: 'workoutLibrary',
        tagName: "div",
        className: "workouts",

        getItemView: function(item)
        {
            if (item)
            {
                return LibraryWorkoutItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        initialize: function()
        {
            if (!this.collection)
            {
                this.collection = new LibraryWorkoutsCollection();
            }

        },

        collectionEvents:
        {
            "reset": "render"
        },

        template:
        {
            type: "handlebars",
            template: workoutLibraryTemplate
        },

        events:
        {
            "click button#add": "addToLibrary"
        },

        addToLibrary: function()
        {
            var view = new WorkoutLibraryAddView({});
            view.render();
        }

    });
});