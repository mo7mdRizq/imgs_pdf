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

    // يسمح باختيار نفس الصورة مرة أخرى
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


        const img =
            document.createElement("img");

        img.src = URL.createObjectURL(file);


        const overlay =
            document.createElement("div");

        overlay.className = "image-overlay";


        const number =
            document.createElement("span");

        number.className = "image-number";

        number.textContent = index + 1;


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
// COUNTER
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
// CLEAR ALL
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


            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            const pageWidth = 210;
            const pageHeight = 297;

            const margin = 8;


            for (
                let i = 0;
                i < selectedImages.length;
                i++
            ) {

                const file =
                    selectedImages[i];


                const imageData =
                    await fileToDataURL(file);


                const img =
                    await loadImage(imageData);


                const availableWidth =
                    pageWidth - margin * 2;


                const availableHeight =
                    pageHeight - margin * 2;


                const imageRatio =
                    img.width / img.height;


                let width =
                    availableWidth;


                let height =
                    width / imageRatio;


                if (
                    height >
                    availableHeight
                ) {

                    height =
                        availableHeight;

                    width =
                        height * imageRatio;

                }


                const x =
                    (pageWidth - width) / 2;


                const y =
                    (pageHeight - height) / 2;


                if (i > 0) {

                    pdf.addPage();

                }


                /*
                 * Determine image format
                 */

                let format = "JPEG";


                if (
                    file.type === "image/png"
                ) {

                    format = "PNG";

                }


                if (
                    file.type === "image/webp"
                ) {

                    format = "WEBP";

                }


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


            pdf.save(
                "images-to-pdf.pdf"
            );


            /*
             * Small delay so the user
             * can actually see the animation
             */

            await delay(450);


            setLoading(false);


            showSuccess();


        } catch (error) {

            console.error(error);

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
                reject;


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
                reject;


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
// SUCCESS
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

        renderImages();

    }
);


// =====================================
// ESC CLOSE
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
            setTimeout(resolve, ms)
    );

}