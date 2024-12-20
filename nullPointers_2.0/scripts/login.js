const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const toggleFormButton = document.getElementById('toggleForm');

let isPanelActive = false;

function toggleForm() {
    isPanelActive = !isPanelActive;
    container.classList.toggle('right-panel-active', isPanelActive);
    if (isPanelActive) {
        toggleFormButton.textContent = 'Sign In';
    } else {
        toggleFormButton.textContent = 'Create Account';
    }
}

signUpButton.addEventListener('click', toggleForm);
signInButton.addEventListener('click', toggleForm);
toggleFormButton.addEventListener('click', toggleForm);

function isMobile() {
    return window.innerWidth <= 768;
}

function updateFormVisibility() {
    if (isMobile()) {
        if (!isPanelActive) {
            container.classList.remove('right-panel-active');
        }
        toggleFormButton.style.display = 'block';
        toggleFormButton.textContent = 'Create Account';
    } else {
        toggleFormButton.style.display = 'none';
    }
}

window.addEventListener('resize', updateFormVisibility);
window.addEventListener('load', updateFormVisibility);