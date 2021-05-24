import {createModal} from './modal.js';

const APP =  {

    host: 'http://' + window.location.host,

    constant: function(){
        let url = this.host + '/public/constants.json'

        return fetch(url)
            .then((response) =>{
                response.json().then((data)=>{
                    console.log(data);
                })
            })

    },


    modal: function(){
        const $modal =  createModal();
        const ANIM_SPEED = 200;
        let closing = false;
        let destroyed = false;
        const modal = {
            open() {
                if (!closing) {
                    $modal.classList.add('open');
                }
            },
            close() {
                closing = true;
                $modal.classList.remove('open');
                $modal.classList.add('hide');
                setTimeout(() => {
                    $modal.classList.remove('hide');
                    closing = false;
                    this.destroy();
                }, ANIM_SPEED);

            },

            destroy(){
                $modal.parentNode.removeChild($modal);
                $modal.removeEventListener('click', modalClickHandler);
                destroyed = true;
            },

            async send(){

                let modalBody = $modal.querySelector('.modal-content');
                let spinner   = document.createElement('div');
                spinner.classList.add('spinner');
                spinner.classList.add('modal');
                modalBody.appendChild(spinner);

                let name = $modal.querySelector('input').value;
                let descr = $modal.querySelector('textarea').value;

                if(!name.match(/[a-zа-я0-9_]+/i) ){
                    throw 'Недопустимое название позиции';
                }else if(!descr.match(/[a-zа-я0-9]+/i)){
                    throw 'Использованы недопустимые символы в описании';
                }

                let url = APP.host + '/entity/create';
                let formData = new FormData();
                formData.append('name', JSON.stringify($modal.querySelector('input').value))
                formData.append('description', JSON.stringify($modal.querySelector("textarea").value))

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-with': 'XMLHttpRequest',
                    }
                })
                return response.text();

            }
        }



        const modalClickHandler = async (e)=>{

            if(e.target.dataset.close){
                modal.close();
            }

            if(e.target.dataset.send){
                modal.send().then(resolve => {
                    setTimeout(() =>{
                        let spinner = document.querySelector('.spinner');
                        let message = document.createElement('span')
                        message.innerHTML = '&#10003;' + resolve;
                        message.classList.add('success');
                        spinner.parentNode.append(message);
                        spinner.parentNode.removeChild(spinner);
                    }, 500);

                },
                reject =>{
                    setTimeout(() =>{
                        let spinner = document.querySelector('.spinner');
                        let message = document.createElement('span');
                        message.innerHTML = '&#10060;  ' + reject;
                        message.classList.add('error');
                        spinner.parentNode.append(message);
                        spinner.parentNode.removeChild(spinner);
                    }, 500);
                }
                );
            }
        }


        $modal.addEventListener('click', modalClickHandler);

        return modal;
    },

    deleteEntity: async function (id = {}){
        let url = this.host + '/entity/delete';

        let formData = new FormData();
        formData.append('id', JSON.stringify(id))
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        if(!response.ok){
            throw 'Ошибка!';
        }
        return response.text();

    },
    spinner: function(){
        let $spinner = document.createElement('div');
        $spinner.classList.add('spinner');
        return $spinner;
    },

    findMode: function(){
        let findMode = false;
        const content = document.querySelector('.card-container');
        const spinner = APP.spinner();
        return {
            start(){
                if(!findMode){
                    let cards = document.querySelector('.cards-wrapper');
                    cards.parentNode.removeChild(cards);
                }
                let data = document.querySelector('#find').value;
                this.send(data).then(
                    resolve =>{
                        content.removeChild(spinner);
                        console.log(resolve)

                    },
                    reject=>{
                        console.log(JSON.parse(reject))
                    }
                )
            },

            async send(data){
                findMode = true;
                if(!data.match(/[a-zа-я0-9\s]+/i)){
                    throw 'Недопустимые символы в запросе!';
                }else if(!data){
                    throw 'Пустой запрос';
                }

                content.append(spinner);
                let formData = new FormData();
                formData.append('text', JSON.stringify(data));
                const response = await fetch(APP.host + '/entity/find', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-with': 'XMLHttpRequest'
                    }
                })
                return response.json();
            }
        }
    }

}
const findMode = APP.findMode();
let findBtn = document.getElementById('find-btn');
findBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    findMode.start();
})

let deleteButtons = document.querySelectorAll('.deleteButton');


for (let i = 0; i < deleteButtons.length; i++){

    deleteButtons[i].addEventListener('click', (e) =>{
        let id = e.target.id;
        let card = document.querySelectorAll('.entityCard'+id)[0];
        card.innerHTML = '<hr>';
        let spinner = APP.spinner();
        card.append(spinner);

        APP.deleteEntity(id).then(

            resolve =>{
                setTimeout(() =>{
                    card.removeChild(spinner);
                    card.innerHTML = '<hr>';
                    card.innerHTML += resolve;
                }, 500);

            },
            reject =>{
                setTimeout(() =>{
                    card.removeChild(spinner);
                    card.innerHTML = '<hr>';
                    card.innerHTML += reject;
                }, 500);
            }
        )
    })
}




let modalBtn = document.querySelector('.addEntity');

modalBtn.addEventListener('click', (e) =>{
    let $modal = APP.modal();
    setTimeout(function(){
        $modal.open();
     }, 10);
})

