const csvParser = require("csv-parser");
const csv = require("csv-parser");
const fs = require("fs");
const barcodeModel = require("../model/barcodeModel");
const Patient = require("../model/patients");

const barcode = {
  getBarcode: async (req, res) => {
    try {
      let layout;
      let index;
      const role = req.session.role;
      if (role === "admin") {
        layout = "layout";
        index = "index";
      } else if (role === "nurse") {
        layout = "layoutNurse";
        index = "index-nurse";
      }
      res.render(layout, {
        page_path: "./product/addbarcode",
        active_path: "Add Barcode",
        layout: index,
        title: "Add Barcode",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  uploadBulkBarcode: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CSV file uploaded" });
      }

      const filePath = req.file.path;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", async (row) => {
          const {
            productCode,
            productDescription,
            productBrand,
            sterile,
            meterialOfConstruct,
            subCategory,
            productType,
            eachPack,
            unitOfMeasure,
            medicalDeviceClassification,
            gs1Code,
            barcodeCode,
          } = row;

          // Create a new barcode instance
          const newBarcode = new barcodeModel({
            productCode,
            productDescription,
            sterile,
            productBrand,
            meterialOfConstruct,
            subCategory,
            productType,
            eachPack,
            unitOfMeasure,
            medicalDeviceClassification,
            gs1Code,
            barcodeCode,
          });

          // Save the barcode to the database
          await newBarcode.save();
        })
        .on("end", () => {
          // Delete the temporary file after processing
          fs.unlinkSync(filePath);

          res
            .status(200)
            .json({ message: "Bulk barcodes uploaded successfully" });
        })
        .on("error", (error) => {
          console.error("Error processing CSV:", error);
          res.status(500).json({ error: "Internal Server Error" });
        });
    } catch (error) {
      console.error("Error uploading bulk barcodes:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  addBarcode: async (req, res) => {
    try {
      console.log(JSON.stringify(req.body) + "haaaaai");

      console.log("first");
      const {
        productCode,
        productDescription,
        productBrand,
        sterile,
        meterialOfConstruct,
        subCategory,
        productType,
        eachPack,
        unitOfMeasure,
        medicalDeviceClassification,
        gs1Code,
        barcodeCode,
      } = req.body;
      const barcodeImage = req.file ? req.file.filename : null;

      const newBarcode = new barcodeModel({
        productCode,
        productDescription,
        sterile,
        productBrand,
        meterialOfConstruct,
        subCategory,
        productType,
        eachPack,
        unitOfMeasure,
        medicalDeviceClassification,
        gs1Code,
        barcodeCode,
        barcodeImage,
      });

      await newBarcode.save();

      res.locals.showAlert = true;

      res.redirect("/add-barcode");
      console.log("bar code added succesfully");
    } catch (error) {
      console.error("Error adding barcode:", error.message);
      res.status(500).send("Internal Server Error");
    }
  },
  getListBarcode: async (req, res, next) => {
    try {
      const barcodes = await barcodeModel.find();
      res.render("layout", {
        page_path: "./product/listbarcode",
        layout: "index",
        title: "Barcode list",
        barcodes: barcodes,
      });
    } catch (error) {
      next(error);
    }
  },
  getScanBarcode: async (req, res) => {
    let layout;
    let index;
    const role = req.session.role;
    if (role === "admin") {
      layout = "layout";
      index = "index";
    } else if (role === "nurse") {
      layout = "layoutNurse";
      index = "index-nurse";
    }
    try {
      res.render(layout, {
        page_path: "./product/scanbarcode",
        layout: index,
        title: "Import Product",
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },

  scanBarcode: async (req, res) => {
    try {
      function escapeRegExp(input) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
  
      const searchValue = escapeRegExp(req.body.searchValue);
      console.log(searchValue, "vvvvvvvvvvv");
  
      const role = req.session.role;
      console.log(role);
  
      // Perform a case-insensitive search based on the productCode
      const searchData = await barcodeModel.findOne({
        $or: [
          { productCode: { $regex: new RegExp(searchValue, "i") } },
          { gs1Code: { $regex: new RegExp(searchValue, "i") } },
          { barcodeCode: { $regex: new RegExp(searchValue, "i") } },
        ],
      });
  
      if (role === "nurse") {
        const nurseId = req.session.nurseId;
        console.log(req.session);
        console.log(nurseId,"haaaai");
        const patientDetail = await Patient.findOne({ nurse: nurseId });
  
        if (!patientDetail) {
          console.log("Patient not found");
          return res.status(404).json({ error: "Patient not found" });
        }
  
        const medicines = [
          patientDetail.femurProsthesisSize,
          patientDetail.tibialSize,
          patientDetail.plasticInsertSize,
          patientDetail.patellaSize,
        ];
  
        // Check if all medicines are included in the productDescription
        const foundMedicines = medicines.filter((medicine) =>
          searchData.productDescription.includes(medicine)
        );
        console.log(foundMedicines,"founded")
        if(foundMedicines > 0){
          res.json(searchData);
        }else{
          res.json("This Medicine is not included in this patient record")
        }
        // return res.json(foundMedicines);
        // if (foundMedicines.length === medicines.length) {
        //   // If all medicines are found, send res.json
        //   console.log("All medicines found:", foundMedicines);
        //   return res.json(searchData);
        // } else {
        //   console.log("Not all medicines found in description");
        //   return res.status(404).json({ error: "Not all medicines found in description" });
        // }
      } else {
        res.json(searchData);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  
  barcodeDetails: async (req, res, next) => {
    try {
      let layout;
      let index;
      const role = req.session.role;
  
      if (role === "admin") {
        layout = "layout.ejs";
        index = "index.ejs";
      } else if (role === "nurse") {
        layout = "layoutNurse.ejs";
        index = "index-nurse.ejs";
      } else {
        // Handle the case where role is not admin or nurse
        res.status(403).json({ error: "Unauthorized access" });
        return;
      }
  
      const barcodeId = req.query.id;
  
      if (!barcodeId) {
        res.status(400).json({ error: "Barcode ID not provided" });
        return;
      }
  
      const details = await barcodeModel.findOne({ _id: barcodeId });
  
      if (!details) {
        res.status(404).json({ error: "Barcode not found" });
        return;
      }
  
      // Render the barcode details page with the layout and index
      res.render("layout", {
        page_path: "./product/barcodedetails",
        layout: "index",
        title: "Barcode list",
        details: details,
      });
    } catch (error) {
      console.error('Error in barcodeDetails:', error);
      next(error);
    }
  },
  
  
  
  processBarcode: async (req, res) => {
    try {
      const scannedData = req.body.scannedData;

      // Now you can perform actions with the scanned data
      // For example, look up the product in your database
      const product = await barcodeModel.findOne({
        productCode: scannedData, // Assuming productCode is the field you're scanning
      });

      // If the product is found, send it back to the frontend
      if (product) {
        res.json({ product });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = barcode;
