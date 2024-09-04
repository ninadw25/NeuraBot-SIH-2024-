const fs = require('fs');

function readTxt(){
    fs.readFile("../assets/documents/document.txt", "utf-8", (err, context) => {
        if(err){
            console.log("Error reading the file: ", err);
        }
        else{
            return context;
        }
    });
}

module.exports = {
    readTxt
};