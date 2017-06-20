/**
 * Created by lin on 6/20/17.
 */
function readBinaryFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            alert(fileEntry.fullPath + ": " + this.result);
            var blob = new Blob([new Uint8Array(this.result)], {type: "image/png"});
            alert(blob);
        };
        reader.readAsArrayBuffer(file);

    }, function (error) {
        alert("onErrorReadFile:" + error);
    });
}

function readFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log("Successful file read: " + this.result);
            alert(fileEntry.fullPath + ": " + this.result);
        };
        reader.readAsText(file);
    }, function (error) {
        alert("onErrorReadFile:" + error);
    });
}

function writeFile(fileEntry, dataObj, isAppend) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            console.log("Successful file write...");
            if (dataObj.type === "image/png") {
                readBinaryFile(fileEntry);
            }
            else {
                readFile(fileEntry);
            }
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(dataObj);
    });
}

function createFile(dirEntry, fileName, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {

        writeFile(fileEntry, null, isAppend);

    }, function (error) {
        alert("createfile:" + error);
    });

}

window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
    console.log('file system open: ' + dirEntry.name);
    var isAppend = true;
    createFile(dirEntry, "fileToAppend.txt", isAppend);
}, function (error) {
    alert("1:" + error);
});
