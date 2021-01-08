import { getNavArrows } from './getNavArrow.js'
import { getNavDots } from './getNavDots.js'

export class SimpleSlider {
  constructor(selector, options) {
    this.$el = document.querySelector(selector);
    this.$mask = this.$el.firstElementChild;
    this.$band = this.$mask.firstElementChild;
    this.slideWidth = this.$band.firstElementChild.offsetWidth;
    this.quantitySlide = this.$band.children.length;
    this.counter = 1;
    this.$dots = null;
    this.initPosX = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.nextSwipeOffset = 0;
    this.prevSwipeOffset = 0;
    this.trfRegExp = /[-0-9.]+(?=px)/;
    this.options = options;
    this.init();
  }

  #createClones() {
    const $firstSlide = this.$band.firstElementChild.cloneNode(true);
    const $lastSlide = this.$band.lastElementChild.cloneNode(true);
    $firstSlide.id = 'firstSlide';
    $lastSlide.id = 'lastSlide';
    this.$band.append($firstSlide);
    this.$band.prepend($lastSlide);
  }

  #initialState() {
    this.$band.style.transform = `translateX(${-this.slideWidth * this.counter}px)`;
    const isNavArrow = this.options.navArrows ?? true;
    const isDots = this.options.dots ?? true;
    if (isNavArrow) {
      this.#insertArrow();
    }
    if (isDots) {
      this.#insertDots();
      this.$dots = this.$el.querySelectorAll(`.${this.options.dotClass || 'ss__dot'}`);
    }
    this.#setClasses();
  }

  #insertArrow() {
    const arrows = getNavArrows(this.options.prevArrowClass || 'ss__prev-arrow',
        this.options.nextArrowClass || 'ss__next-arrow',
        this.options.prevIconClass || 'ss__icon prev-icon',
        this.options.nextIconClass || 'ss__icon next-icon');
    this.$el.insertAdjacentHTML('beforeend', arrows);
  }

  #insertDots() {
    const dots = getNavDots(this.quantitySlide,
        this.options.dotsClass || 'ss__dots',
        this.options.dotClass || 'ss__dot');
    this.$el.insertAdjacentHTML('beforeend', dots);
  }

  #setClasses() {
    this.$el.classList.add(this.options.sliderClass || 'ss');
    this.$mask.classList.add(this.options.maskClass || 'ss__mask');
    this.$band.classList.add(this.options.bandClass || 'ss__band');
    for (const slide of this.$band.children) {
      slide.classList.add(this.options.slideClass || 'ss__slide');
    }
    if (this.$dots) {
      this.$dots[0].classList.add(this.options.dotActiveClass || 'ss__dot--active');
    }
  }

  #notTransition() {
    this.$band.style.transition = `none`;
    this.$band.style.transform = `translateX(${-this.slideWidth * this.counter}px)`;
  }

  resizableSlider() {
    this.slideWidth = this.$el.offsetWidth;
    this.#notTransition();
  }

  #setup() {
    const prevBtn = this.$el.querySelector(`.${this.options.prevArrowClass || 'ss__prev-arrow'}`)
    const nextBtn = this.$el.querySelector(`.${this.options.nextArrowClass || 'ss__next-arrow'}`)
    if (prevBtn) {
      this.prevSlide = this.prevSlide.bind(this);
      prevBtn.addEventListener('click', this.prevSlide);
    }
    if (nextBtn) {
      this.nextSlide = this.nextSlide.bind(this);
      nextBtn.addEventListener('click', this.nextSlide);
    }
    document.addEventListener('keydown', e => {
      const target = e.code;
      if (target === 'ArrowRight') {
        this.nextSlide();
      }
      if (target === 'ArrowLeft') {
        this.prevSlide();
      }
    });
    this.$mask.addEventListener('mousedown', e => this.#swipeStart(e));
    this.$mask.addEventListener('touchstart', e => this.#swipeStart(e));
    this.#switchSlideByDot();
    this.jumpBackToOriginalSlide = this.jumpBackToOriginalSlide.bind(this);
    this.$band.addEventListener('transitionend', this.jumpBackToOriginalSlide);
    this.resizableSlider = this.resizableSlider.bind(this)
    window.addEventListener('resize', this.resizableSlider)
  }

  #toggleDotStyle() {
    if (this.$dots) {
      this.$dots.forEach(dot => {
        dot.classList.remove(`${this.options.dotActiveClass || 'ss__dot--active'}`);
      });
      if (this.counter < 1) {
        this.$dots[this.$dots.length - 1].classList.add(`${this.options.dotActiveClass || 'ss__dot--active'}`);
      } else if (this.counter > this.quantitySlide) {
        this.$dots[0].classList.add(`${this.options.dotActiveClass || 'ss__dot--active'}`);
      } else {
        this.$dots[this.counter - 1].classList.add(`${this.options.dotActiveClass || 'ss__dot--active'}`);
      }
    }
  }

  #switchSlideByDot() {
    if (this.$dots) {
      this.$dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          this.counter = index + 1;
          this.#slideTranslate()
          this.#toggleDotStyle();
        });
      });
    }
  }

  #slideTranslate() {
    this.$band.style.transition = `transform ${this.options.transitionDuration || '0.4'}s ${this.options.transitionTimingFunction || 'ease-in-out'} ${this.options.transitionDelay || '0'}s`;
    this.$band.style.transform = `translateX(${-this.slideWidth * this.counter}px)`;
  }

  nextSlide() {
    if (this.counter >= this.$band.children.length - 1) return;
    this.counter++;
    this.#slideTranslate();
    this.#toggleDotStyle();
  }

  prevSlide() {
    if (this.counter <= 0) return;
    this.counter--;
    this.#slideTranslate();
    this.#toggleDotStyle();
  }

  jumpBackToOriginalSlide() {
    const currentSlide = this.$band.children[this.counter];
    if (currentSlide.id === 'lastSlide') {
      this.counter = this.$band.children.length - 2;
      this.#notTransition();
    }
    if (currentSlide.id === 'firstSlide') {
      this.counter = this.$band.children.length - this.counter;
      this.#notTransition();
    }
  }

  static getEvent(event) {
    return (event.type.search('touch') !== -1) ? event.touches[0] : event;
  }

  #swipeStart(e) {
    if (this.counter >= this.$band.children.length - 1 || this.counter <= 0) return;
    const evn = SimpleSlider.getEvent(e);
    this.initPosX = this.posX1 = evn.clientX;
    this.nextSwipeOffset = (this.counter + 1) * - this.slideWidth;
    this.prevSwipeOffset = (this.counter - 1) * - this.slideWidth;
    this.$band.style.transition = `none`;
    this.swipeEnd = this.swipeEnd.bind(this);
    this.swipeAction = this.swipeAction.bind(this);
    document.addEventListener('touchmove', this.swipeAction);
    document.addEventListener('touchend', this.swipeEnd);
    document.addEventListener('mousemove', this.swipeAction);
    document.addEventListener('mouseup', this.swipeEnd);
  }

  swipeAction(e) {
    const evn = SimpleSlider.getEvent(e);
    if (evn.type && evn.type === 'mousemove') {
      e.preventDefault();
    }
    const transformValueText = this.$band.style.transform;
    const transformValue = +transformValueText.match(this.trfRegExp)[0];
    this.posX2 = this.posX1 - evn.clientX;
    this.posX1 = evn.clientX;
    if (this.initPosX > this.posX1 && transformValue < this.nextSwipeOffset || this.initPosX < this.posX1 && transformValue > this.prevSwipeOffset) return;
    this.$band.style.transform = `translateX(${transformValue - this.posX2}px)`;
  }

  swipeEnd() {
    const finishPosition = this.initPosX - this.posX1;
    document.removeEventListener('touchmove', this.swipeAction);
    document.removeEventListener('touchend', this.swipeEnd);
    document.removeEventListener('mousemove', this.swipeAction);
    document.removeEventListener('mouseup', this.swipeEnd);
    if (Math.abs(finishPosition) > (this.slideWidth * (+this.options.shiftSlideForSwipe || 0.3))) {
      if (this.initPosX < this.posX1) {
        this.counter--;
      } else if (this.initPosX > this.posX1) {
        this.counter++;
      }
    }
    if (this.initPosX !== this.posX1) {
      this.#slideTranslate();
      this.#toggleDotStyle();
    }
  }

  init() {
    this.#createClones();
    this.#initialState();
    this.#setup();
  }
}