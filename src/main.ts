import './style.css'

const viewport = document.getElementById('viewport')!;
const wall = document.getElementById('wall')!;

// Center the wall initially
let scrollLeft = -(2000 - window.innerWidth / 2);
let scrollTop = -(2000 - window.innerHeight / 2);

let isDragging = false;
let startX = 0;
let startY = 0;

// Set initial position
wall.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;

const startDragging = (e: MouseEvent | TouchEvent) => {
  isDragging = true;
  const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
  const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
  
  startX = pageX - scrollLeft;
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
  
  const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
  const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
  
  scrollLeft = pageX - startX;
  scrollTop = pageY - startY;
  
  wall.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;
};

// Event Listeners
viewport.addEventListener('mousedown', startDragging);
window.addEventListener('mouseup', stopDragging);
window.addEventListener('mousemove', move);

viewport.addEventListener('touchstart', startDragging, { passive: false });
window.addEventListener('touchend', stopDragging);
window.addEventListener('touchmove', move, { passive: false });

// Interactive notes: Bring to front on hover/click handled by CSS z-index mostly,
// but let's add a bit of click zoom logic
const notes = document.querySelectorAll('.note');
notes.forEach(note => {
  note.addEventListener('click', () => {
    // Bring to top
    notes.forEach(n => (n as HTMLElement).style.zIndex = '10');
    (note as HTMLElement).style.zIndex = '100';
  });
});

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
    
    // Calculate center relative to grid-container
    const x = (rect.left + rect.width / 2) - containerRect.left;
    const y = (rect.top + rect.height / 2) - containerRect.top;

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

// Initial draw and on resize
window.addEventListener('load', () => {
  setTimeout(drawConnectors, 200); // Give time for CSS layout
});
window.addEventListener('resize', drawConnectors);

console.log('Grid Wall Portfolio Initialized - Centered');
