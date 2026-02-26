/**
 * Guardian Auth Widget
 * Standalone JavaScript widget for passwordless authentication
 * Usage: <guardian-login app-id="your-app-id"></guardian-login>
 */

class GuardianLoginElement extends HTMLElement {
  constructor() {
    super();
    this.appId = this.getAttribute('app-id');
    this.themeColor = this.getAttribute('theme-color') || '#4f8ef7';
    this.redirectUrl = this.getAttribute('redirect-url') || window.location.href;
    this.modal = null;
    this.iframe = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        .guardian-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: ${this.themeColor};
          color: white;
          border: none;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .guardian-login-btn:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
        
        .guardian-login-btn:active {
          transform: scale(0.98);
        }
        
        .guardian-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        
        .guardian-modal.show {
          display: flex;
        }
        
        .guardian-modal-content {
          background: #1a1a2e;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(79, 142, 247, 0.2);
        }
        
        .guardian-modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(79, 142, 247, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .guardian-modal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        
        .guardian-close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .guardian-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .guardian-modal-body {
          height: 500px;
        }
        
        .guardian-modal-body iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .guardian-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 500px;
          color: #94a3b8;
        }
        
        .guardian-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(79, 142, 247, 0.3);
          border-top: 2px solid #4f8ef7;
          border-radius: 50%;
          animation: guardian-spin 1s linear infinite;
          margin-right: 12px;
        }
        
        @keyframes guardian-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      
      <button class="guardian-login-btn" onclick="this.parentElement.openModal()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Login with Guardian Auth
      </button>
    `;

    // Store reference to this element for button click
    this.querySelector('.guardian-login-btn').parentElement = this;
  }

  openModal() {
    if (!this.modal) {
      this.createModal();
    }
    this.modal.classList.add('show');
    this.loadIframe();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'guardian-modal';
    this.modal.innerHTML = `
      <div class="guardian-modal-content">
        <div class="guardian-modal-header">
          <div class="guardian-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${this.themeColor}">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Guardian Auth
          </div>
          <button class="guardian-close-btn" onclick="this.closest('.guardian-modal').closeModal()">&times;</button>
        </div>
        <div class="guardian-modal-body">
          <div class="guardian-loading">
            <div class="guardian-spinner"></div>
            Loading authentication...
          </div>
        </div>
      </div>
    `;

    // Store reference to modal for close button
    this.modal.closeModal = () => this.closeModal();
    
    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Close modal with Escape key
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    document.body.appendChild(this.modal);
  }

  loadIframe() {
    const modalBody = this.modal.querySelector('.guardian-modal-body');
    modalBody.innerHTML = `
      <iframe 
        src="https://guardian-auth.vercel.app/widget-auth?app-id=${this.appId}&theme=${encodeURIComponent(this.themeColor)}"
        frameborder="0"
        allow="clipboard-write; accelerometer; gyroscope; magnetometer"
      ></iframe>
    `;

    this.iframe = modalBody.querySelector('iframe');
    
    // Listen for messages from iframe
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  handleMessage(event) {
    // Verify origin for security
    if (!event.origin.includes('guardian-auth.vercel.app')) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'guardian-auth-success':
        this.handleSuccess(data);
        break;
      case 'guardian-auth-error':
        this.handleError(data);
        break;
      case 'guardian-auth-close':
        this.closeModal();
        break;
    }
  }

  handleSuccess(data) {
    this.closeModal();
    
    // Dispatch custom event to parent page
    const successEvent = new CustomEvent('guardian-auth-success', {
      detail: {
        token: data.token,
        user: data.user,
        appId: this.appId
      }
    });
    
    document.dispatchEvent(successEvent);
    
    // Track login for analytics
    this.trackLogin('success');
    
    // Redirect if specified
    if (this.redirectUrl && this.redirectUrl !== window.location.href) {
      setTimeout(() => {
        window.location.href = this.redirectUrl;
      }, 100);
    }
  }

  handleError(data) {
    console.error('Guardian Auth error:', data);
    
    // Dispatch error event
    const errorEvent = new CustomEvent('guardian-auth-error', {
      detail: {
        error: data.error,
        appId: this.appId
      }
    });
    
    document.dispatchEvent(errorEvent);
    
    // Track login for analytics
    this.trackLogin('error');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('show');
      
      // Remove iframe to stop any ongoing processes
      const modalBody = this.modal.querySelector('.guardian-modal-body');
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="guardian-loading">
            <div class="guardian-spinner"></div>
            Loading authentication...
          </div>
        `;
      }
    }
    
    // Remove message listener
    window.removeEventListener('message', this.handleMessage);
  }

  async trackLogin(status) {
    try {
      // Send analytics data to Guardian Auth servers
      await fetch(`https://guardian-auth.vercel.app/api/widget/increment-login/${this.appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });
    } catch (error) {
      // Silently fail analytics
      console.log('Analytics tracking failed:', error);
    }
  }

  disconnectedCallback() {
    this.closeModal();
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}

// Define the custom element
customElements.define('guardian-login', GuardianLoginElement);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuardianLoginElement;
}
