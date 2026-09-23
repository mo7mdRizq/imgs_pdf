const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");

const preview = document.getElementById("preview");
const imagesSection = document.getElementById("imagesSection");

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");

const addMoreBtn = document.getElementById("addMoreBtn");

const imageCount = document.getElementById("imageCount");

const successOverlay =
    document.getElementById("successOverlay");

const successBtn =
    document.getElementById("successBtn");


// =====================================
// SELECTED IMAGES
// =====================================

let selectedImages = [];


// =====================================
// OPEN FILE PICKER
// =====================================

dropZone.addEventListener("click", () => {
    imageInput.click();
});


addMoreBtn.addEventListener("click", () => {
    imageInput.click();
});


// =====================================
// FILE INPUT
// =====================================

imageInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    addImages(files);

    // Allow selecting the same file again
    this.value = "";

});


// =====================================
// ADD IMAGES
// =====================================

function addImages(files) {

    const validFiles = files.filter(file =>
        file.type.startsWith("image/")
    );

    selectedImages.push(...validFiles);

    renderImages();
}


// =====================================
// RENDER IMAGES
// =====================================

function renderImages() {

    preview.innerHTML = "";

    if (selectedImages.length === 0) {

        imagesSection.classList.add("hidden");

        dropZone.classList.remove("hidden");

        updateCounter();

        return;
    }


    dropZone.classList.add("hidden");

    imagesSection.classList.remove("hidden");


    selectedImages.forEach((file, index) => {

        const card =
            document.createElement("div");

        card.className = "image-card";

        card.draggable = true;

        card.dataset.index = index;


        // Image
        const img =
            document.createElement("img");

        img.src = URL.createObjectURL(file);


        // Overlay
        const overlay =
            document.createElement("div");

        overlay.className = "image-overlay";


        // Image number
        const number =
            document.createElement("span");

        number.className = "image-number";

        number.textContent = index + 1;


        // Remove button
        const removeButton =
            document.createElement("button");

        removeButton.className = "remove-image";

        removeButton.innerHTML = "×";


        removeButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                selectedImages.splice(index, 1);

                renderImages();

            }
        );


        overlay.appendChild(number);

        card.appendChild(img);

        card.appendChild(overlay);

        card.appendChild(removeButton);

        preview.appendChild(card);


        // Drag events
        card.addEventListener(
            "dragstart",
            handleDragStart
        );

        card.addEventListener(
            "dragover",
            handleDragOver
        );

        card.addEventListener(
            "drop",
            handleDrop
        );

        card.addEventListener(
            "dragend",
            handleDragEnd
        );

    });


    updateCounter();
}


// =====================================
// UPDATE IMAGE COUNTER
// =====================================

function updateCounter() {

    const count = selectedImages.length;

    imageCount.textContent =
        `${count} ${count === 1 ? "image" : "images"}`;

}


// =====================================
// DRAG & DROP SORTING
// =====================================

let draggedIndex = null;


function handleDragStart(event) {

    draggedIndex =
        Number(event.currentTarget.dataset.index);

    event.currentTarget.classList.add("dragging");

}


function handleDragOver(event) {

    event.preventDefault();

}


function handleDrop(event) {

    event.preventDefault();

    const targetIndex =
        Number(event.currentTarget.dataset.index);


    if (
        draggedIndex === null ||
        draggedIndex === targetIndex
    ) {

        return;

    }


    const draggedImage =
        selectedImages[draggedIndex];


    selectedImages.splice(
        draggedIndex,
        1
    );


    selectedImages.splice(
        targetIndex,
        0,
        draggedImage
    );


    renderImages();

}


function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

    draggedIndex = null;

}


// =====================================
// DROP ZONE
// =====================================

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add("dragover");

    }
);


dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );


        const files =
            Array.from(event.dataTransfer.files);


        addImages(files);

    }
);


// =====================================
// CLEAR ALL IMAGES
// =====================================

clearBtn.addEventListener(
    "click",
    () => {

        selectedImages = [];

        renderImages();

    }
);


// =====================================
// CREATE PDF
// =====================================

generateBtn.addEventListener(
    "click",
    async () => {

        if (selectedImages.length === 0) {
            return;
        }


        setLoading(true);


        try {

            const { jsPDF } = window.jspdf;


            // =================================
            // A4 PAGE
            // =================================

            const pageWidth = 210;
            const pageHeight = 297;


            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            // =================================
            // PROCESS EVERY IMAGE
            // =================================

            for (
                let i = 0;
                i < selectedImages.length;
                i++
            ) {

                const file =
                    selectedImages[i];


                // Convert file to Base64
                const imageData =
                    await fileToDataURL(file);


                // Load image
                const img =
                    await loadImage(imageData);


                // =================================
                // IMAGE RATIO
                // =================================

                const imageRatio =
                    img.width / img.height;


                const pageRatio =
                    pageWidth / pageHeight;


                let width;
                let height;


                /*
                 * IMPORTANT:
                 *
                 * We NEVER stretch the image.
                 *
                 * The original aspect ratio
                 * is always preserved.
                 *
                 * The image will fit INSIDE
                 * the A4 page.
                 */


                if (imageRatio > pageRatio) {

                    // Image is wider than A4

                    width = pageWidth;

                    height =
                        width / imageRatio;

                } else {

                    // Image is taller than A4

                    height = pageHeight;

                    width =
                        height * imageRatio;

                }


                // =================================
                // CENTER IMAGE
                // =================================

                const x =
                    (pageWidth - width) / 2;


                const y =
                    (pageHeight - height) / 2;


                // =================================
                // ADD NEW PAGE
                // =================================

                if (i > 0) {

                    pdf.addPage();

                }


                // =================================
                // DETERMINE IMAGE FORMAT
                // =================================

                let format = "JPEG";


                if (
                    file.type === "image/png"
                ) {

                    format = "PNG";

                }


                if (
                    file.type === "image/webp"
                ) {

                    /*
                     * jsPDF can handle WEBP
                     * in modern versions.
                     */

                    format = "WEBP";

                }


                // =================================
                // ADD IMAGE
                // =================================

                pdf.addImage(
                    imageData,
                    format,
                    x,
                    y,
                    width,
                    height,
                    undefined,
                    "FAST"
                );

            }


            // =================================
            // SAVE PDF
            // =================================

            pdf.save(
                "images-to-pdf.pdf"
            );


            // Small delay for animation
            await delay(500);


            setLoading(false);


            // =================================
            // SHOW SUCCESS
            // =================================

            showSuccess();


        } catch (error) {

            console.error(
                "PDF Error:",
                error
            );


            setLoading(false);


            alert(
                "Something went wrong while creating the PDF."
            );

        }

    }
);


// =====================================
// FILE -> DATA URL
// =====================================

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(reader.result);


            reader.onerror =
                () => reject(
                    new Error(
                        "Could not read image."
                    )
                );


            reader.readAsDataURL(file);

        }
    );

}


// =====================================
// LOAD IMAGE
// =====================================

function loadImage(src) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();


            img.onload =
                () => resolve(img);


            img.onerror =
                () => reject(
                    new Error(
                        "Could not load image."
                    )
                );


            img.src = src;

        }
    );

}


// =====================================
// LOADING STATE
// =====================================

function setLoading(isLoading) {

    if (isLoading) {

        generateBtn.classList.add(
            "loading"
        );

    } else {

        generateBtn.classList.remove(
            "loading"
        );

    }

}


// =====================================
// SUCCESS MODAL
// =====================================

function showSuccess() {

    successOverlay.classList.add(
        "show"
    );

}


function hideSuccess() {

    successOverlay.classList.remove(
        "show"
    );

}


// =====================================
// CREATE ANOTHER PDF
// =====================================

successBtn.addEventListener(
    "click",
    () => {

        hideSuccess();


        // Clear selected images
        selectedImages = [];


        // Clear preview
        renderImages();

    }
);


// =====================================
// CLOSE SUCCESS WITH ESC
// =====================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            hideSuccess();

        }

    }
);


// =====================================
// DELAY
// =====================================

function delay(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

}
