// js/queue.js

(function() { // Start IIFE
  let frontQueue = [];
  const frontQueueMax = 6;
  const frontQueueWidth = 0.8; // Ширина моделі (або її "довжина" в напрямку черги)
  const frontQueueY = 0.3; // Висота над землею

  const modelIds = ['spaceship2', 'spaceship4', 'spaceship1']; // Використовуємо ID моделей
  const modelScales = {
      'spaceship2': '0.04 0.04 0.04', // Масштаб для spaceship2
      'spaceship4': '0.1 0.1 0.1',  // Масштаб для spaceship4
      'spaceship1': '0.3 0.3 0.3', // Масштаб для spaceship1
  };
  const modelRotations = {
      'spaceship2': '0 -90 0',
      'spaceship4': '0 90 0',
      'spaceship1': '0 -90 0',
  };
  const modelOffsets = {
      'spaceship2': '0 0 0',
      'spaceship4': '0 -0.1 0.1',
      'spaceship1': '0 -0.1 0',
  };

  function getRandomQueueValue() {
    const type = ['Num', 'Str'][Math.floor(Math.random() * 2)];
    let value;
    if (type === 'Num') {
      value = Math.floor(Math.random() * 99) + 1;
    } else {
      const words = ['Cat', 'Dog', 'Sun', 'Moon', 'Star'];
      value = words[Math.floor(Math.random() * words.length)];
    }
    return value;
  }

  function enqueueFront() {
    const frontQueueContainer = document.querySelector('#queue-container');

    if (!frontQueueContainer) {
        console.error("Queue container not found!");
        return;
    }

    if (frontQueue.length >= frontQueueMax) {
      console.warn("Queue is full!");
      return;
    }

    const randomModelId = modelIds[Math.floor(Math.random() * modelIds.length)];
    const modelScale = modelScales[randomModelId];
    const modelRotation = modelRotations[randomModelId];
    const modelOffset = modelOffsets[randomModelId].split(' ').map(Number);

    const targetX = -frontQueueMax * frontQueueWidth / 2 + frontQueue.length * frontQueueWidth + frontQueueWidth / 2;
    const targetY = frontQueueY;
    const targetZ = 0;

    const initialX_enter = frontQueueMax * frontQueueWidth / 2 + frontQueueWidth * 2;
    const initialY_enter = targetY;
    const initialZ_enter = targetZ;

    const entity = document.createElement('a-entity');
    entity.setAttribute('position', `${initialX_enter + modelOffset[0]} ${initialY_enter + modelOffset[1]} ${initialZ_enter + modelOffset[2]}`);
    entity.setAttribute('shadow', 'cast: true');
    entity.setAttribute('data-queue-element', 'true');

    const modelWrapper = document.createElement('a-entity');
    modelWrapper.setAttribute('gltf-model', `#${randomModelId}`);
    modelWrapper.setAttribute('scale', modelScale);
    modelWrapper.setAttribute('rotation', modelRotation);

    // ************ ЗМІНА ТУТ ************
    // Додаємо випадкову затримку до анімації левітації
    const levitateDelay = Math.random() * 1000; // Випадкова затримка до 1 секунди (1000 мс)
    // Можна регулювати діапазон: наприклад, Math.random() * 2000 для до 2 секунд

    modelWrapper.setAttribute('animation__levitate', {
      property: 'position.y',
      from: 0,
      to: 0.05,
      dur: 2000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: levitateDelay // Застосовуємо випадкову затримку
    });
    // **********************************

    const labelWrapper = document.createElement('a-entity');
    labelWrapper.setAttribute('position', '0 0 0');
    labelWrapper.setAttribute('look-at', '[camera]');

    const label = document.createElement('a-text');
    label.setAttribute('value', getRandomQueueValue().toString());
    label.setAttribute('align', 'center');
    label.setAttribute('color', 'black');
    label.setAttribute('position', '0 0.5 0');
    label.setAttribute('width', 2);
    labelWrapper.appendChild(label);

    modelWrapper.appendChild(labelWrapper);
    entity.appendChild(modelWrapper);

    const animationDuration = 1000;
    entity.setAttribute('animation', {
      property: 'position',
      to: `${targetX + modelOffset[0]} ${targetY + modelOffset[1]} ${targetZ + modelOffset[2]}`,
      dur: animationDuration,
      easing: 'easeOutCubic'
    });

    frontQueueContainer.appendChild(entity);
    frontQueue.push(entity);
  }


  function dequeueFront() {
    const frontQueueContainer = document.querySelector('#queue-container');

    if (!frontQueueContainer) {
        console.error("Queue container not found!");
        return;
    }

    if (frontQueue.length === 0) {
      console.warn("Queue is empty!");
      return;
    }

    const first = frontQueue.shift();
    const pos = first.getAttribute('position');

    const midY_exit = pos.y + 1;
    const midX_exit = pos.x;
    const midZ_exit = pos.z;

    const finalX_exit_left = pos.x - 10;
    const finalY_exit_left = pos.y + 3;
    const finalZ_exit_left = pos.z;

    first.setAttribute('animation__path', {
      property: 'position',
      from: `${pos.x} ${pos.y} ${pos.z}`,
      to: `${finalX_exit_left} ${finalY_exit_left} ${finalZ_exit_left}`,
      dur: 1500,
      easing: 'easeOutSine'
    });

    first.setAttribute('animation__scale', {
      property: 'scale',
      to: '0 0 0',
      dur: 1000,
      delay: 500
    });

    setTimeout(() => frontQueueContainer.removeChild(first), 1550);

    frontQueue.forEach((entity, i) => {
      const newX = -frontQueueMax * frontQueueWidth / 2 + i * frontQueueWidth + frontQueueWidth / 2;
      const newY = frontQueueY;
      const newZ = 0;

      entity.setAttribute('animation__shift', {
        property: 'position',
        to: `${newX} ${newY} ${newZ}`,
        dur: 300,
        easing: 'easeOutQuad'
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
      const frontQueueContainer = document.querySelector('#queue-container');
      if (!frontQueueContainer) {
          console.error("Queue container not found during DOMContentLoaded!");
      }

      const enqueueBtn = document.querySelector('#enqueueBtn');
      const dequeueBtn = document.querySelector('#dequeueBtn');

      if (enqueueBtn) { //
        enqueueBtn.addEventListener('click', () => { // Обгортаємо в анонімну функцію
            enqueueFront(); //
            window.playSoundEffect('clickSoundEffect', 0.05); // Додаємо звук при enqueue
        });
    } else { //
        console.error("Enqueue button not found!"); //
    }

    if (dequeueBtn) { //
        dequeueBtn.addEventListener('click', () => { // Обгортаємо в анонімну функцію
            dequeueFront(); //
            window.playSoundEffect('clickSoundEffect', 0.05); // Додаємо звук при dequeue
        });
    } else { //
        console.error("Dequeue button not found!"); //
    }

      const fifoInfoBtn = document.getElementById('fifoInfoBtn');
      const queueInfoOverlay = document.getElementById('queue-info-overlay');
      const queueInfoCloseBtn = document.getElementById('queueInfoCloseBtn');

      function toggleQueueInfoPanel() {
          if (queueInfoOverlay) {
              if (queueInfoOverlay.style.display === 'none' || queueInfoOverlay.style.display === '') {
                  queueInfoOverlay.style.display = 'flex';
              } else {
                  queueInfoOverlay.style.display = 'none';
              }
          }
      }

      if (fifoInfoBtn) {
          fifoInfoBtn.addEventListener('click', toggleQueueInfoPanel);
      }
      if (queueInfoCloseBtn) {
          queueInfoCloseBtn.addEventListener('click', toggleQueueInfoPanel);
      }
});
})(); // End IIFE