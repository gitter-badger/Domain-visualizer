// Saves options to chrome.storage
function save_options() {
  
  var inputUrl = $('#url').val();
  chrome.storage.sync.get({sites: {}}, function(result) {
      var sites = result.sites;
      sites[inputUrl] = {
          'backgroundColor' : $('#backgroundcolor').val(),
          'textColor' : $('#textcolor').val(),
          'textSize' : $('#textsize').val(),
          'name' : $('#project').val(),
          'height': $('#height').val(),
          'width' : $('#width').val(),
          'custom_html' : $("#enableCustomHtml").is(':checked') ? JSON.stringify($('#custom_html').val()) : false
      };
    
    chrome.storage.sync.set({sites: sites}, function () {
          chrome.storage.sync.get({sites : {}}, function (result) {
          displayEnvs(result.sites);
        });
      });
  });
}

function restore_options() {
    chrome.storage.sync.get({ sites: {} }, function(items) {
          displayEnvs(items.sites);
    });

    chrome.storage.sync.get("option-root-disc", function(result) {
            $("#option-root-disc").prop('checked', result['option-root-disc']);
     });
}

function displayEnvs(items)
{
    // Empty table
    $('#table-body').empty();
    // add every stores env
    $.each(items, function(key, value) {
        $('#table-body').append('<tr><td>' + value.name + '</td><td>' + key + '</td><td><button class="btn btn-primary edit-entry" id="'+ key +'"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>&nbsp;<button class="remove btn btn-danger" id="'+ key +'"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
    });

    // bind listeners for removing item
    bindRemoveListener();
    bindEditListeners();
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

function bindEditListeners() {
  $('.edit-entry').on('click', function(e, item) {
      e.preventDefault();
      var key = $(this).attr('id');
      chrome.storage.sync.get({'sites' : []}, function(result) {
          var entry = result.sites[key];
          showEditModal(key, entry);
      });
  });
}

function showEditModal(key, entry) {
  $('#url').val(key);
  $('#url').prop("readonly",true);
  $('#backgroundcolor').val(entry.backgroundColor);
  $('#textcolor').val(entry.textColor);
  $('#textsize').val(entry.textSize);
  $('#project').val(entry.name);
  $('#height').val(entry.height);
  $('#width').val(entry.width);
  $('#save').html('Save');
  $('#add-dmn-lbl').text('Edit domain');

  if(entry.custom_html != false) {
    $('#enableCustomHtml').prop('checked', true);
    $('#custom_html').val(JSON.parse(entry.custom_html));
    $('#custom-html-group').show();

    makeFieldReadonly(true);
  }

  // set colors
  setInputColorBackground('#textcolor');
  setInputColorBackground('#backgroundcolor');

  $('#add-env-modal').modal('show');
}

function makeFieldReadonly(bool)
{
    $('#backgroundcolor').prop("readonly",bool);
    $('#textcolor').prop("readonly",bool);
    $('#textsize').prop("readonly",bool);
    $('#height').prop("readonly",bool);
    $('#width').prop("readonly",bool);
}

function setInputColorBackground(el) {
  $(el).css('background-color', $(el).val());
}

function resetInputColorBackground(el) {
  $(el).css('background-color', '');
}

function removeOption(key) {
chrome.storage.sync.get({'sites': []}, function(result) {
    var sites = result.sites;
    delete sites[key];
     chrome.storage.sync.set({'sites': sites}, function () {
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

// Prepare other js functionalities
document.addEventListener('DOMContentLoaded', function() {
  $('.color-box').colpick({
      colorScheme:'dark',
      layout:'rgbhex',
      color:'#ffffff',
      onSubmit:function(hsb,hex,rgb,el) {
        $(el).css('background-color', '#'+hex);
        $(el).colpickHide();
        $(el).val('#'+hex);
    }
  })
  .css('background-color', '#ffffff');

  $('.color-box').focus(function() {
      $(this).colpickShow();
  });

  $('#enableCustomHtml').change(function() {
    if(this.checked) {
        makeFieldReadonly(true);
        $('#custom-html-group').show();
    } else {
        $('#custom-html-group').hide();
        makeFieldReadonly(false);
    }
  })
});

$('#save').on('click', function(e) {
    e.preventDefault();
    save_options();
});

$('#button-export').on('click', function(e) {
    e.preventDefault();
    console.log('export');
    $('#modal-impExp').modal('show');
        // Empty table
    $('#table-body-export').empty();
    
    // add every stores env
    chrome.storage.sync.get({sites : {}}, function (result) {
    $.each(result.sites, function(key, value) {
        $('#table-body-export').append('<tr><td><input type="checkbox" id="'+key+'"></td><td>' + value.name + '</td><td>' + key + '</td><td></tr>');
      });
    });
        

});

$('#button-import').on('click', function(e){
    e.preventDefault();
    $('#modal-impExp-body').empty();
    $('#button-download').hide();
    $('#button-import-json').show();
    $('#impExp-label').text('Paste the json and click import below, or click select file and import.');
    $('#modal-impExp-body').append('<textarea  class="form-control" id="text-import-json" cols="50" rows="5"></textarea>');
    $('#modal-impExp').modal('show');
    $('#button-import-json').on('click', function() {
        console.log($('#text-import-json').val());
    });
});

$('#checkbox-domains-all').change(function() {
  $('td input:checkbox', $('#table-body-export')).prop('checked',this.checked);
});

$('#button-download').on('click', function() {
    var keys = Array();
    $.each($('td input:checkbox', $('#table-body-export')), function() { 
        if(this.checked) {
          keys.push($(this).attr('id'));
        }
    });

    if(keys.length > 0)
        exportDomains(keys);
});

$('#option-root-disc').click(function() {
    chrome.storage.sync.set({'option-root-disc': this.checked}, function() {
        chrome.storage.sync.get({"option-root-disc" : false}, function(result) {
            console.log(result);
        });
    });
});

function exportDomains(keys) {
  //get all domains
  chrome.storage.sync.get({sites: {}}, function(result) {
        
      // determine wich domains have to be exported
      var domainsForExport = {};
      keys.forEach(function(entry) {
          domainsForExport[entry] = result.sites[entry];
      });

      download('export-'+ new Date().getTime() + '.json', JSON.stringify(domainsForExport, null, '\t'));
      $('#checkbox-domains-all').prop('checked', false);
  });
}

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);
  pom.click();
}

$('#add-env-modal').on('hidden.bs.modal', function () {
    $('#url').val("");
    $('#url').prop("readonly",false);
    $('#backgroundcolor').val("");
    $('#textcolor').val("");
    $('#textsize').val("");
    $('#project').val("");
    $('#height').val("");
    $('#width').val("");
    $('#custom_html').val('');
    $('#enableCustomHtml').prop('checked', false);
    $('#save').html('Add');
    $('#custom-html-group').hide();
    $('#add-dmn-lbl').text('Add domain');

    makeFieldReadonly(false);
    // Reset background colors input field.
    resetInputColorBackground('#backgroundcolor');
    resetInputColorBackground('#textcolor');

});