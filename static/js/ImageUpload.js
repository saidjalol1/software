document.addEventListener('DOMContentLoaded', function() {
    const uploadInput = document.querySelector('.upload_input');
    const selectButton = uploadInput.querySelector('button');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Add drag and drop functionality
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

    // Add click functionality
    selectButton.addEventListener('click', () => fileInput.click());
    uploadInput.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // Function to handle uploaded files
    async function handleFiles(files) {
        const uploadModal = document.getElementById('uploadModal');
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const uploadStatus = document.getElementById('uploadStatus');

        // Show modal
        uploadModal.classList.remove('hidden');
        let processedCount = 0;
        const totalFiles = files.length;

        // Process each file
        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            try {
                // Update progress
                processedCount++;
                const progress = Math.round((processedCount / totalFiles) * 100);
                uploadProgress.textContent = `${progress}%`;
                progressBar.style.width = `${progress}%`;
                uploadStatus.textContent = `Processing ${processedCount} of ${totalFiles}: ${file.name}`;

                // Simulate background removal (in a real app, you'd call your API here)
                const processedImage = await simulateBackgroundRemoval(file);

                // Add the processed image to the gallery
                addImageToGallery(file.name, file, processedImage);
                
                // Small delay to show progress (remove in production)
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }

        // Hide modal when done
        setTimeout(() => {
            uploadModal.classList.add('hidden');
            // Reset progress
            uploadProgress.textContent = '0%';
            progressBar.style.width = '0%';
        }, 500);

        // Scroll to results
        document.querySelector('.uploaded-images-container').scrollIntoView({ behavior: 'smooth' });
    }

    // Function to simulate background removal (replace with actual API call)
    function simulateBackgroundRemoval(file) {
        return new Promise((resolve) => {
            // In a real app, you would:
            // 1. Upload the image to your server
            // 2. Call your background removal API
            // 3. Return the processed image URL
            
            // For demo purposes, we'll just use the same image
            const reader = new FileReader();
            reader.onload = (e) => {
                // Simulate processing delay
                setTimeout(() => {
                    resolve(e.target.result);
                }, 1000);
            };
            reader.readAsDataURL(file);
        });
    }

    // Function to add image to gallery
    function addImageToGallery(name, originalFile, processedImageUrl) {
        const imagesContainer = document.querySelector('.images');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
        
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card bg-white cols-span-1 rounded-lg hover:shadow-lg shadow cursor-pointer';
        imageCard.innerHTML = `
            <div class="crad-header flex justify-between items-center p-6">
                <div class="image_name">${shortName}</div>
                <div class="status py-1 px-4 bg-orange-100 rounded-full text-orange-400 font-bold">Processing</div>
            </div>
            <div class="images flex">
                <div class="before">
                    <img src="${URL.createObjectURL(originalFile)}" class="w-full h-auto object-contain" alt="Original">
                    <span class="bg-gray-400 text-white py-2 px-4 rounded-lg" style="{height:50px;}">Before</span>
                </div>
                <div class="after">
                    <img src="${processedImageUrl}" class="w-full h-auto object-contain"  alt="Processed">
                    <span class="bg-gray-400 text-white py-2 px-4 rounded-lg" style="{height:50px;}">After</span>
                </div>
            </div>
            <div class="crad-header flex justify-between items-center p-6">
                <button class="py-2 w-full hover:shadow-lg shadow bg-orange-500 hover:bg-orange-400 rounded-full text-white font-bold download-btn">Download</button>
            </div>
        `;
        
        // Add to beginning of container
        imagesContainer.prepend(imageCard);

        // Update status after a delay (simulating processing completion)
        setTimeout(() => {
            const statusDiv = imageCard.querySelector('.status');
            statusDiv.textContent = 'Completed';
            statusDiv.classList.remove('bg-orange-100', 'text-orange-400');
            statusDiv.classList.add('bg-green-100', 'text-green-600');
        }, 2000);

        // Add download functionality
        imageCard.querySelector('.download-btn').addEventListener('click', () => {
            downloadImage(processedImageUrl, `processed_${name}`);
        });
    }

    // Function to handle image download
    function downloadImage(imageUrl, fileName) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Clear all functionality
    document.querySelector('.labels button').addEventListener('click', () => {
        document.querySelector('.images').innerHTML = '';
    });
});

async function realBackgroundRemoval(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://your-api-endpoint.com/remove-background', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Background removal failed');
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}