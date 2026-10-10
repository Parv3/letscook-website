import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Check, ExternalLink, Printer, ShieldCheck } from 'lucide-react';
import { playTechClick } from '../utils/soundEngine';

export default function CertificateViewer({ certificate, event }) {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const certId = certificate?.id || '';
  const verificationCode = certificate?.verificationCode || '';
  const recipientName = certificate?.recipient?.name || 'Participant';
  const verifyUrl = `${window.location.origin}/verify?code=${encodeURIComponent(verificationCode || certId)}`;

  useEffect(() => {
    let isCancelled = false;

    const renderCertificate = async () => {
      if (!certificate || !event) return;
      setIsRendering(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const templateSrc = event.template || '/certificates/templates/origin-2026.jpg';
      const baseWidth = event.dimensions?.width || 956;
      const baseHeight = event.dimensions?.height || 681;

      // 2x Retina scale for ultra-crisp downloads & display (1912x1362)
      const scale = 2;
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;
      ctx.scale(scale, scale);

      // Load template image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          console.warn('Could not load template directly, falling back.');
          resolve();
        };
        img.src = templateSrc;
      });

      if (isCancelled) return;

      // 1. Draw base certificate image
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
        bgGrad.addColorStop(0, '#060608');
        bgGrad.addColorStop(1, '#111218');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      }

      // Ensure fonts are loaded before painting text
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const cfg = event.renderConfig || {};

      // 2. Inscribe Recipient Name precisely in the blank space where 'Participant Name' was
      const namePos = cfg.namePosition || { x: 478, y: 396, color: '#ffffff' };
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = namePos.color || '#ffffff';
      
      let fontSize = 38;
      if (recipientName.length > 18) fontSize = 32;
      if (recipientName.length > 25) fontSize = 26;
      if (recipientName.length > 32) fontSize = 22;

      // Refined italic serif / calligraphy font
      ctx.font = `italic 600 ${fontSize}px "Playfair Display", "Alex Brush", "Great Vibes", Georgia, serif`;
      ctx.fillText(recipientName, namePos.x, namePos.y);

      // 3. Inscribe Credential Verification ID & Integrity Hash at the bottom
      const certIdPos = cfg.certIdPosition || { x: 478, y: 662, color: '#71717a' };
      ctx.font = '600 11px "Space Grotesk", monospace';
      ctx.fillStyle = certIdPos.color || '#71717a';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(
        `CREDENTIAL ID: ${certId}  •  LET'S COOK × BACKSTAGE  •  HASH: ${certificate.verifyHash || 'VERIFIED'}`,
        certIdPos.x,
        certIdPos.y
      );

      // 4. Draw dynamic Verification QR Code in the bottom right corner
      const qrPos = cfg.qrPosition || { x: 845, y: 575, size: 72 };
      try {
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: qrPos.size * 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        const qrImg = new Image();
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.src = qrDataUrl;
        });

        // Crisp white backing frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrPos.x - 3, qrPos.y - 3, qrPos.size + 6, qrPos.size + 6);
        ctx.drawImage(qrImg, qrPos.x, qrPos.y, qrPos.size, qrPos.size);

        // QR label
        ctx.font = '700 7px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO VERIFY', qrPos.x + qrPos.size / 2, qrPos.y + qrPos.size + 10);
      } catch (err) {
        console.error('QR code generation error:', err);
      }

      if (!isCancelled) {
        setIsRendering(false);
      }
    };

    renderCertificate();

    return () => {
      isCancelled = true;
    };
  }, [certificate, event]);

  const handleDownload = () => {
    playTechClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    setTimeout(() => {
      try {
        const link = document.createElement('a');
        const sanitizedName = recipientName.replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `LetsCook_Certificate_${certId}_${sanitizedName}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setDownloading(false);
      }
    }, 150);
  };

  const handleCopyLink = () => {
    playTechClick();
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handlePrint = () => {
    playTechClick();
    window.print();
  };

  const getLinkedInCertUrl = () => {
    const orgName = "Let's Cook";
    const certName = event?.name || "ORIGIN – Hackathon Guidance Workshop";
    const issueYear = "2026";
    const issueMonth = "10";
    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certId)}`;
  };

  return (
    <div className="certificate-viewer-container">
      {/* Visual Canvas Display Frame */}
      <div className="cert-canvas-frame">
        {isRendering && (
          <div className="cert-loading-overlay">
            <div className="cert-loading-spinner" />
            <p>Rendering High-Resolution Certificate...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="cert-canvas-element" />
      </div>

      {/* Control Actions Panel */}
      <div className="cert-actions-grid">
        <button
          onClick={handleDownload}
          disabled={isRendering || downloading}
          className="cert-btn primary"
        >
          <Download size={18} />
          <span>{downloading ? 'Preparing PNG...' : 'Download Certificate (PNG)'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="cert-btn secondary"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
          <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
        </button>

        <a
          href={getLinkedInCertUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-btn linkedin"
          onClick={() => playTechClick()}
        >
          <ExternalLink size={18} />
          <span>Add to LinkedIn</span>
        </a>

        <button
          onClick={handlePrint}
          className="cert-btn ghost"
          title="Print or Save as PDF"
        >
          <Printer size={18} />
          <span>Print / PDF</span>
        </button>
      </div>

      <style>{`
        .certificate-viewer-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .cert-canvas-frame {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #060608;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 240, 255, 0.08);
          aspect-ratio: 956 / 681;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cert-canvas-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .cert-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 6, 8, 0.92);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          z-index: 10;
          color: #94a3b8;
          font-size: 0.9rem;
          font-family: var(--font-mono, monospace);
        }

        .cert-loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(0, 240, 255, 0.2);
          border-top-color: #00f0ff;
          border-radius: 50%;
          animation: certSpin 0.8s linear infinite;
        }

        @keyframes certSpin {
          to { transform: rotate(360deg); }
        }

        .cert-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .cert-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 48px;
          padding: 0 20px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          user-select: none;
        }

        .cert-btn.primary {
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          color: #060608;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
        }
        .cert-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0, 240, 255, 0.5);
          filter: brightness(1.1);
        }

        .cert-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .cert-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .cert-btn.linkedin {
          background: rgba(10, 102, 194, 0.15);
          color: #70b5f9;
          border: 1px solid rgba(10, 102, 194, 0.4);
        }
        .cert-btn.linkedin:hover {
          background: #0a66c2;
          color: #ffffff;
          border-color: #0a66c2;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(10, 102, 194, 0.4);
        }

        .cert-btn.ghost {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cert-btn.ghost:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }

        .cert-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .cert-canvas-frame, .cert-canvas-frame * {
            visibility: visible;
          }
          .cert-canvas-frame {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
