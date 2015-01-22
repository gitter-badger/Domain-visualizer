// Saves options to chrome.storage
function save_options() {
  
  var inputUrl = $('#url').val();
  chrome.storage.sync.get({sites: {}}, function(result) {
      var sites = result.sites;
      sites[inputUrl] = {
          'backgroundColor' : $('#backgroundcolor').val(),
          'textColor' : $('#textcolor').val(),
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
        $('#table-body').append('<tr><td>'+value.name+'</td><td>'+ key + '</td><td><button class="btn btn-primary edit-entry" id="'+ key +'"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>&nbsp;<button class="remove btn btn-danger" id="'+ key +'"><span class="glyphicon glyphicon-trash"></span></button></td></tr>');
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
  $('#project').val(entry.name);
  $('#height').val(entry.height);
  $('#width').val(entry.width);
  $('#save').html('Save');
  
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
  });

  $('#btn-show-add-group-modal').on('click', function(event) {
      event.preventDefault();  
      $('#add-group-modal').modal('show');
  }); 

  $('#btn-save-new-group').on('click', function(event) {
      console.log($('#input-new-group').val());
    
  });
});

$('#save').on('click', function(e) {
    e.preventDefault();
    save_options();
});

$('#option-root-disc').click(function() {
    chrome.storage.sync.set({'option-root-disc': this.checked}, function() {
        chrome.storage.sync.get({"option-root-disc" : false}, function(result) {
            console.log(result);
        });
    });
});

$('#add-env-modal').on('hidden.bs.modal', function () {
    $('#url').val("");
    $('#url').prop("readonly",false);
    $('#backgroundcolor').val("");
    $('#textcolor').val("");
    $('#project').val("");
    $('#height').val("");
    $('#width').val("");
    $('#custom_html').val('');
    $('#enableCustomHtml').prop('checked', false);
    $('#save').html('Add');
    $('#custom-html-group').hide();

    makeFieldReadonly(false);
    // Reset background colors input field.
    resetInputColorBackground('#backgroundcolor');
    resetInputColorBackground('#textcolor');
});
