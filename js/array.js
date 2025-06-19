// js/array.js

(function() { // Start IIFE
  const arrayContainer = document.querySelector('#array-container');
  // Оригінальні 3D-кнопки масиву (зберігаємо їхні оригінальні ID та посилання)
  const arrayInsertBtn3D = document.querySelector('#arrayInsertBtn');
  const arrayDeleteBtn3D = document.querySelector('#arrayDeleteBtn');
  const arrayGetBtn3D = document.querySelector('#arrayGetBtn');

  // Кнопка для перемикання панелі введення
  const toggleArrayInputPanelBtn = document.querySelector('#toggleArrayInputPanelBtn');

  // HTML-панель для введення даних масиву та її елементи
  const arrayInputOverlay = document.querySelector('#array-input-overlay');
  const arrayValueInput = document.querySelector('#arrayValueInput');
  const arrayInputIndex = document.querySelector('#arrayInputIndex');
  const arrayInputAddBtn = document.querySelector('#arrayInputAddBtn');
  const arrayInputGetBtn = document.querySelector('#arrayInputGetBtn');
  const arrayInputRemoveBtn = document.querySelector('#arrayInputRemoveBtn');
  const arrayInputCloseBtn = document.querySelector('#arrayInputCloseBtn');


  let currentArray = [];
  const arrayMaxElements = 8;
  const arraySpacing = 1.5; // Відстань між елементами
  const arrayBaseY = 0;    // Базова висота елементів масиву (відносно контейнера)
  const arrayBaseZ = 0;    // Базова глибина елементів масиву (відносно контейнера)

  const modelAssets = [
      { model: '#asteroid1', scale: '0.002 0.002 0.002', rotationAxis: '360 360 0' },
      { model: '#asteroid2', scale: '0.3 0.3 0.3', rotationAxis: '360 0 360' },
      { model: '#asteroid3', scale: '0.005 0.005 0.005', rotationAxis: '0 360 360' },
      { model: '#planet1', scale: '0.005 0.005 0.005', rotationAxis: '0 360 0' },
      { model: '#planet2', scale: '0.06 0.06 0.06', rotationAxis: '0 360 0' },
      { model: '#spacestation1', scale: '0.2 0.2 0.2', rotationAxis: '0 360 0' },
      { model: '#spacestation2', scale: '0.1 0.1 0.1', rotationAxis: '0 360 0' }
  ];

  function getRandomArrayValue() {
      const type = ['Num', 'Str'][Math.floor(Math.random() * 2)];
      let value;
      if (type === 'Num') {
          value = Math.floor(Math.random() * 99) + 1;
      } else {
          const words = ['Data', 'Item', 'Value', 'Element'];
          value = words[Math.floor(Math.random() * words.length)];
      }
      return value;
  }

  function updateArrayVisualization() {
      const elementsInDOM = Array.from(arrayContainer.querySelectorAll('.array-element'));
      const indexLabelsInDOM = Array.from(arrayContainer.querySelectorAll('.array-index-label'));

      // Створюємо Set з елементів, які повинні залишитися в DOM
      const currentElementEntities = new Set(currentArray.map(item => item.entity).filter(e => e));
      const currentIndexLabelEntities = new Set(currentArray.map(item => item.indexLabel).filter(e => e));

      currentArray.forEach((item, index) => {
          const xPos = index * arraySpacing - (currentArray.length - 1) * arraySpacing / 2;

          let modelContainerEntity = item.entity;
          let modelEntity = item.modelEntity;
          let valueLabel = item.valueLabel;
          let indexLabel = item.indexLabel;

          if (!modelContainerEntity) {
              // Елемент новий - створюємо його
              if (!item.modelData) {
                  item.modelData = modelAssets[Math.floor(Math.random() * modelAssets.length)];
              }

              modelContainerEntity = document.createElement('a-entity');
              modelContainerEntity.setAttribute('position', `${xPos} ${arrayBaseY} ${arrayBaseZ}`);
              modelContainerEntity.setAttribute('shadow', 'cast: true; receive: true');
              modelContainerEntity.setAttribute('class', 'array-element'); // Маркер для ідентифікації

              modelEntity = document.createElement('a-entity');
              modelEntity.setAttribute('gltf-model', item.modelData.model);
              modelEntity.setAttribute('scale', '0.001 0.001 0.001'); // Початковий розмір для анімації

              // Анімація появи моделі
              modelEntity.setAttribute('animation__grow', {
                  property: 'scale',
                  to: item.modelData.scale,
                  dur: 500,
                  easing: 'easeOutElastic'
              });

              // Анімація обертання
              modelEntity.setAttribute('animation__rotate', {
                  property: 'rotation',
                  from: '0 0 0',
                  to: item.modelData.rotationAxis,
                  loop: true,
                  dur: 10000,
                  easing: 'linear'
              });

              modelContainerEntity.appendChild(modelEntity);
              arrayContainer.appendChild(modelContainerEntity);

              item.entity = modelContainerEntity;
              item.modelEntity = modelEntity;

              valueLabel = document.createElement('a-text');
              valueLabel.setAttribute('value', item.value.toString());
              valueLabel.setAttribute('align', 'center');
              valueLabel.setAttribute('color', 'white');
              valueLabel.setAttribute('position', '0 0.8 0');
              valueLabel.setAttribute('width', 2);
              modelContainerEntity.appendChild(valueLabel);
              item.valueLabel = valueLabel;

              indexLabel = document.createElement('a-text');
              indexLabel.setAttribute('value', `[${index}]`);
              indexLabel.setAttribute('align', 'center');
              indexLabel.setAttribute('color', '#FFD700');
              indexLabel.setAttribute('position', `${xPos} ${arrayBaseY + 0.6} ${arrayBaseZ}`);
              indexLabel.setAttribute('width', 3);
              indexLabel.setAttribute('class', 'array-index-label'); // Маркер для ідентифікації
              arrayContainer.appendChild(indexLabel);
              item.indexLabel = indexLabel;

          } else {
              // Елемент вже існує - оновлюємо його позицію та індекс
              const targetPosition = `${xPos} ${arrayBaseY} ${arrayBaseZ}`;
              const targetIndexLabelPosition = `${xPos} ${arrayBaseY + 0.6} ${arrayBaseZ}`;

              // Оновлюємо анімацію зсуву для батьківського контейнера, якщо позиція змінилася
              const currentContainerPos = modelContainerEntity.getAttribute('position');
              if (currentContainerPos.x !== parseFloat(targetPosition.split(' ')[0]) ||
                  currentContainerPos.y !== parseFloat(targetPosition.split(' ')[1]) ||
                  currentContainerPos.z !== parseFloat(targetPosition.split(' ')[2]))
              {
                  modelContainerEntity.setAttribute('animation__movePosition', {
                      property: 'position',
                      to: targetPosition,
                      dur: 300,
                      easing: 'easeInOutQuad'
                  });
              }

              // Оновлюємо анімацію зсуву для індексного лейбла, якщо позиція змінилася
              const currentIndexLabelPos = indexLabel.getAttribute('position');
              if (currentIndexLabelPos.x !== parseFloat(targetIndexLabelPosition.split(' ')[0]) ||
                  currentIndexLabelPos.y !== parseFloat(targetIndexLabelPosition.split(' ')[1]) ||
                  currentIndexLabelPos.z !== parseFloat(targetIndexLabelPosition.split(' ')[2]))
              {
                  indexLabel.setAttribute('animation__moveIndexLabel', {
                      property: 'position',
                      to: targetIndexLabelPosition,
                      dur: 300,
                      easing: 'easeInOutQuad'
                  });
              }

              indexLabel.setAttribute('value', `[${index}]`); // Оновлюємо текст індексу
              valueLabel.setAttribute('value', item.value.toString()); // Оновлюємо значення
          }
      });

      // Видаляємо ті елементи з DOM, яких вже немає в currentArray
      elementsInDOM.forEach(entity => {
          if (!currentElementEntities.has(entity) && entity.parentNode) {
              // Перевіряємо, чи елемент не є в процесі видалення, і якщо він має батьківський вузол
              // Анімація видалення вже має бути запущена з іншого місця.
              // Якщо він тут, значить, він "завис" або був видалений іншим шляхом.
              // Просто видаляємо його.
              entity.remove();
          }
      });

      indexLabelsInDOM.forEach(label => {
          if (!currentIndexLabelEntities.has(label) && label.parentNode) {
              label.remove();
          }
      });
  }


  // *** Обробники подій для 3D-кнопок ***

  // Кнопка для перемикання HTML-панелі введення
  if (toggleArrayInputPanelBtn) {
      toggleArrayInputPanelBtn.addEventListener('click', () => {
        window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
          if (arrayInputOverlay) {
              arrayInputOverlay.style.display = arrayInputOverlay.style.display === 'none' ? 'flex' : 'none';
              if (arrayInputOverlay.style.display === 'flex') {
                  arrayValueInput.focus();
              }
          }
      });
  }

  // Кнопка "ADD (Random)"
  if (arrayInsertBtn3D) {
      arrayInsertBtn3D.addEventListener('click', () => {
          if (currentArray.length >= arrayMaxElements) {
              console.warn("Array is full!");
              return;
          }
          window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
          const newValue = getRandomArrayValue();
          currentArray.push({ value: newValue, entity: null, modelData: null, valueLabel: null, indexLabel: null, modelEntity: null });
          updateArrayVisualization();
      });
  }

  // Кнопка "Delete" (видалення останнього елемента)
  if (arrayDeleteBtn3D) {
      arrayDeleteBtn3D.addEventListener('click', () => {
          if (currentArray.length === 0) {
              console.warn("Array is empty!");
              return;
          }
          window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
          // Отримуємо останній елемент, але ще не видаляємо його з currentArray
          const removedItem = currentArray[currentArray.length - 1];

          if (removedItem && removedItem.entity && removedItem.modelEntity) {
              // Анімація зменшення до точки для 3D-моделі
              removedItem.modelEntity.setAttribute('animation__shrinkRemove', {
                  property: 'scale',
                  to: '0.0001 0.0001 0.0001',
                  dur: 200, // Змінено на 500
                  easing: 'easeInQuad'
              });
              // Анімація прозорості та зменшення для контейнера (щоб зникли також text елементи)
              if (removedItem.valueLabel) {
                   removedItem.valueLabel.setAttribute('animation__fadeValueLabelRemove', {
                       property: 'opacity',
                       to: 0,
                       dur: 200, // Змінено на 500
                       easing: 'easeInQuad'
                     });
                   removedItem.valueLabel.setAttribute('animation__shrinkValueLabelRemove', {
                       property: 'scale',
                       to: '0 0 0',
                       dur: 200, // Змінено на 500
                       easing: 'easeInQuad'
                     });
              }

              if (removedItem.indexLabel) {
                  removedItem.indexLabel.setAttribute('animation__fadeAndShrinkLabelRemove', {
                      property: 'scale',
                      to: '0 0 0',
                      dur: 500, // Змінено на 500
                      easing: 'easeInQuad'
                  });
                  removedItem.indexLabel.setAttribute('animation__opacityLabelRemove', {
                      property: 'opacity',
                      to: 0,
                      dur: 500, // Змінено на 500
                      easing: 'easeInQuad'
                  });
              }

              // Видаляємо елементи з DOM та з currentArray після завершення анімації
              setTimeout(() => {
                  currentArray.pop(); // Тепер видаляємо з JS-масиву
                  if (removedItem.entity && removedItem.entity.parentNode) removedItem.entity.remove();
                  if (removedItem.indexLabel && removedItem.indexLabel.parentNode) removedItem.indexLabel.remove();
                  updateArrayVisualization(); // Перемальовуємо решту масиву
              }, 550); // Час має бути трохи більший, ніж тривалість анімації
          } else {
              // Якщо елемент не мав entity, просто видаляємо з масиву та оновлюємо візуалізацію
              currentArray.pop();
              updateArrayVisualization();
          }
      });
  }

  // Кнопка "Get" (для отримання останнього елемента з анімацією)
  if (arrayGetBtn3D) {
      arrayGetBtn3D.addEventListener('click', () => {
          if (currentArray.length === 0) {
              console.warn("Array is empty! Cannot get any element.");
              return;
          }
          window.playSoundEffect('clickSoundEffect', 0.05);//відтворення звуку кліка
          const lastIndex = currentArray.length - 1;
          const item = currentArray[lastIndex];
          const targetModelEntity = item.modelEntity;

          if (targetModelEntity) {
              const originalModelDataScale = item.modelData.scale;
              const originalScaleArray = originalModelDataScale.split(' ').map(s => parseFloat(s));
              const highlightScaleArray = originalScaleArray.map(s => s * 1.5);
              const highlightScaleString = highlightScaleArray.join(' ');

              // Видаляємо всі попередні анімації масштабу
              targetModelEntity.removeAttribute('animation__highlightScale');
              targetModelEntity.removeAttribute('animation__returnScale');

              // Анімація збільшення
              targetModelEntity.setAttribute('animation__highlightScale', {
                  property: 'scale',
                  to: highlightScaleString,
                  dur: 300,
                  easing: 'easeOutQuad',
                  autoplay: true // Переконаємось, що анімація запускається
              });

              // Запускаємо анімацію повернення до початкового розміру після затримки
              setTimeout(() => {
                  targetModelEntity.setAttribute('animation__returnScale', {
                      property: 'scale',
                      to: originalModelDataScale,
                      dur: 300,
                      easing: 'easeOutQuad',
                      autoplay: true
                  });
              }, 350); // Затримка має бути трохи більшою, ніж тривалість анімації збільшення

              console.log(`Value of last element (via 3D button): ${currentArray[lastIndex].value}`);
          }
      });
  }


  // *** Обробники подій для HTML-панелі введення масиву ***

  if (arrayInputAddBtn) {
      arrayInputAddBtn.addEventListener('click', () => {
          const valueToAdd = arrayValueInput.value.trim();
          if (valueToAdd === "") {
              alert("Please enter a value to add.");
              return;
          }
          if (currentArray.length >= arrayMaxElements) {
              console.warn("Array is full!");
              alert("Array is full! Cannot add more elements.");
              return;
          }
          currentArray.push({ value: valueToAdd, entity: null, modelData: null, valueLabel: null, indexLabel: null, modelEntity: null });
          updateArrayVisualization();
          arrayValueInput.value = '';
      });
  }

  if (arrayInputGetBtn) {
      arrayInputGetBtn.addEventListener('click', () => {
          const index = parseInt(arrayInputIndex.value);
          if (isNaN(index) || index < 0 || index >= currentArray.length) {
              alert("Invalid index! Please enter a valid index within the array bounds.");
              return;
          }

          const item = currentArray[index];
          const targetModelEntity = item.modelEntity;

          if (targetModelEntity) {
              const originalModelDataScale = item.modelData.scale;
              const originalScaleArray = originalModelDataScale.split(' ').map(s => parseFloat(s));
              const highlightScaleArray = originalScaleArray.map(s => s * 1.5);
              const highlightScaleString = highlightScaleArray.join(' ');

              targetModelEntity.removeAttribute('animation__highlightScale');
              targetModelEntity.removeAttribute('animation__returnScale');

              targetModelEntity.setAttribute('animation__highlightScale', {
                  property: 'scale',
                  to: highlightScaleString,
                  dur: 300,
                  easing: 'easeOutQuad',
                  autoplay: true
              });

              setTimeout(() => {
                  targetModelEntity.setAttribute('animation__returnScale', {
                      property: 'scale',
                      to: originalModelDataScale,
                      dur: 300,
                      easing: 'easeOutQuad',
                      autoplay: true
                  });
              }, 350);

              console.log(`Value at index ${index}: ${currentArray[index].value}`);
          }
      });
  }

  if (arrayInputRemoveBtn) {
      arrayInputRemoveBtn.addEventListener('click', () => {
          const index = parseInt(arrayInputIndex.value);
          if (isNaN(index) || index < 0 || index >= currentArray.length) {
              alert("Invalid index! Please enter a valid index to remove.");
              return;
          }

          // Отримуємо елемент, але ще не видаляємо його з currentArray
          const removedItem = currentArray[index];

          if (removedItem && removedItem.entity && removedItem.modelEntity) {
              // Анімація зменшення до точки для 3D-моделі
              removedItem.modelEntity.setAttribute('animation__shrinkRemove', {
                  property: 'scale',
                  to: '0.001 0.001 0.001',
                  dur: 500, // Змінено на 500
                  easing: 'easeInQuad'
              });
               if (removedItem.valueLabel) {
                   removedItem.valueLabel.setAttribute('animation__fadeValueLabelRemove', {
                       property: 'opacity',
                       to: 0,
                       dur: 500, // Змінено на 500
                       easing: 'easeInQuad'
                     });
                   removedItem.valueLabel.setAttribute('animation__shrinkValueLabelRemove', {
                       property: 'scale',
                       to: '0 0 0',
                       dur: 500, // Змінено на 500
                       easing: 'easeInQuad'
                     });
               }

              if (removedItem.indexLabel) {
                  removedItem.indexLabel.setAttribute('animation__fadeAndShrinkLabelRemove', {
                      property: 'scale',
                      to: '0 0 0',
                      dur: 500, // Змінено на 500
                      easing: 'easeInQuad'
                  });
                  removedItem.indexLabel.setAttribute('animation__opacityLabelRemove', {
                      property: 'opacity',
                      to: 0,
                      dur: 500, // Змінено на 500
                      easing: 'easeInQuad'
                  });
              }

              setTimeout(() => {
                  currentArray.splice(index, 1); // Тепер видаляємо з JS-масиву
                  if (removedItem.entity && removedItem.entity.parentNode) removedItem.entity.remove();
                  if (removedItem.indexLabel && removedItem.indexLabel.parentNode) removedItem.indexLabel.remove();
                  updateArrayVisualization();
              }, 550); // Час має бути трохи більший, ніж тривалість анімації
          } else {
              currentArray.splice(index, 1);
              updateArrayVisualization();
          }
          arrayInputIndex.value = '';
      });
  }


  if (arrayInputCloseBtn) {
      arrayInputCloseBtn.addEventListener('click', () => {
          if (arrayInputOverlay) {
              arrayInputOverlay.style.display = 'none';
          }
      });
  }


  document.addEventListener('DOMContentLoaded', () => {
      if (currentArray.length === 0) {
          currentArray.push({ value: getRandomArrayValue(), entity: null, modelData: null, valueLabel: null, indexLabel: null, modelEntity: null });
          currentArray.push({ value: getRandomArrayValue(), entity: null, modelData: null, valueLabel: null, indexLabel: null, modelEntity: null });
          currentArray.push({ value: getRandomArrayValue(), entity: null, modelData: null, valueLabel: null, indexLabel: null, modelEntity: null });
          updateArrayVisualization();
      }
  });


  const arrayInfoBtn = document.getElementById('arrayInfoBtn');
  const arrayInfoOverlay = document.getElementById('array-info-overlay');
  const arrayInfoCloseBtn = document.getElementById('arrayInfoCloseBtn');

  function toggleArrayInfoPanel() {
      if (arrayInfoOverlay) {
          if (arrayInfoOverlay.style.display === 'none' || arrayInfoOverlay.style.display === '') {
              arrayInfoOverlay.style.display = 'flex';
          } else {
              arrayInfoOverlay.style.display = 'none';
          }
      }
  }

  if (arrayInfoBtn) {
      arrayInfoBtn.addEventListener('click', toggleArrayInfoPanel);
  }
  if (arrayInfoCloseBtn) {
      arrayInfoCloseBtn.addEventListener('click', toggleArrayInfoPanel);
  }
})(); // End IIFE
