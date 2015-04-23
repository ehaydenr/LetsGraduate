var table_rows = document.getElementsByTagName('tr');

var data = {
  "trans_credit": [], 
  "insti_credit": [],
  //"trans_totals": [],
  "crses_progress": [] 
}

var current_field;
var next_term = 'Term: Fall 2015 - Urbana-Champaign';
var prospective = false;

for(var i = 0; i < table_rows.length; ++i){
  var tr = table_rows[i];

  var children = Array.prototype.filter.call(tr.childNodes, function(el){
    return el.nodeType === 1;
  });

  if(children.length == 0) continue;

  if(children[0].childNodes[0].innerText == next_term) prospective = true;

  if(children[0].tagName == 'TH'){

    // Looking at heading(s)
    var a_tags = children[0].getElementsByTagName("A");

    // Change field
    if(a_tags.length > 0){
      current_field = a_tags[1].name;
    }

  }else{
    // Looking at table data
    if(current_field == 'insti_credit' && children.length == 9){
      data.insti_credit.push({"subject": children[0].innerText, "number": children[1].innerText, "hours": children[5].innerText.replace(/(\r\n|\n|\r)/gm,""), "prospective": prospective});
    }else if(current_field == 'trans_credit' && children.length == 7 && children[1].innerText != "Attempt Hours"){
      data.trans_credit.push({"subject": children[0].innerText, "number": children[1].innerText, "hours": children[4].innerText.replace(/(\r\n|\n|\r)/gm,""), "prospective": prospective});
    }else if(current_field == 'trans_credit'){
      //console.log(children);
    }else if(current_field == 'crses_progress' && children.length == 5){
      data.crses_progress.push({"subject": children[0].innerHTML, "number": children[1].innerHTML, "hours": children[4].innerText.replace(/(\r\n|\n|\r)/gm,""), "prospective": prospective});
    }
  }

}

console.log(data);
data;

