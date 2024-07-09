const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const db = require('../database');
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.post('/create_report', async (req, res) => {
  const { millitary_unit1, millitary_unit2, name_who_report } = req.body;

  try {
    await createReport({ millitary_unit1, millitary_unit2, name_who_report });

    res.send('Отчет успешно создан');
  } catch (error) {
    return res.status(500).send('Ошибка при создании отчета');
  }
});

async function createReport({millitary_unit1, millitary_unit2, name_who_report}) {
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

module.exports = router;
