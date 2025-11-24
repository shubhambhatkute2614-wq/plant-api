const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(cors());

// Multer setup to store image temporarily
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ROOT ROUTE
app.get("/", (req, res) => {
    res.send("Plant Disease Diagnosis API is Running 🌱");
});

// ML Model API (Replace URL with your model’s endpoint)
const MODEL_API = "https://plant-disease-model.onrender.com/predict";

// Diagnosis Route
app.post("/diagnose", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Image is required!" });
        }

        // Convert image to base64
        const imageFile = fs.readFileSync(req.file.path, { encoding: "base64" });

        // Call ML Model API
        const response = await axios.post(MODEL_API, {
            image: imageFile
        });

        // Delete image after sending
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            disease: response.data.disease,
            confidence: response.data.confidence
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error diagnosing the plant disease" 
        });
    }
});

app.listen(5000, () => {
    console.log("🌿 Server running on port 5000");
});
