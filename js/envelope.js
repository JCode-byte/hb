document.addEventListener('DOMContentLoaded', () => {

    function showEnvelope() {
        const pageSources = document.querySelectorAll('.letter-content-source .page-content');
        if (pageSources.length === 0) return;

        let currentPage = 0;
        const totalPages = pageSources.length;
        let isSwiping = false;
        let startX = 0;
        let currentTranslate = 0;

        const envelopeWrapper = document.createElement('div');
        envelopeWrapper.className = 'envelope-wrapper';
        const envelope = document.createElement('div');
        envelope.className = 'envelope';
        const flap = document.createElement('div');
        flap.className = 'flap';
        const front = document.createElement('div');
        front.className = 'front';
        const back = document.createElement('div');
        back.className = 'back';
        const letterViewport = document.createElement('div');
        letterViewport.className = 'letter-viewport';
        const letterTrack = document.createElement('div');
        letterTrack.className = 'letter-track';
        const navDots = document.createElement('div');
        navDots.className = 'nav-dots';
        const instruction = document.createElement('div');
        instruction.className = 'instruction-letter';
        instruction.textContent = 'Tap the letter to open';

        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'letter-page';
            page.appendChild(pageSources[i]);
            letterTrack.appendChild(page);

            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', (e) => { e.stopPropagation(); goToPage(i); });
            navDots.appendChild(dot);
        }

        letterViewport.appendChild(letterTrack);
        envelope.appendChild(back);
        envelope.appendChild(front);
        envelope.appendChild(flap);
        
        // This is the key fix: Assemble as SIBLINGS, not parent-child
        envelopeWrapper.appendChild(letterViewport); 
        envelopeWrapper.appendChild(envelope);
        envelopeWrapper.appendChild(instruction);
        envelopeWrapper.appendChild(navDots);
        
        document.body.appendChild(envelopeWrapper);

        function goToPage(pageIndex) {
            if (pageIndex < 0 || pageIndex >= totalPages) return;
            currentPage = pageIndex;
            const letterWidth = letterViewport.getBoundingClientRect().width;
            currentTranslate = -currentPage * letterWidth;
            letterTrack.style.transform = `translateX(${currentTranslate}px)`;
            navDots.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentPage);
            });
        }

        const handleSwipeStart = (e) => { isSwiping = true; startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; letterTrack.style.transition = 'none'; };
        const handleSwipeMove = (e) => { if (!isSwiping) return; const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; const diff = currentX - startX; letterTrack.style.transform = `translateX(${currentTranslate + diff}px)`; };
        const handleSwipeEnd = (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            letterTrack.style.transition = 'transform 0.4s ease-out';
            const diff = (e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX) - startX;
            if (Math.abs(diff) > 50) {
                if (diff < 0 && currentPage < totalPages - 1) { // Swipe Left for Next
                    goToPage(currentPage + 1);
                } else if (diff > 0 && currentPage > 0) { // Swipe Right for Previous
                    goToPage(currentPage - 1);
                } else {
                    goToPage(currentPage);
                }
            } else {
                goToPage(currentPage);
            }
        };
        
        letterViewport.addEventListener('mousedown', handleSwipeStart);
        letterViewport.addEventListener('mousemove', handleSwipeMove);
        letterViewport.addEventListener('mouseup', handleSwipeEnd);
        letterViewport.addEventListener('mouseleave', handleSwipeEnd);
        letterViewport.addEventListener('touchstart', handleSwipeStart);
        letterViewport.addEventListener('touchmove', handleSwipeMove);
        letterViewport.addEventListener('touchend', handleSwipeEnd);

        envelopeWrapper.addEventListener('click', () => {
            if (!envelopeWrapper.classList.contains('open')) {
                envelopeWrapper.classList.add('open');
            }
        });

        setTimeout(() => envelopeWrapper.classList.add('visible'), 100);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class' && document.body.classList.contains('blown-out')) {
                const cakeContainer = document.querySelector('.cake-container');
                cakeContainer.style.transition = 'transform 1s ease-in';
                cakeContainer.style.transform = 'translateY(150vh)';
                setTimeout(showEnvelope, 1000); 
                observer.disconnect();
            }
        });
    });
    observer.observe(document.body, { attributes: true });
});