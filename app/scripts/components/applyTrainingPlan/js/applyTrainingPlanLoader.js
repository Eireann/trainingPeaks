/* jshint ignore:start */
var applyReady = new $.Deferred();

function LoadApplyTrainingPlan(cssSelector, trainingPlanId)
{
    applyReady.done(function(ApplyTrainingPlan)
    {
        var applyPlan = new ApplyTrainingPlan({ el: $(cssSelector), trainingPlanId: trainingPlanId });

        applyPlan.load().done(function(){applyPlan.render();});
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