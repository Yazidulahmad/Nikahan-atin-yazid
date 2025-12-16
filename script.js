// Inisialisasi AOS
AOS.init({
    duration: 800,
    once: false,
    offset: 50
});

// Inisialisasi Lightbox
lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true,
    'imageFadeDuration': 300,
    'positionFromTop': 50
});

// Variabel global
let currentGuestName = '';
let database;
let commentsRef;

// Konfigurasi SVG Background untuk setiap section
const sectionBackgrounds = {
    'pembuka': `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" zoomAndPan="magnify" viewBox="0 0 810 1439.999935" height="1920" preserveAspectRatio="xMidYMid meet" version="1.0" xmlns:bx="https://boxy-svg.com">
  <defs>
        </svg>
    `,
    'detail-pengantin': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
            <path fill="#d4af37" fill-opacity="0.4" d="M0,224L48,234.7C96,245,192,267,288,256C384,245,480,203,576,170.7C672,139,768,117,864,133.3C960,149,1056,203,1152,202.7C1248,203,1344,149,1392,122.7L1440,96L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            <path fill="#c19a6b" fill-opacity="0.3" d="M0,320L48,309.3C96,299,192,277,288,272C384,267,480,277,576,266.7C672,256,768,224,864,224C960,224,1056,256,1152,245.3C1248,235,1344,181,1392,154.7L1440,128L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
        </svg>
    `,
    'detail-acara': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
            <path fill="#8b7355" fill-opacity="0.4" d="M0,288L48,282.7C96,277,192,267,288,245.3C384,224,480,192,576,176C672,160,768,160,864,170.7C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            <path fill="#2c2c2c" fill-opacity="0.3" d="M0,416L48,416C96,416,192,416,288,394.7C384,373,480,331,576,320C672,309,768,331,864,352C960,373,1056,395,1152,394.7C1248,395,1344,373,1392,362.7L1440,352L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
        </svg>
    `,
    'penutup': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
            <path fill="#f8f4e9" fill-opacity="0.3" d="M0,512L48,501.3C96,491,192,469,288,458.7C384,448,480,448,576,437.3C672,427,768,405,864,405.3C960,405,1056,427,1152,410.7C1248,395,1344,341,1392,314.7L1440,288L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            <path fill="#d4af37" fill-opacity="0.2" d="M0,576L48,576C96,576,192,576,288,544C384,512,480,448,576,448C672,448,768,512,864,512C960,512,1056,448,1152,416C1248,384,1344,384,1392,384L1440,384L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
        </svg>
    `,
    'amplop-digital': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
            <path fill="#667eea" fill-opacity="0.5" d="M0,640L48,640C96,640,192,640,288,618.7C384,597,480,555,576,538.7C672,523,768,533,864,522.7C960,512,1056,480,1152,480C1248,480,1344,512,1392,528L1440,544L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            <path fill="#764ba2" fill-opacity="0.4" d="M0,704L48,693.3C96,683,192,661,288,661.3C384,661,480,683,576,672C672,661,768,619,864,597.3C960,576,1056,576,1152,565.3C1248,555,1344,533,1392,522.7L1440,512L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
        </svg>
    `,
    'ucapan': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
            <path fill="#2c2c2c" fill-opacity="0.4" d="M0,96L48,117.3C96,139,192,181,288,213.3C384,245,480,267,576,256C672,245,768,203,864,192C960,181,1056,203,1152,213.3C1248,224,1344,224,1392,224L1440,224L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            <path fill="#8b7355" fill-opacity="0.3" d="M0,32L48,64C96,96,192,160,288,165.3C384,171,480,117,576,101.3C672,85,768,107,864,138.7C960,171,1056,213,1152,213.3C1248,213,1344,171,1392,149.3L1440,128L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
        </svg>
    `
};

// Fungsi untuk mengubah SVG background berdasarkan section yang aktif
function updateSVGBackground(sectionId) {
    const svgContainer = document.getElementById('svg-background');
    
    if (sectionBackgrounds[sectionId]) {
        svgContainer.innerHTML = sectionBackgrounds[sectionId];
    } else {
        // Default background jika tidak ditemukan
        svgContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
                <path fill="#667eea" fill-opacity="0.5" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,234.7C672,235,768,213,864,192C960,171,1056,149,1152,133.3C1248,117,1344,107,1392,101.3L1440,96L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
                <path fill="#764ba2" fill-opacity="0.3" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,218.7C1248,235,1344,245,1392,250.7L1440,256L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"></path>
            </svg>
        `;
    }
    
    // Tambahkan animasi transisi
    svgContainer.style.opacity = '0';
    setTimeout(() => {
        svgContainer.style.transition = 'opacity 0.8s ease';
        svgContainer.style.opacity = '1';
    }, 50);
}

// Fungsi untuk menambahkan efek typing pada teks
function applyTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach((element, index) => {
        // Reset untuk animasi ulang
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';
        
        // Delay berdasarkan index
        setTimeout(() => {
            element.style.overflow = 'hidden';
            element.style.whiteSpace = 'nowrap';
            element.style.borderRight = '2px solid var(--primary)';
            element.textContent = text;
            
            // Animate typing
            const charCount = text.length;
            const duration = Math.min(3000, charCount * 50); // Max 3 seconds
            
            element.style.animation = `typing ${duration/1000}s steps(${charCount}, end), blink-caret 0.75s step-end infinite`;
            
            // Remove cursor after animation
            setTimeout(() => {
                element.style.borderRight = 'none';
                element.style.animation = '';
            }, duration + 500);
        }, index * 300);
    });
}

// Tambahkan style untuk cursor berkedip
const style = document.createElement('style');
style.textContent = `
    @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: var(--primary); }
    }
`;
document.head.appendChild(style);

// Tunggu Firebase siap
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        const checkFirebase = () => {
            if (window.firebaseDatabase && window.firebaseRef) {
                database = window.firebaseDatabase;
                commentsRef = window.firebaseRef(database, 'comments');
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
        
        // Timeout after 5 seconds
        setTimeout(() => {
            if (!database) {
                reject(new Error('Firebase initialization timeout'));
            }
        }, 5000);
    });
}

// Fungsi untuk mengambil parameter dari URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Tampilkan pesan sukses
function showSuccessMessage(message) {
    const successEl = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    successText.textContent = message;
    successEl.classList.add('show');
    
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 3000);
}

// Salin teks ke clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessMessage('Nomor rekening berhasil disalin');
    }).catch(err => {
        console.error('Gagal menyalin teks: ', err);
        showSuccessMessage('Gagal menyalin nomor rekening');
    });
}

// Cegah scroll ke cover
function preventCoverScroll() {
    $(window).off('scroll.coverPrevention');
    
    $(window).on('scroll.coverPrevention', function() {
        const coverSection = document.getElementById('cover');
        if (coverSection.classList.contains('hidden')) {
            const coverRect = coverSection.getBoundingClientRect();
            if (coverRect.top < 0 && coverRect.bottom > 0) {
                window.scrollTo(0, document.getElementById('pembuka').offsetTop);
            }
        }
    });
}

// Format tanggal untuk komentar
function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Simpan komentar ke Firebase
function saveCommentToFirebase(comment) {
    return window.firebasePush(commentsRef, comment);
}

// Tampilkan komentar dari Firebase
function displayCommentsFromFirebase() {
    const commentsQuery = window.firebaseQuery(commentsRef, window.firebaseOrderByChild('timestamp'));
    const limitedQuery = window.firebaseQuery(commentsQuery, window.firebaseLimitToLast(50));
    
    window.firebaseOnValue(limitedQuery, (snapshot) => {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            const comment = childSnapshot.val();
            comment.id = childSnapshot.key;
            comments.push(comment);
        });
        
        // Urutkan dari yang terbaru
        comments.sort((a, b) => b.timestamp - a.timestamp);
        displayComments(comments);
    }, (error) => {
        console.error('Error loading comments:', error);
        $('#comments-container').html(`
            <div class="comment-item">
                <p style="text-align: center; color: #fff; font-style: italic;">
                    Gagal memuat ucapan. Silakan refresh halaman.
                </p>
            </div>
        `);
    });
}

// Tampilkan komentar di UI
function displayComments(comments) {
    const commentsContainer = $('#comments-container');
    commentsContainer.empty();
    
    if (comments.length === 0) {
        commentsContainer.html(`
            <div class="comment-item" data-aos="fade-up">
                <p style="text-align: center; color: rgba(255, 255, 255, 0.7); font-style: italic;">
                    Belum ada ucapan. Jadilah yang pertama mengucapkan selamat!
                </p>
            </div>
        `);
        return;
    }
    
    comments.forEach(function(comment, index) {
        const commentHtml = `
            <div class="comment-item" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="comment-header">
                    <span class="comment-name">${comment.name}</span>
                    <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>
                </div>
                <p>${comment.message}</p>
            </div>
        `;
        commentsContainer.append(commentHtml);
    });
}

// Set nama tamu dari URL
$(document).ready(function() {
    // Initialize Firebase first
    initializeFirebase().then(() => {
        console.log('Firebase initialized successfully');
        
        // Set nama tamu
        currentGuestName = getUrlParameter('to');
        if (currentGuestName) {
            $('#guest-name').text('Kepada Yth. ' + currentGuestName);
        }
        
        // Tampilkan komentar
        displayCommentsFromFirebase();
        
    }).catch(error => {
        console.error('Firebase initialization failed:', error);
        $('#comments-container').html(`
            <div class="comment-item">
                <p style="text-align: center; color: rgba(255, 255, 255, 0.7); font-style: italic;">
                    Mode offline. Ucapan tidak dapat dimuat.
                </p>
            </div>
        `);
    });
    
    // Inisialisasi background pertama
    updateSVGBackground('pembuka');
    
    // Musik otomatis
    var audio = document.getElementById('wedding-music');
    var musicIcon = document.getElementById('music-icon');
    var musicToggle = document.getElementById('music-toggle');
    var cassetteReel = document.getElementById('cassette-reel');
    
    // Fungsi untuk memutar musik
    function playMusic() {
        audio.play().then(function() {
            musicIcon.classList.remove('fa-play');
            musicIcon.classList.add('fa-pause');
            cassetteReel.classList.add('playing');
        }).catch(function(error) {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Coba putar musik saat halaman dimuat
    setTimeout(playMusic, 1000);
    
    // Toggle musik
    musicToggle.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            musicIcon.classList.remove('fa-play');
            musicIcon.classList.add('fa-pause');
            cassetteReel.classList.add('playing');
        } else {
            audio.pause();
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-play');
            cassetteReel.classList.remove('playing');
        }
    });
    
    // Tombol buka undangan
    $('#open-invitation').click(function() {
        // Sembunyikan cover section
        $('#cover').addClass('hidden');
        
        // Scroll ke section pembuka
        $('html, body').animate({
            scrollTop: $('#pembuka').offset().top
        }, 1000);
        
        // Sembunyikan nama tamu setelah membuka undangan
        $('#guest-name').fadeOut(500);
        
        // Tampilkan bottom navigation setelah membuka undangan
        setTimeout(() => {
            $('#bottom-nav').fadeIn(300);
        }, 1000);
        
        // Aktifkan pencegahan scroll ke cover
        preventCoverScroll();
        
        // Set status bahwa undangan sudah dibuka
        sessionStorage.setItem('undanganDibuka', 'true');
        
        // Terapkan efek typing setelah membuka undangan
        setTimeout(applyTypingEffect, 1200);
    });
    
    // Cek jika undangan sudah dibuka sebelumnya
    if (sessionStorage.getItem('undanganDibuka') === 'true') {
        $('#cover').addClass('hidden');
        $('#bottom-nav').show();
        preventCoverScroll();
        
        // Terapkan efek typing jika undangan sudah dibuka
        setTimeout(applyTypingEffect, 500);
    }
    
    // Bottom Navigation
    $('.nav-tab').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        var sectionId = target.substring(1);
        
        // Cegah navigasi ke cover jika sudah dibuka
        if (target === '#cover' && sessionStorage.getItem('undanganDibuka') === 'true') {
            return;
        }
        
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 500);
        
        // Update active tab
        $('.nav-tab').removeClass('active');
        $(this).addClass('active');
        
        // Update SVG background berdasarkan section yang aktif
        updateSVGBackground(sectionId);
        
        // Terapkan efek typing saat berpindah section
        setTimeout(applyTypingEffect, 300);
    });
    
    // Deteksi scroll untuk mengubah background SVG
    $(window).scroll(function() {
        var scrollPosition = $(window).scrollTop();
        var windowHeight = $(window).height();
        
        // Cari section yang sedang terlihat
        $('.content-section').each(function() {
            var sectionTop = $(this).offset().top - 100;
            var sectionBottom = sectionTop + $(this).outerHeight();
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                var sectionId = $(this).attr('id');
                updateSVGBackground(sectionId);
                
                // Update active tab
                $('.nav-tab').removeClass('active');
                $(`.nav-tab[href="#${sectionId}"]`).addClass('active');
            }
        });
        
        // Sembunyikan bottom nav di cover section (hanya jika cover belum dibuka)
        if (scrollPosition < windowHeight * 0.8 && !sessionStorage.getItem('undanganDibuka')) {
            $('#bottom-nav').fadeOut(300);
        } else {
            $('#bottom-nav').fadeIn(300);
        }
    });
    
    // Hitung mundur
    function updateCountdown() {
        var weddingDate = new Date('December 21, 2025 09:00:00').getTime();
        var now = new Date().getTime();
        var distance = weddingDate - now;
        
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        $('#days').text(days.toString().padStart(2, '0'));
        $('#hours').text(hours.toString().padStart(2, '0'));
        $('#minutes').text(minutes.toString().padStart(2, '0'));
        $('#seconds').text(seconds.toString().padStart(2, '0'));
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Simpan ke kalender - TANPA KONFIRMASI (untuk acara gabungan)
    $('#save-akad-resepsi').click(function() {
        var startDate = '20251221T090000';
        var endDate = '20251221T140000';
        var title = 'Akad Nikah & Resepsi Hartini & Ahmad Yazidul Jihad';
        var location = 'Kediaman Mempelai Wanita';
        var details = 'Akad Nikah dan Resepsi Pernikahan Hartini & Ahmad Yazidul Jihad';
        
        var googleCalendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + 
            encodeURIComponent(title) + '&dates=' + startDate + '/' + endDate + 
            '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(location);
        
        window.open(googleCalendarUrl, '_blank');
        showSuccessMessage('Acara akad nikah dan resepsi ditambahkan ke kalender');
    });
    
    // Buka Google Maps
    $('#open-map').click(function() {
        window.open('https://maps.app.goo.gl/PzdmwVSJc67DmowM7?g_st=ipc', '_blank');
        showSuccessMessage('Membuka lokasi di Google Maps');
    });
    
    // Salin nomor rekening (ATM Card)
    $('.atm-copy-btn').click(function() {
        var accountNumber = $(this).data('account');
        copyToClipboard(accountNumber.replace(/\s/g, ''));
    });
    
    // Kirim ucapan
    $('#submit-comment').click(function() {
        var message = $('#comment-message').val().trim();
        
        if (!message) {
            showSuccessMessage('Harap isi pesan Anda');
            return;
        }
        
        if (message.length < 3) {
            showSuccessMessage('Pesan terlalu pendek');
            return;
        }
        
        // Gunakan nama tamu dari URL, atau default jika tidak ada
        var name = currentGuestName || 'Tamu Undangan';
        
        // Simpan komentar
        var comment = {
            name: name,
            message: message,
            timestamp: Date.now()
        };
        
        // Simpan ke Firebase
        saveCommentToFirebase(comment)
            .then(() => {
                // Reset form
                $('#comment-message').val('');
                
                // Tampilkan pesan sukses
                showSuccessMessage('Ucapan Anda telah terkirim');
            })
            .catch((error) => {
                console.error('Error saving comment:', error);
                showSuccessMessage('Gagal mengirim ucapan. Coba lagi.');
            });
    });
    
    // Sembunyikan bottom nav di awal (saat di cover dan belum dibuka)
    if (!sessionStorage.getItem('undanganDibuka')) {
        $('#bottom-nav').hide();
    }
    
    // Terapkan efek typing pada elemen dengan class typing-text
    function initializeTypingEffects() {
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach((element, index) => {
            // Simpan teks asli
            const originalText = element.textContent;
            element.setAttribute('data-original-text', originalText);
            
            // Set width untuk animasi
            element.style.width = '0';
            element.style.overflow = 'hidden';
            element.style.whiteSpace = 'nowrap';
            element.style.display = 'inline-block';
        });
    }
    
    // Inisialisasi efek typing
    initializeTypingEffects();
});
