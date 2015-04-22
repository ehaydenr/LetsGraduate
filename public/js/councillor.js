$(document).ready(function () {
  function addClassToProspective(id){
    console.log("addClassToProspective: " + id);
  }
  function exploreProspective(id){
    console.log("exploreProspective: " + id);
    $.get( "/class/" + id + "/json", function( data ) {
      var section_data = data.section_data;
      var types = {};
      for(var i = 0; i < section_data.length; ++i){
        types[section_data[i].type] = [];
      }
      for(var i = 0; i < section_data.length; ++i){
        types[section_data[i].type].push(section_data[i]);
      }
      console.log(types);
      var keys = Object.keys(types);
      if(keys.length >= 1){
        $('#header1')[0].innerHTML = keys[0];
      }
      if(keys.length >= 2){
        $('#header2')[0].innerHTML = keys[1];
      }
      if(keys.length >= 3){
        $('#header3')[0].innerHTML = keys[2];
      }
    });
  }
  $("span#explorer").click(function(){
    exploreProspective($(this)[0].getAttribute("value"));
  });

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
