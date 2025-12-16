// Inisialisasi AOS dengan durasi yang disesuaikan
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

// Animasi teks slide dari kiri-kanan
function animateTextElements() {
    $('.text-animate').each(function(index) {
        $(this).css({
            'animation-delay': (index * 0.2) + 's'
        });
    });
}

// Transisi ajaib antar halaman
function performSectionTransition(targetSectionId) {
    const currentSection = $('.section:visible').first();
    const targetSection = $(`#${targetSectionId}`);
    
    // Efek fade out pada section saat ini
    currentSection.addClass('fade-out');
    
    setTimeout(() => {
        // Scroll ke section target
        $('html, body').animate({
            scrollTop: targetSection.offset().top
        }, 800);
        
        // Efek fade in pada section target
        targetSection.removeClass('fade-out').addClass('fade-in');
        
        // Animasi teks untuk section yang aktif
        setTimeout(() => {
            $('.text-animate').css('animation', 'none');
            setTimeout(() => {
                $('.text-animate').css('animation', '');
                animateTextElements();
            }, 10);
        }, 300);
    }, 500);
}

// Update ukuran SVG background
function updateSVGSize() {
    const svgContainer = document.getElementById('svg-background-container');
    const svgImage = document.getElementById('custom-svg-bg');
    
    if (svgContainer && svgImage) {
        // Pastikan SVG menutupi seluruh container
        svgImage.style.width = '100%';
        svgImage.style.height = '100%';
        svgImage.style.objectFit = 'cover';
        
        // Sesuaikan opacity berdasarkan ukuran layar
        if (window.innerWidth < 768) {
            svgImage.style.opacity = '0.9';
        } else {
            svgImage.style.opacity = '0.8';
        }
    }
}

// Main function
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
                <p style="text-align: center; color: #777; font-style: italic;">
                    Mode offline. Ucapan tidak dapat dimuat.
                </p>
            </div>
        `);
    });
    
    // Jalankan animasi teks
    animateTextElements();
    
    // Update SVG background
    updateSVGSize();
    
    // Audio dan musik player
    var audio = document.getElementById('wedding-music');
    var musicToggle = document.getElementById('music-toggle');
    var cassetteIcon = document.querySelector('.cassette-icon');
    
    // Autoplay musik saat tombol buka undangan ditekan
    $('#open-invitation').click(function() {
        // Putar musik otomatis
        audio.play().then(function() {
            // Mulai animasi putar kaset
            cassetteIcon.style.animationPlayState = 'running';
        }).catch(function(error) {
            console.log('Autoplay prevented:', error);
        });
    });
    
    // Toggle musik dengan animasi kaset
    musicToggle.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            cassetteIcon.style.animationPlayState = 'running';
        } else {
            audio.pause();
            cassetteIcon.style.animationPlayState = 'paused';
        }
    });
    
    // Tombol buka undangan
    $('#open-invitation').click(function() {
        // Sembunyikan cover section dengan animasi
        $('#cover').addClass('hidden');
        
        // Scroll ke section pembuka dengan transisi
        performSectionTransition('pembuka');
        
        // Tampilkan bottom navigation setelah membuka undangan
        setTimeout(() => {
            $('#bottom-nav').fadeIn(500);
        }, 800);
        
        // Set status bahwa undangan sudah dibuka
        sessionStorage.setItem('undanganDibuka', 'true');
    });
    
    // Cek jika undangan sudah dibuka sebelumnya
    if (sessionStorage.getItem('undanganDibuka') === 'true') {
        $('#cover').addClass('hidden');
        $('#bottom-nav').show();
        
        // Putar musik otomatis jika sudah dibuka sebelumnya
        audio.play().then(function() {
            cassetteIcon.style.animationPlayState = 'running';
        }).catch(function(error) {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Bottom Navigation dengan transisi ajaib
    $('.nav-tab').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href').substring(1);
        
        // Update active tab
        $('.nav-tab').removeClass('active');
        $(this).addClass('active');
        
        // Jalankan transisi antar section
        performSectionTransition(target);
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
        } else if (sessionStorage.getItem('undanganDibuka')) {
            $('#bottom-nav').fadeIn(300);
        }
        
        // Update active nav berdasarkan section yang terlihat
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
    
    // Event listener untuk resize window
    window.addEventListener('resize', updateSVGSize);
    
    // Animasi untuk elemen dengan AOS saat scroll
    $(window).on('load', function() {
        AOS.refresh();
    });
});
