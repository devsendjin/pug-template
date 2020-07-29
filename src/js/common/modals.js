/*
* Модальные окна.
* Модальным окном может быть как всплывающее окно(.pop-up) так и выдвижная боковая панель(.side-panel)
* У боковой панели должен быть отдельный от нее элемент фона. Id фона должен содержаться в атрибуте data-bg-id окна.
* У кнопки открытия модального окна должен быть класс modal-opener и аттрибут data-modal-id с айдишником окна.
* */

const openModal = modal => {
    modal = typeof modal === 'string' ? document.getElementById(modal) : modal;
    pageScrollState.fix();
    if(modal.dataset.bgId){
        document.getElementById(modal.dataset.bgId).classList.add('active');
    }
    modal.classList.add('active');
};

const closeModal = modal => {
    modal = typeof modal === 'string' ? document.getElementById(modal) : modal;
    if(modal.dataset.bgId){
        document.getElementById(modal.dataset.bgId).classList.remove('active');
    }
    modal.classList.remove('active');
    pageScrollState.unfix();
};

querySelectorAsArray('.modal').forEach( modal => {
    if(modal.dataset.bgId) {
        document.getElementById(modal.dataset.bgId).addEventListener('click', () => {
            closeModal(modal);
        });
    }else{
        modal.addEventListener('click', () => {
            closeModal(modal);
        });
        querySelectorAsArray('.js-close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeModal.bind(null, modal));
        })
    }

    const modalCloseBtns = [...modal.querySelectorAll('.close')];
    if(modalCloseBtns.length > 0){
        modalCloseBtns.forEach(item => item.addEventListener('click', () => closeModal(modal)));
    }

    const modalWindow = modal.querySelector('.window');
    if(modalWindow){
        modalWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

querySelectorAsArray('.modal-opener').forEach( modalOpener => {
    modalOpener.addEventListener('click', () => {
        openModal(modalOpener.dataset.modalId);
    });
});
