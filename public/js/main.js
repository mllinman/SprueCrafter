/**
 * SprueCrafter Marketing Website JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      mobileMenuBtn.classList.toggle('active');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Stripe checkout for Pro subscription
  const proButton = document.querySelector('[data-plan="pro"]');
  
  if (proButton) {
    proButton.addEventListener('click', async () => {
      // Check if user is authenticated
      // NOTE: In production, consider using httpOnly cookies instead of localStorage
      // for better XSS protection. This is acceptable for demo/development.
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // Redirect to login/registration
        window.location.href = '/app?action=register';
        return;
      }
      
      try {
        // Show loading state
        const originalText = proButton.textContent;
        proButton.disabled = true;
        proButton.innerHTML = '<span class="loading"></span> Processing...';
        
        // Create Stripe checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            plan: 'pro',
            success_url: window.location.origin + '/app?payment=success',
            cancel_url: window.location.origin + '/?payment=cancelled'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }
        
        const data = await response.json();
        
        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Unable to start checkout. Please try again or contact support.');
        
        // Restore button
        proButton.disabled = false;
        proButton.textContent = originalText;
      }
    });
  }

  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe feature cards and pricing cards
  document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Handle payment success/cancel messages
  const urlParams = new URLSearchParams(window.location.search);
  const payment = urlParams.get('payment');
  
  if (payment === 'success') {
    showNotification('Payment successful! Welcome to Pro tier.', 'success');
    // Remove payment param from URL
    window.history.replaceState({}, '', window.location.pathname);
  } else if (payment === 'cancelled') {
    showNotification('Payment cancelled. You can try again anytime.', 'info');
    window.history.replaceState({}, '', window.location.pathname);
  }
});

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#00ff88' : '#00e5ff'};
    color: #0a0a0a;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
