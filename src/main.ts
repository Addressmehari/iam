import './style.css'

const viewport = document.getElementById('viewport')!;
const wall = document.getElementById('wall')!;

// Center the wall initially
// Initial Position (relative to transform-origin 0,0)
let scrollLeft = -(2000 - window.innerWidth / 2);
let scrollTop = 0; // Start at the top of the wall

let isDragging = false;
let startX = 0;
let startY = 0;
const zoomScale = 1; // Locked zoom

// Connector Lines Logic
const drawConnectors = () => {
  const svg = document.getElementById('connectors-svg') as unknown as SVGSVGElement;
  if (!svg) return;

  const clusters = document.querySelectorAll('.cluster');
  const container = document.querySelector('.grid-container')!;
  const containerRect = container.getBoundingClientRect();

  // Clear existing paths
  svg.innerHTML = '';

  let pathData = '';

  clusters.forEach((cluster, index) => {
    const rect = cluster.getBoundingClientRect();
    
    // Calculate center relative to grid-container, adjusting for zoomScale
    const x = ((rect.left + rect.width / 2) - containerRect.left) / zoomScale;
    const y = ((rect.top + rect.height / 2) - containerRect.top) / zoomScale;

    if (index === 0) {
      pathData = `M ${x} ${y}`;
    } else {
      const prevRect = clusters[index - 1].getBoundingClientRect();
      const prevX = (prevRect.left + prevRect.width / 2) - containerRect.left;
      const prevY = (prevRect.top + prevRect.height / 2) - containerRect.top;
      
      // Control point for smooth curve
      const cpX = (x + prevX) / 2;
      const cpY = (y + prevY) / 2 + 50; 
      
      pathData += ` Q ${cpX} ${cpY} ${x} ${y}`;
    }
  });

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
  path.setAttribute('stroke-width', '5');
  path.setAttribute('stroke-dasharray', '15 15');
  path.style.strokeLinecap = 'round';
  path.classList.add('connector-line');
  
  svg.appendChild(path);
};

const updateWallTransform = () => {
  const wallWidth = 4000;
  const wallHeight = 8000;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // LOCK X-AXIS: Always center the wall horizontally
  scrollLeft = (vw - wallWidth) / 2;

  // Clamp Y logic
  if (wallHeight <= vh) {
    scrollTop = (vh - wallHeight) / 2;
  } else {
    scrollTop = Math.min(0, Math.max(scrollTop, vh - wallHeight));
  }

  wall.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;
  drawConnectors();
};

// Set initial position
updateWallTransform();

const startDragging = (e: MouseEvent | TouchEvent) => {
  isDragging = true;
  const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
  
  startY = pageY - scrollTop;
  
  viewport.style.cursor = 'grabbing';
};

const stopDragging = () => {
  isDragging = false;
  viewport.style.cursor = 'grab';
};

const move = (e: MouseEvent | TouchEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  
  const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
  
  scrollTop = pageY - startY;
  
  updateWallTransform();
};

// Event Listeners
viewport.addEventListener('mousedown', startDragging);
window.addEventListener('mouseup', stopDragging);
window.addEventListener('mousemove', move);

viewport.addEventListener('touchstart', startDragging, { passive: false });
window.addEventListener('touchend', stopDragging);
window.addEventListener('touchmove', move, { passive: false });

// Interactive notes: Bring to front
const notes = document.querySelectorAll('.note');
notes.forEach(note => {
  note.addEventListener('click', () => {
    notes.forEach(n => (n as HTMLElement).style.zIndex = '10');
    (note as HTMLElement).style.zIndex = '100';
  });
});

// Navigation Logic
const scrollToCluster = (targetCluster: Element) => {
  const container = document.querySelector('.grid-container')!;
  const containerRect = container.getBoundingClientRect();
  const clusterRect = targetCluster.getBoundingClientRect();

  // Calculate local Y coordinate within the grid
  const cy = ((clusterRect.top + clusterRect.height / 2) - containerRect.top);

  // Calculate target scroll positions to center the cluster vertically
  const targetY = -(cy - window.innerHeight / 2);

  // Smooth Animate
  const startY = scrollTop;
  const startTime = performance.now();
  const duration = 800; // slightly faster for linear flow

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing: easeInOutCubic
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    scrollTop = startY + (targetY - startY) * ease;

    updateWallTransform();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const nextButtons = document.querySelectorAll('.next-group-btn');
nextButtons.forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent wall drag start
    const clusters = document.querySelectorAll('.cluster');
    const nextIndex = (index + 1) % clusters.length;
    scrollToCluster(clusters[nextIndex]);
  });
});

// Initial draw and on resize
window.addEventListener('load', () => {
  setTimeout(drawConnectors, 200); // Give time for CSS layout
});
window.addEventListener('resize', drawConnectors);

console.log('Grid Wall Portfolio Initialized - Centered');
