
    // display signup modal when signup is clicked
    if (document.getElementById("signup-modal")) {
        document.getElementById("signup-modal").addEventListener('click',()=>{
        const myModal = new bootstrap.Modal(document.getElementById('signupModal'));
        myModal.show();
    }); 
    }
