// js/tree.js

(function() { // Start IIFE
    let treeData = null;
    const treeRoot = document.querySelector('#tree-root');
    const spacingX = 4;
    const spacingY = 1.5;
    const maxDepth = 3; // Максимальна глибина дерева (корінь + 2 рівні)
  
    // Об'єкти моделей з їхніми налаштуваннями
    const modelAssets = {
      'sun': { gltfModel: '#sun', scale: '0.05 0.05 0.05', rotation: '0 360 0' },
      'earth': { gltfModel: '#earth', scale: '0.4 0.4 0.4', rotation: '0 360 0' },
      'moon': { gltfModel: '#moon', scale: '0.03 0.03 0.03', rotation: '0 360 0' },
      'mars': { gltfModel: '#mars', scale: '0.2 0.2 0.2', rotation: '0 360 0' },
      'planetsys1': { gltfModel: '#planetsys1', scale: '1.2 1.2 1.2', rotation: '0 360 0' },
      'planetsys2': { gltfModel: '#planetsys2', scale: '0.35 0.35 0.35', rotation: '0 360 0' },
      'planet1': { gltfModel: '#planet1', scale: '0.002 0.002 0.002', rotation: '0 360 0' },
      'planet2': { gltfModel: '#planet2', scale: '0.03 0.03 0.03', rotation: '0 360 0' },
      'asteroid1': { gltfModel: '#asteroid1', scale: '0.002 0.002 0.002', rotation: '0 360 0' },
      'asteroid2': { gltfModel: '#asteroid2', scale: '0.3 0.3 0.3', rotation: '0 360 0' },
      'asteroid3': { gltfModel: '#asteroid3', scale: '0.005 0.005 0.005', rotation: '0 360 0' }
    };
  
    // Список моделей для глибини 1
    const firstLevelAllowedModels = ['earth', 'mars', 'planetsys1', 'planetsys2'];
    // Список моделей для глибини 2
    const secondLevelAllowedModels = ['planet1', 'planet2', 'asteroid1', 'asteroid2', 'asteroid3'];
  
    // Додаємо множини для відстеження моделей, які вже є на певних глибинах
    let modelsOnLevel1 = new Set();
    let modelsOnLevel2 = new Set(); // Нова множина для відстеження моделей на глибині 2
  
    // Функція для скидання відстеження моделей при очищенні дерева
    function resetLevelModels() {
        modelsOnLevel1.clear();
        modelsOnLevel2.clear();
    }
  
    // Вибір випадкової моделі залежно від поточної глибини
    function getRandomModelNameForDepth(depth) {
        if (depth === 0) {
            return 'sun';
        } else if (depth === 1) {
            const availableModels = firstLevelAllowedModels.filter(model => !modelsOnLevel1.has(model));
            if (availableModels.length > 0) {
                return availableModels[Math.floor(Math.random() * availableModels.length)];
            }
            return null; // Всі доступні моделі на цьому рівні вже зайняті
        } else if (depth === 2) {
            const availableModels = secondLevelAllowedModels.filter(model => !modelsOnLevel2.has(model));
            if (availableModels.length > 0) {
                return availableModels[Math.floor(Math.random() * availableModels.length)];
            }
            return null; // Всі доступні моделі на цьому рівні вже зайняті
        }
        return null;
    }
  
    function createNodeEntity(modelName, x, y) {
      const modelData = modelAssets[modelName];
      if (!modelData) {
        console.error(`Model data for ${modelName} not found!`);
        return null;
      }
  
      const nodeContainer = document.createElement('a-entity');
      nodeContainer.setAttribute('position', `${x} ${y} -2`);
      nodeContainer.setAttribute('shadow', 'cast: true; receive: true');
      nodeContainer.setAttribute('data-model-name', modelName); // Зберігаємо ім'я моделі
  
      const modelEntity = document.createElement('a-entity');
      modelEntity.setAttribute('gltf-model', modelData.gltfModel);
      modelEntity.setAttribute('scale', '0.01 0.01 0.01'); // Початковий розмір для анімації появи
  
      // Анімація збільшення при появі
      modelEntity.setAttribute('animation__grow', {
        property: 'scale',
        to: modelData.scale,
        dur: 500,
        easing: 'easeOutElastic'
      });
  
      // Анімація обертання
      modelEntity.setAttribute('animation__rotate', {
        property: 'rotation',
        from: '0 0 0',
        to: modelData.rotation,
        loop: true,
        dur: 10000,
        easing: 'linear'
      });
  
      nodeContainer.appendChild(modelEntity);
      treeRoot.appendChild(nodeContainer);
      return nodeContainer;
    }
  
    function createConnectionLine(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = 0;
  
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
      const line = document.createElement('a-cylinder');
      line.setAttribute('radius', 0.02);
      line.setAttribute('height', length);
      line.setAttribute('color', '#ccc');
      line.setAttribute('position', `${(x1 + x2) / 2} ${(y1 + y2) / 2} -2`);
      line.setAttribute('rotation', `${-angle} 0 90`);
      treeRoot.appendChild(line);
    }
  
    // Обхід дерева для пошуку вільного місця для вставки
    // Ця функція тепер буде вирішувати, яку модель вставляти і куди
    function findSpotAndInsert(currentNode, currentDepth) {
        if (!currentNode || currentDepth >= maxDepth) {
            return false; // Досягли кінця гілки або максимальної глибини
        }
  
        // **Особливість Земля -> Місяць**
        if (currentNode.modelName === 'earth') {
            // Якщо "moon" ще не додано і "moon" може бути на наступному рівні (глибина 2)
            if (!currentNode.left && (currentDepth + 1) === 2) {
                const newY = currentNode.y + spacingY;
                const offsetX = spacingX / Math.pow(2, currentDepth + 1);
                const newX = currentNode.x - offsetX;
                currentNode.left = { modelName: 'moon', left: null, right: null, x: newX, y: newY, entity: createNodeEntity('moon', newX, newY) };
                createConnectionLine(currentNode.x, currentNode.y, newX, newY);
                // Важливо: moon не відстежується в modelsOnLevel2, бо це спеціальний випадок
                return true; // Вставлено "moon"
            }
            // Якщо "moon" вже є, або не може бути додано (наприклад, глибина 3), то нічого більше після "earth"
            return false;
        }
  
        // Для всіх інших вузлів (не "earth")
        // Спробуємо додати ліворуч
        if (!currentNode.left) {
            const newX = currentNode.x - spacingX / Math.pow(2, currentDepth + 1);
            const newY = currentNode.y + spacingY;
            const modelNameForNewNode = getRandomModelNameForDepth(currentDepth + 1);
  
            if (modelNameForNewNode) {
                // Додаємо до відповідного Set для відстеження
                if (currentDepth + 1 === 1) {
                    if (modelsOnLevel1.has(modelNameForNewNode)) {
                        // Ця модель вже є на рівні 1, тому не додаємо її сюди.
                        // Ми не повертаємо false одразу, бо можемо спробувати праву гілку.
                    } else {
                        currentNode.left = { modelName: modelNameForNewNode, left: null, right: null, x: newX, y: newY, entity: createNodeEntity(modelNameForNewNode, newX, newY) };
                        createConnectionLine(currentNode.x, currentNode.y, newX, newY);
                        modelsOnLevel1.add(modelNameForNewNode);
                        return true; // Вставлено
                    }
                } else if (currentDepth + 1 === 2) {
                     if (modelsOnLevel2.has(modelNameForNewNode)) {
                        // Ця модель вже є на рівні 2, тому не додаємо її сюди.
                     } else {
                        currentNode.left = { modelName: modelNameForNewNode, left: null, right: null, x: newX, y: newY, entity: createNodeEntity(modelNameForNewNode, newX, newY) };
                        createConnectionLine(currentNode.x, currentNode.y, newX, newY);
                        modelsOnLevel2.add(modelNameForNewNode);
                        return true; // Вставлено
                     }
                }
            }
        } else {
            // Якщо ліве піддерево існує, рекурсивно шукаємо місце там
            if (findSpotAndInsert(currentNode.left, currentDepth + 1)) {
                return true; // Вставлено в ліве піддерево
            }
        }
  
        // Спробуємо додати праворуч
        if (!currentNode.right) {
            const newX = currentNode.x + spacingX / Math.pow(2, currentDepth + 1);
            const newY = currentNode.y + spacingY;
            const modelNameForNewNode = getRandomModelNameForDepth(currentDepth + 1);
  
            if (modelNameForNewNode) {
                // Додаємо до відповідного Set для відстеження
                if (currentDepth + 1 === 1) {
                    if (modelsOnLevel1.has(modelNameForNewNode)) {
                        // Ця модель вже є на рівні 1, тому не додаємо її сюди.
                    } else {
                        currentNode.right = { modelName: modelNameForNewNode, left: null, right: null, x: newX, y: newY, entity: createNodeEntity(modelNameForNewNode, newX, newY) };
                        createConnectionLine(currentNode.x, currentNode.y, newX, newY);
                        modelsOnLevel1.add(modelNameForNewNode);
                        return true; // Вставлено
                    }
                } else if (currentDepth + 1 === 2) {
                     if (modelsOnLevel2.has(modelNameForNewNode)) {
                        // Ця модель вже є на рівні 2, тому не додаємо її сюди.
                     } else {
                        currentNode.right = { modelName: modelNameForNewNode, left: null, right: null, x: newX, y: newY, entity: createNodeEntity(modelNameForNewNode, newX, newY) };
                        createConnectionLine(currentNode.x, currentNode.y, newX, newY);
                        modelsOnLevel2.add(modelNameForNewNode);
                        return true; // Вставлено
                     }
                }
            }
        } else {
            // Якщо праве піддерево існує, рекурсивно шукаємо місце там
            if (findSpotAndInsert(currentNode.right, currentDepth + 1)) {
                return true; // Вставлено в праве піддерево
            }
        }
  
        return false; // Не вдалося вставити на цьому рівні або в його піддеревах
    }
  
  
    // Обробник подій для кнопки "Insert"
    document.querySelector('#insertBtn').addEventListener('click', () => {
      window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
      if (!treeData) {
        // Перший вузол (глибина 0) завжди "sun"
        treeData = { modelName: 'sun', left: null, right: null, x: 0, y: 2.2, entity: createNodeEntity('sun', 0, 2.2) };
      } else {
        // Спробуємо знайти місце і вставити новий елемент
        if (!findSpotAndInsert(treeData, 0)) {
            console.warn("Could not insert new node. Tree might be full or no suitable spot found based on rules.");
        }
      }
    });
  
  
    // Обробник подій для кнопки "Clear"
    document.querySelector('#clearBtn').addEventListener('click', () => {
      window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
      while (treeRoot.firstChild) treeRoot.removeChild(treeRoot.firstChild);
      treeData = null;
      resetLevelModels(); // Скидаємо відстеження моделей при очищенні
    });
  
    // НОВИЙ СКРИПТ ДЛЯ ІНФОРМАЦІЇ ПРО БІНАРНЕ ДЕРЕВО (залишаємо як було, але всередині IIFE)
    const binaryTreeInfoBtn = document.getElementById('binaryTreeInfoBtn');
    const binaryTreeInfoOverlay = document.getElementById('binary-tree-info-overlay');
    const binaryTreeInfoCloseBtn = document.getElementById('binaryTreeInfoCloseBtn');
  
    function toggleBinaryTreeInfoPanel() {
        if (binaryTreeInfoOverlay) { // Додана перевірка на існування елемента
            if (binaryTreeInfoOverlay.style.display === 'none' || binaryTreeInfoOverlay.style.display === '') {
                binaryTreeInfoOverlay.style.display = 'flex';
            } else {
                binaryTreeInfoOverlay.style.display = 'none';
            }
        }
    }
  
    if (binaryTreeInfoBtn) {
        binaryTreeInfoBtn.addEventListener('click', toggleBinaryTreeInfoPanel);
    }
    if (binaryTreeInfoCloseBtn) {
        binaryTreeInfoCloseBtn.addEventListener('click', toggleBinaryTreeInfoPanel);
    }
  
  })(); // End IIFE