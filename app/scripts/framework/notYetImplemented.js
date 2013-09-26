define(
[
    "views/userConfirmationView",
    "hbs!shared/templates/notYetImplemented"
],
function(
    UserConfirmationView,
    notYetImplementedTemplate
)
{

        function notYetImplemented()
        {
            var view = new UserConfirmationView({
                template: notYetImplementedTemplate
            });

            view.render();
        }

        return notYetImplemented;

});
