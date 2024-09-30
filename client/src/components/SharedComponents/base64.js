export const convertToBase64 = (newFile) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(newFile);
        fileReader.onload = () => {
            resolve(fileReader.result);
        }
        fileReader.onerror = (error) => {
            reject(error);
        }
    })
}

export const downloadBase64 = (base64File) => {
    const http = new XMLHttpRequest();
    http.onload = () => {
        var url = window.URL.createObjectURL(http.response);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'leave_attachment';
        link.click();
    }
    http.responseType = 'blob';
    http.open('GET', base64File, true);
    http.send()
}

export const validateFile = (newFile) => {
   if(!newFile){
        return 'Accepted';
   }
   const maxFileSize = 10485760 // Max size is 40 MB (40 . 1024 . 1024)
   if (newFile.size > maxFileSize){
        return 'File too large (Max limit: 40 MB)';
   }
   return 'Accepted';
}

export const validateImage = (newFile) => {
    try{
        if(!newFile){
            return 'Accepted';
        }
        const maxFileSize = 10485760 // Max size is 40 MB (40 . 1024 . 1024)
        if (newFile.size > maxFileSize){
            return 'File too large (Max limit: 40 MB)';
        }
        else if (newFile.type.toLowerCase().slice(0,5) !== 'image'){
            return 'File is not an image';
        }
        return 'Accepted';
    }
    catch (error){
        return '!Accepted';
    }
 }