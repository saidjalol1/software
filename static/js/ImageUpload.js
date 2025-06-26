document.addEventListener('DOMContentLoaded', function() {
    const uploadInput = document.querySelector('.upload_input');
    const selectButton = uploadInput.querySelector('button');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    

    let isHandlingClick = false;
    
    document.body.appendChild(fileInput);

    
    uploadInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadInput.classList.add('border-orange-500', 'bg-orange-50');
    });

    uploadInput.addEventListener('dragleave', () => {
        uploadInput.classList.remove('border-orange-500', 'bg-orange-50');
    });

    uploadInput.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadInput.classList.remove('border-orange-500', 'bg-orange-50');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

   
    selectButton.addEventListener('click', function(e) {
        if (isHandlingClick) return;
        isHandlingClick = true;
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        
        fileInput.value = '';
        fileInput.click();
        
        setTimeout(() => {
            isHandlingClick = false;
        }, 100);
    }, true);
    
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });


    
    async function handleFiles(files) {
        const uploadModal = document.getElementById('uploadModal');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const uploadStatus = document.getElementById('uploadStatus');

        // Show modal
        uploadModal.classList.remove('hidden');
        let processedCount = 0;
        const totalFiles = files.length;

        // Process files in batches (3 at a time)
        const batchSize = 3;
        for (let i = 0; i < totalFiles; i += batchSize) {
            const batch = Array.from(files).slice(i, i + batchSize);
            await Promise.all(batch.map(async (file) => {
                try {
                    // Call your actual API
                    const processedImageUrl = await callBackgroundRemovalAPI(file);
                    
                    // Add to gallery
                    addImageToGallery(file.name, file, processedImageUrl);
                    
                    // Update progress
                    processedCount++;
                    const progress = Math.round((processedCount / totalFiles) * 100);
                    uploadProgress.textContent = `${progress}%`;
                    progressBar.style.width = `${progress}%`;
                    uploadStatus.textContent = `Processed ${processedCount} of ${totalFiles}`;
                } catch (error) {
                    console.error('Error processing file:', error);
                    addErrorCard(file.name, error.message);
                    processedCount++;
                }
            }));
        }

        // Hide modal when done
        setTimeout(() => {
            uploadModal.classList.add('hidden');
            resetProgress();
        }, 500);

        // Scroll to results
        document.querySelector('.uploaded-images-container').scrollIntoView({ behavior: 'smooth' });
    }

    
    async function callBackgroundRemovalAPI(file) {
        const formData = new FormData();
        formData.append('images', file);
        
        
        const response = await fetch('http://127.0.0.1:8000/upload/images', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        
        if (data.results && data.results[0] && data.results[0].success) {
        
        console.log(data.results);
        
        return `http://127.0.0.1:8000/${data.results[0].processed_image}`;
        }
    }

    
    function addImageToGallery(name, originalFile, processedImageUrl) {
        const imagesContainer = document.querySelector('.images');
        const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
        
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow';
        imageCard.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="font-medium truncate">${shortName}</span>
                <span class="status px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Completed</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="relative">
                    <img src="${URL.createObjectURL(originalFile)}" class="w-full h-32 object-contain border rounded" alt="Original">
                    <span class="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">Original</span>
                </div>
                <div class="relative">
                    <img src="${processedImageUrl}" class="w-full h-32 object-contain border rounded" alt="Processed">
                    <span class="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">Processed</span>
                </div>
            </div>
            <button class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full text-sm download-btn">
                Download Processed
            </button>
        `;
        
        
        imageCard.querySelector('.download-btn').addEventListener('click', () => {
            downloadImage(processedImageUrl, `processed_${name}`);
        });

        imagesContainer.prepend(imageCard);
    }

    
    function addErrorCard(name, error) {
        const imagesContainer = document.querySelector('.images');
        const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
        
        const errorCard = document.createElement('div');
        errorCard.className = 'bg-white p-3 rounded-lg shadow-md border border-red-200';
        errorCard.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium truncate">${shortName}</span>
                <span class="status px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Failed</span>
            </div>
            <div class="mt-2 text-red-500 text-sm">${error}</div>
        `;
        
        imagesContainer.prepend(errorCard);
    }

    
    async function downloadImage(imageUrl, fileName) {
    try {
        
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        
        const blob = await response.blob();
        
        
        const blobUrl = URL.createObjectURL(blob);
        
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        }
    }

    function resetProgress() {
        document.getElementById('uploadProgress').textContent = '0%';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('uploadStatus').textContent = 'Uploading images...';
    }

   
    document.querySelector('.labels button').addEventListener('click', () => {
        document.querySelector('.images').innerHTML = '';
    });
});