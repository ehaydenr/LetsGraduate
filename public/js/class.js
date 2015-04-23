// class.ejs 
function toggleClass(add, id, type){
  var data = {"action": (add ? "insert" : "delete"), "id": id, "type": type};
  console.log(data);
  $.get( "/updateClass", data, function( data ) {
    console.log("Added");
    console.log(data);
    location.reload();
  });
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
        console.log(ui.item.total.id);
        window.location.href = "/class/" + ui.item.total.id;
        return true;
      } 
    });
  });


});

