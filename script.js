// Inisialisasi AOS dengan durasi yang disesuaikan
AOS.init({
    duration: 800,
    once: true,
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
let isMusicPlaying = false;

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

// Load SVG Background
function loadSVGBackground() {
    fetch('animasi.svg')
        .then(response => response.text())
        .then(svgContent => {
            const svgContainer = document.getElementById('svg-background');
            svgContainer.innerHTML = svgContent;
            
            // Setelah SVG dimuat, atur opacity dan posisi
            const svgElement = svgContainer.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.opacity = '0.7';
            }
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            // Fallback jika SVG tidak ditemukan
            const svgContainer = document.getElementById('svg-background');
            svgContainer.innerHTML = `
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(212,175,55,0.1);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(139,115,85,0.05);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad1)" />
                    <circle cx="20%" cy="20%" r="100" fill="rgba(193,154,107,0.05)" />
                    <circle cx="80%" cy="30%" r="150" fill="rgba(212,175,55,0.05)" />
                    <circle cx="50%" cy="70%" r="120" fill="rgba(139,115,85,0.05)" />
                </svg>
            `;
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
                <p style="text-align: center; color: #777; font-style: italic;">
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
            <div class="comment-item" data-aos="fade-up" data-aos-duration="500">
                <p style="text-align: center; color: #777; font-style: italic;">
                    Belum ada ucapan. Jadilah yang pertama mengucapkan selamat!
                </p>
            </div>
        `);
        return;
    }
    
    comments.forEach(function(comment) {
        const commentHtml = `
            <div class="comment-item" data-aos="fade-up" data-aos-duration="500">
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

// Animasi teks typewriter
function animateTextElements() {
    $('.typewriter-text').each(function(index) {
        const element = $(this);
        const text = element.text();
        element.text('');
        
        // Delay berbeda untuk setiap elemen
        setTimeout(() => {
            let i = 0;
            const speed = 50; // ms per karakter
            
            function typeWriter() {
                if (i < text.length) {
                    element.text(element.text() + text.charAt(i));
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }
            
            typeWriter();
        }, index * 300);
    });
}

// Update SVG untuk section aktif
function updateSVGForActiveSection() {
    const sections = document.querySelectorAll('.section');
    const svgContainer = document.getElementById('svg-background');
    
    sections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Tambahkan efek transisi pada SVG
                    svgContainer.style.transition = 'opacity 0.8s ease';
                    svgContainer.style.opacity = '0.7';
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(section);
    });
}

// Set nama tamu dari URL
$(document).ready(function() {
    // Load SVG background
    loadSVGBackground();
    
    // Initialize Firebase
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
                <p style="text-align: center; color: #777; font-style: italic;">
                    Mode offline. Ucapan tidak dapat dimuat.
                </p>
            </div>
        `);
    });
    
    // Audio control
    var audio = document.getElementById('wedding-music');
    var musicToggle = document.getElementById('music-toggle');
    var spinIcon = document.querySelector('.spin-icon');
    
    // Fungsi untuk memutar musik
    function playMusic() {
        audio.play().then(function() {
            isMusicPlaying = true;
            spinIcon.style.animationPlayState = 'running';
        }).catch(function(error) {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Toggle musik
    musicToggle.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            isMusicPlaying = true;
            spinIcon.style.animationPlayState = 'running';
        } else {
            audio.pause();
            isMusicPlaying = false;
            spinIcon.style.animationPlayState = 'paused';
        }
    });
    
    // Tombol buka undangan
    $('#open-invitation').click(function() {
        // Sembunyikan cover section
        $('#cover').addClass('hidden');
        
        // Putar musik otomatis
        playMusic();
        
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
        
        // Trigger animasi teks setelah membuka undangan
        setTimeout(() => {
            animateTextElements();
        }, 1200);
    });
    
    // Cek jika undangan sudah dibuka sebelumnya
    if (sessionStorage.getItem('undanganDibuka') === 'true') {
        $('#cover').addClass('hidden');
        $('#bottom-nav').show();
        preventCoverScroll();
        
        // Putar musik jika sudah dibuka sebelumnya
        setTimeout(() => {
            playMusic();
        }, 500);
        
        // Trigger animasi teks
        setTimeout(() => {
            animateTextElements();
        }, 800);
    }
    
    // Bottom Navigation
    $('.nav-tab').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        
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
        
        // Animasi teks untuk section yang aktif
        setTimeout(() => {
            $('.typewriter-text').css('animation', 'none');
            setTimeout(() => {
                $('.typewriter-text').css('animation', '');
                animateTextElements();
            }, 10);
        }, 300);
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
    
    // Simpan ke kalender
    $('#save-combined-event').click(function() {
        var startDate = '20251221T090000';
        var endDate = '20251221T140000';
        var title = 'Akad Nikah & Resepsi Hartini & Ahmad Yazidul Jihad';
        var location = 'Kediaman Mempelai Wanita & Gedung Serba Guna, Jl. Merdeka No. 123, Jakarta Pusat';
        var details = 'Akad Nikah: 09:00 WIB\nResepsi: 11:00-14:00 WIB\n\nAcara pernikahan Hartini & Ahmad Yazidul Jihad';
        
        var googleCalendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + 
            encodeURIComponent(title) + '&dates=' + startDate + '/' + endDate + 
            '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(location);
        
        window.open(googleCalendarUrl, '_blank');
        showSuccessMessage('Acara pernikahan ditambahkan ke kalender');
    });
    
    // Buka Google Maps
    $('#open-map').click(function() {
        window.open('https://maps.app.goo.gl/PzdmwVSJc67DmowM7?g_st=ipc', '_blank');
        showSuccessMessage('Membuka lokasi di Google Maps');
    });
    
    // Salin nomor rekening dari card ATM
    $('.atm-copy-btn').click(function() {
        var accountNumber = $(this).data('account');
        copyToClipboard(accountNumber);
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
                
                // Refresh komentar
                displayCommentsFromFirebase();
            })
            .catch((error) => {
                console.error('Error saving comment:', error);
                showSuccessMessage('Gagal mengirim ucapan. Coba lagi.');
            });
    });
    
    // Deteksi scroll untuk mengaktifkan navigasi
    $(window).scroll(function() {
        var scrollPosition = $(window).scrollTop();
        var windowHeight = $(window).height();
        
        // Sembunyikan bottom nav di cover section (hanya jika cover belum dibuka)
        if (scrollPosition < windowHeight * 0.8 && !sessionStorage.getItem('undanganDibuka')) {
            $('#bottom-nav').fadeOut(300);
        } else {
            $('#bottom-nav').fadeIn(300);
        }
        
        $('.section').each(function() {
            var sectionId = $(this).attr('id');
            var sectionTop = $(this).offset().top - 100;
            var sectionBottom = sectionTop + $(this).outerHeight();
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom && sectionId !== 'cover') {
                $('.nav-tab').removeClass('active');
                $(`.nav-tab[href="#${sectionId}"]`).addClass('active');
            }
        });
    });
    
    // Sembunyikan bottom nav di awal (saat di cover dan belum dibuka)
    if (!sessionStorage.getItem('undanganDibuka')) {
        $('#bottom-nav').hide();
    }
    
    // Update SVG untuk section aktif
    updateSVGForActiveSection();
    
    // Responsive SVG
    function updateSVGResponsive() {
        const svgContainer = document.getElementById('svg-background');
        if (svgContainer && window.innerWidth < 768) {
            svgContainer.style.opacity = '0.5';
        } else if (svgContainer) {
            svgContainer.style.opacity = '0.7';
        }
    }
    
    window.addEventListener('resize', updateSVGResponsive);
    updateSVGResponsive();
});
