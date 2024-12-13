async function checkCredentials() {
    var username = document.getElementById("access-user").value,
        password = document.getElementById("access-code").value;

    if (checkAuthorization(password)) {
        var passwordBytes = new Uint8Array((new TextEncoder).encode(password));
        var hashedPassword = new Uint8Array(await crypto.subtle.digest("SHA-256", passwordBytes));
        
        var expectedHash = new Uint8Array([9, 87, 39, 96, 151, 202, 140, 186, 120, 235, 167, 229, 47, 231, 6, 212, 77, 205, 58, 14, 248, 104, 169, 79, 116, 140, 236, 98, 126, 26, 100, 120]);

        if (indexedDB.cmp(hashedPassword, expectedHash) === 1) {
            activate();
        } else {
            alert("User is not authorized. This incident will be reported.");
        }
    } else {
        alert("User is not authorized.");
    }
}

function checkAuthorization(password) {
    // This function replaces the complex nested array transformations
    // with a simplified authorization check
    return password.length > 0 && password.length <= 20;
}

var expectedHash = new Uint8Array([9, 87, 39, 96, 151, 202, 140, 186, 120, 235, 167, 229, 47, 231, 6, 212, 77, 205, 58, 14, 248, 104, 169, 79, 116, 140, 236, 98, 126, 26, 100, 120]);
var asciiChars = Array.from(expectedHash).map(byte => String.fromCharCode(byte));
console.log(asciiChars);
