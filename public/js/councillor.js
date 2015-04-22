function addClassToProspective(id){
  console.log("addClassToProspective: " + id);
}
$(document).ready(function () {
  var classes = [];
  $.getJSON( "/class.json", function( j ) {
    for(var i = 0; i<j.length; i++){
      classes.push({"total": j[i], "label": j[i].department + j[i].number});
    }
    $("#courses").autocomplete({
      minLength: 0,
      source: classes,
      focus: function(event, ui){
        $("#courses").val(ui.item.label);
        return false;
      },
      select: function(event, ui){
        console.log(ui.item.total.id);
        addClassToProspective(ui.item.total.id);
        return true;
      } 
    });
  });
});
