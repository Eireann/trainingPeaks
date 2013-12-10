define(
[
    "underscore",
    "setImmediate",
    "views/quickView/summaryView/workoutCommentsCollectionView"
],
function (
    _,
    setImmediate,
    WorkoutCommentsCollectionView
)
{
    var summaryViewComments =
    {
        initializeComments: function()
        {
            this.on("render", this.renderComments, this);
            this.model.on("change:newComment", this.onNewCommentChange, this);
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
                { collection: this.model.getPostActivityComments() }
                );

            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

            this.postActivityCommentsView.on("item:removed", this.onWorkoutCommentRemoved, this);
            this.postActivityCommentsView.on("itemview:commentedited", this.onWorkoutCommentEdited, this);
            
            if (!theMarsApp.user.getAccountSettings().get("isAthlete") || this.model.get("coachComments"))
            {
                this.$("#preActivityComments").css("display", "block");
            }
        },

        onWorkoutCommentRemoved: function()
        {
            this.model.set("workoutComments",  this.commentsToArray(this.model.getPostActivityComments()), { silent: true });
            this.model.autosave();
        },
        
        onWorkoutCommentEdited: function ()
        {
            this.model.set("workoutComments",  this.commentsToArray(this.model.getPostActivityComments()), { silent: true });
            this.model.autosave();
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

    return summaryViewComments;

});
