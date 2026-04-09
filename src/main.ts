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

console.log('Grid Wall Portfolio Initialized - Centered');
