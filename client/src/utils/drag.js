export default async function drag(changeHeader, resolve) {
  const cropWrapper = document.querySelector('.crop-section');
  const submit = document.querySelector('.x-button');
  const imageContainer = document.querySelector('.camera-icon');
  const cropSection = cropWrapper.querySelector('.crop-container');
  const cropImage = cropSection.querySelector('.crop-image');
  const cropArea = cropSection.querySelector('.crop-area');
  const resizer = cropArea.querySelector('.resizer');

  let isDragging = false;
  let isResizing = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  let initialWidth;

  cropArea.addEventListener('touchstart', dragStart);
  cropArea.addEventListener('touchend', dragEnd);
  cropArea.addEventListener('touchmove', dragging);

  resizer.addEventListener('touchstart', startResize);
  resizer.addEventListener('touchend', stopResize);
  resizer.addEventListener('touchmove', resize);

  submit.addEventListener('click', drawCanvas);

  function dragStart(e) {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;

    if (e.target === cropArea) {
      isDragging = true;
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  function dragging(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;

      const sectionRect = e.currentTarget.parentElement.getBoundingClientRect();
      const cropAreaRect = cropArea.getBoundingClientRect();

      const maxX = sectionRect.width - cropAreaRect.width;
      const maxY = sectionRect.height - cropAreaRect.height;

      xOffset = currentX < 0 ? 0 : currentX > maxX ? maxX : currentX;
      yOffset = currentY < 0 ? 0 : currentY > maxY ? maxY : currentY;

      setTranslate(xOffset, yOffset, cropArea);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  function startResize(e) {
    initialWidth = cropArea.clientWidth;
    isResizing = true;
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    e.preventDefault();
  }

  function stopResize() {
    isResizing = false;
  }

  function resize(e) {
    if (isResizing) {
      const cropAreaRect = cropArea.getBoundingClientRect();
      const cropImageRect = cropImage.getBoundingClientRect();
      const currentX = e.touches[0].clientX - initialX;
      const width = initialWidth + currentX;

      if (e.touches[0].clientX > cropImageRect.right || width - cropAreaRect.x / 2 < 100) return;

      cropArea.style.width = `${width - cropAreaRect.x / 2}px`;
      cropArea.style.height = `${width - cropAreaRect.x / 2}px`;
    }
  }

  function drawCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const cropAreaRect = cropArea.getBoundingClientRect();
    const cropImageRect = cropImage.getBoundingClientRect();

    const sourceX = cropAreaRect.x - cropImageRect.x;
    const sourceY = cropAreaRect.y - cropImageRect.y;
    const sourceWidth = cropAreaRect.width;
    const sourceHeight = cropAreaRect.width;
    const destX = 0;
    const destY = 0;
    const destWidth = sourceWidth;
    const destHeight = sourceHeight;

    canvas.width = sourceWidth;
    canvas.height = sourceWidth;

    ctx.drawImage(
      cropImage,
      sourceX * 2,
      sourceY * 2,
      sourceWidth * 2,
      sourceHeight * 2,
      destX,
      destY,
      destWidth,
      destHeight,
    );

    const resizedImage = canvas.toDataURL('image/png');

    const blobBin = atob(resizedImage.split(',')[1]);
    const array = [];

    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }

    const file = new Blob([new Uint8Array(array)], { type: 'image/png' }); // Blob 생성
    changeHeader('mint');

    imageContainer.src = resizedImage;
    imageContainer.style.width = '100%';
    imageContainer.style.objectFit = 'contain';
    imageContainer.style.filter = 'none';

    setTranslate(0, 0, cropArea);
    cropWrapper.style.display = 'none';

    resolve(file);
  }
}
