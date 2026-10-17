import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Check, ExternalLink, Printer, ShieldCheck, Trophy, Medal, Award } from 'lucide-react';
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

      const templateSrc = certificate.customTemplate || event.template || '/certificates/templates/origin-2026.jpg';
      const baseWidth = certificate.dimensions?.width || event.dimensions?.width || 2000;
      const baseHeight = certificate.dimensions?.height || event.dimensions?.height || 1414;

      // Native ultra-high-resolution 2000x1414 canvas
      canvas.width = baseWidth;
      canvas.height = baseHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

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

      // 1. Draw base high-resolution certificate image (lossless Canva export)
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
        bgGrad.addColorStop(0, '#060608');
        bgGrad.addColorStop(1, '#111218');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
      }

      const cfg = event.renderConfig || {};

      // 2. Inscribe Recipient Name precisely in the blank space where 'Participant Name' was
      // (Skipped for winner certificates that already have the recipient name pre-printed)
      if (!certificate.isPreRendered) {
        // Ensure fonts are loaded before painting text
        if (document.fonts) {
          try {
            if (document.fonts.ready) await document.fonts.ready;
            await Promise.allSettled([
              document.fonts.load('86px "Adventures Unlimited"'),
              document.fonts.load('86px "Allura"'),
              document.fonts.load('86px "Alex Brush"')
            ]);
          } catch (e) {
            // continue to render
          }
        }

        const namePos = cfg.namePosition || { x: 1000, y: 815, color: '#ffffff' };
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = namePos.color || '#ffffff';
        
        let fontSize = 86;
        if (recipientName.length > 18) fontSize = 74;
        if (recipientName.length > 24) fontSize = 62;
        if (recipientName.length > 32) fontSize = 50;

        // Inscribe recipient name in Adventures Unlimited cursive script
        ctx.font = `400 ${fontSize}px "Adventures Unlimited", "Adventures Unlimited Script", "Allura", "Alex Brush", cursive`;
        ctx.fillText(recipientName, namePos.x, namePos.y);
      }

      // 3. Inscribe Credential Verification ID & Integrity Hash at the bottom edge
      const scaleX = baseWidth / (event.dimensions?.width || 2000);
      const scaleY = baseHeight / (event.dimensions?.height || 1414);
      const certIdPos = {
        x: (cfg.certIdPosition?.x || 1000) * scaleX,
        y: (cfg.certIdPosition?.y || 1390) * scaleY,
        font: baseWidth > 2200 ? '600 18px "Space Grotesk", monospace' : (cfg.certIdPosition?.font || '600 13px "Space Grotesk", monospace'),
        color: cfg.certIdPosition?.color || '#71717a'
      };

      ctx.font = certIdPos.font;
      ctx.fillStyle = certIdPos.color;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(
        `CREDENTIAL ID: ${certId}  •  LET'S COOK × BACKSTAGE  •  HASH: ${certificate.verifyHash || 'VERIFIED'}`,
        certIdPos.x,
        certIdPos.y
      );

      // 4. Draw dynamic Verification QR Code if configured
      if (cfg.qrPosition) {
        const qrPos = cfg.qrPosition;
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
          ctx.font = '700 8px "Space Grotesk", sans-serif';
          ctx.fillStyle = '#71717a';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN TO VERIFY', qrPos.x + qrPos.size / 2, qrPos.y + qrPos.size + 12);
        } catch (err) {
          console.error('QR code generation error:', err);
        }
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
        const rankPrefix = certificate.awardRank 
          ? (certificate.awardRank === 1 ? '1st_Rank_Gold_' : certificate.awardRank === 2 ? '2nd_Rank_Silver_' : '3rd_Rank_Bronze_')
          : '';
        link.download = `LetsCook_Certificate_${rankPrefix}${certId}_${sanitizedName}.png`;
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
    const certName = certificate.credentialType === 'Certificate of Achievement'
      ? `ORIGIN Ideathon – ${certificate.award || 'Winner'}`
      : (event?.name || "ORIGIN – Hackathon Guidance Workshop");
    const issueYear = "2026";
    const issueMonth = "10";
    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certId)}`;
  };

  return (
    <div className={`certificate-viewer-container ${certificate.awardTier ? `has-award tier-${certificate.awardTier}` : ''}`}>
      {/* Winner Podium Crest */}
      {certificate.awardTier && (
        <div className={`winner-crest-banner tier-${certificate.awardTier}`}>
          <div className="crest-badge-left">
            <div className="crest-icon-box">
              {certificate.awardTier === 'gold' && <Trophy size={22} className="crest-icon-gold" />}
              {certificate.awardTier === 'silver' && <Medal size={22} className="crest-icon-silver" />}
              {certificate.awardTier === 'bronze' && <Award size={22} className="crest-icon-bronze" />}
            </div>
            <div>
              <span className="crest-title">
                {certificate.awardTier === 'gold' && '🥇 1ST RANK WINNER'}
                {certificate.awardTier === 'silver' && '🥈 2ND RANK RUNNER UP'}
                {certificate.awardTier === 'bronze' && '🥉 3RD RANK SECOND RUNNER UP'}
              </span>
              <span className="crest-subtitle">ORIGIN HACKATHON GUIDANCE + IDEATHON 2026</span>
            </div>
          </div>
          <div className="crest-badge-tier-tag">
            {certificate.awardTier.toUpperCase()} CREDENTIAL
          </div>
        </div>
      )}

      {/* Visual Canvas Display Frame */}
      <div className={`cert-canvas-frame ${certificate.awardTier ? `tier-${certificate.awardTier}` : ''}`}>
        {isRendering && (
          <div className="cert-loading-overlay">
            <div className="cert-loading-spinner" />
            <p>Loading certificate...</p>
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
          <span>{downloading ? 'Preparing download...' : 'Download Certificate'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="cert-btn secondary"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
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

        /* Winner Crest Banner */
        .winner-crest-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-radius: 12px;
          backdrop-filter: blur(16px);
          flex-wrap: wrap;
          gap: 12px;
          animation: fade-slide-down 0.4s ease-out;
        }

        .winner-crest-banner.tier-gold {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%);
          border: 1px solid rgba(251, 191, 36, 0.4);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);
        }

        .winner-crest-banner.tier-silver {
          background: linear-gradient(135deg, rgba(226, 232, 240, 0.16) 0%, rgba(148, 163, 184, 0.08) 100%);
          border: 1px solid rgba(226, 232, 240, 0.4);
          box-shadow: 0 0 30px rgba(226, 232, 240, 0.2);
        }

        .winner-crest-banner.tier-bronze {
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.16) 0%, rgba(180, 83, 9, 0.08) 100%);
          border: 1px solid rgba(234, 88, 12, 0.4);
          box-shadow: 0 0 30px rgba(234, 88, 12, 0.2);
        }

        .crest-badge-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .crest-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.4);
        }

        .crest-icon-gold {
          color: #fbbf24;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
        }

        .crest-icon-silver {
          color: #f1f5f9;
          filter: drop-shadow(0 0 8px rgba(226, 232, 240, 0.7));
        }

        .crest-icon-bronze {
          color: #f97316;
          filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.7));
        }

        .crest-title {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
        }

        .winner-crest-banner.tier-gold .crest-title {
          color: #fbbf24;
          text-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
        }

        .winner-crest-banner.tier-silver .crest-title {
          color: #f8fafc;
          text-shadow: 0 0 16px rgba(241, 245, 249, 0.4);
        }

        .winner-crest-banner.tier-bronze .crest-title {
          color: #fb923c;
          text-shadow: 0 0 16px rgba(249, 115, 22, 0.4);
        }

        .crest-subtitle {
          display: block;
          font-size: 0.72rem;
          color: #94a3b8;
          letter-spacing: 0.08em;
          font-family: 'Space Grotesk', monospace;
        }

        .crest-badge-tier-tag {
          font-family: 'Space Grotesk', monospace;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 5px 12px;
          border-radius: 999px;
          letter-spacing: 0.08em;
        }

        .winner-crest-banner.tier-gold .crest-badge-tier-tag {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.4);
        }

        .winner-crest-banner.tier-silver .crest-badge-tier-tag {
          background: rgba(226, 232, 240, 0.15);
          color: #f8fafc;
          border: 1px solid rgba(226, 232, 240, 0.4);
        }

        .winner-crest-banner.tier-bronze .crest-badge-tier-tag {
          background: rgba(234, 88, 12, 0.15);
          color: #fb923c;
          border: 1px solid rgba(234, 88, 12, 0.4);
        }

        /* Canvas Frame and Winner Outlines */
        .cert-canvas-frame {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #060608;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 240, 255, 0.08);
          aspect-ratio: 2000 / 1414;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        /* Gold Outline */
        .cert-canvas-frame.tier-gold {
          border: 2.5px solid #fbbf24;
          box-shadow: 0 0 45px rgba(251, 191, 36, 0.45), 0 0 90px rgba(217, 119, 6, 0.25), 0 25px 70px rgba(0, 0, 0, 0.95);
          animation: gold-pulse-border 3.5s ease-in-out infinite;
        }

        @keyframes gold-pulse-border {
          0%, 100% {
            box-shadow: 0 0 35px rgba(251, 191, 36, 0.35), 0 0 75px rgba(217, 119, 6, 0.2), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #fbbf24;
          }
          50% {
            box-shadow: 0 0 55px rgba(251, 191, 36, 0.65), 0 0 110px rgba(245, 158, 11, 0.4), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #fde047;
          }
        }

        /* Silver Outline */
        .cert-canvas-frame.tier-silver {
          border: 2.5px solid #e2e8f0;
          box-shadow: 0 0 45px rgba(226, 232, 240, 0.4), 0 0 90px rgba(148, 163, 184, 0.25), 0 25px 70px rgba(0, 0, 0, 0.95);
          animation: silver-pulse-border 3.5s ease-in-out infinite;
        }

        @keyframes silver-pulse-border {
          0%, 100% {
            box-shadow: 0 0 35px rgba(226, 232, 240, 0.3), 0 0 75px rgba(148, 163, 184, 0.18), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #cbd5e1;
          }
          50% {
            box-shadow: 0 0 55px rgba(255, 255, 255, 0.6), 0 0 110px rgba(203, 213, 225, 0.35), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #ffffff;
          }
        }

        /* Bronze Outline */
        .cert-canvas-frame.tier-bronze {
          border: 2.5px solid #ea580c;
          box-shadow: 0 0 45px rgba(234, 88, 12, 0.4), 0 0 90px rgba(180, 83, 9, 0.22), 0 25px 70px rgba(0, 0, 0, 0.95);
          animation: bronze-pulse-border 3.5s ease-in-out infinite;
        }

        @keyframes bronze-pulse-border {
          0%, 100% {
            box-shadow: 0 0 35px rgba(234, 88, 12, 0.3), 0 0 75px rgba(180, 83, 9, 0.18), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #ea580c;
          }
          50% {
            box-shadow: 0 0 55px rgba(249, 115, 22, 0.6), 0 0 110px rgba(194, 65, 12, 0.35), 0 25px 70px rgba(0, 0, 0, 0.95);
            border-color: #fb923c;
          }
        }

        /* Button Tier Overrides */
        .has-award.tier-gold .cert-btn.primary {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.35);
        }
        .has-award.tier-silver .cert-btn.primary {
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
          box-shadow: 0 4px 20px rgba(226, 232, 240, 0.35);
        }
        .has-award.tier-bronze .cert-btn.primary {
          background: linear-gradient(135deg, #f97316 0%, #b45309 100%);
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35);
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
