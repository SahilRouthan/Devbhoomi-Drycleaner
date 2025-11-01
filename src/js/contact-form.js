// This file manages the functionality of the contact form, including validation and submission.

document.addEventListener("DOMContentLoaded", function() {
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const submitButton = document.getElementById("submit-button");

    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Simple validation
        if (nameInput.value.trim() === "" || emailInput.value.trim() === "" || messageInput.value.trim() === "") {
            alert("Please fill in all fields.");
            return;
        }

        // Simulate form submission
        const formData = {
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
        };

        console.log("Form submitted:", formData);
        alert("Thank you for your message! We will get back to you soon.");

        // Reset the form
        contactForm.reset();
    });
});