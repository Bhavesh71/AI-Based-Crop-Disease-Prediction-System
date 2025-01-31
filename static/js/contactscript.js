document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !phone || !message) {
        alert('Please fill out all fields.');
        return;
    }

    // Simulate form submission
    setTimeout(() => {
        alert('Your message has been sent successfully!');
        document.getElementById('contactForm').reset();
    }, 1000);
});
