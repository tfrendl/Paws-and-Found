// event listeners
 
 // display login modal when login is clicked
    if (document.getElementById("login-modal")) {
        document.getElementById("login-modal").addEventListener('click',()=>{
        const myModal = new bootstrap.Modal(document.getElementById('loginModal'));
        myModal.show();
        });
    }
    
    // display signup modal when signup is clicked
    if (document.getElementById("signup-modal")) {
        document.getElementById("signup-modal").addEventListener('click',()=>{
        const myModal = new bootstrap.Modal(document.getElementById('signupModal'));
        myModal.show();
       // getProfilePhotos();
    }); 
    }




// TODO: ADD THESE FOR PROFILE SECTION

// let displayedPhoto = document.querySelector(".unsplah-photo");
// displayedPhoto.addEventListener("click", getProfilePhotos);




// // functions
// async function getProfilePhotos() {
//     let url = `/api/signup/profilePhotos`;
//     let response = await fetch(url);
//     let data = await response.json();
//     let photo = data.imageUrl;
//     console.log(photo);
//     let profilePhotoOptions = document.querySelector("#profilePhotoOptions");
//     profilePhotoOptions.innerHTML = "";
//     profilePhotoOptions.innerHTML = `<a href="#"><img src="${photo}" class="rounded-circle unsplash-photo" alt="Image of animal height="200px" width="200px"></img></a>`;

// }



