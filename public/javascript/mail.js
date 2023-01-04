function copyText() {
      
    /* Select text area by id*/
    var Text = document.getElementById("hidden");

    var value = Text.value.replace(/,/g, '\n');
    
    
    navigator.clipboard.writeText(value);

    var copyButton = document.getElementById("copy-button");
    copyButton.innerHTML = "Copied";
    
}