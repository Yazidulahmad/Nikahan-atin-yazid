// Inisialisasi AOS  
AOS.init({  
    duration: 800,  
    once: true,  
    offset: 50,  
    easing: 'ease-in-out'  
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
let currentSection = null;  
  
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
        // Fallback untuk browser lama  
        const textArea = document.createElement('textarea');  
        textArea.value = text;  
        document.body.appendChild(textArea);  
        textArea.select();  
        document.execCommand('copy');  
        document.body.removeChild(textArea);  
        showSuccessMessage('Nomor rekening berhasil disalin');  
    });  
}  
  
// Typewriter effect untuk elemen tertentu  
function initTypewriterEffect() {  
    const typewriterElements = document.querySelectorAll('.typewriter-text:not(.no-typewriter)');  
      
    typewriterElements.forEach((element, index) => {  
        const text = element.textContent;  
        element.textContent = '';  
        element.style.display = 'inline-block';  
          
        let i = 0;  
        function typeWriter() {  
            if (i < text.length) {  
                element.textContent += text.charAt(i);  
                i++;  
                setTimeout(typeWriter, 50 + Math.random() * 50); // Random delay untuk efek natural  
            } else {  
                element.style.borderRight = 'none';  
            }  
        }  
          
        // Delay antar elemen  
        setTimeout(() => {  
            typeWriter();  
        }, index * 500);  
    });  
}  
  
// Page transition magic effect  
function createPageTransition() {  
    const transition = document.createElement('div');  
    transition.className = 'page-transition';  
    document.body.appendChild(transition);  
    return transition;  
}  
  
function showPageTransition(callback) {  
    const transition = document.querySelector('.page-transition') || createPageTransition();  
    transition.classList.add('active');  
      
    setTimeout(() => {  
        if (callback) callback();  
        setTimeout(() => {  
            transition.classList.remove('active');  
        }, 300);  
    }, 500);  
}  
  
// Update overlay berdasarkan section aktif  
function updateSectionOverlay(sectionId) {  
    const overlays = document.querySelectorAll('.section-overlay');  
    overlays.forEach(overlay => {  
        overlay.classList.remove('active');  
        if (overlay.id.includes(sectionId)) {  
            overlay.classList.add('active');  
        }  
    });  
      
    // Update section active class  
    document.querySelectorAll('.section').forEach(section => {  
        section.classList.remove('active');  
        if (section.id === sectionId || sectionId === 'cover') {  
            section.classList.add('active');  
        }  
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
          
        comments.sort((a, b) => b.timestamp - a.timestamp);  
        displayComments(comments);  
    }, (error) => {  
        console.error('Error loading comments:', error);  
        $('#comments-container').html(`  
            <div class="comment-item">  
                <p style="text-align: center; color: var(--secondary); font-style: italic; font-family: 'Open Sans', sans-serif;">  
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
                <p style="text-align: center; color: var(--secondary); font-style: italic; font-family: 'Open Sans', sans-serif;">  
                    Belum ada ucapan. Jadilah yang pertama mengucapkan selamat!  
                </p>  
            </div>  
        `);  
        return;  
    }  
      
    comments.forEach(function(comment, index) {  
        const commentHtml = `  
            <div class="comment-item" data-aos="fade-up" data-aos-duration="500" data-aos-delay="${index * 100}">  
                <div class="comment-header">  
                    <span class="comment-name">${comment.name}</span>  
                    <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>  
                </div>  
                <p>${comment.message}</p>  
            </div>  
        `;  
        commentsContainer.append(commentHtml);  
    });  
      
    // Reinit AOS untuk komentar baru  
    AOS.refresh();  
}  
  
// Musik control dengan cassette dan rotating circle  
function initializeMusicControl() {  
    const audio = document.getElementById('wedding-music');  
    const musicToggle = document.getElementById('music-toggle');  
    const musicControl = document.getElementById('music-control');  
    const musicIcon = musicControl.querySelector('i');  
      
    // Fungsi play/pause  
    function toggleMusic() {  
        if (audio.paused) {  
            audio.play().then(() => {  
                isMusicPlaying = true;  
                musicControl.classList.add('playing');  
                musicIcon.style.transform = 'scale(0.9)';  
                showSuccessMessage('Musik diputar');  
            }).catch(error => {  
                console.log('Autoplay prevented:', error);  
                showSuccessMessage('Silakan klik untuk memutar musik');  
            });  
        } else {  
            audio.pause();  
            isMusicPlaying = false;  
            musicControl.classList.remove('playing');  
            musicIcon.style.transform = 'scale(1)';  
            showSuccessMessage('Musik dijeda');  
        }  
    }  
      
    // Event listeners  
    musicToggle.addEventListener('click', toggleMusic);  
    musicControl.addEventListener('click', toggleMusic);  
      
    // Auto play saat undangan dibuka  
    function autoPlayMusic() {  
        if (sessionStorage.getItem('undanganDibuka') === 'true') {  
            audio.play().catch(() => {  
                // Silent fail for autoplay policy  
            });  
        }  
    }  
      
    // Initial state  
    audio.volume = 0.3;  
      
    return { audio, toggleMusic, autoPlayMusic };  
}  
  
// Smooth scroll dengan transition  
function smoothScrollTo(target, duration = 800) {  
    showPageTransition(() => {  
        $('html, body').animate({  
            scrollTop: $(target).offset().top - 20  
        }, duration, 'swing', () => {  
            updateSectionOverlay(target.replace('#', ''));  
        });  
    });  
}  
  
// Update active navigation  
function updateActiveNavigation() {  
    const scrollPosition = $(window).scrollTop() + 100;  
      
    $('.nav-tab').each(function() {  
        const target = $(this).attr('href');  
        const section = $(target);  
          
        if (section.length > 0) {  
            const sectionTop = section.offset().top;  
            const sectionHeight = section.outerHeight();  
              
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {  
                $('.nav-tab').removeClass('active');  
                $(this).addClass('active');  
                return false;  
            }  
        }  
    });  
}  
  
// Initialize all functionality  
$(document).ready(function() {  
    // Initialize Firebase  
    initializeFirebase().then(() => {  
        console.log('Firebase initialized successfully');  
          
        // Set nama tamu  
        currentGuestName = getUrlParameter('to');  
        if (currentGuestName) {  
            $('#guest-name').text('Kepada Yth. ' + currentGuestName);  
        }  
          
        // Load comments  
        displayCommentsFromFirebase();  
          
    }).catch(error => {  
        console.error('Firebase initialization failed:', error);  
        $('#comments-container').html(`  
            <div class="comment-item">  
                <p style="text-align: center; color: var(--secondary); font-style: italic; font-family: 'Open Sans', sans-serif;">  
                    Mode offline. Ucapan tidak dapat dimuat.  
                </p>  
            </div>  
        `);  
    });  
      
    // Initialize music  
    const music = initializeMusicControl();  
      
    // Initialize typewriter effect  
    setTimeout(() => {  
        initTypewriterEffect();  
    }, 1000);  
      
    // Initial overlay  
    updateSectionOverlay('cover');  
      
    // Tombol buka undangan  
    $('#open-invitation').click(function(e) {  
        e.preventDefault();  
          
        // Page transition  
        showPageTransition(() => {  
            // Hide cover  
            $('#cover').addClass('hidden');  
              
            // Show music player  
            $('.music-player').addClass('show');  
              
            // Auto play music  
            music.autoPlayMusic();  
              
            // Scroll to pembuka  
            smoothScrollTo('#pembuka', 1200);  
              
            // Hide guest name  
            $('#guest-name').fadeOut(800);  
              
            // Show bottom navigation  
            setTimeout(() => {  
                $('#bottom-nav').fadeIn(500);  
            }, 1200);  
              
            // Prevent scroll to cover  
            preventCoverScroll();  
              
            // Set session storage  
            sessionStorage.setItem('undanganDibuka', 'true');  
              
            // Update overlay  
            updateSectionOverlay('pembuka');  
        });  
    });  
      
    // Check if invitation was already opened  
    if (sessionStorage.getItem('undanganDibuka') === 'true') {  
        $('#cover').addClass('hidden');  
        $('#bottom-nav').show();  
        $('.music-player').addClass('show');  
        preventCoverScroll();  
        updateSectionOverlay('pembuka');  
          
        // Auto play music  
        music.autoPlayMusic();  
          
        // Init typewriter  
        setTimeout(() => {  
            initTypewriterEffect();  
        }, 500);  
    }  
      
    // Bottom navigation  
    $('.nav-tab').click(function(e) {  
        e.preventDefault();  
        const target = $(this).attr('href');  
          
        // Prevent navigation to cover if opened  
        if (target === '#cover' && sessionStorage.getItem('undanganDibuka') === 'true') {  
            return;  
        }  
          
        // Smooth scroll with transition  
        smoothScrollTo(target, 800);  
          
        // Update active tab  
        $('.nav-tab').removeClass('active');  
        $(this).addClass('active');  
          
        // Update current section  
        currentSection = target.replace('#', '');  
    });  
      
    // Scroll event untuk navigation dan overlay  
    $(window).scroll(function() {  
        updateActiveNavigation();  
          
        // Hide/show bottom nav based on position  
        const scrollPosition = $(this).scrollTop();  
        const windowHeight = $(this).height();  
          
        if (scrollPosition < windowHeight * 0.5 && !sessionStorage.getItem('undanganDibuka')) {  
            $('#bottom-nav').fadeOut(300);  
        } else {  
            if (sessionStorage.getItem('undanganDibuka') === 'true') {  
                $('#bottom-nav').fadeIn(300);  
            }  
        }  
          
        // Update overlay based on scroll position  
        let activeSection = 'pembuka';  
        const sections = ['pembuka', 'detail-pengantin', 'detail-acara', 'penutup', 'amplop-digital', 'ucapan'];  
          
        sections.forEach(sectionId => {  
            const section = document.getElementById(sectionId);  
            if (section) {  
                const rect = section.getBoundingClientRect();  
                if (rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4) {  
                    activeSection = sectionId;  
                }  
            }  
        });  
          
        updateSectionOverlay(activeSection);  
    });  
      
    // Countdown timer  
    function updateCountdown() {  
        const weddingDate = new Date('December 21, 2025 09:00:00').getTime();  
        const now = new Date().getTime();  
        const distance = weddingDate - now;  
          
        if (distance > 0) {  
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));  
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));  
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));  
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);  
              
            $('#days').text(days.toString().padStart(2, '0'));  
            $('#hours').text(hours.toString().padStart(2, '0'));  
            $('#minutes').text(minutes.toString().padStart(2, '0'));  
            $('#seconds').text(seconds.toString().padStart(2, '0'));  
              
            // Add pulsing effect when < 1 hour  
            if (hours === 0 && minutes < 60) {  
                $('.countdown-number').addClass('pulse');  
            } else {  
                $('.countdown-number').removeClass('pulse');  
            }  
        } else {  
            $('.countdown-container').html(`  
                <div style="font-family: 'Open Sans', sans-serif; font-size: 1.5rem; color: var(--primary);">  
                    Acara sedang berlangsung! Selamat kepada pasangan baru! 💍✨  
                </div>  
            `);  
        }  
    }  
      
    setInterval(updateCountdown, 1000);  
    updateCountdown();  
      
    // Simpan ke kalender  
    $('#save-combined-event').click(function() {  
        const startDate = '20251221T090000';  
        const endDate = '20251221T140000';  
        const title = 'Akad Nikah & Resepsi Hartini & Ahmad Yazidul Jihad';  
        const location = 'Kediaman Mempelai Wanita & Gedung Serba Guna, Jl. Merdeka No. 123, Jakarta Pusat';  
        const details = 'Akad Nikah: 09:00 WIB\nResepsi: 11:00-14:00 WIB\n\nAcara pernikahan Hartini & Ahmad Yazidul Jihad\n\nKami mengundang kehadiran Anda untuk merayakan momen bahagia ini.';  
          
        const googleCalendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +   
            encodeURIComponent(title) + '&dates=' + startDate + '/' + endDate +   
            '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(location) +  
            '&sf=true&output=xml';  
          
        window.open(googleCalendarUrl, '_blank');  
        showSuccessMessage('Acara pernikahan ditambahkan ke kalender Google');  
    });  
      
    // Buka Google Maps  
    $('#open-map').click(function() {  
        window.open('https://maps.app.goo.gl/PzdmwVSJc67DmowM7?g_st=ipc', '_blank');  
        showSuccessMessage('Membuka lokasi acara di Google Maps');  
    });  
      
    // Copy rekening  
    $(document).on('click', '.atm-copy-btn', function() {  
        const accountNumber = $(this).data('account');  
        copyToClipboard(accountNumber);  
    });  
      
    // Submit komentar  
    $('#submit-comment').click(function() {  
        const message = $('#comment-message').val().trim();  
          
        if (!message) {  
            showSuccessMessage('Harap isi pesan ucapan Anda');  
            $('#comment-message').focus();  
            return;  
        }  
          
        if (message.length < 3) {  
            showSuccessMessage('Pesan ucapan terlalu pendek (minimal 3 karakter)');  
            return;  
        }  
          
        if (message.length > 500) {  
            showSuccessMessage('Pesan ucapan terlalu panjang (maksimal 500 karakter)');  
            return;  
        }  
          
        const name = currentGuestName || 'Tamu Undangan';  
          
        const comment = {  
            name: name,  
            message: message,  
            timestamp: Date.now()  
        };  
          
        // Disable button sementara  
        const btn = $(this);  
        const originalText = btn.html();  
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Mengirim...');  
          
        saveCommentToFirebase(comment)  
            .then(() => {  
                // Reset form  
                $('#comment-message').val('');  
                  
                // Success message  
                showSuccessMessage('Ucapan Anda berhasil terkirim! Terima kasih 🙏');  
                  
                // Refresh comments  
                displayCommentsFromFirebase();  
                  
                // Re-enable button  
                btn.prop('disabled', false).html(originalText);  
            })  
            .catch((error) => {  
                console.error('Error saving comment:', error);  
                showSuccessMessage('Gagal mengirim ucapan. Silakan coba lagi.');  
                  
                // Re-enable button  
                btn.prop('disabled', false).html(originalText);  
            });  
    });  
      
    // Enter key untuk submit komentar  
    $('#comment-message').keypress(function(e) {  
        if (e.which === 13 && !e.shiftKey) {  
            e.preventDefault();  
            $('#submit-comment').click();  
        }  
    });  
      
    // Responsive SVG background  
    function updateSVGBackground() {  
        const svgContainer = document.getElementById('svg-background-container');  
        if (svgContainer && window.innerWidth >= 768) {  
            svgContainer.style.opacity = '1';  
        } else if (svgContainer) {  
            svgContainer.style.opacity = '0.8';  
        }  
    }  
      
    // Event listeners untuk responsive  
    window.addEventListener('resize', () => {  
        updateSVGBackground();  
        updateActiveNavigation();  
    });  
      
    // Initial call  
    updateSVGBackground();  
      
    // Hide bottom nav initially if not opened  
    if (!sessionStorage.getItem('undanganDibuka')) {  
        $('#bottom-nav').hide();  
    }  
      
    // Add pulse animation for CSS  
    const style = document.createElement('style');  
    style.textContent = `  
        @keyframes pulse {  
            0%, 100% { transform: scale(1); }  
            50% { transform: scale(1.05); }  
        }  
        .pulse {  
            animation: pulse 2s infinite;  
        }  
    `;  
    document.head.appendChild(style);  
      
    // Performance optimization - throttle scroll events  
    let ticking = false;  
    function updateOnScroll() {  
        if (!ticking) {  
            requestAnimationFrame(() => {  
                $(window).trigger('scroll');  
                ticking = false;  
            });  
            ticking = true;  
        }  
    }  
      
    $(window).on('scroll', updateOnScroll);  
      
    console.log('🎉 Wedding invitation fully initialized!');  
});  
  
// Preload fonts untuk performa lebih baik  
function preloadFonts() {  
    const link = document.createElement('link');  
    link.rel = 'preload';  
    link.href = 'https://fonts.googleapis.com/css2?family=Amoresa&family=TAN+Mon+Ch%C3%A9ri&family=Moontime&family=Open+Sans:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap';  
    link.as = 'style';  
    document.head.appendChild(link);  
}  
  
// Load fonts saat DOM ready  
$(document).ready(() => {  
    preloadFonts();  
});  
  
// Service Worker untuk PWA (optional)  
if ('serviceWorker' in navigator) {  
    window.addEventListener('load', () => {  
        navigator.serviceWorker.register('/sw.js').catch(err => {  
            console.log('Service Worker registration failed:', err);  
        });  
    });  
}  
