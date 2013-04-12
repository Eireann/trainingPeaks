define(
[
    "underscore",
    "views/quickView/summaryView/workoutCommentsCollectionView"
],
function (
    _,
    WorkoutCommentsCollectionView
)
{
    var summaryViewComments = {

        initializeComments: function()
        {
            this.on("render", this.renderComments, this);
        },

        renderComments: function()
        {
            this.preActivityCommentsView = new WorkoutCommentsCollectionView(
                { collection: this.model.getPreActivityComments() }
                );
            this.postActivityCommentsView = new WorkoutCommentsCollectionView(
                { collection: this.model.getPostActivityComments() }
                );

            this.preActivityCommentsView.render();
            this.$("#preActivityCommentsList").append(this.preActivityCommentsView.el);
            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

            this.preActivityCommentsView.on("item:removed", this.onCoachCommentRemoved, this);
            this.postActivityCommentsView.on("item:removed", this.onWorkoutCommentRemoved, this);
        },

        onCoachCommentRemoved: function()
        {
            this.model.set("coachComments", this.commentsToArray(this.model.getPreActivityComments()), { silent: true });
            this.model.save();
        },

        onWorkoutCommentRemoved: function()
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

    return summaryViewComments;

});