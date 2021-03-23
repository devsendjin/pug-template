class StepByStepAnimation {
	constructor() {
		this.steps = []
	}
	addStep(cb, timeout) {
		this.steps.push({ cb, timeout })
		return this
	}
	run() {
		this.steps.reduce((p, step) => {
			return p.then(() => new Promise(resolve => {
				setTimeout(() => {
					step.cb()
					resolve()
				}, step.timeout)
			}))
		}, Promise.resolve())
	}
}

class Utils {
	// static MOBILE_MAX_WIDTH = 768
	static ANIMATION_STEP = 150
	static pageScrollState = null
	static scrollBlocksAnimation = null
	static emailRegExp = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	static phoneInputFilterRegExp = /[\d+() -]/

	static init() {
		this.polyfills()
		// this.scrollBlocksAnimation.init()
		this.throttledEvent('resize', 'optimizedResize')

		this.pageScrollState = this.initPageScrollState()
		this.scrollBlocksAnimation = this.initScrollBlocksAnimation()

		window.windowWidth = this.getWindowWidth()
		window.addEventListener('optimizedResize', () => {
			window.windowWidth = this.getWindowWidth()
		})
	}

	static initPageScrollState() {
		let pageScrollPosition = 0
		const fix = () => {
			if (!document.body.parentElement.classList.contains('fixed')) {
				pageScrollPosition = window.scrollY
				document.body.parentNode.classList.add('fixed')
				document.body.scrollTop = pageScrollPosition
			}
		}
		const unfix = () => {
			if (document.body.parentElement.classList.contains('fixed')) {
				document.body.parentNode.classList.remove('fixed')
				window.scrollTo(0, pageScrollPosition)
			}
		}
		const toggle = () => {
			document.body.parentNode.classList.contains('fixed') ? unfix() : fix()
		}
		const set = (position) => {
			window.scrollTo(0, position)
		}
		return {
			fix,
			unfix,
			toggle,
			set,
		}
	}

	static initScrollBlocksAnimation() {
		let scrollAnimatedBlocks

		const setupData = () => {
			scrollAnimatedBlocks = querySelectorAsArray('.animate-on-scroll')
		}

		const run = () => {
			let offset = window.innerHeight * 0.8
			//переменная для хранения индексов елементов во viewport
			let blockIndex = 0

			//задержка между анимированием елементов
			let animationDuration = this.ANIMATION_STEP

			// if(scrollAnimatedBlocks.length === 0) return
			scrollAnimatedBlocks.forEach(block => {
				if (block.classList.contains('animated')) return

				if (block.dataset.startAnimationOffsetCoefficient) {
					offset = window.innerHeight * block.dataset.startAnimationOffsetCoefficient
				}
				const blockRect = block.getBoundingClientRect()
				if (blockRect.top < 0 && blockRect.top < -blockRect.height || !isVisible(block)) return
				if (blockRect.top - offset < 0) { //если в пределах veiwport
					setTimeout(function() {
						if (block.dataset.animationCallBack) {
							window[block.dataset.animationCallBack]()
						} else {
							if (!block.classList.contains('do-not-add-class-animated')) {
								block.classList.add('animated')
							}

							if (block.classList.contains('animate-by-elements')) {
								animateElements(block.querySelectorAll('.block-animation-element'), block.dataset.animationDuration)
							}

							//если у елемента задан класс"animate-el-by-el", анимируем поштучно каждый такой елемент
							if (block.classList.contains('animate-el-by-el')) {
								//если елемент содержит данный класс, анимируем его вместе с предидущим,
								if (!block.classList.contains('animate-with-prev-element')) {
									++blockIndex
								}
								if (block.dataset.animationDuration) {
									animationDuration = block.dataset.animationDuration
								}

								setTimeout(() => {
									block.classList.remove('unanimated')
									block.classList.add('animated')
								}, animationDuration * blockIndex)
							}
						}
					}, Convert.toIntOrZero(block.dataset.animationDelay))
				}
			})
			scrollAnimatedBlocks = scrollAnimatedBlocks.filter(block => !block.classList.contains('animated'))
		}

		const refresh = () => {
			setupData()
			run()
		}

		const init = () => {
			setupData()
			if (!scrollAnimatedBlocks) return
			run()
			window.addEventListener('scroll', run, scrollEventListenerThirdArgument)
			window.addEventListener('resize', run)
		}

		return {
			init,
			refresh,
		}
	}

	static polyfills() {
		if (!Element.prototype.matches)
			Element.prototype.matches = Element.prototype.msMatchesSelector ||
			Element.prototype.webkitMatchesSelector

		if (!Element.prototype.closest) {
			Element.prototype.closest = function(s) {
				let el = this
				if (!document.documentElement.contains(el)) return null
				do {
					if (el.matches(s)) return el
					el = el.parentElement || el.parentNode
				} while (el !== null && el.nodeType === 1)
				return null
			}
		}
	}

	static passiveScrollEventListener() {
		let scrollEventListenerThirdArgument = false;
    (() => {
			try {
				let options = Object.defineProperty({}, "passive", {
					get: () => {
						scrollEventListenerThirdArgument = { passive: true }
					}
				})
				window.addEventListener("test", null, options)
			} catch (err) {}
		})()
	}

	static convert() {
		return {
			nodeListToArray: nodeList => Array.prototype.slice.call(nodeList),
			toIntOrZero: val => parseInt(val) || 0,
			toFloatOrZero: val => parseFloat(val) || 0
		}
	}

	static querySelectorAsArray(selector, context = document) {
		return Array.prototype.slice.call(context.querySelectorAll(selector))
	}

	static on(elements, event, callback) {
		if (typeof elements === 'string') {
			elements = querySelectorAsArray(elements)
		} else if (elements instanceof NodeList) {
			elements = Array.prototype.slice.call(elements)
		}
		elements.forEach(function(item) {
			item.addEventListener(event, callback)
		})
	}

	static emailValid(email) {
		return this.emailRegExp.test(email)
	}

	static isInputFilled(input) { return input.value !== '' }

	static isInputValid(input) {
		if (input.type.toLowerCase() === "email") {
			return input.value !== '' && this.emailRegExp.test(input.value)
		} else {
			return input.value !== '' && input.validity.valid
		}
	}

	static setupPhoneInputFilter() {
		this.on('input[type="tel"]', 'keypress', (e) => {
			const target = e.target

			if (target.value.length > 17) {
				target.value = target.value.substr(0, 16)
				return false
			}

			if (target.tagName.toUpperCase() === 'INPUT') {
				const code = e.which
				if (code < 32 || e.ctrlKey || e.altKey) return true

				const char = String.fromCharCode(code)
				if (!this.phoneInputFilterRegExp.test(char)) {
					e.preventDefault()
					return false
				}
			}
			return true
		})
	}

	static scrollToElement(element, duration = 1000) {
		if (typeof element === 'string') {
			element = document.querySelector(element)
		}
		let endScrollPosition = element.offsetTop
		while (element.tagName.toLowerCase() !== 'body') {
			element = element.parentElement
			endScrollPosition += element.offsetTop
		}
		const startScrollPosition = window.scrollY
		const start = performance.now()

		const scrollStep = (endScrollPosition - startScrollPosition) / duration
		let currentScrollPosition

		requestAnimationFrame(function doScrollStep(time) {
			let timePassed = time - start
			if (timePassed > duration) timePassed = duration

			if (timePassed === duration) {
				currentScrollPosition = endScrollPosition
			} else {
				currentScrollPosition = startScrollPosition + scrollStep * timePassed
			}
			window.scrollTo(0, currentScrollPosition)

			if (timePassed < duration) {
				requestAnimationFrame(doScrollStep)
			}
		})
	}

	/**
	 * @param elements
	 *   массив или массивоподобный объект с элементами для анимации
	 *
	 * @param animationStep {integer}
	 *   задержка между стартами анимации элементов
	 *
	 * Элемент с классом animate-with-prev-element будет анимироваться вместе с предидущим
	 * @param removeClass {boolean}
	 * @param className {string}
	 **/
	static animateElements(elements, animationStep = this.ANIMATION_STEP, removeClass = false, className = 'animated') {
		let index = 0

		Array.prototype.forEach.call(elements, item => {
			if (item.classList.contains(className) && !removeClass) return
			if (!item.classList.contains('animate-with-prev-element')) {
				++index
			}

			setTimeout(() => {
				item.classList.remove('unanimated')
				if (removeClass) {
					item.classList.remove(className)
				} else {
					item.classList.add(className)
				}
			}, animationStep * index)
		})
	}

	static isClickFromKeyboard(mouseClickEvent) {
		if (!mouseClickEvent.type || mouseClickEvent.type.toLowerCase() !== 'click') {
			throw new Error('Wrong event type!')
		}
		return mouseClickEvent.clientX === 0 && mouseClickEvent.clientY === 0
	}

	static isVisible(elem) {
		return !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
	}

	static inputFocus(selector = '') {
		const elements = selector && typeof selector === 'string' ? [...document.querySelectorAll(selector)] : selector

		if (!elements) {
			console.assert('Selector is not defined')
			return;
		}

		elements.forEach(input => {
      let activeClassElement = null;
      if (input.dataset.activeElSelector) {
        activeClassElement = input.closest(`.${input.dataset.activeElSelector}`);
      } else {
        activeClassElement = input.parentElement;
      }
			if (input.value) {
				activeClassElement.classList.add('active')
			}
			input.addEventListener('focus', function() {
        activeClassElement.classList.add('active');
			})

			input.addEventListener('blur', function() {
				if (!input.value) {
					activeClassElement.classList.remove('active')
				}
			})
		})
	}

	//тротлинг запуска функции, умный setInterval"
	static throttle(callback, limit) {
		let wait = false
		return function() {
			if (!wait) {

				callback.apply(null, arguments)
				wait = true
				setTimeout(function() {
					wait = false
				}, limit)
			}
		}
	}

	//задержка запуска функции, "умный setTimout"
	static debounce(func, wait, immediate) {
		let timeout
		return function() {
			let context = this,
				args = arguments
			let later = function() {
				timeout = null
				if (!immediate) func.apply(context, args)
			}
			let callNow = immediate && !timeout
			clearTimeout(timeout)
			timeout = setTimeout(later, wait)
			if (callNow) func.apply(context, args)
		}
	}

	static throttledEvent(type, name, obj) {
		obj = obj || window
		let running = false
		const func = function() {
			if (running) { return }
			running = true
			requestAnimationFrame(function() {
				obj.dispatchEvent(new CustomEvent(name))
				running = false
			})
		}
		obj.addEventListener(type, func)
	}

	static getWindowWidth() {
		return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
	}

	static eventListenersManager() {
		let eventIsAttached = false

		return ({
			element,
			eventsData,
			maxWidth,
			afterRemoveListenerCallback = null,
			afterAddListenerCallback = null
		}) => {

			if (window.windowWidth >= maxWidth && !eventIsAttached) {
				eventsData.forEach(eventInfo => {
					element.addEventListener(eventInfo.type, eventInfo.listener)
				})
				if (afterAddListenerCallback) afterAddListenerCallback()
				eventIsAttached = true
			}

			if (window.windowWidth < maxWidth && eventIsAttached) {
				eventsData.forEach(eventInfo => {
					element.removeEventListener(eventInfo.type, eventInfo.listener)
				})
				if (afterRemoveListenerCallback) afterRemoveListenerCallback()
				eventIsAttached = false
			}
		}
	}

	static findGetParameter(parameterName) {
		const items = location.search.substr(1).split("&")
		for (let index = 0; index < items.length; index++) {
			const tmp = items[index].split("=")
			if (tmp[0] === parameterName) return decodeURIComponent(tmp[1])
		}
		return null
	}

	static getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}
}

Utils.init()
