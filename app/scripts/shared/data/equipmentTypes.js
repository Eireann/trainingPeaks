define(
[
],
function(
)
{
    return {

        Bike: 1,
        Shoe: 2,

        convertLabelToType: function(label)
        {
            var type = 0;

            switch (label)
            {
                case "bike":
                    type = this.Bike;

                    break;
                case "shoe":
                    type = this.Shoe;

                    break;
            }

            return type;
        },

        convertTypeToLabel: function(type)
        {
            var label = "?";

            switch (type)
            {
                case this.Bike:
                    label = "bike";

                    break;
                case this.Shoe:
                    label = "shoe";

                    break;
            }

            return label;
        }

    };
});
