const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const path = require('path');
const fs = require('fs');

async function createReport({ millitary_unit1, millitary_unit2, name_who_report }) {
    // {
    //     user: {
    //       id: 1,
    //       lastName: 'Кучма',
    //       firstName: 'Леонід',
    //       secondName: 'Данилович',
    //       unit: "Взв.зв'язку",
    //       militaryRank: 'солдат'
    //     },
    //     days: [
    //       {
    //         id: 4785,
    //         user_id: 1,
    //         date: '2024-04-02',
    //         is_worked: 1,
    //         is_payed: 0
    //       }
    //     ]
    // }

    const content = fs.readFileSync(
        path.resolve(__dirname, "template.docx"),
        "binary"
    );
    
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    
    doc.render({
        millitary_unit1,
        millitary_unit2,
        name_who_report
    });
    
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    
    fs.writeFileSync(path.resolve(__dirname, "report.docx"), buf);
}

module.exports = createReport;