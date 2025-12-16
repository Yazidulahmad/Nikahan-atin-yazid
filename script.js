// Inisialisasi AOS
AOS.init({
    duration: 800,
    once: false,
    offset: 50
});

// Variabel global
let currentGuestName = '';
let database;
let commentsRef;

// File SVG untuk setiap section (ganti dengan nama file SVG Anda)
const svgFiles = {
    'pembuka': 'animasi.svg',
    'detail-pengantin': 'animasi.svg',
    'detail-acara': 'animasi.svg',
    'penutup': 'animasi.svg',
    'amplop-digital': 'animasi.svg',
    'ucapan': 'animasi.svg'
};

// Fungsi untuk mengubah SVG background berdasarkan section yang aktif
function updateSVGBackground(sectionId) {
    const svgContainer = document.getElementById('svg-background');
    const pageOverlay = document.getElementById('page-overlay');
    
    // Animasi fade out
    svgContainer.style.opacity = '0';
    pageOverlay.style.opacity = '0';
    
    setTimeout(() => {
        // Load SVG file untuk section aktif
        if (svgFiles[sectionId]) {
            loadSVGFile(svgFiles[sectionId], svgContainer);
        } else {
            // Default fallback jika tidak ada file
            loadDefaultSVG(svgContainer);
        }
        
        // Animasi fade in dengan delay
        setTimeout(() => {
            svgContainer.style.transition = 'opacity 1s ease';
            pageOverlay.style.transition = 'opacity 1s ease';
            svgContainer.style.opacity = '1';
            pageOverlay.style.opacity = '1';
        }, 300);
    }, 500);
}

// Fungsi untuk load SVG file
function loadSVGFile(fileName, container) {
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.status}`);
            }
            return response.text();
        })
        .then(svgContent => {
            container.innerHTML = svgContent;
            
            // Optimasi SVG untuk responsif
            const svgElement = container.querySelector('svg');
            if (svgElement) {
                // Pastikan SVG responsif
                if (!svgElement.hasAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', '0 0 1440 800');
                }
                svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.objectFit = 'cover';
            }
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            loadDefaultSVG(container);
        });
}

// Fungsi default SVG fallback
function loadDefaultSVG(container) {
    container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.7">
                        <animate attributeName="stop-color" values="#667eea;#764ba2;#d4af37;#667eea" dur="10s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.5">
                        <animate attributeName="stop-color" values="#764ba2;#d4af37;#667eea;#764ba2" dur="10s" repeatCount="indefinite"/>
                    </stop>
                </linearGradient>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grad1)"/>
            
            <!-- Animated circles -->
            <circle cx="20%" cy="30%" r="50" fill="#d4af37" opacity="0.3">
                <animate attributeName="r" values="50;100;50" dur="8s" repeatCount="indefinite"/>
                <animate attributeName="cx" values="20%;25%;20%" dur="6s" repeatCount="indefinite"/>
            </circle>
            
            <circle cx="80%" cy="70%" r="70" fill="#c19a6b" opacity="0.2">
                <animate attributeName="r" values="70;120;70" dur="10s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="70%;75%;70%" dur="7s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Floating elements -->
            <path d="M1200,300 Q1220,280 1240,300 T1280,300" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.1">
                <animate attributeName="d" 
                    values="M1200,300 Q1220,280 1240,300 T1280,300;M1200,310 Q1220,290 1240,310 T1280,310;M1200,300 Q1220,280 1240,300 T1280,300" 
                    dur="5s" repeatCount="indefinite"/>
            </path>
        </svg>
    `;
}

// Fungsi untuk menambahkan efek typing pada teks
function applyTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach((element, index) => {
        // Reset untuk animasi ulang
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        element.setAttribute('data-original-text', originalText);
        element.textContent = '';
        element.style.width = '0';
        
        // Delay berdasarkan index
        setTimeout(() => {
            element.style.overflow = 'hidden';
            element.style.whiteSpace = 'nowrap';
            element.style.borderRight = '2px solid var(--primary)';
            element.textContent = originalText;
            
            // Animate typing
            const charCount = originalText.length;
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
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
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
            <div class="comment-item" data-aos="fade-up">
                <p style="text-align: center; color: rgba(255, 255, 255, 0.7); font-style: italic;">
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
            <div class="comment-item" data-aos="fade-up">
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
    
    // Inisialisasi efek typing
    applyTypingEffect();
});
