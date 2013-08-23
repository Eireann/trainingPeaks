define(
[
],
function(
)
{
    var FormUtility = {
      applyValuesToForm: function($form, model, options)
      {
        $form.find("input, select, textarea").each(function(i, el)
        {
            var $el = $(el);
            var key = $el.attr("name");
            if(!key) return;
            var value = model.get(key);
            $el.val(value);
        });
      },

      applyValuesToModel: function($form, model, options)
      {
        $form.find("input, select, textarea").each(function(i, el)
        {
          console.log(el);
        });
      }
    };

    return FormUtility;
});


