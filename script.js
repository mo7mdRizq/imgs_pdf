// =====================================
// ELEMENTS
// =====================================

const imageInput =
    document.getElementById("imageInput");

const cameraInput =
    document.getElementById("cameraInput");

const dropZone =
    document.getElementById("dropZone");

const chooseImagesBtn =
    document.getElementById("chooseImagesBtn");

const cameraBtn =
    document.getElementById("cameraBtn");

const preview =
    document.getElementById("preview");

const imagesSection =
    document.getElementById("imagesSection");

const generateBtn =
    document.getElementById("generateBtn");

const clearBtn =
    document.getElementById("clearBtn");

const addMoreBtn =
    document.getElementById("addMoreBtn");

const imageCount =
    document.getElementById("imageCount");

const successOverlay =
    document.getElementById("successOverlay");

const successBtn =
    document.getElementById("successBtn");


// Settings

const pageSizeSelect =
    document.getElementById("pageSize");

const marginSelect =
    document.getElementById("marginSize");

const imageFitSelect =
    document.getElementById("imageFit");

const orientationButtons =
    document.querySelectorAll(".orientation-btn");


// Preview

const previewImage =
    document.getElementById("previewImage");

const pdfPage =
    document.getElementById("pdfPage");

const prevPageBtn =
    document.getElementById("prevPageBtn");

const nextPageBtn =
    document.getElementById("nextPageBtn");

const currentPageElement =
    document.getElementById("currentPage");

const totalPagesElement =
    document.getElementById("totalPages");


// =====================================
// STATE
// =====================================

let selectedImages = [];

let currentPageIndex = 0;

let draggedIndex = null;


// PDF settings

const pdfSettings = {

    pageSize: "a4",

    orientation: "portrait",

    margin: 10,

    fit: "fit"

};


// =====================================
// OPEN FILE PICKER
// =====================================

chooseImagesBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        imageInput.click();

    }
);


addMoreBtn.addEventListener(
    "click",
    () => {

        imageInput.click();

    }
);


// =====================================
// CAMERA
// =====================================

cameraBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        cameraInput.click();

    }
);


// =====================================
// DROP ZONE CLICK
// =====================================

dropZone.addEventListener(
    "click",
    (event) => {

        // Don't trigger file picker
        // if a button was clicked

        if (
            event.target.closest("button")
        ) {

            return;

        }

        imageInput.click();

    }
);


// =====================================
// NORMAL FILE INPUT
// =====================================

imageInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(this.files);

        addImages(files);

        // Allow selecting same file again

        this.value = "";

    }
);


// =====================================
// CAMERA INPUT
// =====================================

cameraInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(this.files);

        addImages(files);

        this.value = "";

    }
);


// =====================================
// ADD IMAGES
// =====================================

function addImages(files) {

    const validFiles =
        files.filter(file =>
            file.type.startsWith("image/")
        );


    if (validFiles.length === 0) {

        return;

    }


    selectedImages.push(
        ...validFiles
    );


    // Keep preview on first image
    // only when adding first batch

    if (
        selectedImages.length ===
        validFiles.length
    ) {

        currentPageIndex = 0;

    }


    renderImages();

    updatePDFPreview();

}


// =====================================
// RENDER IMAGES
// =====================================

function renderImages() {

    preview.innerHTML = "";


    if (
        selectedImages.length === 0
    ) {

        imagesSection.classList.add(
            "hidden"
        );

        dropZone.classList.remove(
            "hidden"
        );

        updateCounter();

        return;

    }


    dropZone.classList.add(
        "hidden"
    );


    imagesSection.classList.remove(
        "hidden"
    );


    selectedImages.forEach(
        (file, index) => {


            const card =
                document.createElement("div");


            card.className =
                "image-card";


            card.draggable = true;


            card.dataset.index =
                index;


            // =============================
            // IMAGE
            // =============================

            const img =
                document.createElement("img");


            img.src =
                URL.createObjectURL(file);


            img.alt =
                `Image ${index + 1}`;


            // =============================
            // OVERLAY
            // =============================

            const overlay =
                document.createElement("div");


            overlay.className =
                "image-overlay";


            // =============================
            // NUMBER
            // =============================

            const number =
                document.createElement("span");


            number.className =
                "image-number";


            number.textContent =
                index + 1;


            // =============================
            // REMOVE BUTTON
            // =============================

            const removeButton =
                document.createElement("button");


            removeButton.className =
                "remove-image";


            removeButton.innerHTML =
                "×";


            removeButton.type =
                "button";


            removeButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    selectedImages.splice(
                        index,
                        1
                    );


                    // Keep current page valid

                    if (
                        currentPageIndex >=
                        selectedImages.length
                    ) {

                        currentPageIndex =
                            Math.max(
                                0,
                                selectedImages.length - 1
                            );

                    }


                    renderImages();

                    updatePDFPreview();

                }
            );


            // =============================
            // BUILD CARD
            // =============================

            overlay.appendChild(
                number
            );


            card.appendChild(
                img
            );


            card.appendChild(
                overlay
            );


            card.appendChild(
                removeButton
            );


            preview.appendChild(
                card
            );


            // =============================
            // DRAG EVENTS
            // =============================

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

        }
    );


    updateCounter();

}


// =====================================
// IMAGE COUNTER
// =====================================

function updateCounter() {

    const count =
        selectedImages.length;


    imageCount.textContent =
        `${count} ${
            count === 1
                ? "image"
                : "images"
        }`;

}


// =====================================
// DRAG & DROP SORTING
// =====================================

function handleDragStart(event) {

    draggedIndex =
        Number(
            event.currentTarget.dataset.index
        );


    event.currentTarget.classList.add(
        "dragging"
    );

}


function handleDragOver(event) {

    event.preventDefault();

}


function handleDrop(event) {

    event.preventDefault();


    const targetIndex =
        Number(
            event.currentTarget.dataset.index
        );


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


    currentPageIndex =
        targetIndex;


    renderImages();

    updatePDFPreview();

}


function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );


    draggedIndex = null;

}


// =====================================
// DROP ZONE DRAG
// =====================================

dropZone.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

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
            Array.from(
                event.dataTransfer.files
            );


        addImages(files);

    }
);


// =====================================
// CLEAR ALL
// =====================================

clearBtn.addEventListener(
    "click",
    () => {

        selectedImages = [];

        currentPageIndex = 0;

        renderImages();

    }
);


// =====================================
// PAGE SIZE
// =====================================

pageSizeSelect.addEventListener(
    "change",
    () => {

        pdfSettings.pageSize =
            pageSizeSelect.value;

        updatePDFPreview();

    }
);


// =====================================
// MARGIN
// =====================================

marginSelect.addEventListener(
    "change",
    () => {

        pdfSettings.margin =
            Number(
                marginSelect.value
            );

        updatePDFPreview();

    }
);


// =====================================
// IMAGE FIT
// =====================================

imageFitSelect.addEventListener(
    "change",
    () => {

        pdfSettings.fit =
            imageFitSelect.value;

        updatePDFPreview();

    }
);


// =====================================
// ORIENTATION
// =====================================

orientationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                orientationButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                pdfSettings.orientation =
                    button.dataset.orientation;


                updatePDFPreview();

            }
        );

    }
);


// =====================================
// PREVIEW NEXT
// =====================================

nextPageBtn.addEventListener(
    "click",
    () => {

        if (
            currentPageIndex <
            selectedImages.length - 1
        ) {

            currentPageIndex++;

            updatePDFPreview();

        }

    }
);


// =====================================
// PREVIEW PREVIOUS
// =====================================

prevPageBtn.addEventListener(
    "click",
    () => {

        if (
            currentPageIndex > 0
        ) {

            currentPageIndex--;

            updatePDFPreview();

        }

    }
);


// =====================================
// UPDATE PDF PREVIEW
// =====================================

function updatePDFPreview() {

    if (
        selectedImages.length === 0
    ) {

        previewImage.src = "";

        currentPageElement.textContent =
            "0";

        totalPagesElement.textContent =
            "0";

        prevPageBtn.disabled = true;

        nextPageBtn.disabled = true;

        return;

    }


    // Make sure index is valid

    if (
        currentPageIndex >=
        selectedImages.length
    ) {

        currentPageIndex =
            selectedImages.length - 1;

    }


    const file =
        selectedImages[currentPageIndex];


    const imageURL =
        URL.createObjectURL(file);


    previewImage.src =
        imageURL;


    // =================================
    // IMAGE FIT
    // =================================

    previewImage.classList.remove(
        "fit",
        "fill"
    );


    previewImage.classList.add(
        pdfSettings.fit
    );


    // =================================
    // PAGE MARGINS
    // =================================

    const margin =
        pdfSettings.margin;


    /*
     * Preview uses percentage-based
     * margins to visually represent
     * the PDF margins.
     */

    const pageSize =
        getPageSize();


    const marginX =
        (margin / pageSize.width) * 100;


    const marginY =
        (margin / pageSize.height) * 100;


    previewImage.style.left =
        `${marginX}%`;


    previewImage.style.top =
        `${marginY}%`;


    previewImage.style.width =
        `${100 - marginX * 2}%`;


    previewImage.style.height =
        `${100 - marginY * 2}%`;


    // =================================
    // LANDSCAPE PREVIEW
    // =================================

    if (
        pdfSettings.orientation ===
        "landscape"
    ) {

        pdfPage.classList.add(
            "landscape"
        );

    } else {

        pdfPage.classList.remove(
            "landscape"
        );

    }


    // =================================
    // COUNTER
    // =================================

    currentPageElement.textContent =
        currentPageIndex + 1;


    totalPagesElement.textContent =
        selectedImages.length;


    // =================================
    // ARROWS
    // =================================

    prevPageBtn.disabled =
        currentPageIndex === 0;


    nextPageBtn.disabled =
        currentPageIndex ===
        selectedImages.length - 1;

}


// =====================================
// PAGE SIZE HELPER
// =====================================

function getPageSize() {

    let width;
    let height;


    switch (
        pdfSettings.pageSize
    ) {

        case "a5":

            width = 148;
            height = 210;

            break;


        case "letter":

            width = 215.9;
            height = 279.4;

            break;


        case "a4":

        default:

            width = 210;
            height = 297;

            break;

    }


    if (
        pdfSettings.orientation ===
        "landscape"
    ) {

        return {
            width: height,
            height: width
        };

    }


    return {
        width,
        height
    };

}


// =====================================
// CREATE PDF
// =====================================

generateBtn.addEventListener(
    "click",
    async () => {

        if (
            selectedImages.length === 0
        ) {

            return;

        }


        setLoading(true);


        try {

            const {
                jsPDF
            } = window.jspdf;


            const pageSize =
                getPageSize();


            const pdf =
                new jsPDF({

                    orientation:
                        pdfSettings.orientation,

                    unit: "mm",

                    format:
                        pdfSettings.pageSize

                });


            const pageWidth =
                pageSize.width;


            const pageHeight =
                pageSize.height;


            const margin =
                pdfSettings.margin;


            const availableWidth =
                pageWidth -
                margin * 2;


            const availableHeight =
                pageHeight -
                margin * 2;


            // =================================
            // PROCESS IMAGES
            // =================================

            for (
                let i = 0;
                i < selectedImages.length;
                i++
            ) {

                const file =
                    selectedImages[i];


                // Convert image

                const imageData =
                    await fileToDataURL(
                        file
                    );


                // Load image

                const img =
                    await loadImage(
                        imageData
                    );


                // Image ratio

                const imageRatio =
                    img.width /
                    img.height;


                const pageRatio =
                    availableWidth /
                    availableHeight;


                let width;

                let height;


                // =================================
                // FIT
                // =================================

                if (
                    pdfSettings.fit ===
                    "fit"
                ) {

                    /*
                     * Keep the complete image.
                     *
                     * No stretching.
                     * No distortion.
                     * No cropping.
                     */

                    if (
                        imageRatio >
                        pageRatio
                    ) {

                        width =
                            availableWidth;

                        height =
                            width /
                            imageRatio;

                    } else {

                        height =
                            availableHeight;

                        width =
                            height *
                            imageRatio;

                    }

                }


                // =================================
                // FILL
                // =================================

                else {

                    /*
                     * Fill the complete page.
                     *
                     * Aspect ratio is preserved.
                     *
                     * Some parts of the image
                     * may be cropped.
                     */

                    if (
                        imageRatio >
                        pageRatio
                    ) {

                        height =
                            availableHeight;

                        width =
                            height *
                            imageRatio;

                    } else {

                        width =
                            availableWidth;

                        height =
                            width /
                            imageRatio;

                    }

                }


                // =================================
                // CENTER IMAGE
                // =================================

                let x;

                let y;


                if (
                    pdfSettings.fit ===
                    "fit"
                ) {

                    x =
                        margin +
                        (availableWidth -
                            width) / 2;


                    y =
                        margin +
                        (availableHeight -
                            height) / 2;

                } else {

                    x =
                        margin +
                        (availableWidth -
                            width) / 2;


                    y =
                        margin +
                        (availableHeight -
                            height) / 2;

                }


                // =================================
                // ADD PAGE
                // =================================

                if (i > 0) {

                    pdf.addPage(
                        pdfSettings.pageSize,
                        pdfSettings.orientation
                    );

                }


                // =================================
                // IMAGE FORMAT
                // =================================

                let format = "JPEG";


                if (
                    file.type ===
                    "image/png"
                ) {

                    format = "PNG";

                }


                /*
                 * WEBP is converted to JPEG
                 * when necessary because it is
                 * more reliable across PDF readers.
                 */

                if (
                    file.type ===
                    "image/webp"
                ) {

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
            // DOWNLOAD
            // =================================

            pdf.save(
                "images-to-pdf.pdf"
            );


            // Wait for animation

            await delay(500);


            setLoading(false);


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
// FILE TO DATA URL
// =====================================

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                );


            reader.onerror =
                () => reject(
                    new Error(
                        "Could not read image."
                    )
                );


            reader.readAsDataURL(
                file
            );

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
// LOADING
// =====================================

function setLoading(
    isLoading
) {

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
// CREATE ANOTHER
// =====================================

successBtn.addEventListener(
    "click",
    () => {

        hideSuccess();


        selectedImages = [];


        currentPageIndex = 0;


        renderImages();

    }
);


// =====================================
// ESC
// =====================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

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
            setTimeout(
                resolve,
                ms
            )
    );

}


// =====================================
// INITIAL PREVIEW
// =====================================

updatePDFPreview();