// js/audio.js

(function() { // Start IIFE
    const toggleMusicBtn = document.getElementById('toggleMusicBtn');
    const volumeControlPanel = document.getElementById('volumeControlPanel');
    const volumeSlider = document.getElementById('volumeSlider');
    const musicStyleSelect = document.getElementById('musicStyleSelect');

    const backgroundMusic1 = document.getElementById('backgroundMusic1');
    const backgroundMusic2 = document.getElementById('backgroundMusic2');
    let currentMusic = backgroundMusic1; // Початкова музика (стиль 1)
    const fadeDuration = 500; // Тривалість плавного переходу (мілісекунди)

    // *** Додані логи для перевірки ***
    console.log("Audio Element 1:", backgroundMusic1 ? backgroundMusic1.id : "null", "src:", backgroundMusic1 ? backgroundMusic1.src : "null");
    console.log("Audio Element 2:", backgroundMusic2 ? backgroundMusic2.id : "null", "src:", backgroundMusic2 ? backgroundMusic2.src : "null");

    // *** НОВИЙ КОД: Форсуємо завантаження backgroundMusic2 ***
    if (backgroundMusic2) {
        backgroundMusic2.load(); // Викликаємо .load() для примусового завантаження
        // Можна також додати обробник подій для відстеження готовності
        backgroundMusic2.addEventListener('canplaythrough', () => {
            console.log(`Audio Element 2 (${backgroundMusic2.id}) готовий до відтворення!`);
        }, { once: true });
    }
    // ******************************************************


    // Функція для плавного зменшення гучності
    function fadeOut(audioElement, duration) {
        return new Promise(resolve => {
            if (!audioElement || audioElement.paused || audioElement.volume === 0) {
                resolve();
                return;
            }

            const startVolume = audioElement.volume;
            const step = startVolume / (duration / 50); // Кожні 50 мс зменшуємо гучність
            let fadeInterval = setInterval(() => {
                if (audioElement.volume - step > 0) {
                    audioElement.volume -= step;
                } else {
                    audioElement.volume = 0;
                    audioElement.pause();
                    audioElement.currentTime = 0; // Скидаємо час відтворення для наступного разу
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, 50);
        });
    }

    // Функція для плавного збільшення гучності
    function fadeIn(audioElement, duration, targetVolume) {
        return new Promise(resolve => {
            if (!audioElement) {
                resolve();
                return;
            }

            // Перевіряємо, чи аудіо готове до відтворення
            if (audioElement.readyState < 2) { // HAVE_CURRENT_DATA (2) або більше
                console.warn(`Аудіоелемент ${audioElement.id} ще не готовий до відтворення. Спроба дочекатися.`);
                audioElement.addEventListener('canplaythrough', function handler() {
                    audioElement.removeEventListener('canplaythrough', handler);
                    startFadeIn();
                }, { once: true });
                return;
            }

            startFadeIn();

            function startFadeIn() {
                audioElement.volume = 0; // Починаємо з нуля
                audioElement.play().catch(e => {
                    console.warn(`Помилка відтворення при fadeIn для ${audioElement.id} (можливо, потрібна взаємодія):`, e);
                    resolve(); // Завершуємо проміс, навіть якщо не вдалося відтворити
                    return;
                });

                const step = targetVolume / (duration / 50); // Кожні 50 мс збільшуємо гучність
                let fadeInterval = setInterval(() => {
                    if (audioElement.volume + step < targetVolume) {
                        audioElement.volume = Math.min(targetVolume, audioElement.volume + step); // Обмежуємо гучність цільовим значенням
                    } else {
                        audioElement.volume = targetVolume;
                        clearInterval(fadeInterval);
                        resolve();
                    }
                }, 50);
            }
        });
    }

    // ЗМІНА ТУТ: Ця функція тепер буде викликатися ТІЛЬКИ для фонової музики, а не для звукових ефектів
    function setupMusicLooping(audioElement) {
        if (audioElement) {
            audioElement.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play().catch(e => console.warn(`Не вдалось зациклити музику ${this.id}:`, e));
            });
        }
    }

    // Ініціалізуємо зациклення ТІЛЬКИ для фонових треків
    setupMusicLooping(backgroundMusic1);
    setupMusicLooping(backgroundMusic2);


    // Функція для перемикання видимості панелі гучності
    if (toggleMusicBtn && volumeControlPanel) {
        toggleMusicBtn.addEventListener('click', () => {
            if (volumeControlPanel.style.display === 'none' || volumeControlPanel.style.display === '') {
                volumeControlPanel.style.display = 'flex';
                requestAnimationFrame(() => {
                    volumeControlPanel.style.opacity = '1';
                    volumeControlPanel.style.transform = 'translateY(0)';
                });
            } else {
                volumeControlPanel.style.opacity = '0';
                volumeControlPanel.style.transform = 'translateY(-10px)';
                volumeControlPanel.addEventListener('transitionend', function handler() {
                    volumeControlPanel.style.display = 'none';
                    volumeControlPanel.removeEventListener('transitionend', handler);
                }, { once: true });
            }
        });
    }

    // Ініціалізувати гучність та спробувати відтворити музику при завантаженні
    document.addEventListener('DOMContentLoaded', () => {
        if (currentMusic && volumeSlider) {
            currentMusic.volume = parseFloat(volumeSlider.value); // Перетворення на число
            currentMusic.play().catch(e => {
                console.warn(`Музика ${currentMusic.id} не відтворилась автоматично (потрібна взаємодія користувача):`, e);
            });
        }
    });

    // Зміна гучності
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            if (currentMusic) {
                currentMusic.volume = parseFloat(volumeSlider.value); // Перетворення на число
            }
        });
    }

    // Зміна стилю музики
    if (musicStyleSelect) {
        musicStyleSelect.addEventListener('change', async (event) => { // Використовуємо async для await
            const selectedMusicId = event.target.value;
            let nextMusic;

            if (selectedMusicId === 'music1') {
                nextMusic = backgroundMusic1;
            } else if (selectedMusicId === 'music2') {
                nextMusic = backgroundMusic2;
            }
            // Додайте більше умов для інших стилів музики, якщо вони будуть

            if (nextMusic && nextMusic !== currentMusic) { // Перемикаємо тільки якщо обрана інша музика
                const initialVolume = parseFloat(volumeSlider.value); // Зберігаємо поточну встановлену гучність

                if (currentMusic && !currentMusic.paused) {
                    await fadeOut(currentMusic, fadeDuration);
                }

                currentMusic = nextMusic;
                await fadeIn(currentMusic, fadeDuration, initialVolume); // Відтворюємо нову музику плавно до встановленої гучності
            } else if (nextMusic === currentMusic && currentMusic.paused) {
                // Якщо обрали той самий трек, але він на паузі, просто відтворюємо його плавно
                await fadeIn(currentMusic, fadeDuration, parseFloat(volumeSlider.value));
            }
        });
    }

    // НОВЕ: Функція для відтворення звукового ефекту
    window.playSoundEffect = function(effectId = 'clickSoundEffect', volume = 0.2) {
        const soundEffect = document.getElementById(effectId);
        if (soundEffect) {
            // Зупиняємо попереднє відтворення і починаємо знову
            if (!soundEffect.paused) { // Перевіряємо, чи звук вже грає
                soundEffect.pause();   // Якщо так, зупиняємо його
            }
            soundEffect.currentTime = 0; // Перемотуємо на початок
            soundEffect.volume = volume; // Встановлюємо гучність
            soundEffect.play().catch(e => {
                // AbortError тут нормальна, якщо був швидкий клік і звук перервався
                console.warn(`Не вдалось відтворити звуковий ефект '${effectId}':`, e);
            });
        } else {
            console.warn(`Звуковий ефект з ID '${effectId}' не знайдено.`);
        }
    };

})(); // End IIFE