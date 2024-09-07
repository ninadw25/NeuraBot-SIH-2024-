document.querySelectorAll('.otp-input').forEach((input, index) => {
    input.addEventListener('input', (e) => {
        // Ensure only digits are entered
        e.target.value = e.target.value.replace(/\D/, '');

        // Move focus to next input if a digit is entered
        if (e.target.value && index < 3) {
            document.querySelectorAll('.otp-input')[index + 1].focus();
        }
    });
});

document.getElementById('otpForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent default form submission

    // Collect the OTP entered by the user
    let otp = '';
    document.querySelectorAll('.otp-input').forEach(input => otp += input.value);

    console.log('Collected OTP:', otp);  // Debugging

    // Send the OTP to the server for verification
    fetch('/verifyOtp', {
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
            window.location.href = '/';
        } else {
            alert('Invalid OTP. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error verifying OTP:', error);
        alert('An error occurred while verifying OTP. Please try again.');
    });
});