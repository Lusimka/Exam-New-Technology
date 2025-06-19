let stack = [];
const maxStackHeight = 6; 
const boxHeight = 1.8; 
const stackContainer = document.querySelector('#stack-container');
const pushBtn = document.querySelector('#pushBtn');
const popBtn = document.querySelector('#popBtn');

// Отримання посилань на елементи для кнопки інформації про стек
const stackInfoBtn = document.getElementById('stackInfoBtn');
const stackInfoOverlay = document.getElementById('stack-info-overlay');
const stackInfoCloseBtn = document.getElementById('stackInfoCloseBtn');


const dataTypes = ['String', 'Number', 'Object'];
// Визначимо моделі та їхні властивості, використовуючи надані ID та початкові scale/rotation.
// Важливо: переконайтеся, що ці моделі завантажені у вашій A-Frame сцені через <a-assets>
const modelAssets = [
    { id: '#box', scale: '0.015 0.015 0.015', rotation: '0 -90 0' },
    { id: '#fuel', scale: '0.015 0.015 0.015', rotation: '0 -90 0' },
    { id: '#drone1', scale: '5 5 5', rotation: '0 0 0' }, 
    { id: '#drone2', scale: '0.15 0.15 0.15', rotation: '0 0 0' },
    { id: '#drone3', scale: '0.4 0.4 0.4', rotation: '0 180 0' },
    { id: '#tank', scale: '0.15 0.15 0.15', rotation: '0 0 0' }
];

// !!! НОВЕ: Відносні зміщення для кожної моделі всередині її "боксу" !!!
// Ви можете редагувати ці значення, щоб точно налаштувати позицію моделі
const modelOffsets = {
    '#box': '0 -0.5 0',
    '#fuel': '0 -0.5 0',
    '#drone1': '0 0 0', 
    '#drone2': '0 0 0',
    '#drone3': '0 0 0',
    '#tank': '0 0 0'
};


function getRandomData() {
    const type = dataTypes[Math.floor(Math.random() * dataTypes.length)];
    let value;
    let modelData = modelAssets[Math.floor(Math.random() * modelAssets.length)]; 

    switch (type) {
        case 'Number':
            value = Math.floor(Math.random() * 100);
            break;
        case 'String':
            const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu'];
            value = words[Math.floor(Math.random() * words.length)];
            break;
        case 'Object':
            value = `{ id: ${Math.floor(Math.random() * 100)}, status: 'active' }`;
            break;
    }
    return { type, value, modelData };
}

pushBtn.addEventListener('click', () => {
    if (stack.length >= maxStackHeight) {
        console.warn("Stack is full. Cannot push.");
        return;
    }
    window.playSoundEffect('clickSoundEffect', 0.05); //відтворення звуку кліка
    const { type, value, modelData } = getRandomData();
    const newBox = document.createElement('a-entity'); 

    const posY = stack.length * boxHeight; 
    newBox.setAttribute('position', `0 ${posY} 0`); 
    
    newBox.setAttribute('geometry', `primitive: box; width: 0.6; height: ${boxHeight}; depth: 0.6`);
    newBox.setAttribute('material', `color: #4CAF50; opacity: 0.0`); 
    newBox.setAttribute('shadow', 'cast: true; receive: true');

    newBox.setAttribute('scale', '0.01 0.01 0.01'); 
    newBox.setAttribute('animation__grow', {
        property: 'scale',
        to: '1 1 1',
        dur: 500,
        easing: 'easeOutElastic'
    });

    // Додаємо модель GLTF
    const modelEntity = document.createElement('a-entity');
    modelEntity.setAttribute('gltf-model', modelData.id);
    modelEntity.setAttribute('scale', modelData.scale);
    
    // Встановлюємо початкове обертання моделі з modelData.rotation
    modelEntity.setAttribute('rotation', modelData.rotation); 
    
    // !!! НОВЕ ВИКОРИСТАННЯ: Відносне зміщення моделі !!!
    // Застосовуємо зміщення з modelOffsets до базової позиції boxHeight / 2
    const offset = modelOffsets[modelData.id] || '0 0 0'; 
    const offsetParts = offset.split(' ').map(Number); 

    modelEntity.setAttribute('position', `${offsetParts[0]} ${boxHeight / 2 + offsetParts[1]} ${offsetParts[2]}`); 

    // Анімація обертання для моделі (для всіх об'єктів у стеку)
    // ВИПРАВЛЕННЯ: Додано from для плавного циклічного обертання
    // АСИНХРОННА АНІМАЦІЯ: Генеруємо випадкову затримку для кожного об'єкта
    const randomDelay = Math.random() * 500; // Зменшено максимальну затримку до 500 мс
    modelEntity.setAttribute('animation__rotate', {
        property: 'rotation',
        from: '0 0 0', 
        to: '0 360 0', 
        loop: true,   
        dur: 10000, 
        easing: 'linear',
        delay: randomDelay 
    });
    newBox.appendChild(modelEntity);


    stackContainer.appendChild(newBox);
    stack.push(newBox);
});

popBtn.addEventListener('click', () => {
    if (stack.length === 0) {
        console.warn("Stack is empty. Cannot pop.");
        return;
    }
    window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
    const topBox = stack.pop();
    const currentPosition = topBox.getAttribute('position');
    const posY = parseFloat(currentPosition.y); 

    const initialIndex = stack.length; 
    const flightHeightFactor = 0.8; 
    const flightHeight = 3.0 + (initialIndex * flightHeightFactor); 
    
    topBox.setAttribute('animation__fade', {
        property: 'material.opacity',
        to: 0,
        dur: 400,
        easing: 'easeOutQuad'
    });
    topBox.setAttribute('animation__scale', {
        property: 'scale',
        to: '0.01 0.01 0.01', 
        dur: 400,
        easing: 'easeOutQuad'
    });
    topBox.setAttribute('animation__up', {
        property: 'position.y', 
        to: posY + flightHeight, 
        dur: 700, 
        easing: 'easeOutQuad'
    });
    setTimeout(() => stackContainer.removeChild(topBox), 750); 

    // Переміщення інших елементів вниз
    for (let i = 0; i < stack.length; i++) {
        const box = stack[i];
        const newY = i * boxHeight; 
        box.setAttribute('animation__movedown', {
            property: 'position.y',
            to: newY,
            dur: 300,
            easing: 'easeOutQuad'
        });
    }
});

// Функція для перемикання видимості панелі інформації про стек
function toggleStackInfoPanel() {
    if (stackInfoOverlay.style.display === 'none' || stackInfoOverlay.style.display === '') {
        stackInfoOverlay.style.display = 'flex'; 
    } else {
        stackInfoOverlay.style.display = 'none';
    }
}

// Додаємо обробники подій для кнопки інформації про стек
if (stackInfoBtn) {
    stackInfoBtn.addEventListener('click', toggleStackInfoPanel);
}
if (stackInfoCloseBtn) {
    stackInfoCloseBtn.addEventListener('click', toggleStackInfoPanel);
}