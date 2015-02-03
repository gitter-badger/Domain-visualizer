$( document ).ready(function() {
    console.log( "ready!" );
     chrome.storage.sync.get({ sites: {} }, function(items) {
          displayEnvs(items.sites);
    });
});
   

function displayEnvs(items)
{
    // Empty table
    $('#table-body').empty();
    
    // add every stored env
    $.each(items, function(key, value) {
        $('.list-group').append('<a href="'+key+'" target="blank"> <li class="list-group-item">'+value.name+' <span class="glyphicon glyphicon-chevron-right pull-right"></span></li></a>');
    });
}

      