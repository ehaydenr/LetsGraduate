$(document).ready(function () {
  window.toggleProspective = function(add, id){
    console.log("addClassToProspective: " + id);
    var data = {"action": (add ? "insert" : "delete"), "id": id, "type": 'prospective'};
    console.log(data);
    $.get( "/updateClass", data, function( data ) {
      console.log("Added");
      console.log(data);
      location.reload();
    });
  }
  function populateColumns(types, key, id){
    $('#header' + (id + 1))[0].innerHTML = '<h4>' + key + '</h4>';
    for(var i = 0; i < types[key].length; ++i){
      var div = document.createElement('div');
      div.className =  'col-md-12';
      div.style.marginBottom = '10px';
      var name = document.createElement('div');
      var class_location = document.createElement('div');
      var dow = document.createElement('div');

      name.innerHTML = types[key][i].name + ' - ' + types[key][i].crn;
      class_location.innerHTML = types[key][i].location;
      dow.innerHTML = types[key][i].daysOfWeek + ' ' + types[key][i].beginTime.substring(0,5) + ' - ' + types[key][i].endTime.substring(0,5);

      name.style.backgroundColor = '#EAECEB';
      class_location.style.backgroundColor = '#B0E2F9';
      dow.style.backgroundColor = '#DCFFD9';

      div.appendChild(name);
      div.appendChild(class_location);
      div.appendChild(dow);
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
      document.getElementById('class_header').innerHTML = data.course_data.title;
      document.getElementById('remove_button').innerHTML =  ' <button type="button" onclick="toggleProspective(false, ' + id + ')">Remove From Prospective</button>';
      document.getElementById('class_desc').innerHTML = data.course_data.description;
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
        toggleProspective(true, ui.item.total.id);
        return true;
      } 
    });
  });
});
