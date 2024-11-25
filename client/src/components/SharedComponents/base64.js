// Utility function to convert a file to a Base64-encoded string
export const convertToBase64 = (newFile) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader(); // Creating a FileReader instance to read the file
        fileReader.readAsDataURL(newFile); // Reading the file as a Data URL (Base64 string)
        fileReader.onload = () => {
            resolve(fileReader.result); // Resolving the promise with the Base64 string once the file is read
        }
        fileReader.onerror = (error) => {
            reject(error); // Rejecting the promise if an error occurs during file reading
        }
    });
};

// Utility function to download a Base64-encoded file
export const downloadBase64 = (base64File) => {
    const http = new XMLHttpRequest(); // Creating an XMLHttpRequest instance to fetch the Base64 file
    http.onload = () => {
        const url = window.URL.createObjectURL(http.response); // Creating a URL object from the fetched file
        const link = document.createElement('a'); // Creating an anchor element to trigger the download
        link.href = url; // Setting the URL as the href for the link
        link.download = 'leave_attachment'; // Setting a default filename for the downloaded file
        link.click(); // Triggering a click event to initiate the download
    };
    http.responseType = 'blob'; // Setting the response type to 'blob' to handle binary data
    http.open('GET', base64File, true); // Opening a GET request to fetch the Base64 file
    http.send(); // Sending the request
};

// Utility function to validate a file's size
export const validateFile = (newFile) => {
   if (!newFile) {
        return 'Accepted'; // Returning 'Accepted' if no file is provided
   }
   const maxFileSize = 10485760; // Setting the maximum file size to 10 MB (10 * 1024 * 1024)
   if (newFile.size > maxFileSize) {
        return 'File too large (Max limit: 40 MB)'; // Returning an error message if the file exceeds the size limit
   }
   return 'Accepted'; // Returning 'Accepted' if the file size is within the limit
};

// Utility function to validate an image file's size and type
export const validateImage = (newFile) => {
    try {
        if (!newFile) {
            return 'Accepted'; // Returning 'Accepted' if no file is provided
        }
        const maxFileSize = 10485760; // Setting the maximum file size to 10 MB (10 * 1024 * 1024)
        if (newFile.size > maxFileSize) {
            return 'File too large (Max limit: 40 MB)'; // Returning an error message if the file exceeds the size limit
        } else if (newFile.type.toLowerCase().slice(0, 5) !== 'image') {
            return 'File is not an image'; // Returning an error message if the file type is not an image
        }
        return 'Accepted'; // Returning 'Accepted' if the file is a valid image
    } catch (error) {
        return '!Accepted'; // Returning '!Accepted' if an error occurs during validation
    }
};
