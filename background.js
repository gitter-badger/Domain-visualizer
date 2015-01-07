 chrome.storage.sync.get({ sites: {} }, function(items) {
	 var url = document.URL.split('/')[2].replace('www.', '');
	 $.each(items.sites, function(key, value) {
		 var storedEnvKey = key.split('/')[2].replace('www.','');
		 if(url == storedEnvKey) {
		     insertHtmlInDom(value);
		     return false;
		 }
	  });
  });

function insertHtmlInDom(param)
{
   // $('body').prepend('<div style="background-color:' + param.color +';>' + param.name + '</div>');
    $('body').prepend('<div style="text-align: center; vertical-align: middle;font-size: xx-large; background-color: '
		    +param.color+'; height: 50px;"><div style="padding-top: 15px;">'+param.name+'</div></div>');
}
