const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views");

app.use(express.static(src));

// Initialize multer for file handling (in-memory storage)
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb
  },
});

let projectId = "tokyo-analyst-431809-n3"; 
let keyFilename = "./tokyo-analyst-431809-n3-047c6d9a2b3d.json"; 
const storage = new Storage({
  projectId,
  keyFilename,
});
const bucket = storage.bucket("example-bot_1");

// Endpoint to fetch all files in the bucket
app.get("/upload", async (req, res) => {
  try {  
    const [files] = await bucket.getFiles();
    res.send([files]);
    console.log("Successfully fetched files from the bucket.");
  } catch (error) {
    res.status(500).send("Error fetching files: " + error);
  }
});

// Endpoint to handle multiple file uploads
app.post("/upload", multer.array("pdffiles[]"), (req, res) => {
  console.log("Received /upload request.");

  try {
    if (req.files) {
      console.log("Files found, uploading...");

      let uploadPromises = req.files.map(file => {
        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream();

        return new Promise((resolve, reject) => {
          blobStream.on("finish", resolve);
          blobStream.on("error", reject);
          blobStream.end(file.buffer);
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          res.status(200).send("Success");
          console.log("All files uploaded successfully.");
        })
        .catch(error => {
          console.error("Error uploading files:", error);
          res.status(500).send("Error uploading files");
        });
    } else {
      throw "No files uploaded.";
    }
  } catch (error) {
    res.status(500).send("Error handling upload: " + error);
  }
});

// Serve the index.html page
app.get("/", (req, res) => {
  res.sendFile(path.join(src, "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
