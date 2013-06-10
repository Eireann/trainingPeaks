define(
[
    "underscore",
    "TP",
    "views/quickView/summaryView/workoutCommentsCollectionView",
    "utilities/stickitMixin",
    "hbs!templates/views/workoutCommentsEditor/workoutCommentsEditor"
],
function (_, TP, WorkoutCommentsCollectionView, stickitMixin, workoutCommentsEditorTemplate)
{
    var workoutCommentsEditorView =
    {
        template:
        {
            type: "handlebars",
            template: workoutCommentsEditorTemplate
        },

        bindings:
        {
            "#descriptionInput":
            {
                events: [ "blur", "keyup", "change", "cut", "paste" ],
                observe: "description",
                onSet: "parseTextField",
                onGet: "formatTextField",
                updateModel: "updateModel",
                ignoreOnSetForUpdateModel: true
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                onSet: "parseTextField",
                onGet: "formatTextField",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                saveTimeout: 60000
            },
            "#preActivityCommentsInput": 
            {
                observe: "coachComments",
                onSet: "parseTextField",
                onGet: "formatTextField",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel"
            }
        },

        //TODO Duplicated from summaryViewStickitBindings.js - Refactor!
        parseTextField: function(value, options)
        {
            return value === "" ? null : this.fixNewlines(value);
        },

        formatTextField: function(value, options)
        {
            return value === null ? "" : this.fixNewlines(value);
        },

        fixNewlines: function(value)
        {
            if (value === null)
                return "";

            var newValue = value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            return newValue;
        },
            
        initialize: function ()
        {
            if (!this.model)
                throw "WorkoutCommentsEditorView requires a model. Aborting";

            this.on("render", this.renderComments, this);
            this.model.on("change:newComment", this.onNewCommentChange, this);

            this.on("close", this.stickitBindingsOnClose, this);
            this.on("render", this.stickitBindingsOnRender, this);

            this.fixNewlinesOnModelDescription();
        },
            
        fixNewlinesOnModelDescription: function ()
        {
            // FIXME - we need to handle this on an api level
            this.model.on("change:description", function ()
            {
                this.model.set("description",
                    this.fixNewlines(this.model.get("description")),
                    { silent: true });
            }, this);

        },

        stickitBindingsOnClose: function ()
        {
            this.unstickit();
        },

        stickitBindingsOnRender: function ()
        {
            if (!this.stickitBindingsInitialized)
            {
                this.model.off("change", this.render);
                this.stickit();
                this.stickitBindingsInitialized = true;
            }
        },

        onNewCommentChange: function()
        {
            var input = this.$("#postActivityCommentsInput");
            setImmediate(function()
            {
                if (!input.val())
                {
                    input.css("height", "");
                }
            });
        },

        renderComments: function()
        {
            this.postActivityCommentsView = new WorkoutCommentsCollectionView(
            {
                collection: this.model.getPostActivityComments()
            });

            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

            this.postActivityCommentsView.on("item:removed", this.onWorkoutCommentRemoved, this);
            this.postActivityCommentsView.on("itemview:commentedited", this.onWorkoutCommentEdited, this);
            
            if (theMarsApp.user.get("settings.account.isCoach") || this.model.get("coachComments"))
            {
                this.$("#preActivityComments").css("display", "block");
            }
        },

        onWorkoutCommentRemoved: function()
        {
            this.model.set("workoutComments",  this.commentsToArray(this.model.getPostActivityComments()), { silent: true });
            this.model.save();
        },
        
        onWorkoutCommentEdited: function ()
        {
            this.model.set("workoutComments",  this.commentsToArray(this.model.getPostActivityComments()), { silent: true });
            this.model.save();
        },

        commentsToArray: function(commentsCollection)
        {
            var commentsArray = [];
            commentsCollection.each(function(commentsModel)
            {
                commentsArray.push(commentsModel.attributes);
            });
            return commentsArray;
        }
    };

    _.extend(workoutCommentsEditorView, stickitMixin);
    return TP.ItemView.extend(workoutCommentsEditorView);
});