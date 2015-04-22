$(document).ready(function () {
  function addClassToProspective(id){
    console.log("addClassToProspective: " + id);
  }
  function populateColumns(types, key, id){
    $('#header' + (id + 1))[0].innerHTML = key;
    for(var i = 0; i < types[key].length; ++i){
      var div = document.createElement('div');
      div.className =  'col-md-12';
      div.innerHTML = types[key][i].name;
      document.getElementById('header' + (id + 1)).appendChild(div);
    }
  }
  function exploreProspective(id){
    console.log("exploreProspective: " + id);
    $.get( "/class/" + id + "/json", function( data ) {
      var section_data = data.section_data;
      console.log(section_data);
      var types = {};
      for(var i = 0; i < section_data.length; ++i){
        types[section_data[i].type] = [];
      }
      for(var i = 0; i < section_data.length; ++i){
        types[section_data[i].type].push(section_data[i]);
      }
      console.log(types);
      document.getElementById('header1').innerHTML = '';
      document.getElementById('header2').innerHTML = '';
      document.getElementById('header3').innerHTML = '';
      var keys = Object.keys(types);
      if(keys.length >= 1){
        populateColumns(types, keys[0], 0);
      }
      if(keys.length >= 2){
        populateColumns(types, keys[1], 1);
      }
      if(keys.length >= 3){
        populateColumns(types, keys[2], 2);
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
