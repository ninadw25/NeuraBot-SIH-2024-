console.log("Script loaded");

document.getElementById('otpForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent default form submission

    // Collect the OTP entered by the user
    let otp = '';
    otp += document.querySelector('input[name="otp1"]').value;
    otp += document.querySelector('input[name="otp2"]').value;
    otp += document.querySelector('input[name="otp3"]').value;
    otp += document.querySelector('input[name="otp4"]').value;

    console.log('Collected OTP:', otp);  // Debugging

    // Send the OTP to the server for verification
    fetch('/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            window.location.href = '/dashboard';  // Redirect on success
        } else {
            alert('Invalid OTP. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error verifying OTP:', error);
        alert('An error occurred while verifying OTP. Please try again.');
    });
});