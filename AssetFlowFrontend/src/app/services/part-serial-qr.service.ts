import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class PartSerialQrService {
  async printLabel(options: {
    serialNumber: string;
    partNumber?: string;
    partName?: string;
  }): Promise<void> {
    const dataUrl = await QRCode.toDataURL(options.serialNumber, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M'
    });

    const partLine =
      options.partNumber || options.partName
        ? `<div class="part">${[options.partNumber, options.partName].filter(Boolean).join(' — ')}</div>`
        : '';

    const html = `<!DOCTYPE html>
<html><head><title>Label ${options.serialNumber}</title>
<style>
  body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 8px; }
  .label { display: inline-block; border: 1px solid #ccc; padding: 12px; }
  img { width: 160px; height: 160px; }
  .serial { font-size: 14px; font-weight: bold; margin-top: 8px; word-break: break-all; }
  .part { font-size: 11px; color: #444; margin-top: 4px; max-width: 200px; }
  @media print { @page { size: 60mm 40mm; margin: 2mm; } }
</style></head>
<body onload="window.print();">
  <div class="label">
    <img src="${dataUrl}" alt="QR" />
    <div class="serial">${escapeHtml(options.serialNumber)}</div>
    ${partLine}
  </div>
</body></html>`;

    const win = window.open('', '_blank', 'width=320,height=420');
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
