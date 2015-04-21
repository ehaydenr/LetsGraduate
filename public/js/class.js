$(function() {

  var classes = [];
  $.getJSON( "class.json", function( j ) {
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
        previewClass(ui.item);
        return true;
      } 
    });
  });



});

// class.ejs 
function toggleClassTaken(id){
  console.log("Toggle Class Taken: " + id);
}

function toggleClassProspective(id){
  console.log("Toggle Class Prospective: " + id);
}

function updateHours(id){
  console.log("Update Hours: " + id);
}
