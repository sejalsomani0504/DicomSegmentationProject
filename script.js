import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Configure Cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

// Initialize DOM elements
const dicomImageElement = document.getElementById("dicomImage");

// Enable the DICOM image element
cornerstone.enable(dicomImageElement);

// Load and Display DICOM Image
async function loadAndDisplayImage(imageId) {
    try {
        const image = await cornerstone.loadImage(imageId);
        cornerstone.displayImage(dicomImageElement, image);

        // Add segmentation tools
        cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
        cornerstoneTools.addTool(cornerstoneTools.SegmentationTool);
        cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
    } catch (error) {
        console.error("Error loading image:", error);
    }
}

// Parse DICOM file and extract metadata
function parseDicomFile(file) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const arrayBuffer = event.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        loadAndDisplayImage(imageId);
    };
    fileReader.readAsArrayBuffer(file);
}

// Handle file upload
document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        parseDicomFile(file);
    }
});

// Segmentation logic
function segmentBoneAndSoftTissue() {
    const viewport = cornerstone.getViewport(dicomImageElement);
    const image = cornerstone.getImage(dicomImageElement);

    // Apply simple segmentation logic (e.g., thresholding)
    const pixelData = image.getPixelData();
    const segmentationData = new Uint8Array(pixelData.length);

    for (let i = 0; i < pixelData.length; i++) {
        const pixelValue = pixelData[i];

        if (pixelValue > 400) {
            // Threshold for bone
            segmentationData[i] = 255;
        } else if (pixelValue > 100 && pixelValue <= 400) {
            // Threshold for soft tissue
            segmentationData[i] = 128;
        } else {
            segmentationData[i] = 0; // Background
        }
    }

    // Render segmentation results
    cornerstone.displayImage(dicomImageElement, image);
}

// Attach segmentation button functionality
document.getElementById("segmentButton").addEventListener("click", segmentBoneAndSoftTissue);
