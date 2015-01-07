// Saves options to chrome.storage
function save_options() {
  var inputColor = document.getElementById('color').value;
  var inputUrl = document.getElementById('url').value;
  var inputProjectName = document.getElementById('project').value;

chrome.storage.sync.get({sites: {}}, function(result) {
    var sites = result.sites;
    sites[inputUrl] = {
        'url' : inputUrl,
        'color' : inputColor,
        'name' : inputProjectName  
    };
    
    chrome.storage.sync.set({sites: sites}, function () {
        chrome.storage.sync.get({sites : {}}, function (result) {
        displayEnvs(result.sites);
        var status = document.getElementById('status');
              status.textContent = 'Options saved.';
              setTimeout(function() {
              status.textContent = '';
            }, 750);
          });
      });
  });
}

function restore_options() {
    chrome.storage.sync.get({ sites: {} }, function(items) {

        displayEnvs(items.sites);
  });
}

function displayEnvs(items)
{
    console.log(items);
    var tableBodyElement = document.getElementById('table-body');
    while(tableBodyElement.firstChild)
      tableBodyElement.removeChild(tableBodyElement.firstChild);

    for(x in items){
        var div = document.getElementById('table-body');
        div.innerHTML = div.innerHTML + '<tr><td>'+items[x].name+'</td><td>'+items[x].url+'</td><td>' +items[x].color 
    + '</td><td><button class="remove btn btn-danger" id="'+items[x].url+'">X</button></tr>';
    }

   bindRemoveListener();
}

function bindRemoveListener(){
  $('.remove').on('click', function(e, item) {
      e.preventDefault();
      var key = $(this).attr('id');
      var row = this.parentNode.parentNode;
      row.parentNode.removeChild(row);

      removeOption(key);
  });
}

function removeOption(key) {
chrome.storage.sync.get({'sites': []}, function(result) {
    var sites = result.sites;
    delete sites[key];
       // set the new array value to the same key
     chrome.storage.sync.set({'sites': sites}, function () {

        // you can use strings instead of objects
        // if you don't  want to define default values
        chrome.storage.sync.get('sites', function (result) {
        displayEnvs(result.sites);
        var status = document.getElementById('status');
              status.textContent = 'Options saved.';
                setTimeout(function() {
                status.textContent = '';
            }, 750);
          });
      });
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
$('#save').on('click', function(e) {
    e.preventDefault();
    save_options();
});
