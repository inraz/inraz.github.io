
/* Velvet Touch Spa - Central Data Store & Realtime Sync Engine */
const VT_STORAGE_KEY = 'VT_SPA_SYSTEM_DATA_V2';

const DEFAULT_VT_DATA = {
  settings: {
    spaName: 'Velvet Touch Spa',
    tagline: 'Quiet luxury. Thoughtful wellness.',
    phone: '+91 86624 49010',
    whatsapp: '918662449010',
    whatsappMsg: 'Hello Velvet Touch Spa, I would like to enquire about appointments and treatments.',
    email: 'care@velvettouch.example',
    address: 'Velvet Touch Sanctuary, Wayanad Road, Kozhikode, Kerala 673573',
    mapEmbed: 'https://www.google.com/maps?q=spa%20near%20Kozhikode%20Kerala&output=embed',
    hours: [
      { days: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
      { days: 'Saturday', time: '9:00 AM – 8:00 PM' },
      { days: 'Sunday', time: '10:00 AM – 6:00 PM' }
    ],
    // Payment Configuration
    payment: {
      upiId: 'velvettouch@upi',
      merchantName: 'Velvet Touch Spa',
      bookingDeposit: 500,
      bankName: 'HDFC Bank',
      accountHolder: 'Velvet Touch Spa & Wellness',
      accountNumber: '50200088992211',
      ifscCode: 'HDFC0001234',
      branch: 'Calicut Main Branch',
      netbankingBanks: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Federal Bank', 'Kotak Mahindra']
    },
    privacyMode: 'resilient' // 'resilient' (camera with instant graceful reveal), 'manual', 'always_show'
  },
  staff: [
    {
      id: 'staff-1',
      name: 'Anjali Nair',
      role: 'Senior Massage Therapist',
      bio: 'Focused on restorative Swedish and Ayurvedic aromatherapy rituals, creating a serene and welcoming space.',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80',
      revealMode: 'camera'
    },
    {
      id: 'staff-2',
      name: 'Neha Susan',
      role: 'Skin & Facial Specialist',
      bio: 'Specialist in holistic glow therapies, custom skin consultations, and mindful facial hydration rituals.',
      photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80',
      revealMode: 'camera'
    },
    {
      id: 'staff-3',
      name: 'Divya Menokey',
      role: 'Wellness & Deep Body Therapist',
      bio: 'Brings an attentive, deeply grounding approach to tension-release body polishes and warm stone treatments.',
      photo: 'https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4?auto=format&fit=crop&w=700&q=80',
      revealMode: 'camera'
    }
  ],
  gallery: [
    {
      id: 'gal-1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'Quiet treatment spaces',
      subtitle: 'Atmosphere & ambience'
    },
    {
      id: 'gal-2',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'Restorative massage',
      subtitle: 'Care, comfort, and relaxation'
    },
    {
      id: 'gal-3',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'Facial rituals',
      subtitle: 'Thoughtful skin care'
    },
    {
      id: 'gal-4',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'Wellness details',
      subtitle: 'Little moments of calm'
    },
    {
      id: 'gal-5',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'Ritual essentials',
      subtitle: 'Soft light and organic oils'
    },
    {
      id: 'gal-6',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85',
      poster: '',
      title: 'A slower pace',
      subtitle: 'Your time, your way'
    },
    {
      id: 'gal-v1',
      type: 'video',
      url: 'https://videos.pexels.com/video-files/3998242/3998242-hd_1920_1080_25fps.mp4',
      poster: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85',
      title: 'Spa ambience video',
      subtitle: 'Gentle lighting and welcoming atmosphere'
    },
    {
      id: 'gal-v2',
      type: 'video',
      url: 'https://videos.pexels.com/video-files/5242999/5242999-hd_1920_1080_25fps.mp4',
      poster: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=85',
      title: 'Wellness moments',
      subtitle: 'Unhurried ritual preparation'
    },
    {
      id: 'gal-v3',
      type: 'video',
      url: 'https://videos.pexels.com/video-files/3998461/3998461-hd_1920_1080_25fps.mp4',
      poster: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
      title: 'Care rituals',
      subtitle: 'Herbal extracts and stone massage'
    }
  ],
  bookings: [
    {
      id: 'BK-1001',
      timestamp: '2026-10-28 14:30',
      type: 'booking',
      name: 'Rohan Sharma',
      phone: '+91 98471 23456',
      email: 'rohan.s@example.com',
      date: '2026-11-02',
      time: 'Afternoon',
      service: 'Massage therapy (Swedish Deep Tissue)',
      notes: 'Prefer low aroma oil',
      paymentMethod: 'UPI',
      paymentRef: 'UPI-7749201948',
      amountPaid: '₹500 Deposit',
      status: 'Confirmed'
    }
  ],
  enquiries: [
    {
      id: 'ENQ-2001',
      timestamp: '2026-10-27 10:15',
      type: 'enquiry',
      name: 'Meera Menon',
      phone: '+91 94470 65432',
      email: 'meera.m@example.com',
      topic: 'Couples ritual enquiry',
      message: 'Looking for a weekend afternoon package for two people including facial and massage.',
      status: 'Pending'
    }
  ]
};

window.VTStore = {
  get: function() {
    try {
      const data = localStorage.getItem(VT_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(VT_STORAGE_KEY, JSON.stringify(DEFAULT_VT_DATA));
        return DEFAULT_VT_DATA;
      }
      return JSON.parse(data);
    } catch(e) {
      console.error('Error reading Velvet Touch storage:', e);
      return DEFAULT_VT_DATA;
    }
  },
  save: function(newData) {
    try {
      localStorage.setItem(VT_STORAGE_KEY, JSON.stringify(newData));
      // Dispatch custom event for real-time tab updates
      window.dispatchEvent(new Event('vt-data-changed'));
      return true;
    } catch(e) {
      console.error('Error saving Velvet Touch storage:', e);
      return false;
    }
  },
  addBooking: function(b) {
    const data = this.get();
    b.id = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    b.timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    data.bookings.unshift(b);
    this.save(data);
    return b;
  },
  addEnquiry: function(e) {
    const data = this.get();
    e.id = 'ENQ-' + Math.floor(2000 + Math.random() * 9000);
    e.timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    data.enquiries.unshift(e);
    this.save(data);
    return e;
  },
  resetDefaults: function() {
    localStorage.setItem(VT_STORAGE_KEY, JSON.stringify(DEFAULT_VT_DATA));
    window.dispatchEvent(new Event('vt-data-changed'));
    return DEFAULT_VT_DATA;
  }
};
