// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('InfraSolid website loaded successfully!');
    
    // Initialize dynamic features
    initializeDynamicMessage();
    initializeCTAButton();
    initializeSmoothScrolling();
    initializeServiceCards();
});

// Dynamic message in contact section
function initializeDynamicMessage() {
    const messages = [
        'Building the future of infrastructure',
        'Reliable solutions since day one',
        'Your success is our priority',
        'Innovation meets reliability',
        'Solid foundations for digital growth'
    ];
    
    const dynamicMessageElement = document.getElementById('dynamic-message');
    let currentMessageIndex = 0;
    
    function updateMessage() {
        if (dynamicMessageElement) {
            dynamicMessageElement.style.opacity = '0';
            
            setTimeout(() => {
                dynamicMessageElement.textContent = messages[currentMessageIndex];
                dynamicMessageElement.style.opacity = '1';
                currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            }, 300);
        }
    }
    
    // Initial message
    updateMessage();
    
    // Update message every 3 seconds
    setInterval(updateMessage, 3000);
}

// CTA Button interaction
function initializeCTAButton() {
    const ctaButton = document.getElementById('cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Show success message
            showNotification('Welcome to InfraSolid! Let\'s build something amazing together.');
            
            // Scroll to contact section
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Add hover effects
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Service cards interaction
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        // Add entrance animation delay
        card.style.animationDelay = `${index * 0.2}s`;
        
        // Add click interaction
        card.addEventListener('click', function() {
            const serviceName = this.querySelector('h3').textContent;
            showNotification(`Learn more about our ${serviceName} services! Contact us for details.`);
        });
        
        // Add hover sound effect (visual feedback only for this demo)
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Notification system
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-weight: 500;
        transform: translateX(350px);
        transition: transform 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(350px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Page scroll effects
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
    
    // Add/remove nav background based on scroll
    const header = document.querySelector('header');
    if (scrolled > 50) {
        header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#2c3e50';
        header.style.backdropFilter = 'none';
    }
});

// Utility functions
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

function logEvent(eventName, details = '') {
    console.log(`[${getCurrentTime()}] ${eventName}${details ? ': ' + details : ''}`);
}

// Performance monitoring
window.addEventListener('load', function() {
    logEvent('Page fully loaded');
    
    // Track performance
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        logEvent('Page load time', `${loadTime}ms`);
    }
});

// Export functions for potential external use
window.InfraSolid = {
    showNotification,
    logEvent,
    getCurrentTime
};