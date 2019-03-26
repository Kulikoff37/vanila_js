document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substr(1);
    const pageHeader = document.querySelector('.page_header');
    const showMoreLink = document.querySelector('.j_link_more');
    const showMoreContent = document.querySelector('.j_terms_more');

    const headroom = new Headroom(pageHeader, {
        offset: 80,
        classes: {
            pinned: 'slide--reset',
            unpinned: 'slide--up'
        }
    });

    if (hash.length) {
        const linkForModal = document.querySelector(
            '[data-target=' + hash + ']'
        );

        if (typeof linkForModal !== 'undefined' && linkForModal !== null) {
            linkForModal.click();
        }

        const formID = document.getElementById(hash);

        if (typeof formID !== 'undefined' && formID !== null) {
            formID.scrollIntoView();
        }
    }

    const bouncer = new Bouncer('[data-validate]', {
        disableSubmit: true,
        customValidations: {
            valueMismatch: function(field) {
                const selector = field.getAttribute('data-bouncer-match');
                if (!selector) return false;
                const otherField = field.form.querySelector(selector);
                if (!otherField) return false;
                return otherField.value !== field.value;
            }
        },
        messages: {
            missingValue: {
                default: 'Поле необходимо заполнить.'
            },
            patternMismatch: {
                email: 'Введите корректный email.'
            }
        }
    });

    headroom.init();

    showMoreLink.addEventListener('click', e => {
        e.preventDefault();
        showMoreLink.style.display = 'none';
        showMoreContent.style.maxHeight = '2000px';
        showMoreContent.style.overflow = 'visible';
    });

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    // questionnaire slider
    const pricesSlider = document.querySelector('#questionnaire_slider');
    const inputMin = document.querySelector('.js_slider_start');
    const inputMax = document.querySelector('.js_slider_end');
    const inputs = [inputMin, inputMax];

    noUiSlider.create(pricesSlider, {
        start: [1000000, 2280000],
        connect: true,
        step: 10000,
        margin: 100000,
        tooltips: [true, wNumb({
            decimals: 0,
            thousand: ' ',
            suffix: ' ₽'
        })],
        range: {
            'min': [700000],
            'max': [3600000]
        },
        format: wNumb({
            decimals: 0,
            thousand: ' ',
            suffix: ' ₽'
        })
    });

    pricesSlider.noUiSlider.on('update', function (values, handle) {
        inputs[handle].value = values[handle];
    });

    inputs.forEach(function (input, handle) {

        input.addEventListener('change', function () {
            pricesSlider.noUiSlider.setHandle(handle, this.value);
        });

        input.addEventListener('keydown', function (e) {

            const values = pricesSlider.noUiSlider.get();
            let value = Number(values[handle]);
            const steps = pricesSlider.noUiSlider.steps();
            let step = steps[handle];
            let position;

            switch (e.which) {
                case 13:
                    pricesSlider.noUiSlider.setHandle(handle, this.value);
                    break;
                case 38:
                    position = step[1];
                    if (position === false) {
                        position = 1;
                    }
                    if (position !== null) {
                        pricesSlider.noUiSlider.setHandle(handle, value + position);
                    }
                    break;
                case 40:
                    position = step[0];
                    if (position === false) {
                        position = 1;
                    }
                    if (position !== null) {
                        pricesSlider.noUiSlider.setHandle(handle, value - position);
                    }
                    break;
            }
        });
    });

    // questionnaire steps
    let currentStep = 0;
    const btnNext = document.querySelector('.j_next');
    const btnPrev = document.querySelector('.j_prev');

    showStep(currentStep);

    function showStep(n) {
        const steps = document.getElementsByClassName('questionnaire_tab');

        steps[n].style.display = 'block';

        if (n === 0) {
            btnPrev.style.display='none';   
        } else {
            btnPrev.style.display='inline';
        }

        if ( n === (steps.length - 1)) {
            btnNext.innerHTML = 'Отправить';
            btnNext.setAttribute('type', 'submit');
        } else {
            btnNext.innerHTML = 'Продолжить';
            btnNext.setAttribute('type', 'button');
        }
        
        updateStepIndicator(n);
    }
    
    function nextPrev(n) {
        const steps = document.getElementsByClassName('questionnaire_tab');

        
        if ( n === 1 && !validateForm()) return false;

        steps[currentStep].style.display = 'none';

        currentStep = currentStep + n;

        const btnSubmit = document.querySelector('.j_form_questionnaire').querySelector('.j_submit');
        btnSubmit.removeAttribute('disabled');

        if ( currentStep >= steps.length) {
            const stepsIndicator = document.querySelector('.questionnaire_steps');
            stepsIndicator.classList.add('is_hide');
            const userNameValue = document.querySelector('.j_user_name_value').value;
            const userName = document.querySelector('.j_user_name');

            userName.innerHTML = userNameValue;

            return false;
        }

        showStep(currentStep);
    }
    
    function validateForm() {
        let valid = true;
        const indicators = document.getElementsByClassName('questionnaire_steps__item');
        let currentIndicator = indicators[currentStep];

        if (currentStep > 1) {
            const fieldset = document.querySelector('.questionnaire_fieldset--personal');
            const form = new Bouncer();
            const areValid = form.validateAll(fieldset);

            valid = !areValid.length;
        }

        if (valid && !hasClass(currentIndicator, 'is_step_done')) {
            currentIndicator.className += ' is_step_done';
        }

        if (currentStep > 1) {
            const header = document.querySelector('.j_questionnaire_header');
            header.classList.add('is_questionnaire_header_active');
        }

        return valid;
    }

    function updateStepIndicator(n) {
        let i;
        const indicators = document.getElementsByClassName('questionnaire_steps__item');

        for (i = 0; i < indicators.length; i++) {
            indicators[i].className = indicators[i].className.replace(' is_step_active', '');
        }

        if (!hasClass(indicators[n].className, 'is_step_active')) {
            indicators[n].className += ' is_step_active';
        }
    }

    btnNext.addEventListener('click', function() {
        nextPrev(1);
    });

    btnPrev.addEventListener('click', function() {
        nextPrev(-1);
    });
});

document.addEventListener('click', function(e) {
    e = e || window.event;
    const target = e.target || e.srcElement;
    const html = document.querySelector('html');

    if (target.hasAttribute('data-toggle') && target.getAttribute('data-toggle') === 'modal') {
        e.preventDefault();
        if (target.hasAttribute('data-target')) {

            const modal_ID = target.getAttribute('data-target');

            window.fordLanding.openModal(modal_ID);
        }
    }

    if ((target.hasAttribute('data-dismiss') && target.getAttribute('data-dismiss') === 'modal') || target.classList.contains('modal')) {
        let modal = document.querySelector('.modal.is_open');

        modal.classList.remove('is_open');
        html.classList.remove('modal_opened');

        window.location.hash = '';
    }

    if ( target.classList.contains('j_office__link')) {
        e.preventDefault();
        const officeParent = target.parentNode;
        officeParent.classList.toggle('is_open');
    }
});

document.addEventListener('bouncerFormValid', function(e) {
    const form = e.target;
    const action = form.getAttribute('action');
    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            form.classList.add('is_hide');
            form.nextElementSibling.classList.add('is_active');
        }
    };

    xhr.open('POST', action, true);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-CSRF-TOKEN", document.head.querySelector("meta[name='csrf-token']").content);
    xhr.send(formData);

    // for (let pair of formData.entries()) {
    //     console.log(pair[0]+ ', ' + pair[1]);
    // }

    e.preventDefault();
}, false);

document.addEventListener('bouncerShowError', function(e) {
    const form = e.target.closest('form');
    const btnSubmit = form.querySelector('.j_submit');

    if (btnSubmit.getAttribute('type') === 'submit') {
        btnSubmit.setAttribute('disabled', 'disabled');
    }
}, false);

document.addEventListener('bouncerRemoveError', function(e) {
    const form = e.target.closest('form');
    const btnSubmit = form.querySelector('.j_submit');
    const errors = form.querySelectorAll('.error');
    if (!errors.length) {
        btnSubmit.removeAttribute('disabled');
    }
}, false);


// smooth scroll to anchor

const anchors = [].slice.call(document.querySelectorAll('a[href*="#"]')),
    animationTime = 500,
    framesCount = 20;

anchors.forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        let coordY = document.querySelector(item.getAttribute('href')).getBoundingClientRect().top;
        let scroller = setInterval(function() {
            let scrollBy = coordY / framesCount;
            if(scrollBy > window.pageYOffset - coordY && window.innerHeight + window.pageYOffset < document.body.offsetHeight) {
                window.scrollBy(0, scrollBy);
            } else {
                window.scrollTo(0, coordY);
                clearInterval(scroller);
            }
        }, animationTime / framesCount);
    });
});