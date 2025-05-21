document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        fetch('http://localhost:3000/auth/kick/callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Token recibido:', data.access_token);
            // Guarda el token en el localStorage o úsalo para autenticar.
        })
        .catch(error => console.error('Error:', error));
    }
});
