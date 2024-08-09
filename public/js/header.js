document.addEventListener('DOMContentLoaded', function () {
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
    }); 
    }
});




