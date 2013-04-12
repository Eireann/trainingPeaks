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
            this.postActivityCommentsView = new WorkoutCommentsCollectionView(
                { collection: this.model.getPostActivityComments() }
                );

            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

            this.postActivityCommentsView.on("item:removed", this.onWorkoutCommentRemoved, this);
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