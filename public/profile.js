function deleteClass(id){
  console.log("ID: " + id)
  $.get( "/updateClass", {"action": "delete", "id": id}, function( data ) {
    console.log(data);
  });
}

$(function() {


  function previewClass(item){
    console.log(item);
    $("div.class_name").html(item.total.department + item.total.number + " - " + item.total.title)
    $("div.description").html(item.total.description);
    $("input#id_holder")[0].value = item.total.id;
    $("div#add").css("display", "inline");
  }

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

  $("#add").on("click", function(event) {
    ///updateClass?action=insert&id=100
    var id = $("input#id_holder")[0].value;
    console.log("ID: " + id);
    alert(id);
    $.get( "/updateClass", {"action": "insert", "id": id}, function( data ) {
      console.log(data);
    });
  });


});

