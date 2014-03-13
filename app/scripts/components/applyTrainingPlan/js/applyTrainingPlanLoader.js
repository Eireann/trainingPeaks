/* jshint ignore:start */
var applyReady = new $.Deferred();

/*
options:
trainingPlanId
target
onSuccess
*/

function LoadApplyTrainingPlan(options)
{
    applyReady.done(function(ApplyTrainingPlan)
    {
        var applyPlan = new ApplyTrainingPlan(options);

        applyPlan.load().done(function(){
          $(options.target).append(applyPlan.render().$el);
        });
    });
}

requirejs([
    "wrappedMoment"
], function(wrappedMoment)
{
    requirejs(
    [
      "jquery",
      "components/applyTrainingPlan/js/applyTrainingPlan"
    ],
    function(
      $,
      ApplyTrainingPlan
    )
    {
        applyReady.resolve(ApplyTrainingPlan);
    });
});
/* jshint ignore:end */