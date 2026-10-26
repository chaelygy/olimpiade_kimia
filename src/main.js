import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

// State Management (Privacy-safe: no cross-student data storage)
const STATE = {
  currentPhoto: null,
  autoNumCounter: 1
};

// DOM Elements
const elements = {
  form: document.getElementById('registration-form'),
  inputNama: document.getElementById('input-nama'),
  inputSekolah: document.getElementById('input-sekolah'),
  inputNomor: document.getElementById('input-nomor'),
  inputPelaksanaan: document.getElementById('input-pelaksanaan'),
  toggleStempel: document.getElementById('toggle-stempel'),
  toggleGuides: document.getElementById('toggle-guides'),
  
  // Photo Dropzone
  dropzone: document.getElementById('photo-dropzone'),
  fileInput: document.getElementById('input-foto-file'),
  dropzoneEmpty: document.getElementById('dropzone-empty-state'),
  dropzonePreview: document.getElementById('dropzone-preview-state'),
  previewThumbImg: document.getElementById('preview-thumbnail-img'),
  photoFilenameLabel: document.getElementById('photo-filename-label'),
  btnBrowseFile: document.getElementById('btn-browse-file'),
  btnReselectPhoto: document.getElementById('btn-reselect-photo'),
  btnRemovePhoto: document.getElementById('btn-remove-photo'),
  btnSamplePhoto1: document.getElementById('btn-sample-photo-1'),
  btnSamplePhoto2: document.getElementById('btn-sample-photo-2'),
  
  // Card Display Elements
  cardDisplayNama: document.getElementById('card-display-nama'),
  cardDisplaySekolah: document.getElementById('card-display-sekolah'),
  cardDisplayNomor: document.getElementById('card-display-nomor'),
  cardDisplayPelaksanaan: document.getElementById('card-display-pelaksanaan'),
  cardStampBox: document.getElementById('card-stamp-box'),
  cardPhotoContainer: document.getElementById('card-photo-container'),
  photoPlaceholderGuide: document.getElementById('photo-placeholder-guide'),
  cardPhotoImg: document.getElementById('card-photo-img'),
  targetCard: document.getElementById('target-participant-card'),
  printableSheet: document.getElementById('printable-sheet'),
  sheetHeaderTitle: document.getElementById('sheet-header-title'),
  sheetFooterInstructions: document.getElementById('sheet-footer-instructions'),

  // Action Buttons
  btnQuickSample: document.getElementById('btn-quick-sample'),
  btnGenerateNomor: document.getElementById('btn-generate-nomor'),
  btnDownloadPdf: document.getElementById('btn-download-pdf'),
  btnQuickDownloadTop: document.getElementById('btn-quick-download-top'),
  btnPrintDirect: document.getElementById('btn-print-direct'),
  btnDownloadPng: document.getElementById('btn-download-png'),
  btnResetForm: document.getElementById('btn-reset-form'),

  // Scale Controls
  btnFitScreen: document.getElementById('btn-fit-screen'),
  btnScale100: document.getElementById('btn-scale-100'),

  // Modal & Overlay
  guideModal: document.getElementById('guide-modal'),
  btnShowGuide: document.getElementById('btn-show-guide'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnModalUnderstand: document.getElementById('btn-modal-understand'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingMessage: document.getElementById('loading-message'),
  toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// TOAST NOTIFICATION HELPER
// ==========================================================================
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================================================
// LIVE PREVIEW UPDATER
// ==========================================================================
function updateCardPreview() {
  const namaVal = elements.inputNama.value.trim();
  const sekolahVal = elements.inputSekolah.value.trim();
  const nomorVal = elements.inputNomor.value.trim();
  const pelaksanaanVal = elements.inputPelaksanaan.value.trim();

  // Name
  elements.cardDisplayNama.textContent = namaVal || '[Nama lengkap]';
  
  // School
  elements.cardDisplaySekolah.textContent = sekolahVal || '[Nama sekolah]';

  // Participant Number
  elements.cardDisplayNomor.textContent = nomorVal || 'OK-001';

  // Schedule text
  elements.cardDisplayPelaksanaan.textContent = pelaksanaanVal || '14 NOVEMBER 2026';

  // Stamp toggle
  if (elements.toggleStempel.checked) {
    elements.cardStampBox.classList.remove('hidden');
  } else {
    elements.cardStampBox.classList.add('hidden');
  }

  // Guidelines toggle
  if (elements.toggleGuides.checked) {
    elements.sheetHeaderTitle.classList.remove('hidden');
    elements.sheetFooterInstructions.classList.remove('hidden');
    elements.targetCard.style.borderStyle = 'dashed';
  } else {
    elements.sheetHeaderTitle.classList.add('hidden');
    elements.sheetFooterInstructions.classList.add('hidden');
    elements.targetCard.style.borderStyle = 'solid';
  }

  // Photo
  if (STATE.currentPhoto) {
    elements.cardPhotoImg.src = STATE.currentPhoto;
    elements.cardPhotoImg.classList.remove('hidden');
    elements.photoPlaceholderGuide.classList.add('hidden');
  } else {
    elements.cardPhotoImg.src = '';
    elements.cardPhotoImg.classList.add('hidden');
    elements.photoPlaceholderGuide.classList.remove('hidden');
  }
}

// ==========================================================================
// PHOTO HANDLING & PREVIEW
// ==========================================================================
function handleFileSelect(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih berkas gambar (JPG, PNG, WEBP)', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran foto terlalu besar. Maksimal 5 MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    setPhotoData(e.target.result, file.name);
    showToast('Foto berhasil dimuat!', 'success');
  };
  reader.readAsDataURL(file);
}

function setPhotoData(dataUrl, filename = 'foto_peserta.jpg') {
  STATE.currentPhoto = dataUrl;
  elements.previewThumbImg.src = dataUrl;
  elements.photoFilenameLabel.textContent = filename;
  
  elements.dropzoneEmpty.classList.add('hidden');
  elements.dropzonePreview.classList.remove('hidden');
  
  updateCardPreview();
}

function clearPhoto() {
  STATE.currentPhoto = null;
  elements.fileInput.value = '';
  elements.previewThumbImg.src = '';
  elements.photoFilenameLabel.textContent = '';
  
  elements.dropzonePreview.classList.add('hidden');
  elements.dropzoneEmpty.classList.remove('hidden');
  
  updateCardPreview();
}

// Generate Realistic Formal Student Photo (Canvas based - 100% self contained)
function createSampleStudentPhoto(gender = 'male') {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400; // 3:4 ratio
  const ctx = canvas.getContext('2d');

  // Red Background (Indonesian formal pass photo background)
  const isRed = gender === 'male';
  ctx.fillStyle = isRed ? '#b91c1c' : '#1d4ed8'; // Red or Blue background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle gradient vignette on background
  const grad = ctx.createRadialGradient(150, 180, 20, 150, 200, 220);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Shoulders & Body (White shirt / OSIS high school uniform)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(150, 390, 120, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Collar lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 270);
  ctx.lineTo(120, 330);
  ctx.lineTo(150, 360);
  ctx.lineTo(180, 330);
  ctx.closePath();
  ctx.stroke();

  // Tie (Grey / Abu-abu SMA)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(144, 305);
  ctx.lineTo(156, 305);
  ctx.lineTo(162, 380);
  ctx.lineTo(150, 400);
  ctx.lineTo(138, 380);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#f8c8a0';
  ctx.beginPath();
  ctx.rect(132, 230, 36, 50);
  ctx.fill();

  // Head / Face
  ctx.fillStyle = '#fbd4b4';
  ctx.beginPath();
  ctx.ellipse(150, 180, 52, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1c1917';
  if (gender === 'male') {
    ctx.beginPath();
    ctx.ellipse(150, 140, 56, 42, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Hijab (Pramuka/Putih) or Hair
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(150, 180, 68, 85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face inner cutout
    ctx.fillStyle = '#fbd4b4';
    ctx.beginPath();
    ctx.ellipse(150, 185, 45, 58, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile / friendly expression
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(150, 205, 12, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.arc(135, 175, 4.5, 0, Math.PI * 2);
  ctx.arc(165, 175, 4.5, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ==========================================================================
// NUMBER GENERATOR & QUICK SAMPLE FILLER
// ==========================================================================
function generateNextNomor() {
  const currentVal = elements.inputNomor.value.trim();
  const match = currentVal.match(/OK-(\d+)/i);
  let nextNum = STATE.autoNumCounter++;
  if (match) {
    nextNum = parseInt(match[1], 10) + 1;
    STATE.autoNumCounter = nextNum + 1;
  }
  const formatted = `OK-${String(nextNum).padStart(3, '0')}`;
  elements.inputNomor.value = formatted;
  updateCardPreview();
  showToast(`Nomor peserta baru dibuat: ${formatted}`, 'info');
}

function fillQuickSample() {
  const sampleNames = [
    'Jessica Abigail Simanjuntak',
    'Samuel Christian Hutapea',
    'Audrey Natasya Panjaitan',
    'Michael Kevin Siahaan'
  ];
  const sampleSchools = [
    'SMA Negeri 1 Pematangsiantar',
    'SMA Katolik Budi Mulia Pematangsiantar',
    'SMA Negeri 2 Pematangsiantar',
    'SMA Swasta Sultan Agung Pematangsiantar'
  ];

  const pick = Math.floor(Math.random() * sampleNames.length);
  elements.inputNama.value = sampleNames[pick];
  elements.inputSekolah.value = sampleSchools[pick];
  
  generateNextNomor();

  // Auto assign sample student photo
  const samplePhoto = createSampleStudentPhoto(pick % 2 === 0 ? 'female' : 'male');
  setPhotoData(samplePhoto, `foto_pas_${elements.inputNomor.value}.jpg`);
  
  updateCardPreview();
  showToast('Data formulir berhasil diisi dengan sampel!', 'success');
}

// ==========================================================================
// EXPORT TO PDF (A4 LANDSCAPE)
// ==========================================================================
async function exportToPdf() {
  const nama = elements.inputNama.value.trim() || 'Peserta';
  const nomor = elements.inputNomor.value.trim() || 'OK-001';

  // Show loading indicator
  elements.loadingMessage.textContent = 'Menyiapkan Dokumen PDF Kartu Peserta...';
  elements.loadingOverlay.classList.remove('hidden');

  try {
    const sheetElement = elements.printableSheet;

    // Use html2canvas with scale: 3 for ultra-sharp 300DPI equivalent quality
    const canvas = await html2canvas(sheetElement, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Create jsPDF in A4 Landscape: width 297mm, height 210mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 297;
    const pdfHeight = 210;

    // Calculate aspect ratio to center it cleanly on A4
    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = pdfWidth / pdfHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > pageRatio) {
      renderWidth = pdfWidth - 20; // 10mm margins
      renderHeight = renderWidth / canvasRatio;
      offsetX = 10;
      offsetY = (pdfHeight - renderHeight) / 2;
    } else {
      renderHeight = pdfHeight - 20; // 10mm margins
      renderWidth = renderHeight * canvasRatio;
      offsetY = 10;
      offsetX = (pdfWidth - renderWidth) / 2;
    }

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

    // Clean filename
    const sanitizedNama = nama.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedNomor = nomor.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Kartu_Peserta_${sanitizedNomor}_${sanitizedNama}.pdf`;

    pdf.save(filename);

    // Confetti celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#860d14', '#f59e0b', '#10b981', '#3b82f6']
    });

    showToast(`PDF berhasil diunduh: ${filename}`, 'success');
  } catch (error) {
    console.error('Error generating PDF:', error);
    showToast('Gagal membuat PDF. Anda juga dapat menggunakan tombol "Print Langsung"', 'error');
  } finally {
    elements.loadingOverlay.classList.add('hidden');
  }
}

// ==========================================================================
// EXPORT TO PNG (CARD ONLY)
// ==========================================================================
async function exportToPng() {
  const nama = elements.inputNama.value.trim() || 'Peserta';
  const nomor = elements.inputNomor.value.trim() || 'OK-001';

  elements.loadingMessage.textContent = 'Merender Gambar Kartu HD...';
  elements.loadingOverlay.classList.remove('hidden');

  try {
    const cardElement = elements.targetCard;
    const canvas = await html2canvas(cardElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const link = document.createElement('a');
    const sanitizedNama = nama.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedNomor = nomor.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Kartu_${sanitizedNomor}_${sanitizedNama}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });

    showToast('Gambar Kartu berhasil diunduh (PNG)', 'success');
  } catch (error) {
    console.error('Error exporting PNG:', error);
    showToast('Gagal merender gambar kartu', 'error');
  } finally {
    elements.loadingOverlay.classList.add('hidden');
  }
}

// ==========================================================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================================================
function init() {
  // Clear any legacy localStorage to protect user privacy
  try {
    localStorage.removeItem('olimpiade_kimia_peserta_history_v1');
  } catch (_) {}

  updateCardPreview();

  // Input event listeners for real-time live preview
  [elements.inputNama, elements.inputSekolah, elements.inputNomor, elements.inputPelaksanaan].forEach(input => {
    input.addEventListener('input', updateCardPreview);
  });

  elements.toggleStempel.addEventListener('change', updateCardPreview);
  elements.toggleGuides.addEventListener('change', updateCardPreview);

  // Auto Capitalize / Format Name
  elements.inputNama.addEventListener('blur', () => {
    const val = elements.inputNama.value.trim();
    if (val) {
      elements.inputNama.value = val.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
      updateCardPreview();
    }
  });

  // Buttons
  elements.btnQuickSample.addEventListener('click', fillQuickSample);
  elements.btnGenerateNomor.addEventListener('click', generateNextNomor);
  elements.btnDownloadPdf.addEventListener('click', exportToPdf);
  elements.btnQuickDownloadTop.addEventListener('click', exportToPdf);
  elements.btnDownloadPng.addEventListener('click', exportToPng);
  
  elements.btnPrintDirect.addEventListener('click', () => {
    window.print();
  });

  elements.btnResetForm.addEventListener('click', () => {
    setTimeout(() => {
      clearPhoto();
      elements.inputNomor.value = 'OK-001';
      elements.inputPelaksanaan.value = '14 NOVEMBER 2026';
      updateCardPreview();
      showToast('Formulir telah dikosongkan', 'info');
    }, 50);
  });

  // Dropzone drag-and-drop
  elements.btnBrowseFile.addEventListener('click', () => elements.fileInput.click());
  elements.btnReselectPhoto.addEventListener('click', () => elements.fileInput.click());
  elements.dropzone.addEventListener('click', (e) => {
    if (e.target !== elements.btnRemovePhoto && !elements.btnRemovePhoto.contains(e.target)) {
      elements.fileInput.click();
    }
  });

  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  elements.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropzone.classList.add('drag-active');
  });

  elements.dropzone.addEventListener('dragleave', () => {
    elements.dropzone.classList.remove('drag-active');
  });

  elements.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  elements.btnRemovePhoto.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPhoto();
    showToast('Foto peserta dihapus', 'info');
  });

  // Sample student photos
  elements.btnSamplePhoto1.addEventListener('click', () => {
    const photo = createSampleStudentPhoto('male');
    setPhotoData(photo, 'pas_foto_siswa_1.jpg');
    showToast('Foto sampel siswa 1 diterapkan', 'info');
  });

  elements.btnSamplePhoto2.addEventListener('click', () => {
    const photo = createSampleStudentPhoto('female');
    setPhotoData(photo, 'pas_foto_siswi_2.jpg');
    showToast('Foto sampel siswi 2 diterapkan', 'info');
  });

  // Scale Controls
  elements.btnFitScreen.addEventListener('click', () => {
    elements.printableSheet.style.transform = 'scale(1)';
    elements.btnFitScreen.classList.add('active');
    elements.btnScale100.classList.remove('active');
  });

  elements.btnScale100.addEventListener('click', () => {
    elements.printableSheet.style.transform = 'scale(1.05)';
    elements.btnScale100.classList.add('active');
    elements.btnFitScreen.classList.remove('active');
  });

  // Guide Modal
  elements.btnShowGuide.addEventListener('click', () => {
    elements.guideModal.showModal();
  });

  elements.btnCloseModal.addEventListener('click', () => {
    elements.guideModal.close();
  });

  elements.btnModalUnderstand.addEventListener('click', () => {
    elements.guideModal.close();
  });

  elements.guideModal.addEventListener('click', (e) => {
    if (e.target === elements.guideModal) {
      elements.guideModal.close();
    }
  });

  console.log('Olimpiade Kimia 2026 Portal Initialized (Privacy-safe mode).');
}

// Start application
document.addEventListener('DOMContentLoaded', init);
