/* Velvet Touch Spa - Admin Dashboard Controller */
(() => {
  const ADMIN_PASS = 'vt#9090';
  const AUTH_KEY = 'VT_ADMIN_AUTH_ACTIVE';

  const authScreen = document.getElementById('admin-auth');
  const dashScreen = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('admin-login-form');
  const passInput = document.getElementById('admin-pass-input');
  const authMsg = document.getElementById('admin-auth-msg');
  const logoutBtn = document.getElementById('admin-logout-btn');

  // Check login state
  function checkAuth() {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      authScreen.style.display = 'none';
      dashScreen.style.display = 'block';
      loadAllData();
    } else {
      authScreen.style.display = 'grid';
      dashScreen.style.display = 'none';
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passInput.value.trim() === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      authMsg.textContent = '';
      checkAuth();
    } else {
      authMsg.textContent = 'Invalid security password. Please try again.';
      passInput.focus();
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
  });

  // Tab Switching
  document.querySelectorAll('.admin-tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Load and render all sections
  function loadAllData() {
    const data = window.VTStore.get();
    renderBookings(data);
    renderEnquiries(data);
    renderStaff(data);
    renderGallery(data);
    loadContactSettings(data);
    loadPaymentSettings(data);
  }

  // 1. RENDER BOOKINGS
  function renderBookings(data) {
    const tbody = document.getElementById('bookings-tbody');
    const countEl = document.getElementById('count-bookings');
    tbody.innerHTML = '';
    const bookings = data.bookings || [];
    countEl.textContent = bookings.length;

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:30px">No appointment requests received yet.</td></tr>';
      return;
    }

    bookings.forEach((b, idx) => {
      const tr = document.createElement('tr');
      const statusClass = b.status === 'Confirmed' ? 'status-confirmed' : (b.status === 'Paid' ? 'status-paid' : (b.status === 'Cancelled' ? 'status-cancelled' : 'status-pending'));
      
      const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${b.name}, this is Velvet Touch Spa regarding your appointment for ${b.service} on ${b.date}.`)}`;

      tr.innerHTML = `
        <td><strong style="color:var(--gold)">${b.id || ('BK-' + (idx+1))}</strong><br><small style="color:var(--muted)">${b.timestamp || ''}</small></td>
        <td><strong>${b.date || '-'}</strong><br><small style="color:var(--gold)">${b.time || 'Any time'}</small></td>
        <td><strong>${b.name || '-'}</strong></td>
        <td>
          <a href="tel:${b.phone}" style="color:var(--text);border-bottom:1px dotted var(--gold)">${b.phone || '-'}</a><br>
          <small style="color:var(--muted)">${b.email || ''}</small>
        </td>
        <td>
          <strong>${b.service || '-'}</strong>
          ${b.notes ? `<br><small style="color:var(--muted);font-style:italic">"${b.notes}"</small>` : ''}
        </td>
        <td>
          <span style="font-size:12px;color:#a5d6a7">${b.paymentMethod || 'On-Arrival'}</span>
          ${b.amountPaid ? `<br><small style="color:var(--gold)">${b.amountPaid}</small>` : ''}
          ${b.paymentRef ? `<br><small style="color:var(--muted)">Ref: ${b.paymentRef}</small>` : ''}
        </td>
        <td>
          <select class="status-select badge-status ${statusClass}" data-id="${b.id}" style="background:#190e16;color:var(--text);border:1px solid var(--line);padding:4px">
            <option value="Pending" ${b.status==='Pending'?'selected':''}>Pending</option>
            <option value="Confirmed" ${b.status==='Confirmed'?'selected':''}>Confirmed</option>
            <option value="Paid" ${b.status==='Paid'?'selected':''}>Paid</option>
            <option value="Cancelled" ${b.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <a href="${waLink}" target="_blank" rel="noopener" class="button btn-success btn-sm" title="Chat on WhatsApp">WhatsApp</a>
            <button class="button btn-danger btn-sm del-booking" data-id="${b.id}" title="Delete">✕</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Wire status updates
    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const fresh = window.VTStore.get();
        const item = fresh.bookings.find(x => x.id === id);
        if (item) {
          item.status = e.target.value;
          window.VTStore.save(fresh);
          loadAllData();
        }
      });
    });

    // Wire delete booking
    tbody.querySelectorAll('.del-booking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!confirm('Remove this appointment record?')) return;
        const id = btn.dataset.id;
        const fresh = window.VTStore.get();
        fresh.bookings = fresh.bookings.filter(x => x.id !== id);
        window.VTStore.save(fresh);
        loadAllData();
      });
    });
  }

  // 2. RENDER ENQUIRIES
  function renderEnquiries(data) {
    const tbody = document.getElementById('enquiries-tbody');
    tbody.innerHTML = '';
    const enquiries = data.enquiries || [];

    if (enquiries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No incoming messages.</td></tr>';
      return;
    }

    enquiries.forEach((enq) => {
      const tr = document.createElement('tr');
      const cleanPhone = (enq.phone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${enq.name}, thanking you for contacting Velvet Touch Spa regarding: ${enq.topic}`)}`;

      tr.innerHTML = `
        <td><strong style="color:var(--gold)">${enq.id}</strong></td>
        <td><small>${enq.timestamp}</small></td>
        <td><strong>${enq.name}</strong><br><small>${enq.phone} | ${enq.email}</small></td>
        <td><span class="badge-status status-pending">${enq.topic}</span></td>
        <td style="max-width:320px;font-size:12px;color:var(--muted)">${enq.message}</td>
        <td>
          <div style="display:flex;gap:6px">
            <a href="${waLink}" target="_blank" rel="noopener" class="button btn-success btn-sm">WhatsApp</a>
            <a href="mailto:${enq.email}" class="button button-outline btn-sm">Email</a>
            <button class="button btn-danger btn-sm del-enq" data-id="${enq.id}">✕</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.del-enq').forEach(btn => {
      btn.addEventListener('click', () => {
        const fresh = window.VTStore.get();
        fresh.enquiries = fresh.enquiries.filter(x => x.id !== btn.dataset.id);
        window.VTStore.save(fresh);
        loadAllData();
      });
    });
  }

  // 3. RENDER STAFF
  const staffGrid = document.getElementById('admin-staff-grid');
  const staffModal = document.getElementById('staff-modal');
  const staffForm = document.getElementById('staff-form');

  function renderStaff(data) {
    staffGrid.innerHTML = '';
    (data.staff || []).forEach(member => {
      const card = document.createElement('div');
      card.className = 'admin-item-card';
      card.innerHTML = `
        <img class="admin-item-preview" src="${member.photo}" alt="${member.name}" onerror="this.src='https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80'">
        <div>
          <strong style="font:20px var(--serif);color:var(--text)">${member.name}</strong>
          <span style="display:block;font-size:11px;color:var(--gold);margin-top:2px">${member.role}</span>
          <p style="font-size:12px;color:var(--muted);margin:8px 0 0;line-height:1.4">${member.bio}</p>
        </div>
        <div class="admin-item-actions">
          <button class="button button-gold btn-sm edit-staff" data-id="${member.id}" style="flex:1">Edit</button>
          <button class="button btn-danger btn-sm del-staff" data-id="${member.id}">Delete</button>
        </div>
      `;
      staffGrid.appendChild(card);
    });

    // Wire Edit
    staffGrid.querySelectorAll('.edit-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = data.staff.find(x => x.id === btn.dataset.id);
        if (!item) return;
        document.getElementById('staff-id').value = item.id;
        document.getElementById('staff-name').value = item.name;
        document.getElementById('staff-role').value = item.role;
        document.getElementById('staff-bio').value = item.bio;
        document.getElementById('staff-photo').value = item.photo;
        document.getElementById('staff-modal-title').textContent = 'Edit Therapist';
        staffModal.setAttribute('aria-hidden', 'false');
      });
    });

    // Wire Delete
    staffGrid.querySelectorAll('.del-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to remove this therapist?')) return;
        const fresh = window.VTStore.get();
        fresh.staff = fresh.staff.filter(x => x.id !== btn.dataset.id);
        window.VTStore.save(fresh);
        loadAllData();
      });
    });
  }

  // Add new staff button
  document.getElementById('add-staff-btn').addEventListener('click', () => {
    staffForm.reset();
    document.getElementById('staff-id').value = '';
    document.getElementById('staff-modal-title').textContent = 'Add New Therapist';
    staffModal.setAttribute('aria-hidden', 'false');
  });

  ['staff-modal-close', 'staff-modal-x', 'staff-modal-cancel'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => staffModal.setAttribute('aria-hidden', 'true'));
  });

  staffForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('staff-id').value;
    const name = document.getElementById('staff-name').value.trim();
    const role = document.getElementById('staff-role').value.trim();
    const bio = document.getElementById('staff-bio').value.trim();
    const photo = document.getElementById('staff-photo').value.trim();

    const fresh = window.VTStore.get();
    if (id) {
      const item = fresh.staff.find(x => x.id === id);
      if (item) {
        item.name = name;
        item.role = role;
        item.bio = bio;
        item.photo = photo;
      }
    } else {
      fresh.staff.push({
        id: 'staff-' + Date.now(),
        name,
        role,
        bio,
        photo,
        revealMode: 'camera'
      });
    }

    window.VTStore.save(fresh);
    staffModal.setAttribute('aria-hidden', 'true');
    loadAllData();
  });

  // 4. RENDER GALLERY
  const galleryGrid = document.getElementById('admin-gallery-grid');
  const galleryModal = document.getElementById('gallery-modal');
  const galleryForm = document.getElementById('gallery-form');

  function renderGallery(data) {
    galleryGrid.innerHTML = '';
    (data.gallery || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'admin-item-card';

      let mediaHtml = item.type === 'video'
        ? `<video style="width:100%;height:150px;object-fit:cover" poster="${item.poster||''}"><source src="${item.url}" type="video/mp4"></video>`
        : `<img class="admin-item-preview" src="${item.url}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600'">`;

      card.innerHTML = `
        ${mediaHtml}
        <div>
          <span class="camera-pill-tag">${item.type.toUpperCase()}</span>
          <strong style="font:18px var(--serif);color:var(--text);display:block;margin-top:6px">${item.title}</strong>
          <small style="color:var(--muted)">${item.subtitle || ''}</small>
        </div>
        <div class="admin-item-actions">
          <button class="button btn-danger btn-sm del-gallery" data-id="${item.id}" style="width:100%">Delete Asset</button>
        </div>
      `;
      galleryGrid.appendChild(card);
    });

    galleryGrid.querySelectorAll('.del-gallery').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Remove this media item from the gallery?')) return;
        const fresh = window.VTStore.get();
        fresh.gallery = fresh.gallery.filter(x => x.id !== btn.dataset.id);
        window.VTStore.save(fresh);
        loadAllData();
      });
    });
  }

  document.getElementById('add-photo-btn').addEventListener('click', () => {
    galleryForm.reset();
    document.getElementById('gallery-id').value = '';
    document.getElementById('gallery-type').value = 'photo';
    document.getElementById('gallery-poster-wrap').style.display = 'none';
    document.getElementById('gallery-modal-title').textContent = 'Add Gallery Photograph';
    galleryModal.setAttribute('aria-hidden', 'false');
  });

  document.getElementById('add-video-btn').addEventListener('click', () => {
    galleryForm.reset();
    document.getElementById('gallery-id').value = '';
    document.getElementById('gallery-type').value = 'video';
    document.getElementById('gallery-poster-wrap').style.display = 'grid';
    document.getElementById('gallery-modal-title').textContent = 'Add Gallery Video (MP4)';
    galleryModal.setAttribute('aria-hidden', 'false');
  });

  ['gallery-modal-close', 'gallery-modal-x', 'gallery-modal-cancel'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => galleryModal.setAttribute('aria-hidden', 'true'));
  });

  galleryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('gallery-type').value;
    const title = document.getElementById('gallery-title').value.trim();
    const subtitle = document.getElementById('gallery-subtitle').value.trim();
    const url = document.getElementById('gallery-url').value.trim();
    const poster = document.getElementById('gallery-poster').value.trim();

    const fresh = window.VTStore.get();
    fresh.gallery.push({
      id: 'gal-' + Date.now(),
      type,
      title,
      subtitle,
      url,
      poster
    });
    window.VTStore.save(fresh);
    galleryModal.setAttribute('aria-hidden', 'true');
    loadAllData();
  });

  // 5. CONTACT & LOCATION SETTINGS
  function loadContactSettings(data) {
    const s = data.settings || {};
    document.getElementById('setting-phone').value = s.phone || '';
    document.getElementById('setting-whatsapp').value = s.whatsapp || '';
    document.getElementById('setting-whatsapp-msg').value = s.whatsappMsg || '';
    document.getElementById('setting-email').value = s.email || '';
    document.getElementById('setting-address').value = s.address || '';
    document.getElementById('setting-map').value = s.mapEmbed || '';

    const pRadios = document.querySelectorAll('input[name="privacy-mode-radio"]');
    pRadios.forEach(r => {
      r.checked = (r.value === (s.privacyMode || 'resilient'));
    });
  }

  document.getElementById('admin-contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fresh = window.VTStore.get();
    fresh.settings.phone = document.getElementById('setting-phone').value.trim();
    fresh.settings.whatsapp = document.getElementById('setting-whatsapp').value.trim();
    fresh.settings.whatsappMsg = document.getElementById('setting-whatsapp-msg').value.trim();
    fresh.settings.email = document.getElementById('setting-email').value.trim();
    fresh.settings.address = document.getElementById('setting-address').value.trim();
    fresh.settings.mapEmbed = document.getElementById('setting-map').value.trim();

    const selectedPrivacy = document.querySelector('input[name="privacy-mode-radio"]:checked');
    if (selectedPrivacy) {
      fresh.settings.privacyMode = selectedPrivacy.value;
    }

    window.VTStore.save(fresh);
    const stat = document.getElementById('contact-save-status');
    stat.textContent = 'Settings saved successfully! ✓';
    setTimeout(() => { stat.textContent = ''; }, 3000);
  });

  // 6. PAYMENT CONFIGURATION
  function loadPaymentSettings(data) {
    const p = data.settings?.payment || {};
    document.getElementById('pay-upi-id').value = p.upiId || '';
    document.getElementById('pay-merchant').value = p.merchantName || '';
    document.getElementById('pay-deposit').value = p.bookingDeposit || 500;
    document.getElementById('pay-account-holder').value = p.accountHolder || '';
    document.getElementById('pay-bank-name').value = p.bankName || '';
    document.getElementById('pay-account-number').value = p.accountNumber || '';
    document.getElementById('pay-ifsc').value = p.ifscCode || '';
    document.getElementById('pay-branch').value = p.branch || '';
  }

  document.getElementById('admin-payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fresh = window.VTStore.get();
    if (!fresh.settings.payment) fresh.settings.payment = {};
    fresh.settings.payment.upiId = document.getElementById('pay-upi-id').value.trim();
    fresh.settings.payment.merchantName = document.getElementById('pay-merchant').value.trim();
    fresh.settings.payment.bookingDeposit = Number(document.getElementById('pay-deposit').value) || 500;
    fresh.settings.payment.accountHolder = document.getElementById('pay-account-holder').value.trim();
    fresh.settings.payment.bankName = document.getElementById('pay-bank-name').value.trim();
    fresh.settings.payment.accountNumber = document.getElementById('pay-account-number').value.trim();
    fresh.settings.payment.ifscCode = document.getElementById('pay-ifsc').value.trim();
    fresh.settings.payment.branch = document.getElementById('pay-branch').value.trim();

    window.VTStore.save(fresh);
    const stat = document.getElementById('payment-save-status');
    stat.textContent = 'Banking & UPI details updated! ✓';
    setTimeout(() => { stat.textContent = ''; }, 3000);
  });

  // CSV Export
  document.getElementById('export-bookings-btn').addEventListener('click', () => {
    const data = window.VTStore.get();
    const rows = [
      ['Ref ID', 'Timestamp', 'Client Name', 'Phone', 'Email', 'Date', 'Time', 'Service', 'Notes', 'Payment Method', 'Payment Ref', 'Amount', 'Status']
    ];
    (data.bookings || []).forEach(b => {
      rows.push([
        b.id || '',
        b.timestamp || '',
        b.name || '',
        b.phone || '',
        b.email || '',
        b.date || '',
        b.time || '',
        b.service || '',
        (b.notes || '').replace(/\n/g, ' '),
        b.paymentMethod || '',
        b.paymentRef || '',
        b.amountPaid || '',
        b.status || ''
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Velvet_Touch_Bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // Clear completed bookings
  document.getElementById('clear-bookings-btn').addEventListener('click', () => {
    if (!confirm('Clear all Confirmed and Paid bookings from list?')) return;
    const fresh = window.VTStore.get();
    fresh.bookings = fresh.bookings.filter(b => b.status === 'Pending');
    window.VTStore.save(fresh);
    loadAllData();
  });

  // Initial auth check
  checkAuth();
})();
