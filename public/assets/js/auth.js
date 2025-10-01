document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('name') || localStorage.getItem('name') === '') {
        localStorage.setItem('new', 'true');
        try {
            if (localStorage.getItem('que') === 'false' || localStorage.getItem('que') === null) {
                var result = confirm("Do you want to enable ultra-performance mode? (HIGHLY RECOMMENDED FOR LOW-END DEVICES)");
                if (result) {
                    localStorage.setItem('particlesEnabled', false);
                    localStorage.setItem('background', '3');
                    localStorage.setItem('performaceMode', 'true');
                    localStorage.setItem('que', 'true');
                    window.top.location.reload();
                }
                else {
                    localStorage.setItem('particlesEnabled', true);
                    localStorage.setItem('que', 'true');
                }
            }
      localStorage.setItem('particlesEnabled', false);
                    localStorage.setItem('background', '3');
            const overlay = document.createElement('div');
            overlay.className = 'onboarding-overlay';
            overlay.innerHTML = `
                <div class="onboarding-content">
                    <h1 class="onboarding-title">Welcome to Bolt</h1>
                    <div class="input-wrapper">
                        <input type="text" class="name-input" id="onboarding-name" placeholder="Enter your name" autocomplete="off">
                    </div>
                    <button class="continue-button" id="onboarding-continue">
                        <span class="button-text">Continue</span>
                        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);

            const style = document.createElement('style');
            style.textContent = `
                .onboarding-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(10, 21, 32, 0.95);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease-out;
                }

                .onboarding-content {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 480px;
                    margin: 20px;
                    animation: slideUp 0.5s ease-out;
                }

                .onboarding-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    background: linear-gradient(135deg, #0099ff, #00ccff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .input-wrapper {
                    margin-bottom: 1.5rem;
                }

                .name-input {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    font-size: 1.1rem;
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }

                .name-input:focus {
                    outline: none;
                    border-color: #0099ff;
                    background: rgba(255, 255, 255, 0.08);
                }

                .name-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .continue-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #ffffff;
                    background: linear-gradient(135deg, #0099ff, #00ccff);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .continue-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 153, 255, 0.3);
                }

                .continue-button:active {
                    transform: translateY(0);
                }

                .arrow-icon {
                    width: 20px;
                    height: 20px;
                    transition: transform 0.3s ease;
                }

                .continue-button:hover .arrow-icon {
                    transform: translateX(4px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);

            const continueButton = document.getElementById('onboarding-continue');
            const nameInput = document.getElementById('onboarding-name');

            const completeOnboarding = () => {
                const name = nameInput.value.trim();
                if (name) {
                    try {
                        localStorage.setItem('name', name);
                        window.location.reload();
                    } catch (error) {
                        console.error('Error saving name to localStorage:', error);
                    }
                }
            };

            continueButton.addEventListener('click', completeOnboarding);

            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    completeOnboarding();
                }
            });

            nameInput.focus();
        } catch (error) {
            console.error('Error setting up onboarding:', error);
        }
    }
});