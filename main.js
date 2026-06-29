import './style.css';

const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const heroSequence = document.querySelector('.hero-sequence');

// Dynamically import all frames available in the public folder
// This handles deleted frames (gaps) and dynamic counts automatically
const frameModules = import.meta.glob('/public/frames/*.png', { eager: true, query: '?url' });

// Sort keys to maintain sequence and format URLs to match public path
const allFrameUrls = Object.keys(frameModules).sort().map(key => key.replace('/public', ''));

// Filter frames to start the animation from frame_00062.png onwards
const frameUrls = allFrameUrls.filter(url => {
  const match = url.match(/frame_(\d+)\.png/);
  if (match) {
    return parseInt(match[1], 10) >= 62;
  }
  return true;
});

const frameCount = frameUrls.length;
const currentFrame = index => frameUrls[index];

const images = [];
const frameInfo = {
  frame: 0
};

// Preload images
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }
};

preloadImages();

// Initial Setup
const img = new Image();
img.src = currentFrame(0);
img.onload = function() {
  // Set canvas resolution to image resolution
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
};

// Update canvas on scroll
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const heroOffsetTop = heroSequence.offsetTop;
  const heroHeight = heroSequence.offsetHeight;
  const windowHeight = window.innerHeight;

  // We only want to animate while scrolling past the hero sequence
  // The scrollable distance is heroHeight - windowHeight
  let scrollProgress = (scrollTop - heroOffsetTop) / (heroHeight - windowHeight);
  
  if (scrollProgress < 0) scrollProgress = 0;
  if (scrollProgress > 1) scrollProgress = 1;

  // Calculate the frame index based on scroll progress
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollProgress * frameCount)
  );

  requestAnimationFrame(() => {
    updateImage(frameIndex);
    // Add parallax effect: push left side to the left and right side to the right as scroll increases
    const leftEl = document.getElementById('hero-left');
    const rightEl = document.getElementById('hero-right');
    if (leftEl && rightEl) {
      // Enhance depth by moving the left and right sides at slightly different speeds
      // Reduce the parallax distance on mobile to prevent text from being pushed off-screen
      const isMobile = window.innerWidth <= 768;
      const maxLeft = isMobile ? 30 : 150;
      const maxRight = isMobile ? 50 : 220;

      const distanceYLeft = scrollProgress * maxLeft; // Moves down smoothly
      const distanceYRight = scrollProgress * maxRight; // Moves down faster for deeper parallax
      leftEl.style.transform = `translateY(${distanceYLeft}px)`;
      rightEl.style.transform = `translateY(${distanceYRight}px)`;
    }
  });
});

const updateImage = index => {
  if (images[index] && images[index].complete) {
    // If the image is loaded, draw it
    context.drawImage(images[index], 0, 0);
  } else {
    // If not loaded yet, wait for it
    images[index].onload = () => {
      context.drawImage(images[index], 0, 0);
    };
  }
};

// Handle Navbar background opacity based on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(8, 16, 22, 0.9)';
    navbar.style.padding = '1rem 5%';
  } else {
    navbar.style.background = 'rgba(8, 16, 22, 0.6)';
    navbar.style.padding = '1.5rem 5%';
  }
});

// Modal Logic
const modal = document.getElementById('booking-modal');
const closeBtn = document.querySelector('.close-btn');
const bookButtons = document.querySelectorAll('.book-appointment-btn');

bookButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  });
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  document.body.style.overflow = '';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
});

// Handle Form Submission
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const service = document.getElementById('service').value;
  
  const appointment = {
    id: Date.now().toString(),
    name,
    phone,
    service,
    status: 'Pending',
    date: new Date().toLocaleDateString()
  };
  
  // Save to localStorage
  const existing = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  existing.push(appointment);
  localStorage.setItem('apex_appointments', JSON.stringify(existing));
  
  alert('Thank you! Your appointment request has been received.');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  e.target.reset();
});

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const questionBtn = item.querySelector('.faq-question');
  
  questionBtn.addEventListener('click', () => {
    // Close other items if desired (optional, here we allow multiple open)
    // faqItems.forEach(otherItem => {
    //   if(otherItem !== item) {
    //     otherItem.classList.remove('active');
    //     otherItem.querySelector('.faq-answer').style.maxHeight = null;
    //   }
    // });
    
    item.classList.toggle('active');
    const answer = item.querySelector('.faq-answer');
    
    if (item.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = null;
    }
  });
});
