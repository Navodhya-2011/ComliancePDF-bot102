// Ensure the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Client-side unique ID generator (can be moved server-side for better security)
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  document.getElementById("submitBtn").addEventListener("click", () => {
    let inputElem = document.getElementById("pdffile");

    if (!inputElem || inputElem.files.length === 0) {
      alert("Please select at least one PDF file to upload.");
      return;
    }

    let files = inputElem.files; // Handle multiple files
    let formData = new FormData();

    // Loop through all selected files
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let postid = uuidv4();

      // Create a new file with a unique name for each selected file
      let blob = file.slice(0, file.size, "application/pdf");
      let newFile = new File([blob], `${postid}_document.pdf`, { type: "application/pdf" });

      // Append each file to the FormData
      formData.append("pdffiles[]", newFile);
    }

    // Perform the upload
    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then(loadPosts)
      .catch((err) => console.error("Error uploading files:", err));
  });

  // Loads the uploaded posts
  function loadPosts() {
    fetch("/upload")
      .then((res) => res.json())
      .then((x) => {
        let documentsDiv = document.getElementById("documents");
        documentsDiv.innerHTML = ""; // Clear previous entries

        for (let y = 0; y < x[0].length; y++) {
          console.log(x[0][y]);
          const newLink = document.createElement("a");
          newLink.setAttribute("href", "https://storage.googleapis.com/example-bot_1/" + x[0][y].name);
          newLink.setAttribute("target", "_blank");
          newLink.textContent = "View Document";
          documentsDiv.appendChild(newLink);
          documentsDiv.appendChild(document.createElement("br"));
        }
      })
      .catch((err) => console.error("Error loading posts:", err));
  }
});
