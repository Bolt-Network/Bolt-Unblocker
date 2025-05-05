document.addEventListener('DOMContentLoaded', () => {
    const notificationBox = document.getElementById('bug-report-notification');
    const modal = document.getElementById('bug-report-modal');
    const closeBtn = document.getElementById('close-modal');
    const bugForm = document.getElementById('bug-report-form');
    const bugDescription = document.getElementById('bug-description');
    const imageInput = document.getElementById('bug-image');
    const imagePreview = document.getElementById('image-preview');
    const submissionStatus = document.getElementById('submission-status');
    const modalContent = document.querySelector('.modal-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const bugSeverity = document.getElementById('bug-severity');
    const bugPage = document.getElementById('bug-page');
    const uploadContainer = document.querySelector('.upload-container');

    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1366204585986883696/AYYTD8Sw4O2_fytbGdIlPRXdW49FULBev1ZBLLgLrqfm3iH3B6sb6j_xXIuDPmJ6QuvF';

    if (localStorage.getItem('bug-reporter-notification') === 'false') {
        notificationBox.remove();
        return;
    }
    if (bugPage) {
        bugPage.value = window.location.href;
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    notificationBox.addEventListener('click', () => {
        openModal();
    });

    function openModal() {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 50);
    }

    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';

        setTimeout(() => {
            modal.classList.add('hidden');
            resetForm();
        }, 300);
    }

    if (uploadContainer) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            uploadContainer.style.borderColor = 'rgba(0, 183, 255, 0.8)';
            uploadContainer.style.backgroundColor = 'rgba(0, 183, 255, 0.15)';
        }

        function unhighlight() {
            uploadContainer.style.borderColor = 'rgba(0, 183, 255, 0.3)';
            uploadContainer.style.backgroundColor = 'rgba(0, 183, 255, 0.05)';
        }

        uploadContainer.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                imageInput.files = files;
                handleFiles(files);
            }
        }
    }

    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        imagePreview.innerHTML = '';
        const file = files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                showStatus('Please select an image file.', 'error');
                imageInput.value = '';
                return;
            }

            if (file.size > 8 * 1024 * 1024) {
                showStatus('Image size should be less than 8MB.', 'error');
                imageInput.value = '';
                return;
            }

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const details = document.createElement('div');
                details.className = 'image-details';
                details.innerHTML = `
                    <span>${file.name}</span>
                    <span>${formatFileSize(file.size)}</span>
                `;

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.addEventListener('click', () => {
                    imagePreview.innerHTML = '';
                    imageInput.value = '';
                });

                imagePreview.appendChild(img);
                imagePreview.appendChild(details);
                imagePreview.appendChild(removeBtn);
            };
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    bugForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const description = bugDescription.value.trim();
        if (!description) {
            showStatus('Please describe the issue.', 'error');
            return;
        }

        if (description.length < 10) {
            showStatus('Please provide a more detailed description.', 'error');
            return;
        }

        if (containsHarmfulContent(description)) {
            showStatus('Your report contains disallowed content. Please revise it.', 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-bug');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            const severity = bugSeverity ? bugSeverity.value : 'medium';
            const pageLocation = bugPage ? bugPage.value.trim() : window.location.href;

            await sendToDiscord(description, severity, pageLocation, imageInput.files[0]);

            showStatus('Report submitted successfully!', 'success');
            resetForm();

            modalContent.style.borderColor = 'rgba(0, 200, 0, 0.6)';
            modalContent.style.boxShadow = '0 0 40px rgba(0, 200, 0, 0.3), 0 0 100px rgba(0, 0, 0, 0.3)';

            setTimeout(() => {
                modalContent.style.transform = 'scale(0.95)';
                modalContent.style.opacity = '0';

                setTimeout(() => {
                    modal.classList.add('hidden');
                    setTimeout(() => {
                        modalContent.style.borderColor = 'rgba(0, 183, 255, 0.3)';
                        modalContent.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
                    }, 300);
                }, 300);
            }, 1500);
        } catch (error) {
            console.error('Error submitting report:', error);
            showStatus('Failed to submit report. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    function containsHarmfulContent(text) {
        if (/@(everyone|here)/.test(text)) {
            return true;
        }

        if (/<@!?\d+>/.test(text)) {
            return true;
        }

        if (/<@&\d+>/.test(text)) {
            return true;
        }

        const urlCount = (text.match(/(https?:\/\/[^\s]+)/g) || []).length;
        if (urlCount > 5) {
            return true;
        }

        if (/(script|eval|alert|document\.|window\.|localStorage|sessionStorage)/.test(text)) {
            return true;
        }

        return false;
    }

    function getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const browserInfo = {
            browser: 'Unknown',
            version: 'Unknown',
            os: 'Unknown'
        };

        if (/Firefox\/(\d+)/.test(userAgent)) {
            browserInfo.browser = 'Firefox';
            browserInfo.version = RegExp.$1;
        } else if (/Edge\/(\d+)/.test(userAgent) || /Edg\/(\d+)/.test(userAgent)) {
            browserInfo.browser = 'Edge';
            browserInfo.version = RegExp.$1;
        } else if (/Chrome\/(\d+)/.test(userAgent)) {
            browserInfo.browser = 'Chrome';
            browserInfo.version = RegExp.$1;
        } else if (/Safari\/(\d+)/.test(userAgent)) {
            browserInfo.browser = 'Safari';
            browserInfo.version = /Version\/(\d+)/.test(userAgent) ? RegExp.$1 : 'Unknown';
        } else if (/MSIE (\d+)/.test(userAgent) || /Trident.*rv:(\d+)/.test(userAgent)) {
            browserInfo.browser = 'Internet Explorer';
            browserInfo.version = RegExp.$1;
        }

        if (/Windows/.test(userAgent)) {
            browserInfo.os = 'Windows';
        } else if (/Macintosh/.test(userAgent)) {
            browserInfo.os = 'Mac OS';
        } else if (/Linux/.test(userAgent)) {
            browserInfo.os = 'Linux';
        } else if (/Android/.test(userAgent)) {
            browserInfo.os = 'Android';
        } else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) {
            browserInfo.os = 'iOS';
        }

        return browserInfo;
    }

    async function sendToDiscord(description, severity, pageLocation, imageFile) {
        const formData = new FormData();

        const sanitizedDescription = description
            .replace(/@/g, '@\u200B')
            .replace(/```/g, '`\u200B``')
            .trim();

        const browserInfo = getBrowserInfo();

        const severityColors = {
            low: 0x00AAFF,
            medium: 0xFF9900,
            high: 0xFF0000
        };

        const severityEmojis = {
            low: '🔵',
            medium: '🟠',
            high: '🔴'
        };

        const embed = {
            title: `${severityEmojis[severity] || '🐛'} New Issue Report`,
            description: sanitizedDescription,
            color: severityColors[severity] || 0x0091FF,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: 'Severity',
                    value: severity.charAt(0).toUpperCase() + severity.slice(1),
                    inline: true
                },
                {
                    name: 'Browser',
                    value: `${browserInfo.browser} ${browserInfo.version}`,
                    inline: true
                },
                {
                    name: 'OS',
                    value: browserInfo.os,
                    inline: true
                },
                {
                    name: 'Screen',
                    value: `${window.screen.width}x${window.screen.height}`,
                    inline: true
                },
                {
                    name: 'Page',
                    value: pageLocation || 'Not specified'
                }
            ],
            footer: {
                text: 'Bolt Bug Reporter'
            }
        };

        const payload = {
            username: 'Bug Reporter',
            embeds: [embed]
        };

        if (imageFile) {
            const reader = new FileReader();

            const fileDataPromise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });

            const fileData = await fileDataPromise;

            embed.image = {
                url: 'attachment://screenshot.png'
            };

            formData.append('payload_json', JSON.stringify(payload));

            const byteString = atob(fileData.split(',')[1]);
            const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeType });
            formData.append('file', blob, 'screenshot.png');

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to send to Discord: ${response.status}`);
            }
        } else {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to send to Discord: ${response.status}`);
            }
        }
    }

    function showStatus(message, type) {
        submissionStatus.textContent = message;
        submissionStatus.className = '';
        submissionStatus.classList.add(type);
        submissionStatus.classList.remove('hidden');

        submissionStatus.style.opacity = '0';
        submissionStatus.style.transform = 'translateY(10px)';

        setTimeout(() => {
            submissionStatus.style.opacity = '1';
            submissionStatus.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            submissionStatus.style.opacity = '0';
            submissionStatus.style.transform = 'translateY(10px)';

            setTimeout(() => {
                submissionStatus.classList.add('hidden');
            }, 300);
        }, 5000);
    }

    function resetForm() {
        bugForm.reset();
        imagePreview.innerHTML = '';
        submissionStatus.classList.add('hidden');

        if (tabButtons.length > 0 && tabContents.length > 0) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            tabButtons[0].classList.add('active');
            tabContents[0].classList.add('active');
        }

        if (bugPage) {
            bugPage.value = window.location.href;
        }
    }
    notificationBox.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        document.getElementById('tooltip').style.opacity = '0';
        localStorage.setItem('bug-reporter-notification', 'false');
        notificationBox.remove();
        alert('This dialog will not appear again. It can be re-enabled in the settings.');
    })
});