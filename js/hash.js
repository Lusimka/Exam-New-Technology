// Конфігурація хеш-таблиці
const bucketCount = 5; // Кількість "відер" або слотів у хеш-таблиці
const bucketSpacing = 1.2; // Вертикальний інтервал між відрами

// Отримання посилань на DOM-елементи
const hashTableContainer = document.getElementById('hash-table-container');
const hashInputKey = document.getElementById('hashInputKey'); // Змінено ID
const hashInputValue = document.getElementById('hashInputValue'); // Новий елемент для значення
const htmlHashInsertBtn = document.getElementById('hashInputInsertBtn'); // Змінено ID
const htmlHashSearchBtn = document.getElementById('hashInputSearchBtn'); // Змінено ID
const htmlHashDeleteBtn = document.getElementById('hashInputDeleteBtn'); // Додана кнопка видалення
const toggleHashInputPanelBtn = document.getElementById('toggleHashInputPanelBtn');
const hashInputOverlay = document.getElementById('hash-input-overlay');
const hashInputCloseBtn = document.getElementById('hashInputCloseBtn');
const hashMessage = document.getElementById('hashMessage'); // Отримуємо елемент для повідомлень

// Об'єкт для зберігання елементів у відрах.
// Використовуємо Map для кожного відра, щоб зберігати пари ключ-значення
const buckets = Array(bucketCount).fill(0).map(() => new Map());

// Початкове позиціонування контейнера хеш-таблиці
//hashTableContainer.setAttribute('position', '10 1.5 -5');

// Створення візуальних "відер" хеш-таблиці
for (let i = 0; i < bucketCount; i++) {
  const bucket = document.createElement('a-box');
  bucket.setAttribute('position', `0 ${i * bucketSpacing} 0`);
  bucket.setAttribute('width', '1.1');
  bucket.setAttribute('height', '0.6');
  bucket.setAttribute('depth', '1.1');
  bucket.setAttribute('color', '#37474F'); // Темно-сірий колір відра
  bucket.setAttribute('material', 'opacity: 0.6; roughness: 0.2; metalness: 0.4; emissive: #263238'); // Інші властивості матеріалу
  bucket.setAttribute('id', `bucket-${i}`);
  bucket.setAttribute('shadow', 'receive: true; cast: true');
  hashTableContainer.appendChild(bucket);

  // Додаємо мітку з номером відра
  const label = document.createElement('a-text');
  label.setAttribute('value', `#${i}`);
  label.setAttribute('position', `-0.6 ${i * bucketSpacing + 0.35} 0.6`);
  label.setAttribute('color', 'white');
  label.setAttribute('width', 2);
  hashTableContainer.appendChild(label);
}

/**
 * Проста хеш-функція для рядків.
 * Перетворює рядок на числовий індекс відра.
 * @param {string} str Вхідний рядок (ключ).
 * @returns {number} Індекс відра.
 */
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Перетворюємо на 32-бітне ціле число
  }
  return Math.abs(hash % bucketCount); // Повертаємо абсолютне значення за модулем кількості відер
}

// Функція для оновлення візуалізації елементів у відрі
function updateBucketVisualization(bucketIndex) {
    // Видаляємо всі поточні візуальні елементи для цього відра
    hashTableContainer.querySelectorAll(`[data-bucket-index="${bucketIndex}"]`).forEach(el => el.remove());

    const bucketMap = buckets[bucketIndex];
    let yOffset = 0; // Початкове зміщення для елементів у відрі

    bucketMap.forEach((itemData, key) => {
        const posY = bucketIndex * bucketSpacing + yOffset;

        const item = document.createElement('a-box');
        item.setAttribute('position', `0 ${posY} 0.5`);
        item.setAttribute('width', '0.5');
        item.setAttribute('height', '0.5');
        item.setAttribute('depth', '0.5');
        item.setAttribute('color', itemData.color); // Використовуємо збережений колір
        item.setAttribute('material', 'opacity: 0.85; roughness: 0.3; metalness: 0.1; emissive: #FFECB3');
        item.setAttribute('data-key', key);
        item.setAttribute('data-bucket-index', bucketIndex); // Додаємо індекс відра для легшого пошуку

        const label = document.createElement('a-text');
        label.setAttribute('value', key);
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#212121');
        label.setAttribute('position', '0 0 0.3');
        label.setAttribute('width', 2);
        item.appendChild(label);

        hashTableContainer.appendChild(item);
        itemData.entity = item; // Зберігаємо посилання на A-Frame сутність
        yOffset += 0.6; // Збільшуємо зміщення для наступного елемента
    });
}

/**
 * Показує повідомлення в оверлеї.
 * @param {string} message Текст повідомлення.
 * @param {string} type Тип повідомлення ('success' або 'error').
 */
function showHashMessage(message, type) {
    hashMessage.textContent = message;
    hashMessage.className = 'message-box show ' + type; // Додаємо клас show і тип
    setTimeout(() => {
        hashMessage.classList.remove('show'); // Приховуємо через 3 секунди
        // Після анімації приховання, можемо видалити клас display: block, щоб повернути до display: none
        setTimeout(() => {
            hashMessage.style.display = 'none';
        }, 500); // 500ms - тривалість transition opacity
    }, 3000);
    hashMessage.style.display = 'block'; // Встановлюємо display: block, щоб transition працював
}


// Початкова візуалізація (якщо потрібно додати елементи при завантаженні)
document.addEventListener('DOMContentLoaded', () => {
    // Приклад додавання елементів при завантаженні
    // insertHashElement('apple', 'red');
    // insertHashElement('banana', 'yellow');
    // insertHashElement('cherry', 'red');
    // insertHashElement('date', 'brown');
});


// Обробник події для кнопки "Insert"
if (htmlHashInsertBtn) {
    htmlHashInsertBtn.addEventListener('click', () => {
        const key = hashInputKey.value.trim();
        const value = hashInputValue.value.trim(); // Отримуємо значення, якщо воно є
        if (!key) {
            showHashMessage("Please enter a key to insert.", "error");
            return;
        }

        const index = stringHash(key);

        if (buckets[index].has(key)) {
            showHashMessage(`Key '${key}' already exists. Updating value.`, "success"); // Змінено на success, оскільки це оновлення
            // Якщо ключ вже існує, оновлюємо значення та підсвічуємо
            const existingItemData = buckets[index].get(key);
            existingItemData.value = value;
            if (existingItemData.entity) {
                // Збережено анімацію для оновлення, якщо потрібно підсвічування
                existingItemData.entity.setAttribute('animation__highlight', {
                    property: 'color',
                    type: 'color',
                    from: existingItemData.color,
                    to: '#FFFF00',
                    dur: 300,
                    dir: 'alternate',
                    loop: 2,
                    startEvents: `highlight-key-${key}`
                });
                existingItemData.entity.emit(`highlight-key-${key}`);
                existingItemData.entity.querySelector('a-text').setAttribute('value', key); // Оновити текст
            }
            hashInputKey.value = '';
            hashInputValue.value = '';
            return;
        }

        const initialColor = '#FFC107'; // Жовтий колір для нового елемента
        const newItemData = {
            value: value,
            color: initialColor, // Зберігаємо початковий колір
            entity: null
        };
        buckets[index].set(key, newItemData);

        // Перемальовуємо тільки зачеплене відро
        updateBucketVisualization(index);

        // Отримати щойно створений елемент, щоб анімувати його спуск
        const newItemEntity = newItemData.entity;
        if (newItemEntity) {
            // Спочатку переміщуємо його на початкову позицію для анімації
            newItemEntity.setAttribute('position', `0 6 0.5`);
            const targetY = index * bucketSpacing + (buckets[index].size - 1) * 0.6; // Перераховуємо Y після додавання
            newItemEntity.setAttribute('animation', `property: position; to: 0 ${targetY} 0.5; dur: 1000; easing: easeInOutQuad`);
        }
        showHashMessage(`Key '${key}' inserted into bucket ${index}.`, "success");
        hashInputKey.value = '';
        hashInputValue.value = '';
    });
}


// Обробник події для кнопки "Search"
if (htmlHashSearchBtn) {
    htmlHashSearchBtn.addEventListener('click', () => {
        const key = hashInputKey.value.trim();
        if (!key) {
            showHashMessage("Please enter a key to search.", "error");
            return;
        }

        const index = stringHash(key);
        const bucketMap = buckets[index];
        let found = false;

        if (bucketMap.has(key)) {
            const itemData = bucketMap.get(key);
            const targetEntity = itemData.entity;

            if (targetEntity) {
                // Отримуємо поточні розміри (width, height, depth) елемента
                const originalWidth = targetEntity.getAttribute('width');
                const originalHeight = targetEntity.getAttribute('height');
                const originalDepth = targetEntity.getAttribute('depth');

                // Розраховуємо збільшений розмір (наприклад, у 1.5 рази)
                const highlightWidth = originalWidth * 2;
                const highlightHeight = originalHeight * 2;
                const highlightDepth = originalDepth * 2;

                const highlightScaleString = `${highlightWidth} ${highlightHeight} ${highlightDepth}`;
                const originalScaleString = `${originalWidth} ${originalHeight} ${originalDepth}`;


                // Видаляємо всі попередні анімації масштабу
                targetEntity.removeAttribute('animation__highlightScale');
                targetEntity.removeAttribute('animation__returnScale');

                // Анімація збільшення
                targetEntity.setAttribute('animation__highlightScale', {
                    property: 'scale',
                    to: highlightScaleString,
                    dur: 300,
                    easing: 'easeOutQuad',
                    autoplay: true
                });

                // Запускаємо анімацію повернення до початкового розміру після затримки
                setTimeout(() => {
                    targetEntity.setAttribute('animation__returnScale', {
                        property: 'scale',
                        to: originalScaleString,
                        dur: 300,
                        easing: 'easeOutQuad',
                        autoplay: true
                    });
                }, 350); // Затримка має бути трохи більшою, ніж тривалість анімації збільшення

                console.log(`Found item with key: '${key}', value: '${itemData.value}' in bucket ${index}`);
                showHashMessage(`Key '${key}' found in bucket ${index}. Value: '${itemData.value}'`, "success");
                found = true;
            }
        }

        if (!found) {
            showHashMessage(`Key '${key}' not found in hash table.`, "error");
        }
        // hashInputKey.value = ''; // Не очищаємо, щоб користувач міг далі взаємодіяти
    });
}

// Обробник події для кнопки "Delete"
if (htmlHashDeleteBtn) {
    htmlHashDeleteBtn.addEventListener('click', () => {
        const key = hashInputKey.value.trim();
        if (!key) {
            showHashMessage("Please enter a key to delete.", "error");
            return;
        }

        const index = stringHash(key);
        const bucketMap = buckets[index];

        if (bucketMap.has(key)) {
            const itemData = bucketMap.get(key);
            if (itemData.entity) {
                const entityToRemove = itemData.entity;

                // Анімація зникнення
                entityToRemove.setAttribute('animation__fade', {
                    property: 'material.opacity',
                    to: 0,
                    dur: 300
                });
                entityToRemove.setAttribute('animation__moveaway', { // Нова анімація відльоту
                    property: 'position',
                    to: `${entityToRemove.getAttribute('position').x} ${entityToRemove.getAttribute('position').y + 1} ${entityToRemove.getAttribute('position').z + 1}`,
                    dur: 300
                });

                // Видаляємо елемент з Map та з DOM після анімації
                setTimeout(() => {
                    bucketMap.delete(key);
                    entityToRemove.remove();
                    // Після видалення, оновлюємо візуалізацію всього відра, щоб елементи "зсунулись"
                    updateBucketVisualization(index);
                }, 350);
            } else {
                // Якщо сутності чомусь немає, просто видаляємо з Map
                bucketMap.delete(key);
                updateBucketVisualization(index); // Оновлюємо візуалізацію
            }
            showHashMessage(`Key '${key}' deleted from hash table.`, "success"); // Повідомлення про успішне видалення
        } else {
            showHashMessage(`Key '${key}' not found in hash table.`, "error"); // Повідомлення про те, що елемент не знайдено
        }
        hashInputKey.value = ''; // Очищаємо поле вводу ключа
    });
}

// Обробник для кнопки перемикання видимості панелі
if (toggleHashInputPanelBtn) {
    toggleHashInputPanelBtn.addEventListener('click', () => {
        if (hashInputOverlay) {
            hashInputOverlay.style.display = hashInputOverlay.style.display === 'none' ? 'flex' : 'none';
            if (hashInputOverlay.style.display === 'flex') {
                hashInputKey.focus();
                // При відкритті оверлея, приховати повідомлення
                hashMessage.classList.remove('show');
                hashMessage.style.display = 'none';
            }
        }
    });
}

// Обробник для кнопки закриття панелі
if (hashInputCloseBtn) {
    hashInputCloseBtn.addEventListener('click', () => {
        if (hashInputOverlay) {
            hashInputOverlay.style.display = 'none';
            // При закритті оверлея, приховати повідомлення
            hashMessage.classList.remove('show');
            hashMessage.style.display = 'none';
        }
    });
}

const hashInfoBtn = document.getElementById('hashInfoBtn');
const hashInfoOverlay = document.getElementById('hash-info-overlay');
const hashInfoCloseBtn = document.getElementById('hashInfoCloseBtn');

// Функція для перемикання видимості панелі інформації про хеш-таблицю
function toggleHashInfoPanel() {
    if (hashInfoOverlay) {
        if (hashInfoOverlay.style.display === 'none' || hashInfoOverlay.style.display === '') {
            hashInfoOverlay.style.display = 'flex';
        } else {
            hashInfoOverlay.style.display = 'none';
        }
    }
}

// Додаємо обробники подій для кнопки інформації про хеш-таблицю
if (hashInfoBtn) {
    hashInfoBtn.addEventListener('click', toggleHashInfoPanel);
}
if (hashInfoCloseBtn) {
    hashInfoCloseBtn.addEventListener('click', toggleHashInfoPanel);
}