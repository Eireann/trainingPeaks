define(
[
    "underscore",
    "TP",
    "utilities/workoutTypeEnum",
    "hbs!templates/views/workoutTypeMenu"
],
function(underscore, TP, workoutTypeEnum, workoutTypeMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "workoutTypeMenu",
        
        events:
        {
            "click label": "onTypeClicked"
        },
        
        onTypeClicked: function(e)
        {
        },

        initialize: function(options)
        {
            this.model = new TP.Model();
          
            var types = [];
            _.each(_.keys(workoutTypeEnum), function(typeName)
            {
                var typeId = workoutTypeEnum[typeName];
                types.push({ typeName: typeName, typeId: typeId });
            });
            this.model.set("workoutTypes", types);
        },

        template:
        {
            type: "handlebars",
            template: workoutTypeMenuTemplate
        }
    });
});