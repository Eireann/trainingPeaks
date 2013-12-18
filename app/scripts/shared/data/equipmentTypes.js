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

            if (label === "bike")
            {
                type = this.Bike;
            }
            else if (label === "shoe")
            {
                type = this.Shoe;
            }

            return type;
        },

        convertTypeToLabel: function(type)
        {
            var label = "?";

            if (type === this.Bike)
            {
                label = "bike";
            }
            else if (type === this.Shoe)
            {
                label = "shoe";
            }

            return label;
        }

    };

});
