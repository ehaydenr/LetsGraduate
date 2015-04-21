// class.ejs 
function toggleClassTaken(add, id){
  console.log("Toggle Class Taken: " + id);
  console.log(add);
  $.get( "/updateClass", {"action": (add ? "insert" : "delete"), "id": id}, function( data ) {
    console.log("Added");
    console.log(data);
    location.reload();
  });
}

function toggleClassProspective(add, id){
  console.log("Toggle Class Prospective: " + id);
}

function updateHours(id){
  console.log("Update Hours: " + id);
  var hours = document.getElementById('hours').value;
  $.get( "/updateClass", {"action": 'update', "id": id, "hours": hours}, function( data ) {
    console.log("updated");
    console.log(data);
    location.reload();
  });
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
        previewClass(ui.item);
        return true;
      } 
    });
  });


});

