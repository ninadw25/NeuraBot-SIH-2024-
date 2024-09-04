const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = path.join(__dirname, '../assets/documents/test.pdf');

try{
    let dataBuffer = fs.readFileSync(filePath);
    pdf(dataBuffer)
        .then((data) => {
            fs.appendFile('../assets/documents/document.txt', data.text, (error, data) => {
                if(error){
                    console.log("Error writing document.txt: ",error);
                }
            })
        })
        .catch((error) => {
            console.error('Error parsing the PDF:', error);
        });
}
catch(error){
    console.log('Error parsing the file:', error);
}