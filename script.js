

// Function to fill sections based on JSON data
function fillSections() {
    // Get JSON input value
    let jsonInput = document.getElementById('jsonInput').value.trim();

    // Parse JSON data
    let data;
    try {
        data = JSON.parse(jsonInput);
    } catch (error) {
        alert('Invalid JSON format! Please check your input.');
        return;
    }

    // Extract and set the new fields
    document.getElementById('title').value = data.newspaperName || '';
    document.getElementById('location').value = data.location || '';

    // Handle the date
    if (data.date) {
        const [month, year] = data.date.split(' ');
        document.getElementById('month').value = month;
        document.getElementById('year').value = year;
    }

    // Handle the emblem
    if (data.emblem) {
        document.getElementById('emblemImage').value = data.emblem;
        document.getElementById('emblemPreview').src = data.emblem;
        document.getElementById('emblemPreview').style.display = 'block';
    }

    // Extract sections
    let sections = data.sections;

    // Clear existing section fields
    document.getElementById('sectionFields').innerHTML = '';

    // Loop through each section and create input fields
    sections.forEach((section, index) => {
        if (index < 12) { // Only process the first 10 sections
            let characterLimit;
            let lineLimit = null;

            if (index < 2) characterLimit = 500;
            else if (index < 4) characterLimit = 275;
            else if (index < 6) characterLimit = 575;
            else if (index === 6) characterLimit = 150;
            else if (index < 9) lineLimit = 8;
            else if (index == 9) characterLimit = 215;
            else if (index == 10) characterLimit = 675;
            else if (index == 11) characterLimit = 325;
            else characterLimit = 120;


            let sectionHTML = `
                <div class="section">
                    <h3 class="section-title">Section ${index + 1}</h3>
                    <label for="title${index}">Title:</label>
                    <input type="text" id="title${index}" value="${section.title}" maxlength="100">
                    <label for="content${index}">Content:</label>
                    <textarea id="content${index}" rows="5" ${characterLimit ? `maxlength="${characterLimit}"` : ''}>${section.content}</textarea>
                    <span class="char-count">${lineLimit ? `0 / ${lineLimit} lines` : `0 / ${characterLimit}`}</span>
                    <label for="imageKeyword${index}">Image Keyword:</label>
                    <input type="text" id="imageKeyword${index}" value="${section.ImageKeyword || ''}">
                    <label for="imageUrl${index}">Wikimedia Commons URL:</label>
                    <input type="url" id="imageUrl${index}" value="${section.WikimediaCommonsURL || ''}" placeholder="https://commons.wikimedia.org/wiki/...">
                    <label for="file${index}">Upload Image:</label>
                    <input type="file" id="file${index}" accept="image/jpeg, image/png" onchange="handleImageUpload(event, ${index})">
                    <input type="hidden" id="image${index}">
                    <img id="imagePreview${index}" src="" alt="Image Preview" style="display: none; max-width: 200px; margin-top: 10px;">
                </div>
            `;
            document.getElementById('sectionFields').innerHTML += sectionHTML;
        }
    });

    // Add Carer's Section
    if (sections[12] && sections[12].title.toLowerCase() === "carer’s section") {
        document.getElementById('carerContent').value = sections[12].content;
    }

    document.querySelectorAll('textarea').forEach((textarea, index) => {
        if (index < 11) {
            textarea.addEventListener('input', () => updateCharCount(textarea));
            updateCharCount(textarea);
        } else if (index === 11) {
            textarea.addEventListener('input', () => updateLineCount(textarea));
            updateLineCount(textarea);
        }
    });
}
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Desired output dimensions in cm
                const targetWidthCm = 6;
                const targetHeightCm = 2;

                // Convert cm to pixels based on 300 DPI
                const dpi = 300;
                const targetWidthPx = (targetWidthCm / 2.54) * dpi;
                const targetHeightPx = (targetHeightCm / 2.54) * dpi;

                // Calculate aspect ratio of the image
                const imgAspectRatio = img.width / img.height;
                const targetAspectRatio = targetWidthPx / targetHeightPx;

                let drawWidth, drawHeight;
                if (imgAspectRatio > targetAspectRatio) {
                    // Image is wider relative to the target dimensions
                    drawWidth = targetWidthPx;
                    drawHeight = drawWidth / imgAspectRatio;
                } else {
                    // Image is taller relative to the target dimensions
                    drawHeight = targetHeightPx;
                    drawWidth = drawHeight * imgAspectRatio;
                }

                // Set canvas dimensions based on calculated size
                canvas.width = drawWidth;
                canvas.height = drawHeight;

                // Draw the image on the canvas
                context.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert the canvas to a data URL
                const dataUrl = canvas.toDataURL('image/png');
                document.getElementById('logoImage').value = dataUrl;

                // Display the image at the correct size
                const logoImgElement = document.getElementById('logoPreview');
                logoImgElement.src = dataUrl;

                // Ensure the preview maintains the original aspect ratio but fits within the 6cm by 2cm box
                logoImgElement.style.width = `${(canvas.width / dpi) * 2.54}cm`;
                logoImgElement.style.height = `${(canvas.height / dpi) * 2.54}cm`;
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function updateLineCount(textarea) {
    const maxLines = 8;
    const lines = textarea.value.split('\n');
    const currentLines = lines.length;
    const countDisplay = textarea.nextElementSibling;
    countDisplay.textContent = `${currentLines} / ${maxLines} lines`;

    if (currentLines > maxLines) {
        textarea.value = lines.slice(0, maxLines).join('\n');
    }
}
function handleImageUpload(event, index) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let img = new Image();
            img.onload = function () {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let aspectRatio = img.width / img.height;

                // Set canvas dimensions based on section
                if (index < 2) {
                    canvas.width = 360; // 9.5cm at 300 DPI
                    canvas.height = 208; // 5.5cm at 300 DPI
                } else if (index < 4) {
                    // Adjust dimensions for page 2
                    canvas.width = 390; // 7cm at 300 DPI
                    canvas.height = 260; // 7cm at 300 DPI (square image for page 2)
                } else if (index < 6) {
                    canvas.width = 360; // 9.5cm at 300 DPI
                    canvas.height = 360; // 9.5cm at 300 DPI
                } else if (index === 6) {
                    canvas.width = 719; // 19cm at 300 DPI
                    canvas.height = 530; // 14cm at 300 DPI
                }
                else if (index === 9) {
                    canvas.width = 719; // 19cm at 300 DPI
                    canvas.height = 800;
                }
                else if (index === 10) {
                    canvas.width = 719; // 19cm at 300 DPI
                    canvas.height = 208;
                }
                else if (index === 11) {
                    canvas.width = 360;
                    canvas.height = 300;
                }

                // Calculate dimensions for cropping
                let srcWidth = img.width;
                let srcHeight = img.height;
                let srcX = 0;
                let srcY = 0;

                if (aspectRatio > canvas.width / canvas.height) {
                    srcWidth = img.height * (canvas.width / canvas.height);
                    srcX = (img.width - srcWidth) / 2;
                } else {
                    srcHeight = img.width / (canvas.width / canvas.height);
                    srcY = (img.height - srcHeight) / 2;
                }

                // Draw image on canvas (cropping in the process)
                ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);

                // Set the cropped image as the value
                document.getElementById(`image${index}`).value = canvas.toDataURL('image/jpeg');

                // Update image preview
                let preview = document.getElementById(`imagePreview${index}`);
                preview.src = canvas.toDataURL('image/jpeg');
                preview.style.display = 'block';
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}
function updateCharCount(textarea) {
    const maxLength = textarea.getAttribute('maxlength');
    const currentLength = textarea.value.length;
    const countDisplay = textarea.nextElementSibling;
    countDisplay.textContent = `${currentLength} / ${maxLength}`;
}
// Function to preview newspaper layout
function previewNewspaper() {
    console.log("Previewing newspaper...");
    // Get newspaper title, location, and date
    let title = document.getElementById('title').value;
    console.log("Title:", title);
    let location = document.getElementById('location').value;
    let month = document.getElementById('month').value;
    let year = document.getElementById('year').value;
    let date = `${month} ${year}`;

    // Clear existing preview
    document.getElementById('newspaperPreview').innerHTML = '';

    // Function to add logo to each page
    function addLogoToPage(page) {
        let logoImage = document.getElementById('logoImage').value;
        if (logoImage) {
            let logoHTML = `
                <div class="page-logo">
                    <img src="${logoImage}" alt="Newspaper Logo">
                </div>
            `;
            page.innerHTML += logoHTML;
        }
    }

    function createPage1() {
        let page1 = document.createElement('div');
        page1.classList.add('page', 'page1');

        let emblemImage = document.getElementById('emblemImage')?.value || '';
        let title = document.getElementById('title')?.value || 'Newspaper Title';
        let location = document.getElementById('location')?.value || 'Location';
        let month = document.getElementById('month')?.value || 'Month';
        let year = document.getElementById('year')?.value || 'Year';
        let date = `${month} ${year}`;

        let header = `
            <div class="page-header">
                <div class="emblem-container">
                    ${emblemImage ? `<img src="${emblemImage}" alt="Newspaper Emblem">` : ''}
                </div>
                <div class="title-container">
                    <h1 class="page-title">${title}</h1>
                </div>
            </div>
            <div class="date-location-container">
                <p>${location}</p>
                <p>${date}</p>
            </div>
        `;
        page1.innerHTML = header;

        // Add sections 1 and 2
        let sectionsContainer = document.createElement('div');
        sectionsContainer.classList.add('sections-container');

        for (let i = 0; i < 2; i++) {
            let sectionTitle = document.getElementById(`title${i}`)?.value || `Section ${i + 1}`;
            let sectionContent = document.getElementById(`content${i}`)?.value || '';
            let sectionImage = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "" || '';

            // Load the image before adding the section
            loadSectionImage(i);

            let sectionHTML = `
                <div class="section-preview">
                    <h3>${sectionTitle}</h3>
                    ${sectionImage ? `<img src="${sectionImage}" alt="${sectionTitle} Image">` : ''}
                    <p>${sectionContent}</p>
                </div>
            `;
            sectionsContainer.innerHTML += sectionHTML;
        }

        page1.appendChild(sectionsContainer);

        // Add footer
        let footer = `
            <div class="page-footer"><span class="page-number">Page 1.</span> Copyright 2024 Mypaper.uk</div>
        `;
        page1.innerHTML += footer;

        addLogoToPage(page1);
        return page1;
    }

    function createPage2() {
        let page2 = document.createElement('div');
        page2.classList.add('page', 'page2');

        // Add sections 3 and 4
        for (let i = 2; i < 4; i++) {
            let sectionTitle = document.getElementById(`title${i}`).value;
            let sectionContent = document.getElementById(`content${i}`).value;
            let sectionImage = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "";

            // Load the image before adding the section
            loadSectionImage(i);

            let memoryTitle = i === 2 ? "Write your memories about this dish" : "Write your memories about this place";

            let sectionHTML = `
                <div class="section-preview page2-section">
                    <h3>${sectionTitle}</h3>
                    <div class="section-content">
                        <div class="row ">
                            <div class="image-container">
                                ${sectionImage ? `<img src="${sectionImage}" alt="${sectionTitle} Image">` : ''}
                            </div>
                            <div class="text-container"><p>${sectionContent}</p></div>
                        </div>
                    </div>
                    <div class="memory-box">
                        <h4>${memoryTitle}</h4>
                        <div class="memory-lines"></div>
                        <div class="memory-lines"></div>
                        <div class="memory-lines"></div>
                        <div class="memory-lines"></div>
                    </div>
                </div>
            `;
            page2.innerHTML += sectionHTML;
        }

        // Add footer
        let footer = `
            <div class="page-footer"><span class="page-number">Page 2.</span> Copyright 2024 Mypaper.uk</div>
        `;
        page2.innerHTML += footer;

        addLogoToPage(page2);
        return page2;
    }

    function createPage3() {
        let page3 = document.createElement('div');
        page3.classList.add('page', 'page3');

        // Add sections 5 and 6
        for (let i = 4; i < 6; i++) {
            let sectionTitle = document.getElementById(`title${i}`).value;
            let sectionContent = document.getElementById(`content${i}`).value;
            let sectionImage = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "";

            // Load the image before adding the section
            loadSectionImage(i);

            let sectionHTML = `
                <div class="section-preview">
                    <h3>${sectionTitle}</h3>
                    ${sectionImage ? `<img src="${sectionImage}" alt="${sectionTitle} Image">` : ''}
                    <p>${sectionContent}</p>
                </div>
            `;
            page3.innerHTML += sectionHTML;
        }

        // Add footer
        let footer = `
            <div class="page-footer"><span class="page-number">Page 3.</span> Copyright 2024 Mypaper.uk</div>
        `;
        page3.innerHTML += footer;

        addLogoToPage(page3);
        return page3;
    }

    function createPage4() {
        let page4 = document.createElement('div');
        page4.classList.add('page', 'page4');

        // Add section 7
        let i = 6; // Index for section 7
        let sectionTitle7 = document.getElementById(`title${i}`).value;
        let sectionContent7 = document.getElementById(`content${i}`).value;
        let sectionImage7 = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "";

        // Load the image before adding the section
        loadSectionImage(i);

        let section7HTML = `
            <div class="section-preview">
                <h3>${sectionTitle7}</h3>
                ${sectionImage7 ? `<img src="${sectionImage7}" alt="${sectionTitle7} Image">` : ''}
                <p>${sectionContent7}</p>
            </div>
        `;
        page4.innerHTML += section7HTML;

        // Create grid for sections 8, 9, and 10
        let gridContainer = document.createElement('div');
        gridContainer.classList.add('grid-container');

        for (let i = 7; i < 9; i++) {
            let sectionTitle = document.getElementById(`title${i}`).value;
            let sectionContent = document.getElementById(`content${i}`).value;

            let sectionHTML;
            if (i < 9) {
                // Sections 8 and 9: Lists without bullets
                sectionHTML = `
                    <div class="section-preview grid-item small-font-section">
                        <h3>${sectionTitle}</h3>
                        <ul>${convertToList(sectionContent)}</ul>
                    </div>
                `;
            } else {
                // Section 10: Normal text
                sectionHTML = `
                    <div class="section-preview grid-item small-font-section">
                        <h3>${sectionTitle}</h3>
                        <p>${sectionContent}</p>
                    </div>
                `;
            }
            gridContainer.innerHTML += sectionHTML;
        }

        page4.appendChild(gridContainer);

        // Add footer
        let footer = `
            <div class="page-footer"><span class="page-number">Page 4.</span> Copyright 2024 Mypaper.uk</div>
        `;
        page4.innerHTML += footer;

        addLogoToPage(page4);
        return page4;
    }
    function createPage5() {
        let page5 = document.createElement('div');
        page5.classList.add('page', 'page5');

        // Add section 7
        let i = 9; // Index for section 10
        let sectionTitle10 = document.getElementById(`title${i}`).value;
        let sectionContent10 = document.getElementById(`content${i}`).value;
        let sectionImage10 = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "";

        // Load the image before adding the section
        loadSectionImage(i);

        let section10HTML = `
            <div class="section-preview">
                <h3>${sectionTitle10}</h3>
                <p>${sectionContent10}</p>
                ${sectionImage10 ? `<img src="${sectionImage10}" alt="${sectionTitle10} Image">` : ''}
            </div>
        `;
        page5.innerHTML += section10HTML;


        // Add footer
        let footer = `
            <div class="page-footer"><span class="page-number">Page 5.</span> Copyright 2024 Mypaper.uk</div>
        `;
        page5.innerHTML += footer;

        addLogoToPage(page5);
        return page5;
    }

    function createPage6() {
        let page6 = document.createElement('div');
        page6.classList.add('page', 'page6');

        // Add sections 5 and 6
        for (let i = 10; i < 12; i++) {
            let sectionTitle = document.getElementById(`title${i}`).value;
            let sectionContent = document.getElementById(`content${i}`).value;
            let sectionImage = document.getElementById(`image${i}`)?.value || document.getElementById(`imageUrl${i}`)?.value || "";

            // Load the image before adding the section
            loadSectionImage(i);
            if (i == 10) {
                let sectionHTML = `<div class="section-preview">
                <h3>${sectionTitle}</h3>
                ${sectionImage ? `<img src="${sectionImage}" alt="${sectionTitle} Image">` : ''}
                <p>${sectionContent}</p>
            </div>`;
                page6.innerHTML += sectionHTML;
            }
            if (i == 11) {
                let sectionHTML = `<div class="section-preview full-width">
                <h3>${sectionTitle}</h3>
                <div class="grid-container">
                    <div class="grid-item">${sectionImage ? `<img src="${sectionImage}" alt="${sectionTitle} Image">` : ''}</div>
                    <div class="grid-item">
                        <p>${sectionContent}</p>
                    </div>
                </div>
            </div>`;
                page6.innerHTML += sectionHTML;
            }

        }

        // Add footer
        let footer = `
                <div class="page-footer"><span class="page-number">Page 6.</span> Copyright 2024 Mypaper.uk</div>
            `;
        page6.innerHTML += footer;

        addLogoToPage(page6);
        return page6;

    }

    function createPages7And8() {
        const carerContent = document.getElementById('carerContent').value;
        const paragraphs = carerContent.split('\n\n');

        // Create a temporary container to measure the content
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '190mm';  // A4 width minus padding
        tempContainer.style.fontSize = '12pt';
        tempContainer.style.lineHeight = '1.5';
        document.body.appendChild(tempContainer);

        // Function to measure height of content
        const measureHeight = (content) => {
            tempContainer.innerHTML = content;
            return tempContainer.offsetHeight;
        };

        const maxHeightPerPage = 550; // Max height in mm for content area
        let currentHeight = 0;
        let pageContents = [];
        let currentPageContent = '';

        // Iterate over each paragraph to distribute across pages
        paragraphs.forEach(para => {
            let content = `<p>${para}</p>`;
            content = content.replace(/#\d+\./, '<span class="list-title">').replace('\n', '</span>');

            const paraHeight = measureHeight(content);

            // Check if adding this paragraph will exceed the page height
            if (currentHeight + paraHeight > maxHeightPerPage) {
                // If adding the entire paragraph exceeds the page height,
                // push the current page content to the pages array
                // and start a new page with this paragraph.
                pageContents.push(currentPageContent);
                currentPageContent = content;
                currentHeight = paraHeight;
            } else {
                // Otherwise, add the paragraph to the current page
                currentPageContent += content;
                currentHeight += paraHeight;
            }
        });

        // Add the last page content if there is any left
        if (currentPageContent) {
            pageContents.push(currentPageContent);
        }

        document.body.removeChild(tempContainer);

        // Create pages dynamically based on the content
        let pages = pageContents.map((content, index) => {
            let page = document.createElement('div');
            page.classList.add('page', `page${index + 7}`);
            page.innerHTML = `
            <h3>Carer's Section - Part ${index + 1}</h3>
            <div id="carerSection${index + 1}Content">${content}</div>
            <div class="page-footer"><span class="page-number">Page ${index + 7}.</span> Copyright 2024 Mypaper.uk</div>
        `;
            addLogoToPage(page);
            return page;
        });

        return pages;
    }


    // Create pages
    let pages = [createPage1(), createPage2(), createPage3(), createPage4(), createPage5(), createPage6(), ...createPages7And8()];

    // Append pages to the preview container
    pages.forEach(page => document.getElementById('newspaperPreview').appendChild(page));
}
// Helper function to convert text to list items
function convertToList(content) {
    console.log("content", content)
    return content.split(',').map(item => `<li>${item}</li>`).join('');
}
// Helper function to load images before adding sections
function loadSectionImage(index) {
    let imageElement = document.getElementById(`image${index}`);
    if (imageElement) {
        let imageUrl = imageElement.value;
        let img = new Image();
        img.src = imageUrl;
    }
}
async function exportToPDF() {
    const btn = document.getElementById("exportToPDF")
    btn.innerText = "Loading...";
    btn.style.pointerEvents = "none";
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = document.querySelectorAll('.page');

    for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        if (index > 0) pdf.addPage();

        const pageClone = page.cloneNode(true);
        document.body.appendChild(pageClone);

        pageClone.style.width = '210mm';
        pageClone.style.height = '297mm';
        pageClone.style.padding = '14mm';
        pageClone.style.margin = '0';
        pageClone.style.border = 'none';
        pageClone.style.boxShadow = 'none';
        pageClone.style.borderRadius = '0';
        pageClone.style.position = 'absolute';
        pageClone.style.top = '0';
        pageClone.style.left = '0';
        pageClone.style.zIndex = '-1';
        pageClone.style.backgroundColor = 'white';

        const printStyle = document.createElement('style');
        printStyle.textContent = `
            @media print {
                body { font-size: 18px; line-height: 1.4; }
                .page-title { font-size: 80px !important; }
                .section-preview h3 { font-size: 28px !important; }
                .section-preview p { font-size: 20px !important; }
                .page-footer { font-size: 14px !important; }
                .page4 .grid-container .grid-item h3 { font-size: 22pt; }
                .page4 .grid-container .grid-item ul,
                .page4 .grid-container .grid-item p { font-size: 16pt; }
                .page1 .section-preview img,
                .page3 .section-preview img,
                .page4 .section-preview img,
                .page4 .section-preview:first-child img {
                    margin-bottom: 7mm !important;
                }
                .page2 { display: flex !important; flex-direction: column !important; height: 297mm !important; width: 210mm !important; padding: 14mm !important; }
                .page2 .page2-section { height: 50% !important; display: flex !important; flex-direction: column !important; margin-bottom: 7mm !important; }
                .page2 .section-content { display: flex !important; flex-grow: 1 !important; }
                .page2 .image-container { width: 40% !important; padding-right: 7mm !important; }
                .page2 .text-container { width: 60% !important; }
                .page2 h3 { margin-bottom: 5mm !important; }
                .page2 .text-container p { margin-bottom: 5mm !important; }
                .page2 .memory-box { padding: 5mm !important; }
                .page-header { display: flex !important; justify-content: center !important; align-items: center !important; }
                .emblem-container { width: 3cm !important; height: 3cm !important; margin-right: 1cm !important; }
                .emblem-container img { max-width: 100% !important; max-height: 100% !important; object-fit: contain !important; }
                .title-container { text-align: center !important; }
                .page-title { font-size: 80px !important; margin: 0 !important; }
                .page-logo { right: 30mm !important; }
            }
        `;
        pageClone.appendChild(printStyle);

        try {
            // Wait for all images to load
            const images = pageClone.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = reject;
                    }
                });
            }));

            // Add a small delay to ensure styles are applied
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generate canvas
            const canvas = await html2canvas(pageClone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                width: pageClone.offsetWidth,
                height: pageClone.offsetHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

        } catch (error) {
            console.error('Error generating PDF page:', error);
        } finally {
            document.body.removeChild(pageClone);
        }
    }

    pdf.save('newspaper.pdf');
    btn.innerText = "Export to PDF";
    btn.style.pointerEvents = "auto";
}
function handleEmblemUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // Set canvas dimensions to 3cm x 3cm at 300 DPI
                const dpi = 300;
                canvas.width = canvas.height = (3 * dpi) / 2.54; // 3cm in inches * DPI

                // Draw the image on the canvas
                context.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert the canvas to a data URL
                const dataUrl = canvas.toDataURL('image/png');

                // Update the hidden input and preview image
                const emblemImageInput = document.getElementById('emblemImage');
                const emblemPreview = document.getElementById('emblemPreview');

                if (emblemImageInput) {
                    emblemImageInput.value = dataUrl;
                } else {
                    console.error("Emblem image input not found");
                }

                if (emblemPreview) {
                    emblemPreview.src = dataUrl;
                    emblemPreview.style.display = 'block';
                } else {
                    console.error("Emblem preview image not found");
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
function updateTitleAndEmblem() {
    const title = document.getElementById('title').value;
    const emblemSrc = document.getElementById('emblemImage').value;

    document.getElementById('newspaperTitle').innerText = title;
    document.getElementById('emblemPreview').src = emblemSrc;
}
function updateDateLocation() {
    const location = document.getElementById('location').value;
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    const dateLocationContainers = document.querySelectorAll('.date-location-container');
    dateLocationContainers.forEach(container => {
        container.innerHTML = `
            <p>${location}</p>
            <p>${month} ${year}</p>
        `;
    });
}
function exportCarersSection() {
    const carersSectionMarkdown = document.getElementById("carerContent").value;
    if (!carersSectionMarkdown.trim()) {
        alert('The Carer\'s Section is empty. Please add some content before exporting.');
        return;
    }

    // Improved markdown to RTF conversion
    function convertMarkdownToRTF(markdown) {
        let rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\\viewkind4\\uc1\n';

        // Add title
        rtf += '\\pard\\sa0\\sb0\\ql\\b\\fs44 Caregiver\'s Suggestions\\b0\\fs24\\par\n';
        rtf += '\\pard\\sa0\\sb0\\par\n'; // Add an empty line after title

        const lines = markdown.split('\n');
        let inList = false;
        let isFirstParagraph = true;
        let paragraphCount = 0;

        for (let line of lines) {
            // Escape special characters
            line = line.replace(/[\\{}]/g, '\\$&').replace(/\u00A0/g, '\\~').replace(/[^ -~]/g, function (ch) {
                return '\\u' + ch.charCodeAt(0).toString() + '?';
            });

            // Headers (start of a new section)
            if (line.startsWith('#')) {
                if (!isFirstParagraph) {
                    // Add a dividing line before new section (except for the first one)
                    rtf += '\\pard\\sa0\\sb0\\brdrb\\brdrs\\brdrw10\\brsp20 \\par\n';
                }
                const text = line.replace(/^#+\s*/, '');
                rtf += `\\pard\\sa0\\sb0\\sl276\\slmult1\\b\\fs34 ${text}\\b0\\fs24\\par\n`; // 17pt = 34 half-points
                isFirstParagraph = true;
                paragraphCount = 0;
            }
            // Bold
            else if (line.includes('**')) {
                line = line.replace(/\*\*(.*?)\*\*/g, '\\b $1\\b0 ');
                rtf += `\\pard\\sa0\\sb0${isFirstParagraph ? '' : '\\fi360'} ${line}\\par\n`;
                isFirstParagraph = false;
                paragraphCount++;
            }
            // Italic
            else if (line.includes('*')) {
                line = line.replace(/\*(.*?)\*/g, '\\i $1\\i0 ');
                rtf += `\\pard\\sa0\\sb0${isFirstParagraph ? '' : '\\fi360'} ${line}\\par\n`;
                isFirstParagraph = false;
                paragraphCount++;
            }
            // Unordered list
            else if (line.trim().startsWith('- ')) {
                if (!inList) {
                    rtf += '\\pard\\sa0\\sb0{\\*\\pn\\pnlvlblt\\pnf1\\pnindent0{\\pntxtb\\bullet}}\\fi-360\\li720 ';
                    inList = true;
                }
                rtf += `${line.trim().substring(2)}\\par\n`;
                isFirstParagraph = false;
                paragraphCount++;
            }
            // End of list
            else if (inList && line.trim() === '') {
                rtf += '\\pard\\sa0\\sb0\\par\n';
                inList = false;
                isFirstParagraph = true;
                paragraphCount = 0;
            }
            // Regular paragraph
            else if (line.trim() !== '') {
                if (line.startsWith("Health Dimensions Stimulated:")) {
                    const boldPart = "Health Dimensions Stimulated:";
                    const restOfLine = line.substring(boldPart.length);
                    rtf += `\\pard\\sa0\\sb0\\fi360\\b ${boldPart}\\b0${restOfLine}\\par\n`;
                } else {
                    rtf += `\\pard\\sa0\\sb0${isFirstParagraph || paragraphCount === 1 ? '' : '\\fi360'} ${line}\\par\n`;
                }
                isFirstParagraph = false;
                paragraphCount++;
            }
            // Empty line
            else {
                rtf += '\\pard\\sa0\\sb0\\par\n';
                isFirstParagraph = true;
                paragraphCount = 0;
            }
        }

        rtf += '}';
        return rtf;
    }

    const rtfContent = convertMarkdownToRTF(carersSectionMarkdown);

    // Create and download the RTF file
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'carers_section.rtf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}